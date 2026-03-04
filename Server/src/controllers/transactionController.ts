import { TransactionService } from "../services/applicationService/TransactionService.js";
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  getTransactions=async(req: any, res: any) =>{
    try {
      const {userId} = req.query; // Lấy từ Middleware authenticateJWT
      const query = req.query;    // Lấy params từ URL (?month=10&year=2023)
      
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

  create=async(req: any, res: any)=>{
    const {userId, newEncryptedBalance} = req.body

    const result = await this.transactionService.addTransaction(userId, req.body,newEncryptedBalance);
    return res.status(201).json({
      status:result.status,
      data: null,
      message:result.message
    });
  }

  update=async (req:any, res:any)=>{
    const result = await this.transactionService.updateTransaction
  }
  
  delete=async (req: any, res: any)=>{
    const { id } = req.query; 
    const {newBackupBalance} = req.body;
    console.log(`${id} ============= ${newBackupBalance} ======== ${req.user.id}`)
    const result = await this.transactionService.removeTransaction(req.user.id, id as string, newBackupBalance);
    return res.status(200).json({
      status: result.status,
      message: result.message
    });
  }
}