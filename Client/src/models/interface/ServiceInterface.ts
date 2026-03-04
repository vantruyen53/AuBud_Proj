import { CreateTransactionDTO, WalletDTO, CreateDebtDTO, CreateSavingDTO, CategoryDTO,
  CreateGroupFundDTO, ConvertDTO, DebtTransactionDTO, SavingTransactionDTO,EncryptedDTO, } from "./DTO";
import { ITransactionItem , IWallet, IDebt, IDebtHistory, IGroupFund, 
  IGroupFundHistory, ISaving, ISavingHistory, } from "./Entities";


export interface ITransactionService {
  addTransaction(transaction: EncryptedDTO, newWatlletBalance: string): Promise<boolean>;
  updateTransaction(transaction: EncryptedDTO, newWatlletBalance: number): Promise<boolean>;
  deleteTransaction(transactionId: string, newBackupBalance:string): Promise<boolean>;
  getByDayService(day: number, month: number, year: number): Promise<ITransactionItem[] | null>;
  getByMonthService(month: number, year: number): Promise<ITransactionItem[] | null>;
  getByYearService(year: number): Promise<ITransactionItem[] | null>;
  getByCategoryService(categoryId: string): Promise<ITransactionItem[] | null>;
}

export interface IWalleetService {
  addWallet(wallet: EncryptedDTO): Promise<boolean>;
  updateWallet(wallet: EncryptedDTO): Promise<boolean>;
  deleteWallet(walletId: string, actionType: 'wallet' | 'saving' | 'debt'): Promise<boolean>;
  getAllWallets(): Promise<{
    wallets: IWallet[],
    savings: ISaving[],
    debts: IDebt[],
    groupFunds: IGroupFund[],
  } | null>;
   getById(id:string):Promise<any>;

  //khoan triển khai 
  addWalletTransaction(walleTransaction:EncryptedDTO, encryptedNewBalance: string, encryptedNewRemaingOrBalance:string): Promise<boolean>;
  getAllWalletHistory():Promise<ISavingHistory[]| IDebtHistory[] | null>
  convertBalance(payLoad: EncryptedDTO, fromWalletNewBalance:string, toWalletNewBalance:string): Promise<boolean>;
}

export interface ICategoryService{
  getSuggestedCategory():Promise<CategoryDTO[] | null>
  getAllCategory():Promise<CategoryDTO[] | null>
  addCategory(category:CategoryDTO): Promise<boolean>;
  updateCategory(category:CategoryDTO): Promise<boolean>;
  deleteCategory(categoryId:string,): Promise<boolean>;
}
