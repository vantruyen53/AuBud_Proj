export interface RegisterPayload {
  userName: string;
  email: string;
  password: string; // raw password — chỉ tồn tại trong RAM, không log
}

export interface RegisterResult {
  status: boolean;
  message: string;
}

export type OTPScreenParams = {
  OTPVerificationScreen: {
    email: string;
    type: "register" | "forgot-password";
  };
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult{
  status: boolean;
  message: string;
  user:{id:string, email:string, role:string}
  accessToken: string;
  refreshToken: string;
  salt: string;
  encryptedSecretKey_user: string;
  encryptedSecretKey_server: string;
}

export interface RefreshPasswordPayload {
  email: string;
  newPassword: string;
}