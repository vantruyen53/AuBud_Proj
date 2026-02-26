export const validateEmail = (email:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validateOTP = (otp:string) => /^\d{6}$/.test(otp);
export const passwordRegex = (pass:string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);