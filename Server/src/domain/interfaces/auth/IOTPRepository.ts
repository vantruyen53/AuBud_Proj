export interface IOTPRepository{
    generateOTP():Promise<string>
    saveOTP(email:string,  otp:string, expiryInSeconds:number):Promise<void>
    deteteOTP(email:string):Promise<void>
    getOTP(email:string):Promise<string | null>
}