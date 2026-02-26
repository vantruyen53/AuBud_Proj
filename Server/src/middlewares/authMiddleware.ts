import type {
  LoginDTO,
  RegisterDTO,
  VerifyOtpDTO,
  ResetPasswordDTO
} from "../data/DTO/AuthDTO.ts";
import { verifyToken } from "../utils/helpers/jwt.js";
import {
  validateEmail,
  validateOTP,
  passwordRegex,
} from "../utils/helpers/validation.js";
import OTPRepository from "../data/repositories/OTPRepositoryImpl.js";
import type { IOTPRepository } from "../domain/interfaces/auth/IOTPRepository.js";

export function authenticateJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: `Invalid or expired token: ${error}` });
  }
}
export function loginValidation(req: any, res: any, next: any) {
  const { password, email } = req.body;
  try {
    if (!password || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    if (!passwordRegex(password)) {
      return res
        .status(400)
        .json({
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
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
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !password || !email) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Password must be at least 8 characters long",
        });
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email format" });
    }

    const resDTO: RegisterDTO = {
      userName: fullName,
      email: email,
      password: password,
    };
    req.resDTO = resDTO;
    next();
  } catch (err) {
    console.error(`Error in registerMiddleware for ${email}:`, err);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}
export function emailValidation(req: any, res: any, next: any) {
  const { email } = req.body;
  if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  if (!validateEmail(email)) {
      return res.status(401).json({ message: "Invalid email format" });
  }
  next();
}

export function passwordValidation(req: any, res: any, next: any) {
  const { newPassword, email } = req.body;
  console.log('============newPassword:', newPassword)
  console.log('============email:', email)
  if (!newPassword) {
    return res.status(400).json({ message: "Password is required" });
  }
  if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    if (!passwordRegex(newPassword)) {
      return res
        .status(400)
        .json({
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }
  const resetPasswordDTO: ResetPasswordDTO = {
    email: email,
    newPassword: newPassword,
  }
  req.resetPasswordDTO = resetPasswordDTO;
  next();
}

export  function verifyOTP(otpRepo: IOTPRepository,) {
  return async (req: any, res: any, next:any)=>{
    try {
      const { email, otp, type } = req.body;
      const OTPStored = await otpRepo.getOTP(email);
      if (!otp || !validateOTP(otp) || otp.length < 6) {
        console.log("Invalid OTP format");
        return res.status(400).json({ message: "Invalid OTP format" });
      }
      if (!OTPStored) {
        console.log(`OTP expired or not found for: ${email}`);
        return res.status(400).json({ message: "OTP has expired or not found" });
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
      next()
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
