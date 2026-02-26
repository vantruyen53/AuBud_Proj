import crypto from 'crypto';
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
export function decryptWithPrivateKey(encryptedText:string, privateKey:string){
    const buffer = Buffer.from(encryptedText, 'base64');
    const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
        buffer
    );
  return decrypted.toString('utf8');
}

