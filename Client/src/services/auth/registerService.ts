import { API_URL, SECRET_KEY_STORE } from "@/src/constants/securityContants";
import { RegisterResult, RegisterPayload} from "@/src/models/types/authType";
import { buildKeyBundleOnRegister } from "@/src/utils/security";
import * as SecureStore from "expo-secure-store";
import * as ExpoCrypto from "expo-crypto";
import { InteractionManager } from "react-native";
import { apiFetch } from "./apiService";

// STEP 1 — Lấy Server Public Key
export async function fetchServerPublicKey(): Promise<string> {
  const res = await apiFetch(`/auth/public-key`);

  if (!res.ok) {
    throw new Error("Không thể lấy public key từ server");
  }
  const data = await res.json();
  if (!data.publicKey) {
    throw new Error("Server trả về public key không hợp lệ");
  }

  return data.publicKey; // PEM format
}

// STEP 2 — Gửi request đăng ký lên server
async function postRegister(payload: {
  userName: string;
  email: string;
  passwordHash: string;
  salt: string;
  encryptedSecretKey_user: string;
  encryptedSecretKey_server: string;
}): Promise<RegisterResult> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      status: false,
      message: data.message ?? "Đăng ký thất bại",
    };
  }

  return {
    status: true,
    message: data.message ?? "Đăng ký thành công",
  };
}

// MAIN — Hàm duy nhất SignUpScreen gọi
export async function registerService(
  payload: RegisterPayload
): Promise<RegisterResult> {
  const { userName, email, password } = payload;
  console.log("Payload nhận vào registerService:", userName, email, password);

  // B1: Lấy Server Public Key
  console.log("2 ============= Lấy Server Public Key")
  const serverPublicKeyPem = await fetchServerPublicKey();

  // B2: Tạo toàn bộ KeyBundle trên client
  // SecretKey chỉ tồn tại trong RAM từ đây đến hết hàm này
  console.log("3 ============= Tạo KeyBundle trên client")
  const passwordForKEK = await ExpoCrypto.digestStringAsync(ExpoCrypto.CryptoDigestAlgorithm.SHA256, password, { encoding: ExpoCrypto.CryptoEncoding.HEX })
  const keyBundle = await buildKeyBundleOnRegister(passwordForKEK, serverPublicKeyPem);

  // B3: Bcrypt hash password phía client trước khi gửi lên server
  // Server KHÔNG bao giờ biết raw password
  // Dùng expo-crypto để hash SHA-256 làm pre-hash trước khi gửi
  // (bcrypt thật sẽ chạy trên server với hash này làm input)
  console.log("4 ============= Hash password trên client")
  const passwordHash = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    password,
    { encoding: ExpoCrypto.CryptoEncoding.HEX }
  );

  // B4: Gửi lên server — raw password KHÔNG có trong payload này
  console.log("5 ============= Gửi payload đăng ký lên server")
  const result = await postRegister({
    userName,
    email,
    passwordHash,
    salt:                      keyBundle.salt,
    encryptedSecretKey_user:   keyBundle.encryptedSecretKey_user,
    encryptedSecretKey_server: keyBundle.encryptedSecretKey_server,
  });

  // B5: Chỉ lưu SecretKey vào SecureStore khi server xác nhận thành công
  // Nếu lưu trước rồi server lỗi → SecretKey và DB không đồng bộ
  if (result.status) {
    await SecureStore.setItemAsync(SECRET_KEY_STORE, keyBundle.secretKey);
    console.log("6 ============= Đăng ký thành công — SecretKey đã lưu vào SecureStore");
  }

  // B6: keyBundle.secretKey tự động bị GC sau khi hàm return
  // Không còn tồn tại trong RAM nữa (ngoại trừ bản đã lưu SecureStore)
  return result;
}