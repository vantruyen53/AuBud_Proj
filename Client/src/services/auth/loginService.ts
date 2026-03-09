import { LoginPayload, RegisterResult, LoginResult} from "@/src/models/types/authType";
import { deriveKEK, decryptSecretKeyWithKEK } from "@/src/utils/security";
import * as SecureStore from "expo-secure-store";
import { API_URL, SECRET_KEY_STORE } from "@/src/constants/securityContants";
import * as ExpoCrypto from "expo-crypto";

export async function postLogin( payload: LoginPayload): Promise<LoginResult> {
  const { email, password } = payload;

  console.log(payload)
  const passwordHash = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    password,
    { encoding: ExpoCrypto.CryptoEncoding.HEX }
    );
  try{
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordHash }),
    });

    const data = await res.json();

        return {
            ...data
        };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Login failed. Please try again.");
  }
}

export async function loginService(payload: LoginPayload): Promise<any> {
    try {
        const result = await postLogin(payload);
        console.log('====1. postLogin result.status:', result.status);
        console.log('====2. postLogin result.email:', result.user.email);
        console.log('====2. result.salt:', result.salt ? 'có' : 'NULL');
        console.log('====3. result.encryptedSecretKey_user:', result.encryptedSecretKey_user ? 'có' : 'NULL');

        if (result.status && result.salt && result.encryptedSecretKey_user) {
            console.log('====4. Bắt đầu deriveKEK...');
            const passwordForKEK = await ExpoCrypto.digestStringAsync(
                ExpoCrypto.CryptoDigestAlgorithm.SHA256,
                payload.password,
                { encoding: ExpoCrypto.CryptoEncoding.HEX }
            );
            const kek = await deriveKEK(passwordForKEK, result.salt); ;
            console.log('====5. KEK:', kek ? 'có' : 'NULL');

            console.log('====6. Bắt đầu decryptSecretKey...');
            const secretKey = decryptSecretKeyWithKEK(result.encryptedSecretKey_user, kek);
            console.log('====7. secretKey:', secretKey ? 'có' : 'NULL');

            console.log('====8. Lưu vào SecureStore với key:', SECRET_KEY_STORE);
            await SecureStore.setItemAsync(SECRET_KEY_STORE, secretKey);

            // Verify lưu thành công
            const verify = await SecureStore.getItemAsync(SECRET_KEY_STORE);
            console.log('====9. Verify sau khi lưu:', verify ? 'LƯU THÀNH CÔNG' : 'LƯU THẤT BẠI');
        } else {
            console.log('====X. Không vào if — thiếu điều kiện');
        }

        return {
            status:       result.status,
            message:      result.message,
            email:        result.user.email,
            accessToken:  result.accessToken,
            refreshToken: result.refreshToken,
        };
    } catch (error) {
        console.log('====ERROR in loginService:', error);
        throw error;
    }
}