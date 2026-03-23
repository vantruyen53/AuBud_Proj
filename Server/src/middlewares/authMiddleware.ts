import type {
  LoginDTO,
  RegisterDTO,
  VerifyOtpDTO,
  ResetPasswordDTO,
} from "../data/DTO/AuthDTO.ts";
import { verifyToken } from "../utils/helpers/jwt.js";
import {
  validateEmail,
  validateOTP,
} from "../utils/helpers/validation.js";
import type { IOTPRepository } from "../domain/models/auth/IOTPRepository.js";
import { LogService } from "../services/systemLogService.js";

export function authenticateJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;

  // ── Không có Authorization header ──────────────────────────
  if (!authHeader) {
    LogService.write({
      message: `API called without authorization header: ${req.method} ${req.path}`,
      actor_type: 'system',
      type: 'auth',
      status: 'failure',
      actionDetail: 'auth.api.missing_token',
      ipAddress: req.ip,
      metaData: {
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent'] ?? '',
      } as any,
    }).catch(err => console.error('[AuthMiddleware] Failed to write log:', err));

    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  // ── Có header nhưng thiếu token (Bearer <empty>) ────────────
  if (!token) {
    LogService.write({
      message: `API called with malformed authorization header: ${req.method} ${req.path}`,
      actor_type: 'system',
      type: 'auth',
      status: 'failure',
      actionDetail: 'auth.api.missing_token',
      ipAddress: req.ip,
      metaData: {
        method: req.method,
        path: req.path,
        reason: 'malformed_header',
      } as any,
    }).catch(err => console.error('[AuthMiddleware] Failed to write log:', err));

    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log('✅ TOKEN STILL VALID');
    next();
  } catch (error: any) {
    // ── Token invalid hoặc expired ──────────────────────────
    const isExpired = error.name === 'TokenExpiredError';

    LogService.write({
      message: `API called with ${isExpired ? 'expired' : 'invalid'} token: ${req.method} ${req.path}`,
      actor_type: 'system',
      type: 'auth',
      status: 'failure',
      actionDetail: 'auth.api.invalid_token',
      ipAddress: req.ip,
      metaData: {
        method: req.method,
        path: req.path,
        reason: isExpired ? 'token_expired' : 'token_invalid',
        errorName: error.name,
      } as any,
    }).catch(err => console.error('[AuthMiddleware] Failed to write log:', err));

    console.log('❌ TOKEN EXPIRED ❌');
    return res.status(401).json({ message: `Invalid or expired token: ${error}` });
  }
}

export function loginValidation(req: any, res: any, next: any) {
  const { password, email } = req.body;
  try {
    if (!password || !email) {
      return res.status(400).json({ message: "All fields are required controller" });
    }

    console.log('IP: ', req.ip);

    const isSHA256Hex = /^[a-f0-9]{64}$/.test(password);
    if (!isSHA256Hex) {
      return res.status(400).json({ status: false, message: "Invalid password format" });
    }

    if (!validateEmail(email)) {
      return res.status(401).json({ message: "Invalid email format" });
    }

    const loginDTP: LoginDTO = { email, password };
    req.logInDTO = loginDTP;
    next();
  } catch (err: any) {
    // ── Unexpected error trong validation ──────────────────
    LogService.write({
      message: `Unexpected error in loginValidation: ${err.message}`,
      actor_type: 'system',
      type: 'error',
      status: 'failure',
      actionDetail: 'auth.login.validation_error',
      ipAddress: req.ip,
      metaData: { error: err.message, stack: err.stack } as any,
    }).catch(e => console.error('[AuthMiddleware] Failed to write log:', e));

    console.error(`Error in loginMiddleware for ${email}:`, err);
    res.status(500).json({ message: "Internal server error at verify login middleware" });
  }
}

export function registerValidation(req: any, res: any, next: any) {
  const { userName, email, passwordHash, encryptedSecretKey_user, encryptedSecretKey_server, salt } = req.body;

  try {
    if (!userName || !email || !passwordHash || !salt || !encryptedSecretKey_user || !encryptedSecretKey_server) {
      return res.status(400).json({ status: false, message: "All fields are required" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ status: false, message: "Invalid email format" });
    }

    const isSHA256Hex = /^[a-f0-9]{64}$/.test(passwordHash);
    if (!isSHA256Hex) {
      return res.status(400).json({ status: false, message: "Invalid password format" });
    }

    const resDTO: RegisterDTO = {
      userName, email, password: passwordHash, salt,
      encryptedSecretKey_user, encryptedSecretKey_server,
    };
    req.resDTO = resDTO;
    next();
  } catch (err: any) {
    // ── Unexpected error trong validation ──────────────────
    LogService.write({
      message: `Unexpected error in registerValidation: ${err.message}`,
      actor_type: 'system',
      type: 'error',
      status: 'failure',
      actionDetail: 'auth.register.validation_error',
      ipAddress: req.ip,
      metaData: { error: err.message, stack: err.stack } as any,
    }).catch(e => console.error('[AuthMiddleware] Failed to write log:', e));

    console.error(`Error in registerMiddleware for ${email}:`, err);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

export function verifyOTP(otpRepo: IOTPRepository) {
  return async (req: any, res: any, next: any) => {
    try {
      const { email, otp, type } = req.body;

      if (!otp || !validateOTP(otp) || otp.length < 6) {
        console.log("Invalid OTP format");
        return res.status(400).json({ message: "Invalid OTP format" });
      }

      const OTPStored = await otpRepo.getOTP(email);

      // ── OTP hết hạn hoặc không tồn tại ─────────────────
      if (!OTPStored) {
        await LogService.write({
          message: `OTP expired or not found for: ${email}`,
          actor_type: 'user',
          type: 'auth',
          status: 'failure',
          actionDetail: 'otp.verify.expired',
          ipAddress: req.ip,
          metaData: { email, otpType: type } as any,
        });

        console.log(`OTP expired or not found for: ${email}`);
        return res.status(400).json({ message: "OTP has expired or not found" });
      }

      // ── OTP sai ─────────────────────────────────────────
      if (OTPStored !== otp) {
        await LogService.write({
          message: `Invalid OTP attempt for: ${email}`,
          actor_type: 'user',
          type: 'auth',
          status: 'failure',
          actionDetail: 'otp.verify.mismatch',
          ipAddress: req.ip,
          metaData: { email, otpType: type } as any,
        });

        console.log(`Invalid OTP attempt for: ${email}`);
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // ── OTP hợp lệ — success log để controller quyết định context ──
      const otpDTO: VerifyOtpDTO = { email, otpCode: otp, type };
      req.otpDTO = otpDTO;
      next();
    } catch (error: any) {
      // ── Unexpected error ────────────────────────────────
      await LogService.write({
        message: `Unexpected error in verifyOTP: ${error.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'otp.verify.error',
        ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });

      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export function emailValidation(req: any, res: any, next: any) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: false, message: "Email is required" });
  if (!validateEmail(email)) return res.status(401).json({ status: false, message: "Invalid email format" });
  next();
}

export function passwordValidation(req: any, res: any, next: any) {
  //vì email đã được validation trước đó rồi
  const { newPassword, email } = req.body;
  if (!newPassword) {
    return res
      .status(400)
      .json({ status: false, message: "Password is required" });
  }

  const isSHA256Hex = /^[a-f0-9]{64}$/.test(newPassword);
  if (!isSHA256Hex) {
    return res.status(400).json({
      status: false,
      message: "Invalid password format",
    });
  }

  const resetPasswordDTO: ResetPasswordDTO = {
    email: email,
    newPassword: newPassword,
  };
  req.resetPasswordDTO = resetPasswordDTO;
  next();
}
