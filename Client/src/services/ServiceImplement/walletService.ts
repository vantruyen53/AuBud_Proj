import { API_URL } from "@/src/constants/securityContants";
import { UserDTO, DebtTransactionDTO,SavingTransactionDTO,ConvertDTO, EncryptedDTO } from "@/src/models/interface/DTO";
import { IWallet, ServiceResponse, IDebt, IDebtHistory, IGroupFund, ISaving, ISavingHistory} from "@/src/models/interface/Entities";
import axios from 'axios'
import { IWalleetService } from "@/src/models/interface/ServiceInterface";



export class WalletService implements IWalleetService {
    constructor(private user: UserDTO) {}

    private async _multiRequest(method:"POST" | "PUT" | "DELETE",data?: any, actionType?:string, walletId?: string, isTransaction?:boolean):Promise<ServiceResponse<any>>{
        try{
            const queryObj: any = { userId: this.user.id };
            const queryString = "?" + new URLSearchParams(queryObj).toString();

            let url = `${API_URL}/wallet`;
            if (actionType) url += `/${actionType}`;
            if(isTransaction) url+='/transaction'
            if (walletId) url += `/${walletId}`;
            url += queryString;

            console.log(url)

            const res = await axios(url,{
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.user.accessToken}` 
                },
                data: data ? { ...data, userId: this.user.id } : undefined
            })
            if (res.status !== 200) {
                const errorData = res.statusText;
                console.log(errorData)
                throw new Error(errorData || "Something went wrong");
            }
            return {
                status:true,
                data:await res.data,
                message:"Successfully"
            } ;
        } catch (error: any) {
            console.log(`Error in ${method} request for ${actionType}:`, error);
            return {
                status:false,
                data: null,
                message: error.message || "Network Error"
            };
        }
    }

    private async _getRequest(endpoint: string, params?: object): Promise<any>{
        try{
            const queryObj: any = { ...params, userId: this.user.id };
            const queryString = "?" + new URLSearchParams(queryObj).toString();

            const res = await axios.get(`${API_URL}/wallet/${endpoint}${queryString}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.user.accessToken}`
                }
            });

            if (res.status !== 200) {
                throw new Error(res.statusText || "Something went wrong");
            }
            return res.data;
        } catch (error) {
            console.error("Network error:", error);
            return null;
        }
    }

    // TRIỂN KHAI CÁC HÀM INTERFACE

    async addWallet(walletHash: EncryptedDTO): Promise<boolean> {
        if (!walletHash) return false;
        const res = await this._multiRequest("POST", walletHash, walletHash.actionType);
        return res.status;
    }

    async updateWallet(walletHash: EncryptedDTO): Promise<boolean> {
        if (!walletHash) return false;
        const res = await this._multiRequest("PUT", walletHash, walletHash.actionType, walletHash.id);
        return res.status;
    }

    async deleteWallet(walletId: string, actionType: 'wallet' | 'saving' | 'debt'): Promise<boolean> {
        const res = await this._multiRequest("DELETE", undefined, actionType, walletId);
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
    async getAllWalletHistory(): Promise<ISavingHistory[] | IDebtHistory[] | null> {
        // Có thể truyền thêm params để phân loại history nếu cần
        return await this._getRequest("history");
    }
    async convertBalance(payLoad: EncryptedDTO, fromWalletNewBalance:string, toWalletNewBalance:string): Promise<boolean> {
        const data = {...payLoad, fromWalletNewBalance, toWalletNewBalance}
        console.log(data)
        const res = await this._multiRequest("POST", data, "convert", '', false);
        return res.status;
    }
}