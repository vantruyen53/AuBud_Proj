import pool from "../config/dbConfig.js";
import type { RowDataPacket } from "mysql2/promise";

export interface LogDTO{
    message:string,
    actor_type:'user'|'admin'|'system',
    actorId?:string,
    ipAddress?:string,
    type:'error' | 'warning' | 'info' | 'auth' | 'ai',
    actionDetail?:string,
    status:'success'|'failure'|'pending',
    metaData?:JSON
}

interface LogEntity extends LogDTO{
    id:string,
    createdAt:string
}
export const LogService ={
    async write(payLoad:LogDTO):Promise<{status:boolean, message:string}>{
        try{
            const id = crypto.randomUUID();
            const dateTime = new Date();
            const sql = `INSERT INTO Logs (id, message, actor_type, create_at, actor_id, ip_address, type, action_detail, status, meta_data)
            VALUES (?,?,?,?,?,?,?,?,?,?)`
            const [rows]: any = await pool.execute(sql,[id, payLoad.message, payLoad.actor_type, dateTime, 
                payLoad.actorId ??'', payLoad.ipAddress ??'', payLoad.type, payLoad.actionDetail??'', payLoad.status,payLoad.metaData??{}])

            if(rows.affectedRows >0)
                return {status:true, message:"Write log was successfully"}
            return {status:false, message:"Write log was failure"}

        }catch (error:any) {
            console.error('[UserMana Service] Error: ', error);
            return { status:false, message:`[LOG SERVICE] Error: ${error.message}`};
        }
    },

    async getLog(
    fromDate: string, toDate: string,
    offset: number, limit: number,
    type: 'error' | 'warning' | 'info' | 'auth' | 'ai' | 'all'
    ): Promise<{ total: number; logs: LogEntity[] }> {
    try {
        const params: any[] = [fromDate, toDate];
        let whereClause = `WHERE DATE(create_at) BETWEEN ? AND ?`;

        if (type !== 'all') {
        whereClause += ` AND type = ?`;
        params.push(type);
        }

        // Đếm tổng
        const [countRows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS total FROM Logs ${whereClause}`,
        params
        );
        const total = Number(countRows[0]?.total);

        // Lấy data
        const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM Logs ${whereClause} ORDER BY create_at DESC LIMIT ${limit} OFFSET ${offset}`,
        params
        );

        return {
        total,
        logs: rows.map(l => ({
            id: l.id,
            message: l.message,
            actor_type: l.actor_type,
            createdAt: l.create_at,
            actorId: l?.actor_id ?? null,
            ipAddress: l?.ip_address ?? null,
            type: l.type,
            actionDetail: l?.action_detail ?? null,
            status: l.status,
            metaData: l?.meta_data ?? null,
        }))
        };
    } catch (error: any) {
        console.error('[Log Service] Get Error:', error.message);
        return { total: 0, logs: [] };
    }
    },
    async getLogStats(): Promise<Record<string, number>> {
        try {
            const sql = `
                SELECT type, COUNT(*) AS total
                FROM Logs
                GROUP BY type
            `;
            const [rows] = await pool.execute<RowDataPacket[]>(sql);

            const stats = {
                all: 0,
                info: 0,
                warning: 0,
                error: 0,
                auth: 0,
                ai: 0,
            };

            for (const row of rows) {
                stats[row.type as keyof typeof stats] = Number(row.total);
                stats.all  += Number(row.total);
            }

            return stats;
        } catch (error: any) {
            console.error('[Log Service] getLogStats Error:', error.message);
            return { all: 0, info: 0, warning: 0, error: 0, auth: 0, ai: 0 };
        }
    }
}
