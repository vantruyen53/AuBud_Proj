import type { Pool } from "mysql2/promise";
import crypto from "crypto";
import datetime from '../../utils/helpers/datetime.js';

interface FeedbackDTO{
    userId:string
    content:string,
}

export class FeedbackService{
    constructor(private readonly pool: Pool){}

    async sendFeedback(payLoad:FeedbackDTO):Promise<boolean>{
        try {
            const id = crypto.randomUUID();
            const createdAt = datetime();
            const sql = `
            INSERT INTO feedback (id, user_id, content, created_at) 
            VALUE (?, ?, ?, ?) `

            await this.pool.execute(sql, [id, payLoad.userId, payLoad.content, createdAt])

            return true
        } catch (error) {
            console.error("Error at send feedback service: ", error)
            return false
        }
    }
}