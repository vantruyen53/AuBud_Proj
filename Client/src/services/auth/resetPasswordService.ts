import { RefreshPasswordPayload } from "@/src/models/types/authType";
import { API_URL } from "@/src/constants/securityContants";
import * as ExpoCrypto from "expo-crypto";

export async function postEmailToVerify(email:string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();
    return {
        success: data.status,
        message: data.message,
    };
}
export async function resetPasswordService(payload: RefreshPasswordPayload): Promise<{ success: boolean; message: string }> {
    const passwordHash = await ExpoCrypto.digestStringAsync(
        ExpoCrypto.CryptoDigestAlgorithm.SHA256,
        payload.newPassword,
        { encoding: ExpoCrypto.CryptoEncoding.HEX }
        );

    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: payload.email,
            newPassword: passwordHash,  
        }),
    });

    const data = await res.json();
    return {
        success: data.status,
        message: data.message,
    };
}