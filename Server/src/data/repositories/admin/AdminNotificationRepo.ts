import type{Pool, RowDataPacket,ResultSetHeader} from 'mysql2/promise';
import { title } from 'node:process';

export type notificationEnum = 'channels'|'status'|'all';

export interface AdminNotifactionDTO{
    title:string,
    message:string,
    recipients:string,
    metaData?:any,
    channels:string,
    status:string,
}

interface AdminNotifaction extends AdminNotifactionDTO{
    id:string,
    sendAt:string,
}

export interface NotificationPage{
    totalUser:number,
    totalRow:number,
    data:AdminNotifaction[]
}

export class AdminNotificationRepo{
    constructor(private _pool:Pool){}

    async create(payLoad:AdminNotifactionDTO):Promise<{status:boolean, mess:string}>{
        const senddate = new Date()
        try {
            const sql = `INSERT INTO admin_notification (id, title, message, recipients, metadata, channels, status, send_at)
             VALUES (UUID(), ?, ?,?,?,?,?, ?)`

            const [result] = await this._pool.execute<ResultSetHeader>(sql,[
                payLoad.title, payLoad.message,payLoad.recipients, payLoad.metaData, payLoad.channels,payLoad.status, senddate
            ])
            return {status:result?.affectedRows>0, mess:result?.affectedRows>0?"ok":'Something went wrong'}
        } catch (error:any) {
            console.error('[AdminNotificationRepo Repo] Create Error: ', error);
            return {status:false, mess:error.message };
        }
    }

    async get(type:notificationEnum, value:string|undefined,offset:string, limit:string):Promise<NotificationPage>{
        try {
            let baseSql = `FROM admin_notification`
            const params = []
            
            if(type!=='all' && value){
                baseSql+=` WHERE ${type} = ? `
                params.push(value)
            }

            //Get total user in db;
            const countUserSql = `SELECT COUNT(*) AS total ${baseSql}`;
            const [totalRows] = await this._pool.execute<RowDataPacket[]>(countUserSql,params);
            const total = totalRows[0]?.total;
            
            const [rows] = await this._pool.execute<RowDataPacket[]>(`SELECT * ${baseSql} LIMIT ${Number(limit)} OFFSET ${Number(offset)}`, params);

            const [userRows]: any = await this._pool.execute(`
                SELECT COUNT(*) AS total 
                FROM account 
                WHERE status != 'deleted' AND role = 'user' AND verified = 1
            `);
            const totalUser = userRows[0]?.total

            return{
                totalUser,
                totalRow:total,
                data:rows.map(d=>({
                    id: d.id,
                    title:d.title,
                    message:d.message,
                    recipients:d.recipients,
                    metaData:d.metaData,
                    channels:d.channels,
                    status:d.status,
                    sendAt:d.send_at,
                }))
            }

        } catch (error:any) {
            console.error('[AdminNotificationRepo Repo] Get Error: ', error);
            return {totalUser:0, totalRow: 0, data: [] };
        }
    }
}