import { CategoryDTO,UserDTO } from "@/src/models/interface/DTO";
import { API_URL } from "@/src/constants/securityContants";
import axios from 'axios'
import { ICategoryService } from "@/src/models/interface/ServiceInterface";
import { ServiceResponse } from "@/src/models/interface/Entities";
import { apiFetch } from "../auth/apiService";

export class CategoryService implements ICategoryService{
    constructor(private user: UserDTO) {}

    private async _getRequest(endpoint?: string, params?: object): Promise<CategoryDTO[] | null> {
        try {
            // đổi fetch → apiFetch, bỏ headers
            const res = await apiFetch(`/aubud/api/v1/category/${endpoint}/${this.user.id}`);

            if (res.status !== 200) {
                throw new Error(res.statusText || "Something went wrong");
            }

            const json = await res.json();
            return json.data ?? null;
        } catch (error) {
            console.error("Network error:", error);
            return null;
        }
    }

    private async _mutationRequest(method: "POST" | "PUT" | "DELETE", data?: any, categoryId?: string): Promise<ServiceResponse<any>> {
        try {
            const url = method === "DELETE" && categoryId
                ? `/aubud/api/v1/category/${categoryId}`
                : `/aubud/api/v1/category`;

            // đổi fetch → apiFetch, bỏ headers
            const res = await apiFetch(url, {
                method,
                body: method !== "DELETE"
                    ? JSON.stringify({ ...data, userId: this.user.id })
                    : JSON.stringify({ userId: this.user.id }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            const json = await res.json();
            return json ?? false;
        } catch (error) {
            console.error(`${method} Error:`, error);
            return { status: false, data: null, message: (error as any)?.message || "An error occurred" };
        }
    }

    async getSuggestedCategory():Promise<CategoryDTO[] | null>{
        return await this._getRequest("suggested")
    }
    async getAllCategory():Promise<CategoryDTO[] | null>{
        return await this._getRequest("all")
    }
    async addCategory(category:CategoryDTO): Promise<boolean>{
        if(!category) return false;

        const res  = await this._mutationRequest("POST", category)
        console.log("=== App addCategory result ===", res.status);
        return res.status
    }
    async updateCategory(category:CategoryDTO): Promise<boolean>{
         if(!category) return false;

        const res  = await this._mutationRequest("PUT", category)
        console.log("=== App updateCategory result ===", res);
        return res.status
    }
    async deleteCategory(categoryId:string,): Promise<boolean>{
        const res = await this._mutationRequest('DELETE', null, categoryId)
        console.log("=== App deleteCategory result ===", res.status)
        return res.status
    }
}