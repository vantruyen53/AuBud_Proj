import { API_URL } from "@/src/constants/securityContants";
import { UserDTO, DebtTransactionDTO,SavingTransactionDTO,ConvertDTO, EncryptedDTO } from "@/src/models/interface/DTO";
import { IWallet, ServiceResponse, IDebt, IDebtHistory, IGroupFund, ISaving, ISavingHistory} from "@/src/models/interface/Entities";
import axios from 'axios'
import { IWalleetService } from "@/src/models/interface/ServiceInterface";
import { apiFetch } from "../auth/apiService";

export class WalletService implements IWalleetService {
    constructor(private user: UserDTO) {}

    private async _multiRequest(method: "POST" | "PUT" | "DELETE", data?: any, actionType?: string, walletId?: string, isTransaction?: boolean): Promise<ServiceResponse<any>> {
        try {
            const queryString = "?" + new URLSearchParams({ userId: this.user.id }).toString();

            let url = `/wallet`;
            if (actionType) url += `/${actionType}`;
            if (isTransaction) url += '/transaction';
            if (walletId) url += `/${walletId}`;
            url += queryString;

            const res = await apiFetch(url, {
                method,
                body: data ? JSON.stringify({ ...data, userId: this.user.id }) : undefined
            });

            if (!res.ok) {
                throw new Error(res.statusText || "Something went wrong");
            }

            const json = await res.json();
            return {
                status: json.status,
                data: json,
                message: "Successfully"
            };
        } catch (error: any) {
            console.log(`Error in ${method} request for ${actionType}:`, error);
            return { status: false, data: null, message: error.message || "Network Error" };
        }
    }

    private async _getRequest(endpoint: string, params?: object, actionType?: string, walletId?: string): Promise<any> {
        try {
            const queryObj: any = { ...params, userId: this.user.id };
            const queryString = "?" + new URLSearchParams(queryObj).toString();

            let url = `/wallet`;
            if (endpoint === "history") url += `/${actionType}/${walletId}`;
            url += `/${endpoint}${queryString}`;

            // đổi axios → apiFetch, bỏ headers
            const res = await apiFetch(url);

            if (!res.ok) {
                throw new Error(res.statusText || "Something went wrong");
            }

            return await res.json();
        } catch (error) {
            console.error("Network error:", error);
            return null;
        }
    }

    // TRIỂN KHAI CÁC HÀM INTERFACE

    async addWallet(walletHash: EncryptedDTO, handleBy:'bot'|'user', encryptedNewBalance?:string): Promise<boolean> {
        if (!walletHash) return false;
        if(encryptedNewBalance){
            const res = await this._multiRequest("POST", {walletHash, encryptedNewBalance, handleBy}, walletHash.actionType);
            return res.status;
        }

        const res = await this._multiRequest("POST", {walletHash}, walletHash.actionType);
        return res.status;
    }
    async updateWallet(walletHash: EncryptedDTO, handleBy:'bot'|'user'): Promise<boolean> {
        if (!walletHash) return false;
        const res = await this._multiRequest("PUT", {walletHash, handleBy}, walletHash.actionType, walletHash.id);
        return res.status;
    }
    async deleteWallet(walletId: string, actionType: 'wallet' | 'saving' | 'debt'): Promise<boolean> {
        const res = await this._multiRequest("DELETE", undefined, actionType, walletId);
        console.log(actionType, walletId);
        return res.status;
    }
    async getAllWallets(): Promise<{
        wallets: IWallet[],
        savings: ISaving[],
        debts: IDebt[],
        groupFunds: IGroupFund[],
    } | null> {
        // Gọi endpoint GET chung cho tất cả các loại ví của User
        return await this._getRequest("all");
    }
    async getById(id:string):Promise<any>{
        return await this._getRequest('one', {id})
    }

    async addWalletTransaction(walletTransaction: EncryptedDTO, encryptedNewBalance: string, encryptedNewRemaingOrBalance:string): Promise<boolean> {
        const data = {...walletTransaction, encryptedNewBalance, encryptedNewRemaingOrBalance}
        console.log(data);
        const res = await this._multiRequest("POST", data, walletTransaction.actionType, "", true);
        return res.status;  
    }
    async getAllWalletHistory(walletId:string, actionType:string): Promise<ISavingHistory[] | IDebtHistory[] | null> {
        return await this._getRequest("history",undefined, actionType,walletId);
    }
    async deleteWalletHistoryItem(foreignId:string, actionType:string, wTransactionId:string, 
        newBalanceHashed:string,paymentWalletId:string, encrytedNewWalletBalace:string): Promise<boolean>{

        const res = await this._multiRequest('DELETE', {wTransactionId, newBalanceHashed, paymentWalletId, encrytedNewWalletBalace}, actionType, foreignId, true) 
        console.log('======================================')
        console.log(res.status)
        return true
    }
    async convertBalance(payLoad: EncryptedDTO, fromWalletNewBalance:string, toWalletNewBalance:string): Promise<boolean> {
        const data = {...payLoad, fromWalletNewBalance, toWalletNewBalance}
        console.log(data)
        const res = await this._multiRequest("POST", data, "convert", '', false);
        return res.status;
    }
}