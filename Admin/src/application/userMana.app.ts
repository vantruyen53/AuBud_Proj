import { UserManaService } from "../services/serviceImplement/userManaService";

export interface User{
    id:string
    name:string,
    email:string,
    role: string,
    join:string,
    lastActive:string,
    status: string
}
interface UserTable{
    total:number,
    users:User[]
}

const _service = new UserManaService();

export const UserManaApp={
    async get(role: string, status:string, offset:number, limit:number):Promise<UserTable>{
        const result = await _service.getUser(role, status, offset.toString(), limit.toString())
        return result
    },

    async ban(userId:string, email:string, userName:string , reason:string, toState:'ban'|'active'):Promise<{status:boolean, message:string}>{
        const result = await _service.ban(userId, email, userName, reason, toState)
        return result
    }
}

