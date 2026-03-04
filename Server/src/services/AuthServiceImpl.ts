import type { IAuthService } from "../domain/models/auth/IAuthService.js";
import type { IUserRepository } from "../domain/models/auth/IUserRepository.js";
import type { IOTPRepository } from "../domain/models/auth/IOTPRepository.js";
import { TokenService } from "./tokenService.js";
import { NotificationStrategy } from "../utils/strategies/NotificationStratery.js";
import { NotificationChannelFactory } from "../utils/factories/NotificationFactory.js";
import {
  User,
  Account,
} from "../domain/entities/authEntities.js";
import {ServerResult} from '../domain/entities/appEntities.js';
import type {
  RegisterDTO,
  LoginDTO,
  VerifyOtpDTO,
} from "../data/DTO/AuthDTO.js";
import { hashedPassword, comparePassword } from "../utils/helpers/bcrypt.js";
import { AccountStatus, Role } from "../domain/enums/authEnums.js";
import crypto from "crypto";
import type {
  IAuthStrategy,
  AuthPayload,
  AuthResult,
} from "../domain/models/auth/IAuthStrategy.js";
import { GoogleAuthStrategy } from "../utils/strategies/GoogleAuthStrategy.js";
import datetime from "../utils/helpers/datetime.js";
import { normalizeDeviceInfo } from "../utils/helpers/normalizeDeviceInfo.js";
import { Login } from "../domain/entities/authEntities.js";
import {
  decryptWithPrivateKey,
  generateSalt,
  deriveKEK,
  newEncryptSecretKeyWithKEK,
} from "../utils/helpers/RSA.js";

export class AuthServiceImpl implements IAuthService {
  private notificationStrategy: NotificationStrategy;

  constructor(
    private userRepo: IUserRepository,
    private otpRepo: IOTPRepository,
    private tokenService: TokenService,
  ) {
    this.notificationStrategy = new NotificationStrategy(
      NotificationChannelFactory,
    );
  }

  // --- 1. LOGIN ---
  async login(data: LoginDTO, deviceInfo: string) {
    // Tìm account theo email
    const account = await this.userRepo.findByEmail(data.email);
    if (!account || !account.verified)
      return new Login(
        false,"Email hoặc mật khẩu không đúng khi tìm kiếm email",
        "","","","","",
      );
    // Kiểm tra trạng thái tài khoản
    if (account.status === AccountStatus.BAN)
      return new Login(
        false,"Tài khoản của bạn đã bị khóa",
        "","","","","",
      );
    // Kiểm tra mật khẩu
    const isMatch = await comparePassword(data.password, account.passwordHash);
    if (!isMatch)
      return new Login(
        false,"Email hoặc mật khẩu không đúng khi so sánh mật khẩu",
        "","","","","",
      );

    // Tạo Session (Access Token & Refresh Token)
    const tokens = await this.tokenService.createSession(
      { id: account.userId, userName: account.userName, role: account.role },
      deviceInfo,
    );

    const lastDevice = await this.tokenService.findLastDeviceByUserId(
      account.userId,
    );
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
          console.error("[Notification Error] Device change alert:", err),
        );
    }

    return new Login(
      true,
      "Đăng nhập thành công",
      account.email,
      tokens.accessToken,
      tokens.refreshToken,
      account.salt,
      account.encryptedSecretKey_user,
    );
  }

  // --- 2. REGISTER ---
  async register(data: RegisterDTO) {
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
      false, // verified = false, chờ OTP
      now,
      data.salt,
      data.encryptedSecretKey_user,
      data.encryptedSecretKey_server,
    );

    // Lưu vào DB qua Repository (Transaction đã được xử lý trong Repo)
    await this.userRepo.create(newUser, newAccount);

    return { userId };
  }

  //3.1 verify email to change pw
  async verifyEmailForPasswordReset(email: string) {
    const account = await this.userRepo.findByEmail(email);
    if (!account || !account.verified)
      return new ServerResult(
        false,
        "Email không tồn tại hoặc chưa được xác minh",
      );
    // Kiểm tra trạng thái tài khoản
    if (account.status === AccountStatus.BAN)
      return new ServerResult(false, "Tài khoản của bạn đã bị khóa");
    return new ServerResult(true, "Email hợp lệ, có thể tiếp tục đổi mật khẩu");
  }

  //3.2 change password
  async changePassword(email: string, newPassword: string) {
    const encryptedSecretKeyServer =
      await this.userRepo.getEncryptedSecretKeyServerByEmail(email);
    if (!encryptedSecretKeyServer) {
      return new ServerResult(
        false,
        "Không tìm thấy tài khoản hoặc tài khoản chưa được xác minh",
      );
    }

    const secretKey = decryptWithPrivateKey(
      encryptedSecretKeyServer, // encrypted data trước
      process.env.RSA_PRIVATE_KEY || "", // private key sau
    );

    const newSalt = await generateSalt();

    const newKek = deriveKEK(newPassword, newSalt);

    const newEncryptedSecretKeyServer = await newEncryptSecretKeyWithKEK(
      secretKey,
      newKek,
    );

    //bcrypt
    const hashedNewPassword = await hashedPassword(newPassword);

    const result = await this.userRepo.updatePasswordAndEncryptedSecretKeyUser(
      email,
      hashedNewPassword,
      newEncryptedSecretKeyServer,
      newSalt,
    );

    if (result) {
      console.log(
        `Password, salt, encryptedSecretKey_user updated successfully for email: ${email}`,
      );
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
      body: `Mã xác thực của bạn là: ${otp}. Mã này có hiệu lực trong 60 giây.`,
    });

    if (!result.success) {
      console.log("Không thể gửi email OTP");
      return false;
    }
    return true;
  }

  async verifyAcc(email: string) {
    const result = await this.userRepo.verifyAcc(email);

    if (result) return new ServerResult(true, `verified account - ${email}`);
    else return new ServerResult(false, `verifiy account - ${email} failed`);
  }

  // Thêm method loginWithGoogle vào AuthServiceImpl
  async loginWithGoogle(
    idToken: string,
    deviceInfo: string,
    salt: string,
    encryptedSecretKey_user: string,
    encryptedSecretKey_server: string,
  ) {
    const googleStrategy = new GoogleAuthStrategy();
    const payload = await googleStrategy.authenticate(idToken);

    // Tìm hoặc tạo account
    let account = await this.userRepo.findByEmail(payload.email);

    if (!account) {
      // Tạo mới user + account cho tài khoản Google
      const userId = crypto.randomUUID();
      const accountId = crypto.randomUUID();
      const now = datetime();

      const newUser = new User(userId, payload.name, now, now);
      const newAccount = new Account(
        accountId,
        payload.email,
        "", // password null — tài khoản Google
        Role.USER,
        userId,
        AccountStatus.ACTIVE,
        true, // verified mặc định true vì Google đã xác minh email
        now,
        salt,
        encryptedSecretKey_user,
        encryptedSecretKey_server,
      );

      await this.userRepo.create(newUser, newAccount);
      account = await this.userRepo.findByEmail(payload.email);
    } else if (!account.googleId && payload.googleId) {
      // Email đã tồn tại nhưng chưa liên kết Google → tự động liên kết
      await this.userRepo.linkGoogleId(account.id, payload.googleId);
    }

    if (!account) throw new Error("Không thể tạo tài khoản");
    if (account.status === AccountStatus.BAN)
      throw new Error("Tài khoản đã bị khóa");

    const tokens = await this.tokenService.createSession(
      { id: account.userId, role: account.role },
      deviceInfo,
    );

    return {
      status: true,
      message: "Đăng nhập bằng Google thành công",
      user: { id: account.userId, email: account.email, role: account.role },
      ...tokens,
    };
  }
}
