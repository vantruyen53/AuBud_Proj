import type { IAuthService } from "../domain/interfaces/auth/IAuthService.js";
import type { IUserRepository } from "../domain/interfaces/auth/IUserRepository.js";
import type { IOTPRepository } from "../domain/interfaces/auth/IOTPRepository.js";
import  { TokenService } from "./tokenService.js";
import  { NotificationStrategy } from '../utils/strategies/NotificationStratery.js';
import  { NotificationChannelFactory } from "../utils/factories/NotificationFactory.js";
import  { User, Account, ServerResult } from "../domain/entities/authEntities.js";
import type { RegisterDTO, LoginDTO, VerifyOtpDTO } from "../data/DTO/AuthDTO.js";
import { hashedPassword, comparePassword } from "../utils/helpers/bcrypt.js";
import { AccountStatus, Role } from "../domain/enums/authEnums.js";
import crypto from 'crypto';
import type { IAuthStrategy, AuthPayload, AuthResult } from "../domain/interfaces/auth/IAuthStrategy.js";
import { GoogleAuthStrategy } from "../utils/strategies/GoogleAuthStrategy.js";
import datetime from '../utils/helpers/datetime.js';
import { normalizeDeviceInfo } from "../utils/helpers/normalizeDeviceInfo.js";

export class AuthServiceImpl implements IAuthService {
  private notificationStrategy: NotificationStrategy;

  constructor(
    private userRepo: IUserRepository,
    private otpRepo: IOTPRepository,
    private tokenService: TokenService
  ) {
    this.notificationStrategy = new NotificationStrategy(NotificationChannelFactory);
  }

  // --- 1. LOGIN ---
  async login(data: LoginDTO, deviceInfo: string) {
    // Tìm account theo email
    const account = await this.userRepo.findByEmail(data.email);
    if (!account || !account.verified)
      return {
        status: false,
        message:"Email hoặc mật khẩu không đúng khi tìm email",
        user: { id: '', email: '', role: Role.NULL },
        accessToken: '',
        refreshToken:'',
      }
    // Kiểm tra trạng thái tài khoản
    if (account.status === AccountStatus.BAN)
      return {
        status: false,
        message:"Tài khoản của bạn đã bị khóa",
        user: { id: '', email: '', role: Role.NULL },
        accessToken: '',
        refreshToken:'',
      };
    // Kiểm tra mật khẩu
    const isMatch = await comparePassword(data.password, account.passwordHash);
    if (!isMatch)
      return {
        status: false,
        message:"Email hoặc mật khẩu không đúng khi so sánh mật khẩu",
        user: { id: '', email: '', role: Role.NULL },
        accessToken: '',
        refreshToken:'',
      }
    // Tạo Session (Access Token & Refresh Token)
    const tokens = await this.tokenService.createSession(
      { id: account.userId, role: account.role },
      deviceInfo
    );

    const lastDevice = await this.tokenService.findLastDeviceByUserId(account.userId);
    if (lastDevice && lastDevice !== deviceInfo) {
    // Thiết bị khác nhau → gửi in-app notification
    // Không await để không block response về client
    this.notificationStrategy
      .sendTo("in-app", {
        recipientId: account.userId,
        title: "Đăng nhập từ thiết bị mới",
        body: `Tài khoản của bạn vừa đăng nhập từ thiết bị: ${deviceInfo}. Nếu không phải bạn, hãy đổi mật khẩu ngay.`,
        metadata: {
          previousDevice: lastDevice,
          currentDevice: deviceInfo,
          loginAt: new Date().toISOString(),
        },
      })
      .catch((err) =>
        console.error("[Notification Error] Device change alert:", err)
      );
    }
  
    return {
      status: true,
      message:"Login successfullly",
      user: { id: account.userId, email: account.email, role: account.role },
      ...tokens
    };
  }

  // --- 2. REGISTER ---
  async register(data: RegisterDTO & { publicKey: string, encryptedPrivateKey: string }) {
    // Băm mật khẩu (Security: pass từ client đã qua validate ở middleware)
    const passHash = await hashedPassword(data.password);
    
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();
    const now = datetime();

    // Khởi tạo Entity User và Account
    const newUser = new User(userId, data.userName, now, now);
    const newAccount = new Account(
      accountId,
      data.email,
      passHash,
      Role.USER,
      userId,
      AccountStatus.ACTIVE,
      false, // Mặc định true nếu đã qua bước verify OTP ở middleware
      now,
      data.publicKey,         // Nhận từ Client (Zero-knowledge)
      data.encryptedPrivateKey // Nhận từ Client (Zero-knowledge)
    );

    // Lưu vào DB qua Repository (Transaction đã được xử lý trong Repo)
    await this.userRepo.create(newUser, newAccount);

    return { userId };
  }

  //3.1 verify email to change pw
  async verifyEmailForPasswordReset(email: string) {
    const account = await this.userRepo.findByEmail(email);
    if (!account || !account.verified)
      return new ServerResult(false, "Email không tồn tại hoặc chưa được xác minh");
    // Kiểm tra trạng thái tài khoản
    if (account.status === AccountStatus.BAN)
      return new ServerResult(false, "Tài khoản của bạn đã bị khóa");
    return new ServerResult(true, "Email hợp lệ, có thể tiếp tục đổi mật khẩu");
  }
    
  //3.2 change password
  async changePassword(email: string, newPassword: string) {
    const hashedNewPassword = await hashedPassword(newPassword);
    const result = await this.userRepo.updatePassword(email, hashedNewPassword);

    if (result) {
      return new ServerResult(true, result.message);
    } else {
      return new ServerResult(false, "Cập nhật mật khẩu thất bại");
    }
  }

  // --- 4. SEND OTP ---
  async sendOTP(email: string) {
    // Tạo mã 6 số
    const otp = await this.otpRepo.generateOTP();
    
    // Lưu vào Redis (hết hạn sau 60s)
    await this.otpRepo.saveOTP(email, otp, 60);

    // Gửi qua Email
    const result = await this.notificationStrategy.sendTo("email", {
      recipientId: "guest",
      recipientEmail: email,
      title: "Mã xác thực OTP của bạn",
      body: `Mã xác thực của bạn là: ${otp}. Mã này có hiệu lực trong 60 giây.`
    });

    if (!result.success){
      console.log("Không thể gửi email OTP");
      return false
    }
    return true;
  }

  async verifyAcc(email:string){
    const result = await this.userRepo.verifyAcc(email);

    if(result)
      return new ServerResult(true,`verified account - ${email}`)
    else
      return new ServerResult(false,`verifiy account - ${email} failed`)

  }

  // Thêm method loginWithGoogle vào AuthServiceImpl
  async loginWithGoogle(idToken: string, deviceInfo: string) {
    const googleStrategy = new GoogleAuthStrategy();
    const payload = await googleStrategy.authenticate(idToken);

    // Tìm hoặc tạo account
    let account = await this.userRepo.findByEmail(payload.email);

    if (!account) {
      // Tạo mới user + account cho tài khoản Google
      const userId    = crypto.randomUUID();
      const accountId = crypto.randomUUID();
      const now       = datetime();

      const newUser    = new User(userId, payload.name, now, now);
      const newAccount = new Account(
        accountId,
        payload.email,
        '',              // password null — tài khoản Google
        Role.USER,
        userId,
        AccountStatus.ACTIVE,
        true,              // verified mặc định true vì Google đã xác minh email
        now,
        '',              // publicKey — chưa có, xử lý sau nếu cần
        '',              // encryptedPrivateKey
        payload.googleId,  // thêm field này vào Account entity
      );

      await this.userRepo.create(newUser, newAccount);
      account = await this.userRepo.findByEmail(payload.email);

    } else if (!account.googleId && payload.googleId) {
      // Email đã tồn tại nhưng chưa liên kết Google → tự động liên kết
      await this.userRepo.linkGoogleId(account.id, payload.googleId);
    }

    if (!account) throw new Error("Không thể tạo tài khoản");
    if (account.status === AccountStatus.BAN) throw new Error("Tài khoản đã bị khóa");

    const tokens = await this.tokenService.createSession(
      { id: account.userId, role: account.role },
      deviceInfo
    );

    return {
      user: { id: account.userId, email: account.email, role: account.role },
      ...tokens
    };
  }
}