import { CategoryDTO } from "./DTO";

 export interface IDateState {
  y: string;
  m: string;
  d: string;
}
export interface IStatisticDate{
  id: string,
  date:string,
  income: number,
  sending:number,
}
export interface IStatisticCategory{
  id:string,
  totalAmount: number,
  type: 'sending'|'income',
  categoryName:string
  date:string,
}
export interface IMonthlySummary{
  id:string,
  type:string,
  amount:string,
  createdAt:string,
}
//============================ ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU GET TỪ SERVER===================
export interface ServiceResponse<T> {
    status: boolean;
    data: T | null;
    message?: string;
}

export interface ICategory{
  id: string,
  name: string,
  type:string,
  iconName:string,
  iconColor: string,
}

export interface ITransactionItem{
    id: string;
    category: ICategory;
    amount: number;
    type: 'sending' | 'income';
    wallet: string;
    date: string;
    note: string;
    title: string;
    walletId?:string,
}

export interface IWallet{
    id:string,
    name: string,
    balance: number
}
export interface IDebt{
  id:string,
  name:string,
  type:'loan_to' | 'loan_from',
  partnerName:string,
  totalAmount:number,
  remaining:number,
  createdAt:string,
}
export interface IDebtHistory{
    id:string,
    walletName:string,
    foreignId:string,
    type:'repay_to'|'repay_from' |'', 
    amount:number,
    createdAt:string,
    note:"string"
}
export interface IGroupFund{
  id:string,
  fundName:string,
  groupName:string,
  balance:number
}
export interface IGroupFundHistory{
//=================================================================================================================================
}
export interface ISaving{
    id:string,
    name:string,
    target:number,
    balance: number,
}
export interface ISavingHistory{
    id: string,
    walletName:string,
    amount:number,
    createdAt:string,
    note:string,
    foreignId:string,
}

export interface BudgetEntitiy{
  id: string;
  amountLimit: string;     
  date: string;
  status: string;
  categoryId: string;
  categoryName: string;
  iconName: string;
  iconColor: string;
  categoryType: string;
  transactions: {
    id: string;
    amount: string;        
  }[];
}

export interface Budgets{
  id: string,
  category:ICategory,
  target: number;      
  balance: number ;          
  createdAt: string;
}

export interface DataForAI{
  buget:BudgetEntitiy[], 
  category: CategoryDTO[], 
  transaction: ITransactionItem[]
}



//=========================WEB DATA SCRAPE============
export interface IForeignCurrency {
  id: string;
  country: string;
  foreignCurrency: string;  // tên đơn vị tiền
  rate: number;             // 1 đơn vị ngoại tệ = x VND
  updatedAt: string;
}

export interface IGoldPrice {
  id: string;
  type: string;
  buyPrice: number;
  sellPrice: number;
  datetime: string;
}
// Response trả về client — gộp cả 2 vào 1 lần fetch
export interface IMarketDataResponse {
  foreignCurrencies: IForeignCurrency[];
  goldPrices: IGoldPrice[];
  updatedAt: string;
}



//=========================NOTIFACATIONS============
export interface INotification{
    id:string,
    type:string,
    title:string,
    description:string,
    time:string,
    isRead:boolean,
}
