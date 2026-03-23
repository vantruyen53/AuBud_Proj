import { NotificationService } from "../services/serviceImplement/notificationService";

const _service = new NotificationService();

export interface AdminNotifaction{
    id:string,
    title:string,
    message:string,
    recipients:string,
    metaData?:unknown,
    channels:string,
    status:string,
    sendAt:string,
}

export interface NotificationPage{
    totalUser:number,
    totalRow:number,
    data:AdminNotifaction[]
}

export interface NotificationDTO{
    title:string,
    message:string,
    recipients:string,
    metaData?:unknown,
    channels:string[],
}

export class NotificationApp{
    async get(type:string, value:string|undefined,offset:number, limit:number):Promise<NotificationPage>{
        return await _service.get(type, value,offset.toString(), limit.toString())
    }

    async send(payLoad:NotificationDTO):Promise<{status:boolean, message:string}>{
        if(!payLoad) return {status:false, message:"Please enter full field"}
        
        return await _service.send(payLoad)
    }
}