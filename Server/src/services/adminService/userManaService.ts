import type { Pool,RowDataPacket } from "mysql2/promise";
import { NotificationStrategy } from "../../utils/strategies/NotificationStratery.js";
import { NotificationChannelFactory } from "../../utils/factories/NotificationFactory.js";
import { LogService } from "../systemLogService.js";
enum Role{
    ALL='all',
    ADMIN='admin',
    USER='user'
}
enum Status{
    ALL='all',
    ACTIVE='active',
    BAN='ban',
    DELETED='deleted'
}

interface User{
    id:string
    name:string,
    email:string,
    role:Role,
    join:string,
    lastActive:string,
    status:Status
}
interface UserTable{
    total:number,
    users:User[]
}

export class UserManaService{
    private _notificationStrategy: NotificationStrategy;

    constructor(private _pool:Pool){this._notificationStrategy = new NotificationStrategy(NotificationChannelFactory)}

    async getUser(role: Role, status: Status, offset: number, limit: number): Promise<UserTable> {
        try {
            let baseSql = `
                FROM user u
                INNER JOIN account a ON a.user_id = u.id
                WHERE a.verified = 1
            `;

            const params: any[] = [];

            if (role !== 'all') {
                baseSql += ` AND a.role = ?`;
                params.push(role);
            }
            if (status !== 'all') {
                baseSql += ` AND a.status = ?`;
                params.push(status);
            }

            // Query COUNT dùng chung baseSql và params
            const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
            const [countRows] = await this._pool.execute<RowDataPacket[]>(countSql, params);
            const total = countRows[0]?.total;

            // Query data thêm LIMIT OFFSET
            const dataSql = `
                SELECT u.id AS userId, u.user_name AS userName, u.create_at AS joinedDate, 
                u.last_input AS lastActive, a.email, a.role, a.status
                ${baseSql}
                LIMIT ${limit} OFFSET ${offset}
            `;
            const [rows] = await this._pool.execute<RowDataPacket[]>(dataSql, params);

            return {
                total,
                users: rows.map(r => ({
                    id: r.userId,
                    name: r.userName,
                    join: r.joinedDate,
                    lastActive: r.lastActive,
                    email: r.email,
                    role: r.role,
                    status: r.status,
                }))
            };
        } catch (error) {
            console.error('[UserMana Service] Error: ', error);
            return { total: 0, users: [] };
        }
    }

    async ban(userId:string, email:string, userName:string , reason:string, toState:'ban'|'active'):Promise<{status:boolean, message:string}>{
        try {
            const sql=`UPDATE account SET status = ? WHERE user_id = ?`
            const [resultHeader]: any = await this._pool.execute(sql, [toState, userId]);

            if(resultHeader.affectedRows > 0){
                await LogService.write({
                    message: `Admin ${toState === 'ban' ? 'banned' : 'unbanned'} user: ${userName} (${email})`,
                    actor_type: 'admin',
                    type: 'info',
                    status: 'success',
                    actionDetail: toState === 'ban' ? 'admin.user.banned' : 'admin.user.unbanned',
                    actorId: userId,
                    metaData: { userId, email, userName, reason, toState } as any,
                });
                const result = await this._notificationStrategy.sendTo('email',{
                    recipientId: "guest",
                    recipientEmail: email,
                    title:`Thông báo: Tài khoản của bạn đã ${toState==='active'?'được mở khóa':'bị khóa'}`,
                    body:`Ứng dụng Audug - Quản lí ngân sách cá nhân với AI thông báo đến người dùng ${userName}. Tài khoản của bạn đã ${toState==='active'?'được mở khóa':`bị khóa vì lí do: \n ${reason}`}`
                })

                if (result.success) {
                    console.log('Send email success for ', email)
                    return {status:true, message:`Send email success to to user ${userName}`};
                }else{
                    console.log('Send email fail')
                    return {status:false, message:'Ban was successful'}
                }
            }

            await LogService.write({
                message: `Ban/unban failed: user not found — userId: ${userId}`,
                actor_type: 'admin',
                type: 'warning',
                status: 'failure',
                actionDetail: 'admin.user.ban.not_found',
                actorId: userId,
                metaData: { userId, email, toState } as any,
            });
            
            return {status:false, message:`User not found or already banned`}

        } catch (error:any) {
            await LogService.write({
                message: `getUser error: ${error.message}`,
                actor_type: 'system', type: 'error', status: 'failure',
                actionDetail: 'admin.user.get.error',
                metaData: { error: error.message, stack: error.stack } as any,
            });
            console.error('[UserMana Service] Error: ', error)
            return {status:false, message:`Something went wrong when trying to ban/unban ${error}`}
        }
    }
}