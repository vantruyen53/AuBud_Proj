import { IBudgetService } from "@/src/models/interface/ServiceInterface";
import { EncryptedDTO,UserDTO, BudgetDTO, CategoryDTO} from "@/src/models/interface/DTO";
import { Budgets, BudgetEntitiy, DataForAI, IWallet } from "@/src/models/interface/Entities";
import type { TransactionForGemini, GeminiProposal } from "@/src/store/application/BudgetApp";
import { apiFetch } from "../auth/apiService";

export class BudgetService implements  IBudgetService{
  constructor(private user: UserDTO) {}

  private async _mutilRequest(method: "POST" | "PUT" | "DELETE", data?: any, budgetId?: string, isMultiple?: boolean): Promise<{success: boolean, message?: string}> {
    try {
        const url = (method === "PUT" || method === "DELETE") && budgetId
            ? `/budget/${budgetId}`
            : isMultiple
                ? '/budget/add-mutiple'
                : '/budget';

        let body: Record<string, any> = { userId: this.user.id };
        if (method === "POST" && data) {
            if (isMultiple) {
                body = { budgets: data, userId: this.user.id };
            } else {
                body = { ...data, userId: this.user.id };
            }
        } else if (method === "PUT" && data) {
            body = { target: data, userId: this.user.id };
        }

        // đổi fetch → apiFetch, bỏ headers
        const res = await apiFetch(url, {
            method,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Something went wrong" };
        }

        return { success: true };

    } catch (error) {
        console.error(`${method} Error:`, error);
        return { success: false, message: "Network error" };
    }
  }

  async getBudgets(month: string, year: string): Promise<BudgetEntitiy[]> {
      try {
          const queryString = new URLSearchParams({ month, year, userId: this.user.id }).toString();

          // đổi fetch → apiFetch, bỏ headers
          const res = await apiFetch(`/budget/all?${queryString}`);

          const json = await res.json();
          return json ?? [];
      } catch (error:any) {
          console.error("Network error:", error.message || error);
          return [];
      }
  }

  async addNewBudget(payLoad: EncryptedDTO) {
    return await this._mutilRequest("POST", payLoad);
  }

  async addMultipleBudgets(payLoads: EncryptedDTO[]) {
    try {
        const results = await this._mutilRequest("POST", payLoads, undefined, true);
        return results;
    } catch (error) {
        console.error("Error adding multiple budgets:", error);
        throw error;
    }
  }


  async updateBudget(budgetId: string, newTarget: string) {
    return await this._mutilRequest("PUT", newTarget, budgetId);
  }
  async deleteBudget(budgetId: string) {
    return await this._mutilRequest("DELETE", null, budgetId);
  }

  async getDataForAutoBudget(month:string, year:string):Promise<DataForAI> {
    try {
          const queryString = new URLSearchParams({ month, year, userId: this.user.id }).toString();

          const res = await apiFetch(`/budget/get-data-for-auto-budget?${queryString}`);

          const json = await res.json();
          return json ?? {buget: [], category: [], transaction: []};
      } catch (error:any) {
          console.error("Network error:", error.message || error);
          return {buget: [], category: [], transaction: []};
      }
  }

  async generateAutoBudget(budgets: (Budgets | null)[], transactions: TransactionForGemini[], categories: CategoryDTO[], wallets:IWallet[])
    :Promise<GeminiProposal>{
        try {
            const res = await apiFetch('/budget/auto-generate', {
                method: "POST",
                body: JSON.stringify({ budgets, transactions, categories, wallets }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error from server:", errorData.message || "Unknown error");
                return { message: errorData.message || "Unknown error", budgets: [] };
            }
            const data: GeminiProposal = await res.json();
            return data;
        } catch (error:any) {
            console.error("Network error:", error.message || error);
            return { message: error.message || "Network error", budgets: [] };
        }
  }
}