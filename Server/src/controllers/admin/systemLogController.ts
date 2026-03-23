import { LogService } from "../../services/systemLogService.js";

export class LogController{
    getLog = async(req:any, res:any)=>{
        const {type}= req.params;
        const {fromDate, toDate, offset, limit}  = req.query;

        if (!fromDate || !toDate || !offset || !limit) {
            return res.status(400).json({ message: "fromDate, toDate, offset, limit là bắt buộc" });
        }

        try{
            const data = await LogService.getLog(fromDate as string,toDate as string, parseInt(offset), parseInt(limit), type);
            return res.status(200).json(data)
        }catch(err){
            return res.status(500).json({message: "Server error"})
        }
    }

    getLogStats = async (req: any, res: any) => {
    try {
        const data = await LogService.getLogStats();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
    }
}