import {TransactionService} from "@/src/services/ServiceImplement/transactionService";
import { WalletService } from "@/src/services/ServiceImplement/walletService";
import { UserDTO,CreateTransactionDTO } from "@/src/models/interface/DTO";
import { ITransactionItem, IMonthlySummary } from "@/src/models/interface/Entities";
import { totalSenIn } from "@/src/utils/helper";
import { ITransactionService, IWalleetService } from "@/src/models/interface/ServiceInterface";

import * as Secure from 'expo-secure-store';
import { SECRET_KEY_STORE } from "@/src/constants/securityContants";
import { decryptFormData, encryptFormData, encryptData, decryptData } from "@/src/utils/security";

export class TransactionApp{
    private transactionService:ITransactionService
    private walletService:IWalleetService;

    constructor(private user:UserDTO){
        this.transactionService = new TransactionService(this.user)
        this.walletService =new WalletService(this.user)
    }

    private _toNumber(val: any): number {
        return isNaN(Number(val)) ? 0 : Number(val);
    }
    private async _decryptData(raw: any, secretKey: string): Promise<ITransactionItem> {
        const d = await decryptFormData<any>(raw, secretKey,);
        const { createdAt, categoryId, categoryName, categoryType, iconName, iconColor, walletName, ...rest } = d;
        return {
        ...rest,
        amount: this._toNumber(d.amount),
        date: createdAt,    
        wallet: walletName,    
        type: d.type,
        category: {
            id: categoryId,
            name: categoryName,
            type: categoryType,
            iconName: iconName,
            iconColor: iconColor,
        },
    };
    }

    private async _decryptMonthlySummary(raw:IMonthlySummary, secrekey:string):Promise<IMonthlySummary>{
        const d = await decryptFormData<any>(raw, secrekey);
        return d
    }

    async getTransactionHistory(date:number,month: number, year: number, since:string){
        const serviceMap: Record<string, () => Promise<ITransactionItem[] | null>> = {
            day:   () => this.transactionService.getByDayService(date, month, year),
            month: () => this.transactionService.getByMonthService(month, year),
            year:  () => this.transactionService.getByYearService(year),
        };

        const data = await (serviceMap[since]?.() ?? Promise.resolve([]));

        if (!data || data.length === 0) {
            return {
                rawTransactions: [],
                totalSending: 0,
                totalIncome: 0,
                balance: 0
            };
        }

        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
        const decryptedData = await Promise.all(data.map(async (w) => {
            try {
                return await this._decryptData(w, secretKey);
            } catch (err) {
            console.error('==========_decryptData error===========', err);
            console.error('Raw data bị lỗi:', JSON.stringify(w));
            throw err;
            }
        }))

        
        const totalSending = decryptedData
            .filter(t => t.type === 'sending')
            .reduce((sum, item) => sum + item.amount, 0);
            
        const totalIncome = decryptedData
            .filter(t => t.type === 'income')
            .reduce((sum, item) => sum + item.amount, 0);
            
        return {
            rawTransactions: decryptedData,
            totalSending,
            totalIncome,
            balance: totalIncome - totalSending
        };
    }

    async getMonthlySummary(date:number,month: number, year: number){
        const {currentPeriod, lastPeriod} = await this.transactionService.getMonthlySummary(date, month, year);
        
        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;

        const [decryptedCurrentPeriod, decrypteLlastPeriod] = await Promise.all([
            Promise.all(currentPeriod.map(c=>this._decryptMonthlySummary(c, secretKey))),
            Promise.all(lastPeriod.map(c=>this._decryptMonthlySummary(c, secretKey)))
        ])

        const totalCurrentPeriod = decryptedCurrentPeriod.reduce((sum, i)=>parseInt(i.amount)+sum, 0)
        const totalLastPeriod = decrypteLlastPeriod.reduce((sum, i)=>parseInt(i.amount)+sum, 0)

        const avgDaily = Math.round(totalCurrentPeriod / new Date().getDate());

        // Phần trăm chênh lệch
        const percent = totalLastPeriod === 0
            ? 100
            : Math.round(Math.abs((totalCurrentPeriod - totalLastPeriod) / totalLastPeriod) * 100);

        const isIncrease = totalCurrentPeriod > totalLastPeriod;

        return {avgDaily, percent, isIncrease}
    }
    
    async addTransaction(payLoad:CreateTransactionDTO, walletBalance:number){
        if (!payLoad) return false;

        const newWatlletBalance = payLoad.type==="sending"?walletBalance-payLoad.amount:walletBalance+payLoad.amount

        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
        const encryptedPayload = await encryptFormData(payLoad, secretKey);
        const encryptedNewBalance = await encryptData(newWatlletBalance.toString(), secretKey);

        const result = await this.transactionService.addTransaction(encryptedPayload, encryptedNewBalance);
        return result;
    }

    async updateTransaction(payLoad:any, oldWallet:object, newWallet:object){
        if (!payLoad) return false;
        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
        const encryptedPayload = await encryptFormData(payLoad, secretKey);
        const encryptedOldWallet = await encryptFormData(oldWallet, secretKey);
        const encryptedNewWallet = await encryptFormData(newWallet, secretKey);

        return await this.transactionService.updateTransaction(encryptedPayload, encryptedOldWallet, encryptedNewWallet);
    }

    async deleteTransaction(transaction:ITransactionItem){
        const wallet = await this.walletService.getById(transaction.walletId as string);
        const walletBalance = wallet.balance;

        const amount = transaction.amount;

        const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;    
        const decrypBalance = parseInt(decryptData(walletBalance, secretKey))

        const backupBalance = transaction.type==='sending'?decrypBalance + amount:decrypBalance-amount;

        const encryptedNewBalance = await encryptData(backupBalance.toString(), secretKey);


        const result = await this.transactionService.deleteTransaction(transaction.id, encryptedNewBalance)
        return result;
    }
}