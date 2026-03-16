import { TransactionService } from "../services/applicationService/TransactionService.js";
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  getTransactions=async(req: any, res: any) =>{
    try {
      const userId = req.user.id; 
      const query = req.query; 
      const result = await this.transactionService.getTransactions(userId, query);
      return res.status(200).json({
        status: true,
        data: result,
        message:"Get successfully"
      });
    } catch (error) {
      console.log('======================Error: ', error)
      return res.status(500).json({
        status:false,
        data: null,
        message: "Internal Server Error" });
    }
  }

  getMonthlySpendingSummary=async(req: any, res: any) =>{
    try{
      const userId = req.user.id;
      const { day, month, year} = req.query;
      const result = await this.transactionService.getMonthlySpendingSummary(userId, 
        parseInt(day as string),parseInt(month as string),parseInt(year as string));
      if(result)
        return res.status(200).json(result) 
      return res.status(500).json('Data not possible')
    }catch (error) {
      console.log('======================Error: ', error)
      return res.status(500).json({
        status:false,
        data: null,
        message: "Internal Server Error" });
    }
  }

  create=async(req: any, res: any)=>{
    const userId = req.user.id;
    const {newEncryptedBalance,...data} = req.body
    console.log('=data to server:')
    console.log(userId)
    console.log(req.body)
    console.log(newEncryptedBalance)

    const result = await this.transactionService.addTransaction(userId, data,newEncryptedBalance);
    return res.status(201).json({
      status:result.status,
      data: null,
      message:result.message
    });
  }

  update=async (req:any, res:any)=>{
    const userId = req.user.id;
    const {  ...data } = req.body;
    const result = await this.transactionService.updateTransaction(userId, data)
    return res.status(200).json({
      status:result.status,
      data: null,
      message:result.message
    });
  }
  
  delete=async (req: any, res: any)=>{
    const userId = req.user.id;
    const { id } = req.query; 
    const {newBackupBalance} = req.body;
    console.log(`${id} ============= ${newBackupBalance} ======== ${userId}`)
    const result = await this.transactionService.removeTransaction(userId, id as string, newBackupBalance);
    return res.status(200).json({
      status: result.status,
      message: result.message
    });
  }
}