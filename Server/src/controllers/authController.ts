import { AuthServiceImpl } from '../services/AuthServiceImpl.js';
import {TokenService} from '../services/tokenService.js';
import TokenRepositoryImpl from "../data/repositories/TokenRepository.js";
import {verifyToken} from '../utils/helpers/jwt.js';

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
  ) {}

  register = async (req: any, res: any) => {
    try {
      const registerData = req.resDTO;
      
      // Bổ sung publicKey và encryptedPrivateKey từ body (nhận từ Client)
      const { publicKey, encryptedPrivateKey } = req.body;

      if (!publicKey || !encryptedPrivateKey) {
        return res.status(400).json({ 
          status: false, 
          message: "Thiếu thông tin mã hóa (RSA Keys)" 
        });
      }

      const result = await this.authService.register({
        ...registerData,
        publicKey,
        encryptedPrivateKey
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
        status: result.status,
        message: result.message,
        data: {
          data: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error: any) {
      console.error("Controller Login Error:", error.message);
      return res.status(401).json({ 
        status: false, 
        message: error.message || "Đăng nhập thất bại" 
      });
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
      else        return res.status(400).json({
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

        if(!updateAccVerify.status)
          return res.status(200).json({ 
            status: true, 
            message: updateAccVerify.message
          });
        else 
          return res.status(401).json({ 
            status: false, 
            message: updateAccVerify.message
          });
      } else{
        return res.status(200).json({ 
            status: true, 
            message: "OTP is correct"
          });
      }
    } catch (error: any) {
      return res.status(500).json({ status: false, message: error.message });
    }
  };

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
    const { refreshToken, userId } = req.body;
    const deviceInfo = req.headers['user-agent'] || "Unknown Device";

    const decoded = verifyToken(refreshToken, "refresh") as unknown as DecodedToken;
    if (!decoded) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    const isValidInDb = await this.tokenService.validateRefreshToken(refreshToken);
      if (!isValidInDb) {
        return res.status(403).json({ message: "Token has been revoked" });
      }

    await this.tokenService.revokeSession(refreshToken);

    const tokens = await this.tokenService.createSession(
        //tuyệt đối không nên lấy userId từ req.body
        /*Nếu hacker có một Refresh Token hợp lệ của User A, 
        nhưng họ gửi kèm userId của User B trong body, và server của bạn tin vào cái body đó, 
        bạn sẽ vô tình cấp Access Token của User B cho hacker. 
        Đây là lỗ hổng IDOR (Insecure Direct Object Reference).*/
        { id: decoded.id}, 
        deviceInfo
      );

    res.json({status: true, ...tokens });
  }

  loginWithGG =  async (req: any, res: any) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: "idToken là bắt buộc" });
      }

      // Lấy deviceInfo từ header User-Agent (giống login thường)
      const deviceInfo = req.headers['user-agent'] || "Unknown Device";

      const result = await this.authService.loginWithGoogle(idToken, deviceInfo);

      return res.status(200).json(result);

    } catch (error: any) {
      console.error("[Google Auth Error]", error.message);
      return res.status(401).json({ message: "Xác thực Google thất bại" });
    }
  }
}