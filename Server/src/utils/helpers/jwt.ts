import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const generateToken = (user:any) =>{
    const accessToken = jwt.sign(
        { id: user.id, userName: user.userName, role: user.role }, 
        ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' });
    return accessToken;
}
const RefreshToken = (user:any) =>{
    const refreshToken = jwt.sign(
        { id: user.id,userName:user.userName, role: user.role }, 
        REFRESH_TOKEN_SECRET, 
        { expiresIn: '30d' });
    return refreshToken;
}
const verifyToken = (token: string, type = 'access') => {
    const secret = type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
    // Không dùng try-catch ở đây, hãy để nó tự throw lỗi của thư viện JWT
    return jwt.verify(token, secret);
}
export { generateToken, RefreshToken, verifyToken };