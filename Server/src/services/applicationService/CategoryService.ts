import type { IcategoryService } from "../../domain/models/application/interface/ICagegoryService.js";
import type { ICategoryRepo } from "../../domain/models/application/repository/ICategoryRepo.js";
import type{ CategoryDTO } from "../../data/DTO/AppDTO.js";
import type{ CategoryEntity } from "../../domain/entities/appEntities.js";

export class CategoryService implements IcategoryService {
  constructor(private categoryRepo: ICategoryRepo) {}

  async getSuggetedCategory(userId: string): Promise<CategoryEntity[]> {
    if (!userId) throw new Error('userId is required');
    return this.categoryRepo.getSuggetedCategory(userId);
  }

  async getAllCategory(userId: string): Promise<CategoryEntity[]> {
    if (!userId) throw new Error('userId is required');
    return this.categoryRepo.getAllCategory(userId);
  }

  async createCategory(payLoad: CategoryDTO): Promise<boolean> {
    if (!payLoad.name || !payLoad.type || !payLoad.iconName || !payLoad.iconColor) {
      throw new Error('Missing required fields');
    }
    return this.categoryRepo.createCategory(payLoad);
  }

  async updateCategory(payLoad: CategoryDTO): Promise<boolean> {
    if (!payLoad.id || !payLoad.userId) {
        throw new Error('id and userId are required');
    }

    // Kiểm tra category có tồn tại và thuộc về user không
    const category = await this.categoryRepo.findById(payLoad.id);
    if (!category) throw new Error('Category not found');
    if (category.userId !== payLoad.userId) throw new Error('Permission denied');
    if (category.isDefault) throw new Error('Cannot modify default category');

    return this.categoryRepo.updateCategory(payLoad);
    }

  async deletedCategory(categoryId: string, userId: string): Promise<boolean> {
    if (!categoryId || !userId) {
        throw new Error('categoryId and userId are required');
    }

    const category = await this.categoryRepo.findById(categoryId);
    if (!category) throw new Error('Category not found');
    if (category.userId !== userId) throw new Error('Permission denied');
    if (category.isDefault) throw new Error('Cannot delete default category');

    return this.categoryRepo.deletedCategory(categoryId, userId);
    }
}
