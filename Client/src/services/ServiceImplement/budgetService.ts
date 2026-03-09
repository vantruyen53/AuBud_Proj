import { IBudgetService } from "@/src/models/interface/ServiceInterface";
import { EncryptedDTO,UserDTO } from "@/src/models/interface/DTO";
import { BudgetEntitiy } from "@/src/models/interface/Entities";
import { API_URL } from "@/src/constants/securityContants";
import { apiFetch } from "../auth/apiService";

export class BudgetService implements  IBudgetService{
  constructor(private user: UserDTO) {}

  private async _mutilRequest(method: "POST" | "PUT" | "DELETE", data?: any, budgetId?: string): Promise<{success: boolean, message?: string}> {
    try {
        const url = (method === "PUT" || method === "DELETE") && budgetId
            ? `/budget/${budgetId}`
            : `/budget/`;

        let body: Record<string, any> = { userId: this.user.id };
        if (method === "POST" && data) {
            body = { ...data, userId: this.user.id };
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
      } catch (error) {
          console.error("Network error:", error);
          return [];
      }
  }

  async addNewBudget(payLoad: EncryptedDTO) {
    return await this._mutilRequest("POST", payLoad);
  }
  async updateBudget(budgetId: string, newTarget: string) {
    return await this._mutilRequest("PUT", newTarget, budgetId);
  }
  async deleteBudget(budgetId: string) {
    return await this._mutilRequest("DELETE", null, budgetId);
  }
}