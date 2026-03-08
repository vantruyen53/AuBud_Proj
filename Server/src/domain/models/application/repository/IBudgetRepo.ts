import type{ BudgetEntity } from "../../../entities/appEntities.js";
import type { CreateBudgetDTO, GetBudgetsDTO, UpdateBudgetDTO, DeleteBudgetDTO } from "../../../../data/DTO/AppDTO.js";

export interface IBudgetRepository {
  // Lấy danh sách budget kèm transactions theo tháng/năm
  findByMonth(dto: GetBudgetsDTO): Promise<BudgetEntity[]>;

  // Tạo mới budget
  create(dto: CreateBudgetDTO): Promise<boolean>;

  // Cập nhật target
  update(dto: UpdateBudgetDTO): Promise<boolean>;

  // Xóa budget
  delete(dto: DeleteBudgetDTO): Promise<boolean>;

  // Kiểm tra budget đã tồn tại chưa (tránh tạo trùng category trong cùng tháng)
  findDuplicate(userId: string, categoryId: string, yearMonth: string): Promise<boolean>;
}