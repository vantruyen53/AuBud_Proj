import { ICategory } from "./Entities";


//============================ ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU POST TỚI SERVER============================ 
export interface UserDTO{
    id:string,
    accessToken:string,
}
export type EncryptedDTO = Record<string, string>;

export interface CategoryDTO{
  id: string,
  name: string,
  type:string,
  iconName:string,
  iconColor: string,
}

export interface TransactionDTO{
    id?: string;
    category: ICategory;
    amount: number;
    walletName:string,
    type: 'Sending' | 'Income';
    createdAd: string;
    title: string;
}
export interface CreateTransactionDTO{
    id?: string;
    categoryId: string;
    amount: number;
    type: 'sending' | 'income';
    walletId: string;
    createdAt: string;
    note: string;
    title: string;
    budgetId?:string,
    status:'completed',
    userId:string
}

export interface WalletDTO{
    id?: string, // cho update
    name: string,
    balance: number,
    createdAt: string,
    userId: string,
    status: 'active' | 'delelted',
    actionType:'wallet'|'debt'|'saving'|'groupFund'
}
export interface CreateDebtDTO{
  id?: string, // cho update
  name:string,
  type:'loan_from' | 'loan_to',
  partnerName:string,
  totalAmount:number,
  remaining?:number
  status: 'active' | 'done' | 'deleted',
  createdAt:String,
  actionType:'wallet'|'debt'|'saving'|'groupFund',
  paymentWalletId?:string,
}
export interface DebtTransactionDTO{
  id?: string, // cho update
  type:'repay_to' | 'repay_from',
  debtId:string,
  amount:number,
  walletId:string,
  createdAt:string,
  note:string,
  actionType:'debt'|'saving',
  userId:string,
}
export interface CreateGroupFundDTO{
  actionType:'wallet'|'debt'|'saving'|'groupFund'
//=================================================================================================================================
}
export interface GroupTransactionDTO{
//=================================================================================================================================
}
export interface CreateSavingDTO{
  id?: string, // cho update
  name:string,
  target:number,
  createdAt:string,
  status: 'active' | 'done' | 'deleted',
  balance:number,
  actionType:'wallet'|'debt'|'saving'|'groupFund'
}
export interface SavingTransactionDTO{
  id?: string, // cho update
  walletId:string,
  amount: number,
  createdAt:string,
  note:string,
  type:'active',
  actionType:'debt'|'saving',
  userId:string,
  saving_book_id:string,
}
export interface ConvertDTO{
  fromWalletId:string,
  toWalletId:string,
  amount:number,
  createdAt:string
  note:string,
  actionType:'convert',
  userId:string,
}


export interface BudgetDTO{
  target:string //sau khi mã hóa,
  categoryId:string,
  date:string
  status:'active' // | 'deleted'
}

