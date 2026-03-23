import type { IBudgetService } from "../../domain/models/application/interface/BudgetService.js";
import type { IBudgetRepository } from "../../domain/models/application/repository/IBudgetRepo.js";
import type { GetBudgetsDTO, CreateBudgetDTO, UpdateBudgetDTO, DeleteBudgetDTO } from "../../data/DTO/AppDTO.js";
import type { BudgetEntity } from "../../domain/entities/appEntities.js";
import { LogService } from "../systemLogService.js";

export class BudgetService implements IBudgetService {
  constructor(private budgetRepo: IBudgetRepository) {}

  async getBudgets(dto: GetBudgetsDTO): Promise<BudgetEntity[]> {
    try {
      return await this.budgetRepo.findByMonth(dto);
    } catch (error: any) {
      await LogService.write({
        message: `getBudgets error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'budget.get.service_error',
        actorId: dto.userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('getBudgets error:', error);
      return [];
    }
  }

  async createBudget(dto: CreateBudgetDTO): Promise<boolean> {
    try {
      const [month, year] = dto.date.split('/');
      const yearMonth = `${year}-${month}-01`;
      const isDuplicate = await this.budgetRepo.findDuplicate(dto.userId, dto.categoryId, yearMonth);
      if (isDuplicate) {
        console.warn(`Budget đã tồn tại: category ${dto.categoryId} tháng ${yearMonth}`);
        return false;
      }
      return await this.budgetRepo.create(dto);
    } catch (error: any) {
      await LogService.write({
        message: `createBudget error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'budget.create.service_error',
        actorId: dto.userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('createBudget at service error:', error);
      return false;
    }
  }

  async updateBudget(dto: UpdateBudgetDTO): Promise<boolean> {
    try {
      return await this.budgetRepo.update(dto);
    } catch (error: any) {
      await LogService.write({
        message: `updateBudget error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'budget.update.service_error',
        actorId: dto.userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('updateBudget error:', error);
      return false;
    }
  }

  async deleteBudget(dto: DeleteBudgetDTO): Promise<boolean> {
    try {
      return await this.budgetRepo.delete(dto);
    } catch (error: any) {
      await LogService.write({
        message: `deleteBudget error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'budget.delete.service_error',
        actorId: dto.userId,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('deleteBudget error:', error);
      return false;
    }
  }
}