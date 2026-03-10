import { FeedbackService } from "../services/applicationService/FeebackService.js";

export class FeedbackController{
    constructor(private service:FeedbackService){}

    send = async (req: any, res: any)=>{
        try {
            const payLoad = req.body
            console.log('=============data post to server: ', payLoad)

            const result = await this.service.sendFeedback(payLoad)

            return res.status(200).json(result)
        } catch (error) {
            console.error('getBudgets error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}