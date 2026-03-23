import type { Pool, RowDataPacket } from "mysql2/promise";
import crypto from "crypto";
import datetime from '../../utils/helpers/datetime.js';
import { LogService } from "../systemLogService.js";

interface FeedbackDTO{
    userId:string
    content:string,
    rating:number
}

interface FeedbackEntity{
    id:string,
    userId:string,
    userName:string,
    email:string,
    content:string,
    createdAt:string,
    rating:string,
    isMark:number;
}

interface FeedbackTable{
    total:number,
    data:FeedbackEntity[]
}

interface FeedbackStats{
    total:number,
    totalMark:number,
    totalToday:number,
}

export class FeedbackService{
    constructor(private readonly pool: Pool){}

    async sendFeedback(payLoad: FeedbackDTO): Promise<boolean> {
    try {
        const id = crypto.randomUUID();
        const createdAt = datetime();
        const sql = `INSERT INTO feedback (id, user_id, content, created_at, rating) VALUE (?, ?, ?, ?, ?)`;
        await this.pool.execute(sql, [id, payLoad.userId, payLoad.content, createdAt, payLoad.rating]);
        return true;
    } catch (error: any) {
        await LogService.write({
        message: `sendFeedback error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'feedback.send.error',
        actorId: payLoad.userId,
        metaData: { error: error.message, stack: error.stack } as any,
        });
        console.error('Error at send feedback service:', error);
        return false;
    }
    }

    async get(type:'today' | 'isMark' | 'all', offset:string, limit:string, rating: '1'|'2'|'3'|'4'|'5'|'all'):Promise<FeedbackTable>{
        try{
            let whereClause = `FROM feedback f JOIN user u ON f.user_id = u.id JOIN account a ON u.id = a.user_id `
            const params = []

            if (type === 'all') {
                if( rating!=='all'){
                    whereClause += `WHERE f.rating = ? `;
                params.push(String(rating));
                }
            } else if (type === 'isMark') {
                whereClause+=` WHERE f.is_mark = 1 `
                if( rating!=='all'){
                    whereClause += ` AND f.rating = ?`;
                    params.push(String(rating));
                }
            } else if (type === 'today') {
                whereClause+=` WHERE DATE(f.created_at) = CURDATE() `
                if( rating!=='all'){
                    whereClause += ` AND f.rating = ?`;
                    params.push(String(rating));
                }
            }

            const [_totalRows] = await this.pool.execute<RowDataPacket[]>(
                `SELECT COUNT(*) AS total ${whereClause}`, params
            )
            const total = Number(_totalRows[0]?.total)

            //Get data by limit and offset
            const sql=`SELECT f.id, u.user_name as userName, a.email, f.user_id as userId, f.content, 
                f.created_at as createdAt, f.rating, f.is_mark as isMark 
                ${whereClause} LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
            const [rows] =await this.pool.execute<RowDataPacket[]>(sql, params)

            return{
                total,
                data: rows.map(d=>({
                    id:d.id,
                    userId:d.userId,
                    userName: d.userName,
                    email:d.email,
                    content:d.content,
                    createdAt: d.createdAt,
                    rating: d.rating,
                    isMark: d.isMark
                }))
            }

        }catch (error: any){
            console.error('Error at send feedback service:', error);
        return {total:0, data:[]};
        }
    }

    async getStats():Promise<FeedbackStats>{
        try {
            //Get total all feedback
            const [_countTotal] = await this.pool.execute<RowDataPacket[]>(
                `SELECT COUNT(*) AS total FROM feedback`
            )
            const total = Number(_countTotal[0]?.total)

            //Get total today's feedback
            const [_todayRows] = await this.pool.execute<RowDataPacket[]>(
                `SELECT COUNT(*) AS total FROM feedback WHERE DATE(created_at) = CURDATE()`
            )
            const totalToday = Number(_todayRows[0]?.total)

            //Get total feedback is marked
            const [_markRows] = await this.pool.execute<RowDataPacket[]>(
                `SELECT COUNT(*) AS total FROM feedback WHERE is_mark = 1`
            )
            const totalMark = Number(_markRows[0]?.total)

            return {total, totalMark, totalToday}

        } catch (error:any) {
            console.error('Error at send feedback service:', error);
            return{total:0, totalMark:0, totalToday:0}
        }
    }

    async mark(id:string, isMark:string):Promise<{status:boolean, message:string}>{
        try{
            const sql = `UPDATE feedback set is_mark = ? WHERE id = ? `
            const value = isMark === 'true' ? 1 : 0;
            const [result]: any = await this.pool.execute(sql, [value, id]);
            if(result.affectedRows >0)
                return {status:true, message:''}
            return {status:false, message:'Maybe this feedback isnot exits'}
        }catch(error:any){
            return {status:false, message:error.message}
        }
    }
}