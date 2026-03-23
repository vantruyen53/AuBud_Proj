import { User, Account, UserRefresh} from '../../entities/authEntities.js';
import { ServerResult } from '../../entities/appEntities.js';
import {type UserToSendNotifi} from '../../../data/repositories/auth/UserRepositoryImpl.js';
import { type PoolConnection } from 'mysql2/promise';

export interface IUserRepository {
  create(user: User, account: Account): Promise<void>;
  findByEmail(email: string, password?:string): Promise<any | null>;
  findById(id: string): Promise<UserRefresh | null>;
  getEncryptedSecretKeyServerByEmail(email: string): Promise<string | null>;
  getUserToSendNotifi():Promise<UserToSendNotifi[]>
  updateAccountStatus(id: string, status: string): Promise<void>;
  verifyAcc(email:string):Promise<boolean>;
  updatePasswordAndEncryptedSecretKeyUser(
    email: string, 
    newPasswordHash: string,
    newEncryptedSecretKeyUser?: string, newSalt?: string): Promise<ServerResult>;
  findByGoogleId(googleId: string): Promise<Account | null>;
  linkGoogleId(accountId: string, googleId: string): Promise<void>
  updateKeyBundle(userId: string,salt: string,encryptedSecretKey_user: string,encryptedSecretKey_server: string,): Promise<void> 
  checkUserRole(userId: string): Promise<string | null>;
  updateLastLogin(userId:string, ):Promise<boolean>;
  updateLastInput(userId:string, conn?: PoolConnection):Promise<void>;
  getUsersWithNoInputToday(offset: number, limit: number): Promise<{ userId: string; email: string; userName: string }[]>
  trackDailyTraffic(userId: string): Promise<void>
}