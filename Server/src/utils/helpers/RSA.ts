import crypto from 'crypto';
import forge from "node-forge";

const AES_IV_LENGTH  = 12;  // bytes
const TAG_LENGTH     = 16;  // bytes
const PBKDF2_ITERATIONS=5_000
const PBKDF2_KEY_LENGTH = 32

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string;         // base64
  tag: string;        // base64 — GCM auth tag, chống tamper
}

export function generateKeyPair(){
    return crypto.generateKeyPairSync('rsa',{
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    })
}
export function encryptWithPublicKey(text:string, publicKey:string){
    const buffer = Buffer.from(text, 'utf8')
    const encrypted = crypto.publicEncrypt(
        {
            key:publicKey,
            padding:crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        buffer
    )
    return encrypted.toString('base64');
}

//  GIẢI MÃ SECRET KEY BẰNG ServerPrivateKey
export function decryptWithPrivateKey(
  EncryptedSecretKey_server: string,
  ServerPrivateKey: string
): string {
  const buffer = Buffer.from(EncryptedSecretKey_server, 'base64');

  const decrypted = crypto.privateDecrypt(
    {
      key: ServerPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",        // ← fix 1: hash khớp với client
    },
    buffer
  );

  return decrypted.toString('base64'); // ← fix 2: encoding đúng cho downstream
}

export async function generateSalt(): Promise<string> {
  const randomBytes = crypto.randomBytes(16);
  return forge.util.encode64(
    String.fromCharCode(...randomBytes)
  );
}
// KDF — Derive KEK từ new_password + new_salt
export function deriveKEK(password: string, saltBase64: string): string {
  const salt = forge.util.decode64(saltBase64);
  const kek  = forge.pkcs5.pbkdf2(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    "sha256"
  );
  return forge.util.encode64(kek);
}


export async function newEncryptSecretKeyWithKEK(
  secretKeyBase64: string,
  kekBase64: string
): Promise<string> {
  const secretKey = forge.util.decode64(secretKeyBase64);
  const kek       = forge.util.decode64(kekBase64);

  const ivBytes = crypto.randomBytes(AES_IV_LENGTH); 
  const iv      = String.fromCharCode(...ivBytes);

  const cipher = forge.cipher.createCipher("AES-GCM", kek);
  cipher.start({ iv, tagLength: TAG_LENGTH * 8 }); 
  cipher.update(forge.util.createBuffer(secretKey));
  cipher.finish();

  const payload: EncryptedPayload = {
    ciphertext: forge.util.encode64(cipher.output.getBytes()),
    iv:         forge.util.encode64(iv),
    tag:        forge.util.encode64(cipher.mode.tag.getBytes()),
  };

  return JSON.stringify(payload);
}

