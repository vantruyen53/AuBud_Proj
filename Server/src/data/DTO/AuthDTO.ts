export interface RegisterDTO {
  userName: string;
  email: string;
  password: string; // Password thô từ client
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