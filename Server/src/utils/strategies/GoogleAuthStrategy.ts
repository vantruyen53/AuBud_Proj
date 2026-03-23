import { OAuth2Client } from "google-auth-library";
import type {
  IAuthStrategy,
  AuthPayload,
} from "../../domain/models/auth/IAuthStrategy.js";
import { LogService } from '../../services/systemLogService.js'; // adjust path

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthStrategy implements IAuthStrategy {
  async authenticate(idToken: string): Promise<AuthPayload> {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    // ── Config missing — lỗi hệ thống ──────────────────────────
    if (!googleClientId) {
      await LogService.write({
        message: 'Google OAuth failed: GOOGLE_CLIENT_ID is not configured',
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'auth.google.config_missing',
        metaData: { reason: 'GOOGLE_CLIENT_ID not set in environment' } as any,
      });
      throw new Error("GOOGLE_CLIENT_ID chưa được cấu hình trong .env");
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        await LogService.write({
          message: 'Google OAuth failed: idToken payload invalid or missing email',
          actor_type: 'system',
          type: 'auth',
          status: 'failure',
          actionDetail: 'auth.google.invalid_payload',
          metaData: { reason: 'payload null or email missing' } as any,
        });
        throw new Error("idToken không hợp lệ");
      }

      // Success — không log ở đây, controller sẽ log login.success
      // vì ở đây chưa có đủ context (userId, IP,...)
      return {
        email: payload.email,
        name: payload.name ?? payload.email,
        ...(payload.picture && { avatarUrl: payload.picture }),
        googleId: payload.sub,
        provider: "google",
      };

    } catch (error: any) {
      // Chỉ log nếu chưa throw ở trên (tức là lỗi từ Google API)
      if (error.message !== "idToken không hợp lệ") {
        await LogService.write({
          message: `Google OAuth token verification failed: ${error.message}`,
          actor_type: 'system',
          type: 'auth',
          status: 'failure',
          actionDetail: 'auth.google.verify_failed',
          metaData: {
            error: error.message,
            // Không log raw idToken
          } as any,
        });
      }
      throw error;
    }
  }
}