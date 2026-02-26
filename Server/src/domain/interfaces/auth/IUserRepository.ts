import { User, Account, ServerResult } from '../../entities/authEntities.js';

export interface IUserRepository {
  create(user: User, account: Account): Promise<void>;
  findByEmail(email: string, password?:string): Promise<Account | null>;
  findById(id: string): Promise<User | null>;
  updateAccountStatus(id: string, status: string): Promise<void>;
  verifyAcc(email:string):Promise<boolean>;
  updatePassword(email: string, newPasswordHash: string): Promise<ServerResult>;
  findByGoogleId(googleId: string): Promise<Account | null>;
  linkGoogleId(accountId: string, googleId: string): Promise<void>
}