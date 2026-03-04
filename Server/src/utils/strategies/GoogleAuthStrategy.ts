import { OAuth2Client } from "google-auth-library";
import type {
  IAuthStrategy,
  AuthPayload,
} from "../../domain/models/auth/IAuthStrategy.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export class GoogleAuthStrategy implements IAuthStrategy {
  async authenticate(idToken: string): Promise<AuthPayload> {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID chưa được cấu hình trong .env");
    }
    // Verify idToken trực tiếp với Google — không tự decode
    const ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error("idToken không hợp lệ");
    }

    return {
      email: payload.email,
      name: payload.name ?? payload.email,
      ...(payload.picture && { avatarUrl: payload.picture }),
      googleId: payload.sub, // ID duy nhất của user trên Google
      provider: "google",
    };
  }
}
