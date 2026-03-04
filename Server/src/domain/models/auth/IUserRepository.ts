import { User, Account, } from '../../entities/authEntities.js';
import { ServerResult } from '../../entities/appEntities.js';

export interface IUserRepository {
  create(user: User, account: Account): Promise<void>;
  findByEmail(email: string, password?:string): Promise<any | null>;
  findById(id: string): Promise<User | null>;
  getEncryptedSecretKeyServerByEmail(email: string): Promise<string | null>;
  updateAccountStatus(id: string, status: string): Promise<void>;
  verifyAcc(email:string):Promise<boolean>;
  updatePasswordAndEncryptedSecretKeyUser(
    email: string, 
    newPasswordHash: string,
    newEncryptedSecretKeyUser?: string, newSalt?: string): Promise<ServerResult>;
  findByGoogleId(googleId: string): Promise<Account | null>;
  linkGoogleId(accountId: string, googleId: string): Promise<void>
  checkUserRole(userId: string): Promise<string | null>;
}