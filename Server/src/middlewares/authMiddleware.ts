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

export function authenticateJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log('✅ TOKEN STILL VALID ')
    next();
  } catch (error:any) {
    console.log('❌ TOKEN EXPIRED ❌')
    return res
      .status(401)
      .json({ message: `Invalid or expired token: ${error}` });
  }
}
export function loginValidation(req: any, res: any, next: any) {
  const { password, email } = req.body;
  try {
    if (!password || !email) {
      return res.status(400).json({ message: "All fields are required controller" });
    }

    console.log('IP: ', req.ip)
    console.log('Password: ', password)

    const isSHA256Hex = /^[a-f0-9]{64}$/.test(password);
    if (!isSHA256Hex) {
      return res.status(400).json({
        status: false,
        message: "Invalid password format",
      });
    }

    if (!validateEmail(email)) {
      return res.status(401).json({ message: "Invalid email format" });
    }

    const loginDTP: LoginDTO = {
      email: email,
      password: password,
    };
    req.logInDTO = loginDTP;
    next();
  } catch (err) {
    console.error(`Error in loginMiddleware for ${email}:`, err);
    res
      .status(500)
      .json({ message: "Internal server error at verify login middleware" });
  }
}

export function registerValidation(req: any, res: any, next: any) {
  const {
    userName,
    email,
    passwordHash,
    encryptedSecretKey_user,
    encryptedSecretKey_server,
    salt,
  } = req.body;

  console.log("Register Validation Middleware - Received Data:", {
    userName,
    email,
    passwordHash,
    encryptedSecretKey_user,
    encryptedSecretKey_server,
    salt,
  });
  try {
    if (
      !userName ||
      !email ||
      !passwordHash ||
      !salt ||
      !encryptedSecretKey_user ||
      !encryptedSecretKey_server
    ) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email format" });
    }

    // Password lúc này là SHA-256 hex — kiểm tra đúng định dạng
    // SHA-256 luôn là 64 ký tự hex
    const isSHA256Hex = /^[a-f0-9]{64}$/.test(passwordHash);
    if (!isSHA256Hex) {
      return res.status(400).json({
        status: false,
        message: "Invalid password format",
      });
    }

    const resDTO: RegisterDTO = {
      userName: userName,
      email: email,
      password: passwordHash,
      salt: salt,
      encryptedSecretKey_user: encryptedSecretKey_user,
      encryptedSecretKey_server: encryptedSecretKey_server,
    };
    req.resDTO = resDTO;
    next();
  } catch (err) {
    console.error(`Error in registerMiddleware for ${email}:`, err);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

export function verifyOTP(otpRepo: IOTPRepository) {
  return async (req: any, res: any, next: any) => {
    try {
      const { email, otp, type } = req.body;
      const OTPStored = await otpRepo.getOTP(email);
      if (!otp || !validateOTP(otp) || otp.length < 6) {
        console.log("Invalid OTP format");
        return res.status(400).json({ message: "Invalid OTP format" });
      }
      if (!OTPStored) {
        console.log(`OTP expired or not found for: ${email}`);
        return res
          .status(400)
          .json({ message: "OTP has expired or not found" });
      }
      if (OTPStored !== otp) {
        console.log(`Invalid OTP attempt for: ${email}`);
        return res.status(400).json({ message: "Invalid OTP" });
      }
      const otpDTO: VerifyOtpDTO = {
        email: email,
        otpCode: otp,
        type: type,
      };
      req.otpDTO = otpDTO;
      next();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export function emailValidation(req: any, res: any, next: any) {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ status: false, message: "Email is required" });
  }
  if (!validateEmail(email)) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid email format" });
  }
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
