import type{ CategoryDTO } from "../../../../data/DTO/AppDTO.js";
import type{ CategoryEntity } from "../../../entities/appEntities.js";

export interface ICategoryRepo{
    findById(id: string): Promise<CategoryEntity | null>;
    getSuggetedCategory(userId:string):Promise<CategoryEntity[]>;
    getAllCategory(userId:string):Promise<CategoryEntity[]>;
    createCategory(payLoad:CategoryDTO):Promise<boolean>
    updateCategory(payLoad:CategoryDTO):Promise<boolean>
    deletedCategory(cageroryId:string, userId:string):Promise<boolean>
}