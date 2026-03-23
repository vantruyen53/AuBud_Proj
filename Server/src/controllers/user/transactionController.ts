import { TransactionService } from "../../services/applicationService/TransactionService.js";
import { LogService } from "../../services/systemLogService.js";

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  getTransactions=async(req: any, res: any) =>{
    try {
      const userId = req.user.id; 
      const query = req.query; 
      console.log(query)
      const result = await this.transactionService.getTransactions(userId, query);
      return res.status(200).json({
        status: true,
        data: result,
        message:"Get successfully"
      });
    } catch (error:any) {
      await LogService.write({
        message: `[TransactionController.getTransactions] error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'transaction.getTransactions.error', // get.error | monthly_summary.error
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
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
    }catch (error:any) {
      await LogService.write({
        message: `[TransactionController.getMonthlySpendingSummary] error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'transaction.getMonthlySpendingSummary.error', // get.error | monthly_summary.error
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.log('======================Error: ', error)
      return res.status(500).json({
        status:false,
        data: null,
        message: "Internal Server Error" });
    }
  }

  create = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { newEncryptedBalance, ...data } = req.body;
      const result = await this.transactionService.addTransaction(userId, data, newEncryptedBalance);
      return res.status(201).json({ status: result.status, data: null, message: result.message });
    } catch (error: any) {
      await LogService.write({
        message: `addTransaction error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'transaction.create.error',
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      return res.status(500).json({ status: false, data: null, message: error.message });
    }
  }

  update = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { ...data } = req.body;
      const result = await this.transactionService.updateTransaction(userId, data);
      return res.status(200).json({ status: result.status, data: null, message: result.message });
    } catch (error: any) {
      await LogService.write({
        message: `updateTransaction error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'transaction.update.error',
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      return res.status(500).json({ status: false, data: null, message: error.message });
    }
  }
  
  delete = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { id, handleBy } = req.query;
      const { newBackupBalance } = req.body;
      const result = await this.transactionService.removeTransaction(
        userId, id as string, newBackupBalance, handleBy
      );
      return res.status(200).json({ status: result.status, message: result.message });
    } catch (error: any) {
      await LogService.write({
        message: `removeTransaction error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'transaction.delete.error',
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      return res.status(500).json({ status: false, message: error.message });
    }
  }
}