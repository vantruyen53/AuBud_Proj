import { ITransactionService } from "@/src/models/interface/ServiceInterface";
import { ITransactionItem, ServiceResponse } from "@/src/models/interface/Entities";
import { UserDTO, CreateTransactionDTO, EncryptedDTO } from "@/src/models/interface/DTO";
import { API_URL } from "@/src/constants/securityContants";
export class TransactionService implements ITransactionService {
    constructor(private user: UserDTO) {}

    private async _getData(params: Record<string, any>): Promise<ITransactionItem[] | null> {
        try {
            // Chuyển đổi Object thành Query String (vd: ?month=10&year=2023)
            const queryString = new URLSearchParams({
                ...params,
                userId: this.user.id
            }).toString();

            const res = await fetch(`${API_URL}/transaction?${queryString}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.user.accessToken}` 
                }
            });

            if (!res.ok) return null;
            const json = await res.json();
            return json.data ?? null;
        } catch (error) {
            console.error("Network error:", error);
            return null;
        }
    }
    
    private async _mutationRequest(method:"POST" | "PUT" | "DELETE", data?: any, params?: object):Promise<ServiceResponse<any>> {
        try {
            const queryString = params ? '?' + new URLSearchParams({ ...params, userId: this.user.id }).toString() : '';
            
            let body: string | undefined;
            if (method === "DELETE") {
            body = JSON.stringify({
                newBackupBalance: data,
                userId: this.user.id,
            });
            } else if (method === "POST" || method === "PUT") {
            body = data ? JSON.stringify({ ...data, userId: this.user.id }) : undefined;
            }

            const res = await fetch(`${API_URL}/transaction${queryString}`, {
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.user.accessToken}` 
                },
                body
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            return await res.json();
        } catch (error) {
            console.error(`${method} Error:`, error);
            return { status: false, data: null, message: (error as any)?.message || "An error occurred" };
        }
    }

    // --- Triển khai Interface dùng GET ---

    async addTransaction(transaction: EncryptedDTO, newEncryptedBalance:string): Promise<boolean> {
        // Loại bỏ ID nếu có lỡ gửi kèm khi thêm mới
        const { id, ...payload } = transaction;
        const data = {newEncryptedBalance, ...payload}
        const result = await this._mutationRequest("POST", data);

        return result.status;
    }
    async updateTransaction(transaction: EncryptedDTO, newWatlletBalance:number): Promise<boolean> {
        if (!transaction.id) throw new Error("ID is required for updating");
        const result = await this._mutationRequest("PUT", transaction);

        return result.status;
    }
    async deleteTransaction(transactionId: string, newBackupBalance:string): Promise<boolean> {
        const result = await this._mutationRequest("DELETE", newBackupBalance, { id: transactionId });
        return result.status ? true : false;
    }

    async getByDayService(day: number, month: number, year: number) {
        return this._getData({ day, month, year });
    }
    async getByMonthService(month: number, year: number) {
        return this._getData({ month, year });
    }
    async getByYearService(year: number) {
        return this._getData({ year });
    }
    async getByCategoryService(categoryId: string) {
        return this._getData({ categoryId });
    }
}
