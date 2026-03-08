import { UserDTO } from "@/src/models/interface/DTO";
import { IWallet,ISaving,IDebt,IGroupFund,ISavingHistory,IDebtHistory } from "@/src/models/interface/Entities";
import { WalletDTO, CreateSavingDTO, CreateDebtDTO, DebtTransactionDTO,SavingTransactionDTO,ConvertDTO,CreateTransactionDTO } from "@/src/models/interface/DTO";
import { WalletService } from "@/src/services/ServiceImplement/walletService";
import { IWalleetService } from "@/src/models/interface/ServiceInterface";

import * as Secure from 'expo-secure-store';
import { SECRET_KEY_STORE } from "@/src/constants/securityContants";
import { decryptFormData, encryptFormData, encryptData} from "@/src/utils/security";
import { Wallet } from "lucide-react-native";

export interface WalletScreenData {
  // Đối tượng chứa các mảng dữ liệu thô
  rawData: {
    wallets: IWallet[];
    savings: ISaving[];
    debts: IDebt[];
    groupFunds: IGroupFund[];
  };
  // Tổng số tiền theo từng loại
  summary: {
    totalWalletBalance: number;
    totalSavingBalance: number;
    totalGroupFundBalance: number;
    totalLoanFrom: number; 
    totalLoanTo: number;
  };
  // Tổng tài sản ròng (Wallets + Savings + GroupFunds)
  totalNetWorth: number;
}

export class WalletApp{
  private walletService: IWalleetService;

  constructor(private user: UserDTO){
    this.walletService = new WalletService(this.user);
  }

  private _toNumber(val: any): number {
    return isNaN(Number(val)) ? 0 : Number(val);
  }

  private async _decryptWallet(raw: any, secretKey: string): Promise<IWallet> {
    const d = await decryptFormData<any>(raw, secretKey, 
        ['id', 'status', 'createdAt', 'actionType', 'userId'],
        'WALLET' // ← label
    );
    return { ...d, balance: this._toNumber(d.balance) };
  }
  private async _decryptSaving(raw: any, secretKey: string, absolute: boolean): Promise<ISaving | null> {
    const d = await decryptFormData<any>(raw, secretKey,
        ['id', 'status', 'createdAt', 'actionType', 'userId'], 'SAVING'
    );
    if (!absolute && this._toNumber(d.balance) >= this._toNumber(d.target))
        return null;

    return { ...d, balance: this._toNumber(d.balance), target: this._toNumber(d.target) };
  }

  private async _decryptDebt(raw: any, secretKey: string, absolute: boolean): Promise<IDebt | null> {
      const d = await decryptFormData<any>(raw, secretKey,
          ['id', 'status', 'createdAt', 'actionType', 'userId', 'type'], 'DEBT'
      );
      if (!absolute && this._toNumber(d.remaining) <= 0)
          return null;

      return { ...d, totalAmount: this._toNumber(d.totalAmount), remaining: this._toNumber(d.remaining) };
  }

  async loadWalletScreenData(absolute:boolean): Promise<WalletScreenData | null> {
    const data = await this.walletService.getAllWallets();
    if (!data) return null;

    // 1. Lấy secretKey từ SecureStore
    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;

     // 2. Giải mã song song cho từng loại — Promise.all để nhanh hơn
    const [wallets, savingsRaw, debtsRaw] = await Promise.all([
      Promise.all(data.wallets.map(w => this._decryptWallet(w, secretKey))),
      Promise.all(data.savings.map(s => this._decryptSaving(s, secretKey, absolute))),
      Promise.all(data.debts.map(d => this._decryptDebt(d, secretKey, absolute))),
    ]);

    // Filter null — TypeScript tự hiểu savings: ISaving[], debts: IDebt[]
    const savings = savingsRaw.filter((s): s is ISaving => s !== null);
    const debts   = debtsRaw.filter((d): d is IDebt => d !== null);

    
    const groupFunds = data.groupFunds;

    // 3.Tính toán — giờ balance đã là number sau giải mã
    const totalWalletBalance     = wallets.reduce((sum, i) => sum + i.balance, 0);
    const totalSavingBalance     = savings.reduce((sum, i) => sum + i.balance, 0);
    const totalGroupFundBalance  = groupFunds.reduce((sum, i) => sum + Number(i.balance || 0), 0);

    
    // 4. Tính toán giá trị Nợ/Cho vay (Để hiển thị riêng, không cộng vào Net Worth)
    let totalLoanFrom = 0;
    let totalLoanTo   = 0;
    debts.forEach(i => {
      if (i.type === 'loan_from') totalLoanFrom += i.remaining;
      else if (i.type === 'loan_to') totalLoanTo += i.remaining;
    });

    // 5. Tính Tổng tài sản ròng (Net Worth) 
    // Lưu ý: Nợ (Debt) thường không được tính là tài sản sẵn có trừ khi bạn muốn trừ nợ trực tiếp
    const totalNetWorth = totalWalletBalance + totalSavingBalance + totalGroupFundBalance;
    return {
      rawData: {
        wallets: wallets,
        savings: savings, 
        debts: debts,
        groupFunds: groupFunds
      },
      summary: {
        totalWalletBalance,
        totalSavingBalance,
        totalGroupFundBalance,
        totalLoanFrom,
        totalLoanTo
      },
      totalNetWorth
    };
  }

  async deleteWallet( walletId: string, actionType:'wallet'|'debt'|'saving') {
    return await this.walletService.deleteWallet(walletId, actionType);
  }

  async updateWallet(wallet: WalletDTO | CreateDebtDTO | CreateSavingDTO| undefined) {
    if (!wallet) return false;
      
    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;

    const encryptedPayload = await encryptFormData(wallet, secretKey);
    return await this.walletService.updateWallet(encryptedPayload)
  }

  async createNewWallet(wallet: WalletDTO | CreateDebtDTO | CreateSavingDTO | undefined, newPaymentWalletBalance?:number) {
    if (!wallet) return false;

    console.log(wallet)

      const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
      const encryptedPayload = await encryptFormData(wallet, secretKey);

      if(newPaymentWalletBalance){  
        const toStr = newPaymentWalletBalance?.toString() as string
        const encryptedNewBalance = await encryptData(toStr, secretKey)
        
        return await this.walletService.addWallet(encryptedPayload, encryptedNewBalance)
      }
      
      return await this.walletService.addWallet(encryptedPayload)
  }

  async addWalletTransaction(walletTransaction: DebtTransactionDTO | SavingTransactionDTO, walletBalance:number, remaingOrBalance:number){
    if (!walletTransaction) return false;

    const newWatlletBalance = walletTransaction.type==='repay_from'?walletBalance+walletTransaction.amount:walletBalance-walletTransaction.amount
    const newRemaingOrBalance =walletTransaction.actionType==="debt"?remaingOrBalance-walletTransaction.amount:remaingOrBalance+walletTransaction.amount;

    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
    const encryptedPayload = await encryptFormData(walletTransaction, secretKey);

    const encryptedNewBalance = await encryptData(newWatlletBalance.toString(), secretKey);
    const encryptedNewRemaingOrBalance= await encryptData(newRemaingOrBalance.toString(), secretKey);

    return await this.walletService.addWalletTransaction(encryptedPayload, encryptedNewBalance, encryptedNewRemaingOrBalance)
  }

  async convertBalance(payLoad: ConvertDTO, fromWalletBalance:number, toWalletBalance:number){
    if(!payLoad) return false;

    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
    const encryptedPayload = await encryptFormData(payLoad, secretKey);
    const fromWalletNewBalance =await encryptData((fromWalletBalance-payLoad.amount).toString(), secretKey)
    const toWalletNewBalance = await encryptData((toWalletBalance + payLoad.amount).toString(), secretKey)

    return await this.walletService.convertBalance(encryptedPayload, fromWalletNewBalance, toWalletNewBalance)
  }

  async getWalletHistory(walletId:string, actionType:string){
    const data = await this.walletService.getAllWalletHistory(walletId, actionType);
    if (!data) return null;

    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;

    const decryptedData = await Promise.all(data.map(async (h)=>{
      try{
        return await decryptFormData(h, secretKey)
      }catch (err) {
        console.error('==========_decryptData error===========', err);
        console.error('Raw data bị lỗi:', JSON.stringify(h));
        throw err;
      }
    }))

    return decryptedData;
  }

  async deleteWalletHistoryItem(foreignId:string, actionType:string, wTransactionId:string, newBalance:number,walletId:string, newWalletBalance:number){
    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
    const encryptedNewBalance = await encryptData(newBalance.toString(), secretKey) //backup balance for saving or debt
    const encrytedNewWalletBalace = await encryptData(newWalletBalance.toString(), secretKey) //wallet used for payment, ex: bank or cash

    return await this.walletService.deleteWalletHistoryItem(foreignId, actionType, wTransactionId, encryptedNewBalance, walletId, encrytedNewWalletBalace);
  }
}