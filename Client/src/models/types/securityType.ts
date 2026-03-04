export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string;         // base64
  tag: string;        // base64 — GCM auth tag, chống tamper
}

export interface KeyBundle {
  secretKey: string;              // base64 — chỉ tồn tại trong memory
  salt: string;                   // base64 — lưu DB
  encryptedSecretKey_user: string;   // base64 — lưu DB
  encryptedSecretKey_server: string; // base64 — lưu DB
}

