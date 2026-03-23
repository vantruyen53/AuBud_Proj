import { AuthServiceImpl } from '../../services/AuthServiceImpl.js';
import {TokenService} from '../../services/tokenService.js';
import { LogService } from '../../services/systemLogService.js';
import {verifyToken} from '../../utils/helpers/jwt.js';
import { Role } from '../../domain/enums/authEnums.js';
import type { IUserRepository } from "../../domain/models/auth/IUserRepository.js";

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthController {
  constructor(
    private authService: AuthServiceImpl,
    private tokenService: TokenService,
    private userRepo: IUserRepository,
  ) {}

  register = async (req: any, res: any) => {
    try {
      const registerData = req.resDTO;
      const result = await this.authService.register({ ...registerData });

      await LogService.write({
        message: `User registered successfully: ${registerData.email}`,
        actor_type: 'user',
        type: 'auth',
        status: 'success',
        actionDetail: 'auth.register.success',
        ipAddress: req.ip,
        metaData: { email: registerData.email, userName: registerData.userName } as any,
      });

      return res.status(201).json({ status: true, message: "Đăng ký tài khoản thành công", data: result });
    } catch (error: any) {
      await LogService.write({
        message: `Register failed: ${error.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'auth.register.error',
        ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack, email: req.resDTO?.email } as any,
      });

      console.error("Controller Register Error:", error.message);
      return res.status(500).json({ status: false, message: error.message || "Lỗi hệ thống khi đăng ký" });
    }
  };

  // ─── login ───────────────────────────────────────────────────
  login = async (req: any, res: any) => {
    try {
      const loginData = req.logInDTO;
      const deviceInfo = req.headers['user-agent'] || "Unknown Device";

      const result = await this.authService.login(loginData, deviceInfo);

      // ── Login success ──────────────────────────────────────
      await LogService.write({
        message: `User logged in successfully: ${loginData.email}`,
        actor_type: 'user',
        type: 'auth',
        status: 'success',
        actionDetail: 'auth.login.success',
        actorId: result.user?.id,
        ipAddress: req.ip,
        metaData: {
          email: loginData.email,
          userId: result.user?.id,
          deviceInfo,
          message:result.message
        } as any,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true, secure: true, sameSite: "none" as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ ...result });
    } catch (error: any) {
      // ── Login failure (wrong password, user not found, banned,...) ──
      await LogService.write({
        message: `Login failed for: ${req.logInDTO?.email} — ${error.message}`,
        actor_type: 'user',
        type: 'auth',
        status: 'failure',
        actionDetail: 'auth.login.failed',
        ipAddress: req.ip,
        metaData: {
          email: req.logInDTO?.email,
          reason: error.message,
          deviceInfo: req.headers['user-agent'] ?? '',
        } as any,
      });

      console.error("Controller Login Error:", error.message);
      return res.status(401).json({
        status: false, message: error.message || "Đăng nhập thất bại",
        user: { id: '', email: '', role: Role.NULL },
        accessToken: '', refreshToken: '', salt: '', encryptedSecretKey_user: '',
      });
    }
  };

  // 4. Yêu cầu gửi OTP (Quên mật khẩu hoặc Đăng ký)
  sendOtp = async (req: any, res: any) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ status: false, message: "Email là bắt buộc" });
      }

      await this.authService.sendOTP(email);

      await LogService.write({
        message: `OTP sent successfully to: ${email}`,
        actor_type: 'system',
        type: 'info',
        status: 'success',
        actionDetail: 'otp.sent.success',
        ipAddress: req.ip,
        metaData: { email, channel: 'email' } as any,
      });

      return res.status(200).json({ status: true, message: "Mã OTP đã được gửi vào email của bạn" });
    } catch (error: any) {
      await LogService.write({
        message: `OTP send failed for: ${req.body?.email} — ${error.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'otp.sent.failed',
        ipAddress: req.ip,
        metaData: { email: req.body?.email, error: error.message } as any,
      });

      return res.status(500).json({ status: false, message: `Controllor send otp error: ${error.message}` });
    }
  };

  // ─── verifyOtp ───────────────────────────────────────────────
  // Failure đã log ở middleware rồi — chỉ log success verify account
  verifyOtp = async (req: any, res: any) => {
    try {
      const otpData = req.otpDTO;

      if (otpData.type === 'REGISTER') {
        const updateAccVerify = await this.authService.verifyAcc(otpData.email);

        if (updateAccVerify.status) {
          await LogService.write({
            message: `Account verified successfully: ${otpData.email}`,
            actor_type: 'user',
            type: 'auth',
            status: 'success',
            actionDetail: 'otp.verify.success',
            ipAddress: req.ip,
            metaData: { email: otpData.email, otpType: otpData.type, message:updateAccVerify.message } as any,
          });

          console.log(`Account verified for email: ${otpData.email} successfully.`);
          return res.status(200).json({ status: true, message: updateAccVerify.message });
        } else {
          return res.status(401).json({ status: false, message: updateAccVerify.message });
        }
      } else {
        return res.status(200).json({ status: true, message: "OTP is correct" });
      }
    } catch (error: any) {
      await LogService.write({
        message: `verifyOtp unexpected error: ${error.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'otp.verify.error',
        ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });

      return res.status(500).json({ status: false, message: error.message });
    }
  };

  // 3.1 Verify email to change pw
  verifyEmail = async (req:any, res:any)=>{
    const { email } = req.body;

    try{
      const result = await this.authService.verifyEmailForPasswordReset(email);
      if(result.status) 
        return res.status(200).json({
          status: true,
          message: result.message,
        });
      else        
        return res.status(400).json({
          status: false,
          message: result.message,
        });
    } catch (error: any) {
        return res.status(500).json({ 
          status: false, 
          message: `Controller Verify Email Error: ${error.message}`
        });
    }
  }

    // 3.2 Change password 
  changePassWord = async (req: any, res: any) => {
    const resetPasswordDTO = req.resetPasswordDTO;
    try {
      const result = await this.authService.changePassword(resetPasswordDTO.email, resetPasswordDTO.newPassword);

      if (result.status) {
        await LogService.write({
          message: `Password changed successfully for: ${resetPasswordDTO.email}`,
          actor_type: 'user',
          type: 'auth',
          status: 'success',
          actionDetail: 'auth.change_password.success',
          ipAddress: req.ip,
          metaData: { email: resetPasswordDTO.email } as any,
        });

        return res.status(200).json({ status: true, message: result.message });
      } else {
        await LogService.write({
          message: `Password change failed for: ${resetPasswordDTO.email} — ${result.message}`,
          actor_type: 'user',
          type: 'auth',
          status: 'failure',
          actionDetail: 'auth.change_password.failed',
          ipAddress: req.ip,
          metaData: { email: resetPasswordDTO.email, reason: result.message } as any,
        });

        return res.status(400).json({ status: false, message: result.message });
      }
    } catch (error: any) {
      await LogService.write({
        message: `changePassword unexpected error: ${error.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'auth.change_password.error',
        ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack, email: resetPasswordDTO?.email } as any,
      });

      return res.status(500).json({ status: false, message: `Controller Change Password Error: ${error.message}` });
    }
  };

// ─── logOut ──────────────────────────────────────────────────
  logOut = async (req: any, res: any) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const decoded = verifyToken(refreshToken, "refresh") as unknown as DecodedToken;
    try {
      if (!refreshToken) {
        return res.status(400).json({ status: false, message: "Refresh Token is required" });
      }

      const result = await this.tokenService.revokeSession(refreshToken);

      res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" as const });

      if (result.status) {
        await LogService.write({
          message: `User logged out successfully`,
          actor_type: 'user',
          type: 'auth',
          status: 'success',
          actionDetail: 'auth.logout.success',
          actorId: decoded.id,
          ipAddress: req.ip,
          metaData: { deviceInfo: req.headers['user-agent'] ?? '' } as any,
        });

        return res.status(200).json({ status: true, message: result.message });
      } else {
        return res.status(401).json({ status: false, message: result.message });
      }
    } catch (err: any) {
      await LogService.write({
        message: `Logout unexpected error: ${err.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'auth.logout.error',
        ipAddress: req.ip,
        metaData: { error: err.message, stack: err.stack } as any,
      });

      console.error("Logout Error:", err);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  };

  // ─── refreshToken ────────────────────────────────────────────
  
  refreshToken = async (req: any, res: any) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const deviceInfo = req.headers['user-agent'] || "Unknown Device";

    let decoded: DecodedToken;
    try {
      decoded = verifyToken(refreshToken, "refresh") as unknown as DecodedToken;
    } catch {
      await LogService.write({
        message: 'Refresh token invalid or expired',
        actor_type: 'system',
        type: 'auth',
        status: 'failure',
        actionDetail: 'auth.refresh_token.invalid',
        ipAddress: req.ip,
        metaData: { deviceInfo, reason: 'token_verify_failed' } as any,
      });

      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const isValidInDb = await this.tokenService.validateRefreshToken(refreshToken);
    if (!isValidInDb) {
      await LogService.write({
        message: `Refresh token revoked for userId: ${decoded.id}`,
        actor_type: 'user',
        type: 'auth',
        status: 'failure',
        actionDetail: 'auth.refresh_token.revoked',
        actorId: decoded.id,
        ipAddress: req.ip,
        metaData: { deviceInfo } as any,
      });

      return res.status(403).json({ message: "Token has been revoked" });
    }

    const user = await this.userRepo.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await this.tokenService.revokeSession(refreshToken);
    await this.userRepo.updateLastLogin(user.id);
    const tokens = await this.tokenService.createSession(
      { id: decoded.id, userName: user.userName, role: user.role },
      deviceInfo
    );

    await LogService.write({
      message: `Refresh token rotated successfully for userId: ${user.id}`,
      actor_type: 'user',
      type: 'auth',
      status: 'success',
      actionDetail: 'auth.refresh_token.success',
      actorId: user.id,
      ipAddress: req.ip,
      metaData: { deviceInfo, email: user.email } as any,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true, secure: true, sameSite: "none" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ status: true, ...tokens, user: { id: user.id, name: user.userName, email: user.email, role: user.role } });
  };

// ─── googleCallback ──────────────────────────────────────────
  googleCallback = async (req: any, res: any) => {

    try {
      const profile = req.user;
      const deviceInfo = req.headers["user-agent"] || "Unknown";
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const googleId = profile.id;

      const result = await this.authService.loginWithGoogle({ email, name, googleId }, deviceInfo);

      if (!result.status) {
        await LogService.write({
          message: `Google login failed for: ${email} — ${result.message}`,
          actor_type: 'user',
          type: 'auth',
          status: 'failure',
          actionDetail: 'auth.google_login.failed',
          ipAddress: req.ip,
          metaData: { email, reason: result.message } as any,
        });

        return res.redirect(`aubud-app://auth/google/callback?error=${encodeURIComponent(result.message)}`);
      }

      await LogService.write({
        message: `Google login successful for: ${email}`,
        actor_type: 'user',
        type: 'auth',
        status: 'success',
        actionDetail: result.isNewUser ? 'auth.google_login.registered' : 'auth.google_login.success',
        actorId: result.user?.id,
        ipAddress: req.ip,
        metaData: {
          email,
          userId: result.user?.id,
          isNewUser: result.isNewUser,
          deviceInfo,
        } as any,
      });

      const params = new URLSearchParams({
        accessToken: result.accessToken, refreshToken: result.refreshToken,
        userId: result.user.id, email: result.user.email, role: result.user.role,
        salt: result.salt, encryptedSecretKey_user: result.encryptedSecretKey_user,
        isNewUser: result.isNewUser ? "1" : "0",
      });

      res.redirect(`aubud-app://auth/google/callback?${params.toString()}`);
    } catch (error: any) {
      await LogService.write({
        message: `Google callback unexpected error: ${error.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'auth.google_login.error',
        ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });

      res.redirect(`aubud-app://auth/google/callback?error=${encodeURIComponent(error.message)}`);
    }
  };

  uploadKeyBundle = async (req: any, res: any) => {
    try {
      const { salt, encryptedSecretKey_user, encryptedSecretKey_server } = req.body;
      const userId = req.user.id; // từ authMiddleware (JWT đã verify)

      if (!salt || !encryptedSecretKey_user || !encryptedSecretKey_server) {
        return res.status(400).json({ message: "Thiếu keyBundle" });
      }

      await this.authService.saveKeyBundle(userId, salt, encryptedSecretKey_user, encryptedSecretKey_server);

      return res.status(200).json({ status: true, message: "Lưu keyBundle thành công" });

    } catch (error: any) {
      return res.status(500).json({ status: false, message: error.message });
    }
  };
}