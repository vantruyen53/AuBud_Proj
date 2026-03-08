import type{ BudgetEntity } from "../../../entities/appEntities.js";
import type { CreateBudgetDTO, GetBudgetsDTO, UpdateBudgetDTO, DeleteBudgetDTO } from "../../../../data/DTO/AppDTO.js";

export interface IBudgetService {
  getBudgets(dto: GetBudgetsDTO): Promise<BudgetEntity[]>;
  createBudget(dto: CreateBudgetDTO): Promise<boolean>;
  updateBudget(dto: UpdateBudgetDTO): Promise<boolean>;
  deleteBudget(dto: DeleteBudgetDTO): Promise<boolean>;
}