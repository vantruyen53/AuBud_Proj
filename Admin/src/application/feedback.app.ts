import type{FeedbackTable, FeedbackStats } from "../model/type/feedback.type";
import { FeedbackService } from "../services/serviceImplement/feedbackService";

const _service = new FeedbackService()

export class FeedbackApp{
    async get(type:string, offset:string, limit:string, value?:string):Promise<FeedbackTable>{
        return await _service.get(type, offset, limit, value)
    }

    async getStats():Promise<FeedbackStats>{
        return await _service.getStats();
    }

    async mark(id:string, isMark:1|0):Promise<{status:boolean, message:string}>{
        const state = isMark===1?'true':'false'
        return await _service.mark(id, state);
    }
}