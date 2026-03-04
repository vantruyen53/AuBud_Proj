import { ICategoryService } from "@/src/models/interface/ServiceInterface";
import { UserDTO,CategoryDTO } from "@/src/models/interface/DTO";
import { CategoryService } from "@/src/services/ServiceImplement/categoryService";

export class CategoryApp{
    private categoryService: ICategoryService

    constructor(private user:UserDTO){
        this.categoryService = new CategoryService(user);
    }

    async getSuggestedCategory(){
        const d = await this.categoryService.getSuggestedCategory()

        if(!d || d.length===0)
            return{
                catSending:[],
                catIncome:[]
            }
        
        const catSending = d.filter(c =>c.type==='sending')
        const catIncome=d.filter(c =>c.type==='income')
        return{
            catSending,
            catIncome
        }
    }
    async getAllCategory(){
        const d= await this.categoryService.getAllCategory()

        if(!d || d.length===0)
            return{
                catSending:[],
                catIncome:[]
            }
        
        const catSending = d.filter(c =>c.type==='sending')
        const catIncome=d.filter(c =>c.type==='income')
        return{
            catSending,
            catIncome
        }
    }
    async addCategory(category:CategoryDTO){
        if(!category) return false;

        const payLoad = {
            ...category,
            usageCount:0,
         }

        const res  = await this.categoryService.addCategory(payLoad)
        return res
    }
    async updateCategory(category:CategoryDTO){
         if(!category) return false;

        const res  = await this.categoryService.updateCategory(category)
        return res
    }
    async deleteCategory(categoryId:string,){
        const res = await this.categoryService.deleteCategory(categoryId)
        return res
    }
}