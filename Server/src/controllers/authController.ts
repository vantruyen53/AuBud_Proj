import { AuthServiceImpl } from '../services/AuthServiceImpl.js';
import {TokenService} from '../services/tokenService.js';
import TokenRepositoryImpl from "../data/repositories/auth/TokenRepository.js";
import {verifyToken} from '../utils/helpers/jwt.js';
import { Role } from '../domain/enums/authEnums.js';
import type { IUserRepository } from "../domain/models/auth/IUserRepository.js";

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

      const result = await this.authService.register({
        ...registerData
      });

      return res.status(201).json({
        status: true,
        message: "Đăng ký tài khoản thành công",
        data: result
      });
    } catch (error: any) {
      console.error("Controller Register Error:", error.message);
      return res.status(500).json({ 
        status: false, 
        message: error.message || "Lỗi hệ thống khi đăng ký" 
      });
    }
  };

  // 2. Đăng nhập
  login = async (req: any, res: any) => {
    try {
      const loginData = req.logInDTO; // Lấy từ Middleware
      const deviceInfo = req.headers['user-agent'] || "Unknown Device";

      const result = await this.authService.login(loginData, deviceInfo);

      return res.status(200).json({
        ...result,
      });
    } catch (error: any) {
      console.error("Controller Login Error:", error.message);
      return res.status(401).json({ 
        status: false, 
        message: error.message || "Đăng nhập thất bại",
        user: { id: '', email: '', role: Role.NULL },
        accessToken: '',
        refreshToken: '',
        salt: '',
        encryptedSecretKey_user: '',
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

      return res.status(200).json({
        status: true,
        message: "Mã OTP đã được gửi vào email của bạn"
      });
    } catch (error: any) {
      return res.status(500).json({ status: false, message: `Controllor send otp error: ${error.message}` });
    }
  };

  verifyOtp = async (req: any, res: any) => {
    try {
      const otpData = req.otpDTO; // Lấy từ Middleware verifyOTP
      
      if(otpData.type === 'REGISTER'){
        const updateAccVerify = await this.authService.verifyAcc(otpData.email)

        if(updateAccVerify.status){
          console.log(`Account verified for email: ${otpData.email} successfully.`);
          return res.status(200).json({ 
            status: true, 
            message: updateAccVerify.message
          });
        }
        else 
          return res.status(401).json({ 
            status: false, 
            message: updateAccVerify.message
          });
      } else{
        //chang password type, vefiry email khi change password đã có route khác thực hiện  
        return res.status(200).json({ 
            status: true, 
            message: "OTP is correct"
          });
      }
    } catch (error: any) {
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
  changePassWord = async (req:any, res:any)=>{
    const resetPasswordDTO=req.resetPasswordDTO;
    try{
      const result = await this.authService.changePassword(resetPasswordDTO.email, resetPasswordDTO.newPassword);

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
          message: `Controller Change Password Error: ${error.message}`
        });
    }
  }

  logOut = async(req: any, res: any) => {
    const { refreshToken } = req.body;

    try {
        if (!refreshToken) {
        return res.status(400).json({ status: false, message: "Refresh Token is required" });
        }
        // 1. Xóa trong Database
        const result = await this.tokenService.revokeSession(refreshToken);

        // 2. Phản hồi cho Client để Client tự xóa localStorage
        if(result.status)
          return res.status(200).json({ 
          status: true, 
          message: result.message
          });
        else
          return res.status(401).json({ 
          status: false, 
          message: result.message
          });
    } catch (err) {
        console.error("Logout Error:", err);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  refreshToken= async(req: any, res: any) => {
    const { refreshToken } = req.body;
    const deviceInfo = req.headers['user-agent'] || "Unknown Device";

    let decoded: DecodedToken;
    try {
      decoded = verifyToken(refreshToken, "refresh") as unknown as DecodedToken;
    } catch {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const isValidInDb = await this.tokenService.validateRefreshToken(refreshToken);
      if (!isValidInDb) {
        return res.status(403).json({ message: "Token has been revoked" });
      }
      
    const user = await this.userRepo.findById(decoded.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    await this.tokenService.revokeSession(refreshToken);

    //Update last login.
    await this.userRepo.updateLastLogin(user.id);

    const tokens = await this.tokenService.createSession(
        //tuyệt đối không nên lấy userId từ req.body
        /*Nếu hacker có một Refresh Token hợp lệ của User A, 
        nhưng họ gửi kèm userId của User B trong body, và server của bạn tin vào cái body đó, 
        bạn sẽ vô tình cấp Access Token của User B cho hacker. 
        Đây là lỗ hổng IDOR (Insecure Direct Object Reference).*/
        { id: decoded.id,userName: user.userName, role: user.role}, 
        deviceInfo
      );

    res.json({status: true, ...tokens, user: { id: user.id, email: user.email} },);
  }

  googleCallback = async (req: any, res: any) => {
    try {
      const profile = req.user; // từ passport
      const deviceInfo = req.headers["user-agent"] || "Unknown";

      const email = profile.emails[0].value;
      const name = profile.displayName;
      const googleId = profile.id;

      // Tìm hoặc tạo user (giữ nguyên logic cũ của bạn)
      const result = await this.authService.loginWithGoogle({email, name, googleId,},deviceInfo);

      if (!result.status) {
      return res.redirect(
          `aubud-app://auth/google/callback?error=${encodeURIComponent(result.message)}`
        );
      }

      // Redirect về app kèm token
      const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      salt: result.salt,
      encryptedSecretKey_user: result.encryptedSecretKey_user,
      isNewUser: result.isNewUser ? "1" : "0",
    });

      // Deep link về app
      res.redirect(`aubud-app://auth/google/callback?${params.toString()}`);

    } catch (error: any) {
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