import type { ITokenRepository } from "../domain/models/auth/ITokenRepository.js";
import crypto from "crypto";
import { generateToken, RefreshToken } from "../utils/helpers/jwt.js";

export class TokenService {
  constructor(private tokenRepo: ITokenRepository) {}

  async createSession(user: any, deviceInfo: string) {
    const accessToken = generateToken(user);
    const refreshToken = RefreshToken(user);
    // Thay vào đó, ta lưu Hash của nó (giống như mật khẩu).
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const tokenId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.tokenRepo.saveToken(
      tokenId,
      tokenHash,
      user.id,
      expiresAt,
      deviceInfo,
    );

    return { accessToken, refreshToken };
  }

  /**
   * Thu hồi Token khi người dùng Logout
   */
  async revokeSession(refreshToken: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const result = await this.tokenRepo.deleteToken(tokenHash);
    return { status: result.status, message: result.message };
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const tokenRecord = await this.tokenRepo.findByHash(tokenHash);

    if (!tokenRecord) return false;
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);

    if (now > expiresAt) {
      await this.tokenRepo.deleteToken(tokenHash); // Xóa luôn nếu đã hết hạn
      return false;
    }
    return true;
  }

  async findLastDeviceByUserId(userId: string): Promise<string | null> {
    return this.tokenRepo.findLastDeviceByUserId(userId);
  }
}
