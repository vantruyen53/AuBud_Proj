// data/DTO/AuthDTO.ts
export interface RegisterDTO {
  userName: string;
  email: string;
  password: string; // SHA-256 hash từ client
  salt: string;
  encryptedSecretKey_user: string;
  encryptedSecretKey_server: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface VerifyOtpDTO {
  email: string;
  otpCode: string;
  type: 'REGISTER' | 'FORGOT_PASSWORD'; 
}

export interface ResetPasswordDTO {
  email:string;
  newPassword: string;
}