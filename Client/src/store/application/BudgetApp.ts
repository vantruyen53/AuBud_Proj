import * as Secure from 'expo-secure-store';
import { SECRET_KEY_STORE } from "@/src/constants/securityContants";

import { encryptData, decryptData, encryptFormData } from "@/src/utils/security";
import { BudgetDTO,UserDTO } from "@/src/models/interface/DTO";
import { IBudgetService } from "@/src/models/interface/ServiceInterface";
import { BudgetService } from '@/src/services/ServiceImplement/budgetService';
import { Budgets, BudgetEntitiy } from '@/src/models/interface/Entities';

export class BudgetApp {
    private _budgetService:IBudgetService;

    constructor(private user:UserDTO){
        this._budgetService = new BudgetService(user)
    }

    private _toNumber(val: any): number {
        return isNaN(Number(val)) ? 0 : Number(val);
    }

    private async _decryptFormData(raw: BudgetEntitiy, secretKey: string): Promise<Budgets> {
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

    async getBudgets(month:string, year:string): Promise<Budgets[]> {
        const data = await this._budgetService.getBudgets(month,year);
        if (!data || data.length === 0) return [];

        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;

        const decryptedData = await Promise.all(
            data.map(async (b) => {
                try {
                    return await this._decryptFormData(b, secretKey); // ← có return
                } catch (err) {
                    console.error('_decryptFormData error:', err);
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
}