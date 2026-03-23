import { AdminNotificationService } from "../../services/adminService/notificationService.js";

export class AdminNotificationController{
    constructor(private _service:AdminNotificationService){}

    get = async (req:any, res:any)=>{
        const {type, value, offset, limit} = req.query;
        try {
            const data = await this._service.get(type, value, offset, limit)
            return res.status(200).json(data)
        } catch (error:any) {
            return res.status(500).json({message: "Server error"})
        }
    }

    sent = async(req:any, res:any)=>{
        try {
            const {title, message, recipients, metaData, channels} = req.body;

            const channelsMap = channels.map((c:string)=>{
                if(c==='inapp') 
                    return 'in-app'
                return c
            })

            console.log("[AdminNotificationController] Sent data: ", title, message, recipients,'-', channelsMap, '-',metaData)

            if(!title || !message || !recipients || !channelsMap)
                return res.status(401).json({message: `Thiếu data, các data được gởi gồm: ${title}-${message}-${recipients}-${metaData}-${channelsMap}`})

            const result = await this._service.sent(title, message, recipients,channelsMap,metaData)
            
            if(result.status)
                return res.status(200).json({status:true, message:"Sent successfully"})
            else
                return res.status(500).json({message: "Server error"})

        } catch (error:any) {
            return res.status(500).json({message: "Server error"})
        }
    }
}