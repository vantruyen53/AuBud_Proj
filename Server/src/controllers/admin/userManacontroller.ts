import { UserManaService } from "../../services/adminService/userManaService.js";

export class UserManaController{
    constructor(private _service:UserManaService){}

    getUser = async(req:any, res:any)=>{
        const {role}=req.params;
        const {status, offset, limit} = req.query;
        try{
            const data = await this._service.getUser(role, status, parseInt(offset), parseInt(limit));
            return res.status(200).json(data)
        }catch(err){
            return res.status(500).json({message: "Server error"})
        }
    }

    ban = async(req:any, res:any)=>{
        const {userId} = req.params;
        const {email, userName, reason, toState} = req.body;

        console.log('[BAN] DATA: ', userId, email, userName, reason, toState)

        try {
            const result = await this._service.ban(userId, email, userName, reason, toState)
            if(result.status)
                return res.status(200).json({message: result.message})
            return res.status(500).json({message: result.message})
        } catch (error) {
            return res.status(500).json({message: "Server error"})
        }
    }
}