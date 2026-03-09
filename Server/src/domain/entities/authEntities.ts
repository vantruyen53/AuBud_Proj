import { Role, AccountStatus } from '../enums/authEnums.js';
export class User {
  constructor(
    public id: string,
    public userName: string,
    public createdAt: string,
    public lastInput: string
  ) {}
}

export class UserRefresh {
  constructor(
    public id: string,
    public userName: string,
    public email: string,
    public role: string
  ) {}
}

export class Login{
  constructor(
    public status: boolean,
    public message:string,
    public user:{id:string, email:string, role:string},
    public accessToken: string,
    public refreshToken: string,
    public salt: string,
    public encryptedSecretKey_user: string,
  ){}
}

export class Account {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly userId: string,
    public readonly status: AccountStatus,
    public readonly verified: boolean,
    public readonly lastLogin: string,
    public readonly salt: string,
    public readonly encryptedSecretKey_user: string,
    public readonly encryptedSecretKey_server: string,
    public readonly googleId?: string | null,
    public userName?: string
  ) {}
}