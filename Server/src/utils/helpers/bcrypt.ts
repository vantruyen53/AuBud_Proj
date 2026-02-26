import bcrypt from "bcrypt";
export const hashedPassword = async(password:string)=>{
    return await bcrypt.hash(password, 10);
}
export const comparePassword = async (password:string, storedHash:string) => {
    try {
        const isMatch = await bcrypt.compare(password, storedHash);
        return isMatch;
    } catch (err) {
        console.error('Lỗi tại hàm comparePassword: ' + err);
        return false;
    }
}