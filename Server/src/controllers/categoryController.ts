import type{ IcategoryService } from "../domain/models/application/interface/ICagegoryService.js";
import type{ CategoryDTO } from "../data/DTO/AppDTO.js";
export class CategoryController {
  constructor(private categoryService: IcategoryService) {}

  getSuggestedCategory = async (req: any, res: any): Promise<void> =>{
    try {
      const userId = req.user.id;
      const data = await this.categoryService.getSuggetedCategory(userId);
      res.status(200).json({
        status: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  getAllCategory=async (req: any, res: any): Promise<void>=>{
    try {
      const userId = req.user.id;
      const data = await this.categoryService.getAllCategory(userId);
      res.status(200).json({
        status: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  createCategory=async (req: any, res: any): Promise<void>=>{
    try {
      const payLoad: CategoryDTO = {
        ...req.body,
        id: crypto.randomUUID(),
        status: 'active',
      };
      const result = await this.categoryService.createCategory(payLoad);
      res.status(201).json({
        status: result,
        message: result ? 'Category created successfully' : 'Failed to create category',
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  updateCategory=async (req: any, res: any): Promise<void>=>{
    try {
      const payLoad: CategoryDTO = req.body;
      const result = await this.categoryService.updateCategory(payLoad);
      res.status(200).json({
        status: result,
        message: result ? 'Category updated successfully' : 'Failed to update category',
      });
    } catch (error: any) {
      const isPermissionError = ['Permission denied', 'Cannot modify default category'].includes(error.message);
      res.status(isPermissionError ? 403 : 400).json({
        status: false,
        message: error.message,
      });
    }
  }

  deleteCategory=async (req: any, res: any): Promise<void>=>{
    try {
      const { categoryId } = req.params;
      const userId = req.user.id;;
      const result = await this.categoryService.deletedCategory(categoryId, userId);
      res.status(200).json({
        status: result,
        message: result ? 'Category deleted successfully' : 'Failed to delete category',
      });
    } catch (error: any) {
      const isPermissionError = ['Permission denied', 'Cannot delete default category'].includes(error.message);
      res.status(isPermissionError ? 403 : 400).json({
        status: false,
        message: error.message,
      });
    }
  }
}