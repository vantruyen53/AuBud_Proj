import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_CLIENT_ID!;

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

export interface GoogleAuthResult {
  idToken: string;
}

export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  // redirectUri phải khớp với cái đăng ký trong Google Cloud Console
  const redirectUri = AuthSession.makeRedirectUri();

  // PKCE - bảo vệ authorization code khỏi bị intercept
  const codeVerifier = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Math.random().toString(),
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );

  const request = new AuthSession.AuthRequest({
    clientId: WEB_CLIENT_ID,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    usePKCE: true,
    extraParams: { access_type: "offline" },
  });

  await request.makeAuthUrlAsync(discovery);

  const result = await request.promptAsync(discovery);

  if (result.type !== "success") {
    throw new Error(
      result.type === "cancel"
        ? "Người dùng huỷ đăng nhập"
        : "Đăng nhập Google thất bại",
    );
  }

  // Đổi authorization code lấy idToken
  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: WEB_CLIENT_ID,
      redirectUri,
      code: result.params.code,
      extraParams: { code_verifier: request.codeVerifier! },
    },
    discovery,
  );

  if (!tokenResponse.idToken) {
    throw new Error("Không nhận được idToken từ Google");
  }

  return { idToken: tokenResponse.idToken };
}
