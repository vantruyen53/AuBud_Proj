import { UserDTO } from "@/src/models/interface/DTO";
import { IWallet,ISaving,IDebt,IGroupFund } from "@/src/models/interface/Entities";
import { WalletDTO, CreateSavingDTO, CreateDebtDTO, DebtTransactionDTO,SavingTransactionDTO,ConvertDTO,CreateTransactionDTO } from "@/src/models/interface/DTO";
import { WalletService } from "@/src/services/ServiceImplement/walletService";
import { IWalleetService } from "@/src/models/interface/ServiceInterface";

import * as Secure from 'expo-secure-store';
import { SECRET_KEY_STORE } from "@/src/constants/securityContants";
import { decryptFormData, encryptFormData, encryptData} from "@/src/utils/security";

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
  private async _decryptSaving(raw: any, secretKey: string): Promise<ISaving> {
      const d = await decryptFormData<any>(raw, secretKey,
          ['id', 'status', 'createdAt', 'actionType', 'userId'],
          'SAVING' // ← label
      );
      return { ...d, balance: this._toNumber(d.balance), target: this._toNumber(d.target) };
  }
  private async _decryptDebt(raw: any, secretKey: string): Promise<IDebt> {
      const d = await decryptFormData<any>(raw, secretKey,
          ['id', 'status', 'createdAt', 'actionType', 'userId', 'type'],
          'DEBT' // ← label
      );
      return { ...d, totalAmount: this._toNumber(d.totalAmount), remaining: this._toNumber(d.remaining) };
  }

  async loadWalletScreenData(): Promise<WalletScreenData | null> {
    const data = await this.walletService.getAllWallets();
    if (!data) return null;

    // 1. Lấy secretKey từ SecureStore
    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;

     // 2. Giải mã song song cho từng loại — Promise.all để nhanh hơn
    const [wallets, savings, debts] = await Promise.all([
      Promise.all(data.wallets.map(w => this._decryptWallet(w, secretKey))),
      Promise.all(data.savings.map(s => this._decryptSaving(s, secretKey))),
      Promise.all(data.debts.map(d => this._decryptDebt(d, secretKey))),
    ]);

    
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

  async createNewWallet(wallet: WalletDTO | CreateDebtDTO | CreateSavingDTO | undefined) {
    if (!wallet) return false;
      const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
      const encryptedPayload = await encryptFormData(wallet, secretKey);
      
      return await this.walletService.addWallet(encryptedPayload)
  }

  async addWalletTransaction(walletTransaction: DebtTransactionDTO | SavingTransactionDTO, walletBalance:number, remaingOrBalance:number){
    if (!walletTransaction) return false;

    const newWatlletBalance = walletBalance-walletTransaction.amount
    const newRemaingOrBalance =walletTransaction.actionType==="debt"?remaingOrBalance-walletTransaction.amount:remaingOrBalance+walletTransaction.amount;

    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
    const encryptedPayload = await encryptFormData(walletTransaction, secretKey);

    const encryptedNewBalance = await encryptData(newWatlletBalance.toString(), secretKey);
    const encryptedNewRemaingOrBalance= await encryptData(newRemaingOrBalance.toString(), secretKey);

    return await this.walletService.addWalletTransaction(encryptedPayload, encryptedNewBalance, encryptedNewRemaingOrBalance)
  }

  async getWalletHistory(){

  }

  async convertBalance(payLoad: ConvertDTO, fromWalletBalance:number, toWalletBalance:number){
    if(!payLoad) return false;

    const secretKey = await Secure.getItemAsync(SECRET_KEY_STORE) as string;
    const encryptedPayload = await encryptFormData(payLoad, secretKey);
    const fromWalletNewBalance =await encryptData((fromWalletBalance-payLoad.amount).toString(), secretKey)
    const toWalletNewBalance = await encryptData((toWalletBalance + payLoad.amount).toString(), secretKey)

    return await this.walletService.convertBalance(encryptedPayload, fromWalletNewBalance, toWalletNewBalance)
  }
}