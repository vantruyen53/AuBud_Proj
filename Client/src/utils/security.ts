import * as ExpoCrypto from "expo-crypto";
import { InteractionManager } from "react-native";
import forge from "node-forge";
import { EncryptedPayload, KeyBundle } from "../models/types/securityType";
import { AES_KEY_LENGTH, SALT_LENGTH, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, AES_IV_LENGTH, TAG_LENGTH } from "../constants/securityContants";
import { EncryptedDTO } from "../models/interface/DTO";

//1. TẠO SECRET KEY NGẪU NHIÊN (AES-256)
export async function generateSecretKey(): Promise<string> {
  const randomBytes = await ExpoCrypto.getRandomBytesAsync(AES_KEY_LENGTH);
  return forge.util.encode64(
    String.fromCharCode(...randomBytes)
  );
}

// 2. TẠO SALT NGẪU NHIÊN
export async function generateSalt(): Promise<string> {
  const randomBytes = await ExpoCrypto.getRandomBytesAsync(SALT_LENGTH);
  return forge.util.encode64(
    String.fromCharCode(...randomBytes)
  );
}

// 3. KDF — Derive KEK từ password + salt (PBKDF2)
export function deriveKEK(password: string, saltBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Đợi UI interactions xong rồi mới chạy heavy task
    InteractionManager.runAfterInteractions(() => {
      try {
        console.log("3.2.1 ============= Giải mã salt từ Base64")
        const salt = forge.util.decode64(saltBase64);
         console.log("3.2.2 ============= Tạo Derive KEK")
        const kek  = forge.pkcs5.pbkdf2(
          password,
          salt,
          PBKDF2_ITERATIONS,
          PBKDF2_KEY_LENGTH,
          "sha256"
        );
        resolve(forge.util.encode64(kek));
      } catch (err) {
        reject(err);
      }
    });
  });
}


// 4. MÃ HÓA SECRET KEY BẰNG KEK_USER -> tạo ra EncryptedSecretKey_user
export async function encryptSecretKeyWithKEK(
  secretKeyBase64: string,
  kekBase64: string
): Promise<string> {
  const secretKey = forge.util.decode64(secretKeyBase64);
  const kek       = forge.util.decode64(kekBase64);

  const ivBytes   = await ExpoCrypto.getRandomBytesAsync(AES_IV_LENGTH);
  const iv        = String.fromCharCode(...ivBytes);

  const cipher = forge.cipher.createCipher("AES-GCM", kek);
  cipher.start({ iv, tagLength: TAG_LENGTH * 8 });
  cipher.update(forge.util.createBuffer(secretKey));
  cipher.finish();

  const payload: EncryptedPayload = {
    ciphertext: forge.util.encode64(cipher.output.getBytes()),
    iv:         forge.util.encode64(iv),
    tag:        forge.util.encode64(cipher.mode.tag.getBytes()),
  };

  return JSON.stringify(payload);
}

// 5. GIẢI MÃ SECRET KEY BẰNG KEK_USER
export function decryptSecretKeyWithKEK(
  encryptedJson: string,
  kekBase64: string
): string {
  const { ciphertext, iv, tag }: EncryptedPayload = JSON.parse(encryptedJson);
  const kek = forge.util.decode64(kekBase64);

  const decipher = forge.cipher.createDecipher("AES-GCM", kek);
  decipher.start({
    iv:  forge.util.decode64(iv),
    tag: forge.util.createBuffer(forge.util.decode64(tag)),
  });
  decipher.update(forge.util.createBuffer(forge.util.decode64(ciphertext)));

  const pass = decipher.finish();
  if (!pass) throw new Error("Giải mã SecretKey thất bại — sai mật khẩu hoặc dữ liệu bị tamper");

  return forge.util.encode64(decipher.output.getBytes());
}

// 6. MÃ HÓA SECRET KEY BẰNG SERVER PUBLIC KEY (RSA-OAEP) -> tạo ra EncryptedSecretKey_server
export function encryptSecretKeyWithServerPublicKey(
  secretKeyBase64: string,
  serverPublicKeyPem: string
): string {
  const publicKey = forge.pki.publicKeyFromPem(serverPublicKeyPem);
  const secretKey = forge.util.decode64(secretKeyBase64);

  // RSA-OAEP với SHA-256 — an toàn hơn RSA-PKCS1v1.5
  const encrypted = publicKey.encrypt(secretKey, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha256.create() },
  });

  return forge.util.encode64(encrypted);
}

// 7. MÃ HÓA DỮ LIỆU BẰNG SECRET KEY (AES-256-GCM)
export async function encryptData(
  plaintext: string,
  secretKeyBase64: string
): Promise<string> {
  const secretKey = forge.util.decode64(secretKeyBase64);
  const ivBytes   = await ExpoCrypto.getRandomBytesAsync(AES_IV_LENGTH);
  const iv        = String.fromCharCode(...ivBytes);

  const cipher = forge.cipher.createCipher("AES-GCM", secretKey);
  cipher.start({ iv, tagLength: TAG_LENGTH * 8 });
  cipher.update(forge.util.createBuffer(plaintext, "utf8"));
  cipher.finish();

  const payload: EncryptedPayload = {
    ciphertext: forge.util.encode64(cipher.output.getBytes()),
    iv:         forge.util.encode64(iv),
    tag:        forge.util.encode64(cipher.mode.tag.getBytes()),
  };

  return JSON.stringify(payload);
}

// 8. GIẢI MÃ DỮ LIỆU BẰNG SECRET KEY
export function decryptData(
  encryptedJson: string,
  secretKeyBase64: string
): string {
  const { ciphertext, iv, tag }: EncryptedPayload = JSON.parse(encryptedJson);
  const secretKey = forge.util.decode64(secretKeyBase64);

  const decipher = forge.cipher.createDecipher("AES-GCM", secretKey);
  decipher.start({
    iv:  forge.util.decode64(iv),
    tag: forge.util.createBuffer(forge.util.decode64(tag)),
  });
  decipher.update(forge.util.createBuffer(forge.util.decode64(ciphertext)));

  const pass = decipher.finish();
  if (!pass) throw new Error("Giải mã data thất bại — SecretKey sai hoặc data bị tamper");

  return decipher.output.toString();
}

// 9. HELPER — Tạo toàn bộ KeyBundle khi đăng ký. Gom hết các bước lại thành 1 lần gọi duy nhất
export async function buildKeyBundleOnRegister(
  password: string,
  serverPublicKeyPem: string
): Promise<KeyBundle> {
  // B1: Tạo SecretKey và Salt ngẫu nhiên
  console.log("3.1 ============= Tạo SecretKey và Salt ngẫu nhiên")
  const secretKey = await generateSecretKey();
  const salt      = await generateSalt();

  // B2: Derive KEK từ password + salt
  console.log("3.2 ============= Tạo Derive KEK từ password + salt")
  const kek = await deriveKEK(password, salt);

  // B3: Mã hóa SecretKey bằng KEK → để client giải mã khi login
  console.log("3.3 ============= TMã hóa SecretKey bằng KEK")
  const encryptedSecretKey_user = await encryptSecretKeyWithKEK(secretKey, kek);

  // B4: Mã hóa SecretKey bằng ServerPublicKey → để server khôi phục khi reset pass
  console.log("3.4 ============= Mã hóa SecretKey bằng ServerPublicKey")
  const encryptedSecretKey_server = encryptSecretKeyWithServerPublicKey(
    secretKey,
    serverPublicKeyPem
  );

  // B5: SecretKey thuần KHÔNG đưa vào bundle — chỉ tồn tại trong RAM hàm này
  // Caller tự quyết định có lưu SecureStore không (thường là có)
  return {
    secretKey,               // ← lưu vào SecureStore sau khi register thành công
    salt,                    // ← gửi lên server
    encryptedSecretKey_user,    // ← gửi lên server
    encryptedSecretKey_server,  // ← gửi lên server
  };
}

// 10. Mã hóa dữ liệu dạng object bằng secret key
export async function encryptFormData(
  formData: Record<string, any>,
  secretKeyBase64: string
): Promise<EncryptedDTO> {
  const result: EncryptedDTO = {};

  for (const [key, value] of Object.entries(formData)) {
    // Bỏ qua key không cần mã hóa như id
    if (key === 'id' || key==="status" || key==="createdAt" ||
       key==="actionType" || key==="type" || key.includes("Id") || key.includes("_") || value === null || value === undefined || value==="NaN") {
      result[key] = value;
      continue;
    }
  
    // Convert value sang string trước khi mã hóa
    const plaintext = value?.toString() ?? '';
    result[key] = await encryptData(plaintext, secretKeyBase64);
  }

  return result;
}

// 11. Giải mã dữ liệu dạng object bằng secret key
export async function decryptFormData<T>(
  encryptedData: Record<string, any>,
  secretKeyBase64: string,
  skipKeys: string[] = ['id', 'status', 'createdAt', 'actionType',  'type', "categoryName","iconColor","iconName",'library',"categoryType"],
  label: string = 'Unknown'
): Promise<T> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(encryptedData)) {
    if (skipKeys.includes(key) || value === null || value === undefined || key.includes("_")|| key.includes("Id")) {
      result[key] = value;
      continue;
    }
    // Giải mã rồi convert về đúng kiểu
    const plaintext = decryptData(value, secretKeyBase64);
    result[key] = plaintext;
  }

  return result as T;
}