import { Role, AccountStatus } from '../enums/authEnums.js';
export class User {
  constructor(
    public id: string,
    public userName: string,
    public createdAt: string,
    public lastInput: string
  ) {}
}

export class Account {
  constructor(
    public id: string,
    public email: string,
    public passwordHash: string,
    public role: Role,
    public userId: string,
    public status: AccountStatus,
    public verified: boolean,
    public lastLogin: string,
    public publicKey:string,
    public encryptedPrivateKey:string,
    public googleId?:string
  ) {}
}

export class ServerResult{
  constructor(
    public status: boolean,
    public message: string,
  ){}
}