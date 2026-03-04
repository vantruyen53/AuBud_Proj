export const AES_KEY_LENGTH = 32; // 256-bit
export const AES_IV_LENGTH = 12; // 96-bit — chuẩn cho GCM
export const PBKDF2_ITERATIONS = 5_000; // OWASP 2023
export const PBKDF2_KEY_LENGTH = 32; // 256-bit
export const SALT_LENGTH = 16; // 128-bit
export const TAG_LENGTH = 16; // 128-bit GCM auth tag

export const API_URL         = process.env.EXPO_PUBLIC_API_URL;
export const SECRET_KEY_STORE = "secretKey";
