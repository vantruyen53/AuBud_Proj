import { DashBoardService } from "../../services/adminService/dashboardService.js";

export class DashBoardController{
    constructor(private _service:DashBoardService){}
    
    getSystemStats = async (req:any, res:any)=>{
        const data = await this._service.getSystemStats()
        if(data)
            return res.status(200).json(data)
        return res.status(500).json({message:"Server error"})
    }

    getDailyActive = async (req:any, res:any)=>{
        const {period} = req.params;
        const {month, year} = req.query;

        const data = await this._service.getDailyActive(month, year, period)

        if(data)
            return res.status(200).json(data)
        return res.status(500).json({message:"Server error"})
    }

    getTransactionInput = async (req:any, res:any)=>{
        const {period} = req.params ;
        const {month, year} = req.query;

        const data = await this._service.getTransactionInput(month, year, period)

        if(data)
            return res.status(200).json(data)
        return res.status(500).json({message:"Server error"})
    }

    getAIUsage = async (req:any, res:any)=>{
        const {period} = req.params;
        const {month, year} = req.query;

        const data = await this._service.getAIUsage(month, year, period)

        if(data)
            return res.status(200).json(data)
        return res.status(500).json({message:"Server error"})
    }
}