import type { IOTPRepository } from "../../domain/interfaces/auth/IOTPRepository.js";
import client from "../../config/redis.js";
export default class OTPRepository implements IOTPRepository {
  async generateOTP(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  async saveOTP(
    email: string,
    otp: string,
    expiryInSeconds: number,
  ): Promise<void> {
    try {
      await client.set(email, otp, {
        EX: expiryInSeconds,
      });
      console.log("OTP saved: " + otp);
      return;
    } catch (err) {
      console.error("Lỗi khi lưu OTP vào Redis:", err);
      throw err;
    }
  }

  async deteteOTP(email: string): Promise<void> {
    try {
      await client.del(email);
      return;
    } catch (err) {
      console.error(`Error deleting OTP for ${email}:`, err);
      throw err;
    }
  }
  
  async getOTP(email: string): Promise<string | null> {
    try {
      const data = await client.get(email);
      console.log(
        `Get OTP for ${email}: ${data ? `=====================${data}` : "Not Found"}`,
      );
      return data;
    } catch (err) {
      console.error(`Error getting data from Redis for ${email}:`, err);
      throw err;
    }
  }
}
