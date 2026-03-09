import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { API_URL, SECRET_KEY_STORE } from "@/src/constants/securityContants";
import { LoginResult } from "@/src/models/types/authType";
import * as ExpoCrypto from "expo-crypto";
import forge from "node-forge";
import * as SecureStore from "expo-secure-store";
import { fetchServerPublicKey } from "./registerService";
import { buildKeyBundleOnRegister, deriveKEK, decryptSecretKeyWithKEK } from "@/src/utils/security";
import { apiFetch } from "./apiService";


export async function signInWithGoogle(): Promise<LoginResult> {
  const callbackScheme = "aubud-app://auth/google/callback";

  // ── Bước 1: OAuth flow ──────────────────────────────────────────
  console.log("1 ===== Mở browser đến server...");
  const result = await WebBrowser.openAuthSessionAsync(
    `${API_URL}/auth/google?ngrok-skip-browser-warning=true`,
    callbackScheme
  );

  console.log("2 ===== result type:", result.type);

  if (result.type !== "success") {
    throw new Error(
      result.type === "cancel"
        ? "Người dùng huỷ đăng nhập"
        : "Đăng nhập Google thất bại"
    );
  }

  // Parse params từ deep link
  const url = result.url;
  const { queryParams } = Linking.parse(url);

  if (queryParams?.error) {
    throw new Error(queryParams.error as string);
  }

  const accessToken = queryParams?.accessToken as string;
  const refreshToken = queryParams?.refreshToken as string;
  const email = queryParams?.email as string;
  const userId = queryParams?.userId as string;
  const role = queryParams?.role as string;
  const salt = queryParams?.salt as string;
  const encryptedSecretKey_user = queryParams?.encryptedSecretKey_user as string;
  const isNewUser = queryParams?.isNewUser === "1";

  console.log("===== isNewUser:", isNewUser);
  console.log("===== salt:", salt ? "có" : "không có");
  console.log("===== encryptedSecretKey_user:", encryptedSecretKey_user ? "có" : "không có");

  // ── Bước 2: Upload keyBundle nếu là user mới ────────────────────
  if (isNewUser) {
    console.log("3 ===== User mới → tạo và upload keyBundle...");

    const serverPublicKeyPem = await fetchServerPublicKey();

    const GOOGLE_KEK_PASSWORD_KEY = "googleKekPassword";
    let googleKekPassword = await SecureStore.getItemAsync(GOOGLE_KEK_PASSWORD_KEY);
    if (!googleKekPassword) {
      const randomBytes = await ExpoCrypto.getRandomBytesAsync(32);
      googleKekPassword = forge.util.encode64(String.fromCharCode(...randomBytes));
      await SecureStore.setItemAsync(GOOGLE_KEK_PASSWORD_KEY, googleKekPassword);
    }

    const keyBundle = await buildKeyBundleOnRegister(googleKekPassword, serverPublicKeyPem);

    const uploadRes = await apiFetch(`/auth/google/keybundle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`, // override token vừa nhận
      },
      body: JSON.stringify({
        salt: keyBundle.salt,
        encryptedSecretKey_user: keyBundle.encryptedSecretKey_user,
        encryptedSecretKey_server: keyBundle.encryptedSecretKey_server,
      }),
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      throw new Error(err.message ?? "Upload keyBundle thất bại");
    }

    await SecureStore.setItemAsync(SECRET_KEY_STORE , keyBundle.secretKey);

    console.log("4 ===== keyBundle uploaded OK");

    return {
      status: true,
      message: "Đăng nhập thành công",
      user: { id: userId, email, role },
      accessToken,
      refreshToken,
      salt: keyBundle.salt,
      encryptedSecretKey_user: keyBundle.encryptedSecretKey_user,
      encryptedSecretKey_server: keyBundle.encryptedSecretKey_server,
    };
  } 
  const GOOGLE_KEK_PASSWORD_KEY = "googleKekPassword";
    let googleKekPassword = await SecureStore.getItemAsync(GOOGLE_KEK_PASSWORD_KEY);
  
  const kek = await deriveKEK(googleKekPassword as string, salt);
      const secretKey = decryptSecretKeyWithKEK(encryptedSecretKey_user, kek);
      await SecureStore.setItemAsync(SECRET_KEY_STORE, secretKey);
      console.log("===== secretKey đã lưu vào SecureStore ✅");

  return {
    status: true,
    message: "Đăng nhập thành công",
    user: { id: userId, email, role },
    accessToken,
    refreshToken,
    salt,
    encryptedSecretKey_user,
    encryptedSecretKey_server: "",
  };
}