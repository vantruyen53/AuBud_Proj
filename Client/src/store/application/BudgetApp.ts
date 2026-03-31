import * as Secure from 'expo-secure-store';
import { SECRET_KEY_STORE } from "@/src/constants/securityContants";

import { encryptData, decryptData, encryptFormData, decryptFormData } from "@/src/utils/security";
import { BudgetDTO,UserDTO } from "@/src/models/interface/DTO";
import { IBudgetService } from "@/src/models/interface/ServiceInterface";
import { BudgetService } from '@/src/services/ServiceImplement/budgetService';
import { Budgets, BudgetEntitiy, IWallet} from '@/src/models/interface/Entities';

export interface TransactionForGemini {
    id: string;
    amount:string,
    note:string,
    title:string,
    userId:string,
    walletId:string,
    categoryId:string,
    createdAt:string,
}

export interface GeminiProposal {
    message: string;
    budgets: {
        categoryId: string;
        categoryName: string;
        iconName: string;
        iconColor: string;
        categoryType:string;
        target: string;
        date: string;
    }[];
}

export class BudgetApp {
    private _budgetService:IBudgetService;

    constructor(private user:UserDTO){
        this._budgetService = new BudgetService(user)
    }

    private _toNumber(val: any): number {
        return isNaN(Number(val)) ? 0 : Number(val);
    }

    private async _decryptBudget(raw: BudgetEntitiy, secretKey: string): Promise<Budgets> {
    // Giải mã amountLimit riêng
        const decryptedAmount = decryptData(raw.amountLimit, secretKey);
        const target = this._toNumber(decryptedAmount);

        const decryptedTransactions = await Promise.all(
            raw.transactions.map(async (t) => {
                const decryptedTAmount = decryptData(t.amount, secretKey);
                return { ...t, amount: this._toNumber(decryptedTAmount) };
            })
        );

        // Tính tổng đã chi
        const balance = decryptedTransactions.reduce((sum, t) => sum + t.amount, 0);

        return {
            id: raw.id,
            target,
            balance,
            createdAt: raw.date,
            category: {
                id: raw.categoryId,
                name: raw.categoryName,
                iconName: raw.iconName,
                iconColor: raw.iconColor,
                type: raw.categoryType,
            },
        };
    }

    private async decryptTransaction(raw: any, secretKey: string): Promise<TransactionForGemini> {
        const d = await decryptFormData<any>(raw, secretKey,);
        const { createdAt, categoryId, ...rest } = d;
         return {
            ...rest,
            amount: this._toNumber(d.amount),
            date: createdAt,    
            categoryId
        };
    }

    async getBudgets(month:string, year:string): Promise<Budgets[]> {
        const data = await this._budgetService.getBudgets(month,year);
        if (!data || data.length === 0) return [];

        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;

        const decryptedData = await Promise.all(
            data.map(async (b) => {
                try {
                    return await this._decryptBudget(b, secretKey); // ← có return
                } catch (err) {
                    console.error('_decryptBudget error:', err);
                    console.error('Raw data bị lỗi:', JSON.stringify(b));
                    return null;
                }
            })
        );

        // Lọc những item bị lỗi giải mã
        return decryptedData.filter((b): b is Budgets => b !== null);
    }

    async createBudget(payLoad: BudgetDTO) {
        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
        const encryptedPayload = await encryptFormData(payLoad, secretKey);
        return await this._budgetService.addNewBudget(encryptedPayload);
    }

    async createMultipleBudgets(payLoads: BudgetDTO[]) {
        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
        const encryptedPayloads = await Promise.all(payLoads.map(pl => encryptFormData(pl, secretKey)));
        return await this._budgetService.addMultipleBudgets(encryptedPayloads);
    }

    async updateBudget(newTarget: string, budgetId: string) {
        if (!budgetId || !newTarget) return { success: false, message: "Thiếu thông tin" };
        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
        const encryptedTarget = await encryptData(newTarget.toString(), secretKey);
        return await this._budgetService.updateBudget(budgetId, encryptedTarget);
    }

    async deleteBudget(budgetId: string) {
        if (!budgetId) return { success: false, message: "Thiếu budgetId" };
        return await this._budgetService.deleteBudget(budgetId);
    }

    async generateAutoBudget(month: number, year: number, wallets:IWallet[], onStatusChange: (status: "idle" | "loading" | "generating") => void)
        :Promise<GeminiProposal> {
        onStatusChange('loading');

        // Bước 1: Lấy dữ liệu
        try {
            const data = await this._budgetService.getDataForAutoBudget(month.toString(), year.toString());
            if(!data) return { message: "Không lấy được dữ liệu cho AI", budgets: [] };
            
            const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;

            const [buget, transaction] = await Promise.all([
                Promise.all(data.buget.map(async (b) => {
                    try {
                        return await this._decryptBudget(b, secretKey);
                    } catch (err) {
                        console.error('_decryptBudget error:', err);
                        console.error('Raw data bị lỗi:', JSON.stringify(b));
                        return null;
                    }
                })),
                Promise.all(data.transaction.map(async (t) => {
                    try {
                        return await this.decryptTransaction(t, secretKey);
                    } catch (err) {
                        console.error('decryptTransaction error:', err);
                        console.error('Raw data bị lỗi:', JSON.stringify(t));
                        return null;
                    }
                }))
            ])

            // Bước 2: Gọi Gemini
            onStatusChange('generating');
            const aiProposal = await this._budgetService.generateAutoBudget(buget, transaction, data.category, wallets);

            return aiProposal;;
        } catch (error:any) {
            console.error("Lỗi quy trình AI:", error);
            throw error;
        }

    }
}