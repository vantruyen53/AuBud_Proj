import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const generateToken = (user:any) =>{
    const accessToken = jwt.sign(
        { id: user.id, role: user.role }, 
        ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' });
    return accessToken;
}
const RefreshToken = (user:any) =>{
    const refreshToken = jwt.sign(
        { id: user.id, role: user.role }, 
        REFRESH_TOKEN_SECRET, 
        { expiresIn: '30d' });
    return refreshToken;
}
const verifyToken = (token:string, type='access') =>{
    const secret = type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (err) {
        console.error("Token verification failed:", err);
        return false;
    }
}
export { generateToken, RefreshToken, verifyToken };