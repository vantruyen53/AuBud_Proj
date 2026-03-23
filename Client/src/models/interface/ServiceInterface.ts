import {  CategoryDTO,EncryptedDTO, } from "./DTO";
import { ITransactionItem , IWallet, IDebt, IDebtHistory, IGroupFund, 
  IGroupFundHistory, ISaving, ISavingHistory, IMonthlySummary, BudgetEntitiy, IMarketDataResponse} from "./Entities";


export interface ITransactionService {
  addTransaction(transaction: EncryptedDTO, newWatlletBalance: string): Promise<boolean>;
  updateTransaction(transaction: EncryptedDTO, oldWallet:EncryptedDTO, newWallet:EncryptedDTO): Promise<boolean>;
  deleteTransaction(transactionId: string, newBackupBalance:string,handleBy:'bot'|'user'): Promise<boolean>;
  getByDayService(day: number, month: number, year: number, handleBy:'bot'|'user'): Promise<ITransactionItem[] | null>;
  getByMonthService(month: number, year: number, handleBy:'bot'|'user'): Promise<ITransactionItem[] | null>;
  getByYearService(year: number, handleBy:'bot'|'user'): Promise<ITransactionItem[] | null>;
  getByCategoryService(categoryId: string): Promise<ITransactionItem[] | null>;
  getMonthlySummary(day:number, month:number, year:number):
    Promise<{ currentPeriod: IMonthlySummary[]; lastPeriod: IMonthlySummary[]}>
}

export interface IWalleetService {
  addWallet(wallet: EncryptedDTO, handleBy:'bot'|'user', encryptedNewBalance?:string, ): Promise<boolean>;
  updateWallet(wallet: EncryptedDTO, handleBy:'bot'|'user'): Promise<boolean>;
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
  getAllWalletHistory(walletId:string, walletType:string):Promise<ISavingHistory[]| IDebtHistory[] | null>
  deleteWalletHistoryItem(foreignId:string, actionType:string, wTransactionId:string, 
    newBalanceHashed:string,walletId:string, encrytedNewWalletBalace:string): Promise<boolean>
  convertBalance(payLoad: EncryptedDTO, fromWalletNewBalance:string, toWalletNewBalance:string): Promise<boolean>;
}

export interface ICategoryService{
  getSuggestedCategory():Promise<CategoryDTO[] | null>
  getAllCategory():Promise<CategoryDTO[] | null>
  addCategory(category:CategoryDTO): Promise<boolean>;
  updateCategory(category:CategoryDTO): Promise<boolean>;
  deleteCategory(categoryId:string,): Promise<boolean>;
}

export interface IBudgetService {
  getBudgets(month: string, year: string): Promise<BudgetEntitiy[]>;
  addNewBudget(payLoad: EncryptedDTO): Promise<{success: boolean, message?: string}>;
  updateBudget(budgetId: string, newTarget: string): Promise<{success: boolean, message?: string}>;
  deleteBudget(budgetId: string): Promise<{success: boolean, message?: string}>;
}

export interface IMarketService {
  getMarketData(): Promise<IMarketDataResponse | null>;
}