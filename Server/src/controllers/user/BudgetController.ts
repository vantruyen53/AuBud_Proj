import type { IBudgetService } from "../../domain/models/application/interface/BudgetService.js";
import { LogService } from "../../services/systemLogService.js";

export class BudgetController {
  constructor(private budgetService: IBudgetService) {}

  getBudgets = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const {  month, year } = req.query;

      if (!userId || !month || !year) { 
        return res.status(400).json({ message: 'userId, month, year là bắt buộc' });
      }

      const result = await this.budgetService.getBudgets({ userId, month, year });

      return res.status(200).json(result);
    } catch (error:any) {
        await LogService.write({
        message: `getBudgets error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'budget.get.error',
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('getBudgets error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }; 

  createBudget = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const {  categoryId, target, date, status } = req.body;

      console.log( userId, categoryId, target, date, status )

      if (!userId || !categoryId || !target || !date) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }

      const result = await this.budgetService.createBudget({
        userId,
        categoryId,
        target,
        date,
        status: status ?? 'active',
      });

      if (!result) {
        return res.status(409).json({ message: 'Budget cho category này đã tồn tại trong tháng' });
      }

      return res.status(201).json(result);
    } catch (error:any) {
        await LogService.write({
        message: `createBudget error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'budget.create.error',
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('createBudget error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  updateBudget = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { id: budgetId } = req.params;
      const {  target } = req.body;

      if (!budgetId || !userId || !target) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }

      console.log( userId, budgetId, target)

      const result = await this.budgetService.updateBudget({ userId, budgetId, target });

      if (!result) {
        return res.status(404).json({ message: 'Budget không tồn tại hoặc không có quyền' });
      }

      return res.status(200).json(result);
    } catch (error:any) {
      await LogService.write({
        message: `deleteBudget error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'budget.delete.error',
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('updateBudget error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  deleteBudget = async (req: any, res: any) => {
    try {
      const { id: budgetId } = req.params;
      const userId = req.user.id;

      if (!budgetId || !userId) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }

      const result = await this.budgetService.deleteBudget({ userId, budgetId });

      if (!result) {
        return res.status(404).json({ message: 'Budget không tồn tại hoặc không có quyền' });
      }

      return res.status(200).json(result);
    } catch (error:any) {
      await LogService.write({
        message: `chatController error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'ai.chat.error',
        actorId: req.user?.id, ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('deleteBudget error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}