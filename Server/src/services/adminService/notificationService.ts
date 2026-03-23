import { AdminNotificationRepo,type AdminNotifactionDTO,
type notificationEnum, type NotificationPage } from "../../data/repositories/admin/AdminNotificationRepo.js";
import { NotificationStrategy } from "../../utils/strategies/NotificationStratery.js";
import { NotificationChannelFactory } from "../../utils/factories/NotificationFactory.js";
import type{ NotificationChannel } from "../../domain/models/application/interface/INotification.js";
import type { IUserRepository } from "../../domain/models/auth/IUserRepository.js";
import { NotificationType } from "../../domain/enums/appEnum.js";
import type{ ITokenRepository } from "../../domain/models/auth/ITokenRepository.js";
import TokenRepositoryImpl from '../../data/repositories/auth/TokenRepository.js';

export class AdminNotificationService{
    private _notificationStrategy: NotificationStrategy;
    private tokenRepo: ITokenRepository;

    constructor(private _notirepo:AdminNotificationRepo, private _userRepo: IUserRepository){
        this._notificationStrategy = new NotificationStrategy(NotificationChannelFactory)
        this.tokenRepo = new TokenRepositoryImpl();
    }

    private async _save(title:string, message:string, recipients:string, 
        channels:NotificationChannel[],totalFailed:number,totalSent:number, metaData?:any ){
        const payLoad:AdminNotifactionDTO={
                    title,
                    message,
                    recipients,
                    status: totalSent===metaData.length?'send':'failure',
                    channels:channels.join(', '),
                    metaData:{
                        ...metaData,
                        totalSend: metaData.length,
                        totalSuccess: totalSent,
                        totalFailed
                    }
                }

                console.log("[Notification] Bắt đầu lưu data...");
                const saveResult = await this._notirepo.create(payLoad)
                if(saveResult.status)
                    console.log("[Notification] Lưu data thành công");
                else
                    console.log(`[Notification] Lưu data thât bại: ${saveResult.mess}`);
    }

    async get(type:notificationEnum, value:string|undefined,offset:string, limit:string):Promise<NotificationPage>{
        try{
            return await this._notirepo.get(type, value, offset, limit);
        } catch(err:any){
            console.log("AdminNotificationService: ", err)
            return {totalRow:0, totalUser:0, data:[]}
        }
    }

    async sent(title:string, message:string, recipients:string,  channels:NotificationChannel[], metaData?:any):Promise<{status:boolean, mess:string}>{
        try {
            console.log("[Admin Sent Notification] Bắt đầu gởi...");
            let totalSent = 0;
            let totalFailed = 0;

            const hasPush = channels.includes('push')

            if(metaData &&recipients!=='all' ){
                console.log(`[Admin Sent Notification] Gởi đến ${recipients} ...`);

                const results = await Promise.allSettled(
                    metaData.map(async(u:{ id: any; email: any; })=>{
                        if(hasPush){
                            const devideToken = await this.tokenRepo.getPushTokensByUserId(u.id)

                        const sends: Promise<any>[] = [
                            ...devideToken.map((token)=>
                            this._notificationStrategy.sendToMany(channels,{
                                recipientId:u.id,
                                recipientEmail:u.email,
                                title,
                                body:message,
                                metadata:{
                                    userId:u.id,
                                    email:u.email
                                },
                                deviceToken:token,
                                type:NotificationType.ADMIN
                            }, 'admin')
                        )]
                        await Promise.allSettled(sends);
                    }})
                )
                results.forEach((r) => {
                    if (r.status === "fulfilled") totalSent++;
                    else {
                        totalFailed++;
                        console.error("[Reminder] Gửi thất bại:", r.reason);
                    }
                });
            } else{
                const users =await this._userRepo.getUserToSendNotifi();
                if(users.length>0)
                    console.log(`[User] Get success with ${users.length} users ...`);
                else
                    console.log(`[User] Get faild ...`);

                console.log(`[Admin Sent Notification] Gởi đến ${recipients} ...`);
                const results = await Promise.allSettled(
                    users.map(async(u:{ id: any; email: any; device:string })=>{
                        const result =await this._notificationStrategy.sendToMany(channels,{
                            recipientId:u.id,
                            recipientEmail:u.email,
                            title,
                            body:message,
                            metadata:{
                                userId:u.id,
                                email:u.email
                            },
                            type:NotificationType.ADMIN,
                            deviceToken:u.device
                        })
                        await Promise.allSettled(result);
                    })
                )
                results.forEach((r) => {
                    if (r.status === "fulfilled"){ totalSent++;}
                    else {
                        totalFailed++;
                        console.error("[Reminder] Gửi thất bại:", r.reason);
                    }
                });
            }

            await this._save(title, message, recipients, channels, totalFailed, totalSent, metaData)

            console.log('metaData:', metaData)
            console.log('totalSent:', totalSent)
            console.log('totalFailed:', totalFailed)

            if(totalSent===metaData.length)
                return {status:true, mess:''}
            else
                return {status:false, mess:'Something went wrong'}
            
        } catch (error:any) {
            console.log("[Admin Sent Notification] Lỗi: ", error);
            return {status:false, mess:error.message}
        }
    }
}