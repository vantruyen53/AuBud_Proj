export interface AuthPayload {
  email: string;
  name: string;
  avatarUrl?: string;
  googleId?: string;
  provider: "local" | "google";
}

export interface AuthResult {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface IAuthStrategy {
  /**
   * Xác thực và trả về thông tin user đã được chuẩn hóa
   * Input tuỳ theo strategy (idToken cho Google, password cho local...)
   */
  authenticate(credential: string): Promise<AuthPayload>;
}