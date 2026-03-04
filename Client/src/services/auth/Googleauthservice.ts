import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { fetchServerPublicKey } from "./registerService";
import { buildKeyBundleOnRegister } from "@/src/utils/security";
import { LoginResult } from "@/src/models/types/authType";
import * as ExpoCrypto from "expo-crypto";
import forge from "node-forge";
import { API_URL } from "@/src/constants/securityContants";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

export async function signInWithGoogle(): Promise<LoginResult> {
  const redirectUri = `https://auth.expo.io/@truyenjjjjjjjj/Client`;

  console.log("1 ==========get server public key...");
  const serverPublicKeyPem = await fetchServerPublicKey();

  // Lấy hoặc tạo googleKekPassword ổn định cho tài khoản này
  const GOOGLE_KEK_PASSWORD_KEY = "googleKekPassword";
  console.log("2 ==========get googleKekPassword...");
  let googleKekPassword = await SecureStore.getItemAsync(GOOGLE_KEK_PASSWORD_KEY);
  if (!googleKekPassword) {
    const randomBytes = await ExpoCrypto.getRandomBytesAsync(32);
    googleKekPassword = forge.util.encode64(String.fromCharCode(...randomBytes));
    console.log("save googleKekPassword...");
    await SecureStore.setItemAsync(GOOGLE_KEK_PASSWORD_KEY, googleKekPassword);
  }

  console.log("3 ==========start Google auth flow...");
  const request = new AuthSession.AuthRequest({
    clientId: WEB_CLIENT_ID,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    usePKCE: true,
    extraParams: { access_type: "offline" },
  });

  console.log("4 ==========make auth url and prompt...");
  await request.makeAuthUrlAsync(discovery);

  console.log("4.1 ==========Maybe stop at here...");
  const result = await request.promptAsync(discovery, {
    // Dùng proxy để Expo Go nhận được redirect
    showInRecents: true,
  });
  console.log("4.2 ===== result type:", result.type);
  console.log("4.3 ===== result:", JSON.stringify(result));

  if (result.type !== "success") {
    throw new Error(
      result.type === "cancel" ? "Người dùng huỷ đăng nhập" : "Đăng nhập Google thất bại"
    );
  }

  console.log("5 ========== get idToken from Google...");
  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: WEB_CLIENT_ID,
      redirectUri,
      code: result.params.code,
      extraParams: { code_verifier: request.codeVerifier! },
    },
    discovery
  );

  if (!tokenResponse.idToken) throw new Error("Không nhận được idToken từ Google");

  // Dùng googleKekPassword ổn định thay vì idToken
  console.log("6 ========== build key bundle with googleKekPassword...");
  const keyBundle = await buildKeyBundleOnRegister(googleKekPassword, serverPublicKeyPem);

  console.log("7 ==========Fetch to server to save data...");
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken: tokenResponse.idToken,
      salt: keyBundle.salt,
      encryptedSecretKey_user: keyBundle.encryptedSecretKey_user,
      encryptedSecretKey_server: keyBundle.encryptedSecretKey_server,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Đăng nhập thất bại");

  // Lưu secretKey vào SecureStore sau khi server xác nhận thành công
  await SecureStore.setItemAsync("secretKey", keyBundle.secretKey);

  return {
    status: true,
    message: data.message ?? "Đăng nhập thành công",
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    salt: '',
    encryptedSecretKey_user: '',
    encryptedSecretKey_server: '',
  };
}
