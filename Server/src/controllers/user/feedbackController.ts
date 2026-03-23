import { FeedbackService } from "../../services/applicationService/FeebackService.js";

export class FeedbackController{
    constructor(private service:FeedbackService){}

    send = async (req: any, res: any)=>{
        try {
            const payLoad = req.body
            // console.log('=============data post to server: ', payLoad)

            const result = await this.service.sendFeedback(payLoad)

            return res.status(200).json(result)
        } catch (error:any) {
            console.error('getBudgets error:', error.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    get = async  (req: any, res: any)=>{
        try{
            const {type}=req.params;
            const {rating, offset, limit} = req.query;
            // console.log('=============type get feedback: ', type, '| star:',rating)
            const result = await this.service.get(type, offset, limit, rating)
            return res.status(200).json(result)
        }catch (error:any) {
            console.error('getBudgets error:', error.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    getStats = async (req: any, res: any)=>{
        try{
            const result = await this.service.getStats()
            return res.status(200).json(result)
        }catch (error:any) {
            console.error('getBudgets error:', error.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    mark = async  (req: any, res: any)=>{
        try {
            const {id, isMark} = req.params;
            const result = await this.service.mark(id, isMark)
            if(result.status)
                return res.status(200).json(result)
            return res.status(500).json({status:false, message: result.message });
        } catch (error:any) {
            console.error('getBudgets error:', error.message);
            return res.status(500).json({status:false, message: 'Internal Server Error' });
        }
    }
}