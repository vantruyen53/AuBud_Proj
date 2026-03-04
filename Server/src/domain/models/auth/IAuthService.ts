import type  { RegisterDTO, LoginDTO } from '../../../data/DTO/AuthDTO.js';
import { Role } from '../../enums/authEnums.js';
import { ServerResult, Login } from '../../entities/authEntities.js';

export interface IAuthService {
  register(data: RegisterDTO, ): Promise<{userId:string}>; // Trả về userId hoặc thông báo
  login(data: LoginDTO, deviceInfo: string): Promise<Login>;
  sendOTP(email: string): Promise<boolean>;
  verifyEmailForPasswordReset(email: string): Promise<ServerResult>;
  changePassword(email: string, newPassword: string): Promise<ServerResult>;
  verifyAcc(email:string):Promise<ServerResult>
  changePassword(email: string, newPassword: string): Promise<ServerResult>;
  // googleAuth(token: string): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: Role; }; }>;
}