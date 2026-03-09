import type  { RegisterDTO, LoginDTO } from '../../../data/DTO/AuthDTO.js';
import { Role } from '../../enums/authEnums.js';
import { Login } from '../../entities/authEntities.js';
import { ServerResult } from '../../entities/appEntities.js';
import {type GoogleProfile } from '../../../services/AuthServiceImpl.js';

export interface IAuthService {
  register(data: RegisterDTO, ): Promise<{userId:string}>; // Trả về userId hoặc thông báo
  login(data: LoginDTO, deviceInfo: string): Promise<Login>;
  sendOTP(email: string): Promise<boolean>;
  verifyEmailForPasswordReset(email: string): Promise<ServerResult>;
  changePassword(email: string, newPassword: string): Promise<ServerResult>;
  verifyAcc(email:string):Promise<ServerResult>
  changePassword(email: string, newPassword: string): Promise<ServerResult>;
  loginWithGoogle(profile: GoogleProfile, deviceInfo: string): Promise<any>;
  saveKeyBundle(userId: string,salt: string,encryptedSecretKey_user: string,encryptedSecretKey_server: string,): Promise<void>
}