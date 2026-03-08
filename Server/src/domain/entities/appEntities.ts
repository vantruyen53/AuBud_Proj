export class ServerResult{
  constructor(
    public status: boolean,
    public message: string,
  ){}
}

export interface ICategory {
  id: string;
  name: string;
  type: string;
  iconName: string;
  iconColor: string;
  library: string;
}

export interface ITransaction {
  id: string;
  userId: string; 
  categoryId: string;
  category?: ICategory;
  amount: number;
  type: 'sending' | 'income';
  wallet: string;
  date: string; // YYYY-MM-DD
  note: string;
  title: string;
}

export interface IMonthlySummary{
  id:string,
  type:string,
  amount:string,
  createdAt:string,
}

//==========================WALLET=================
export interface WalletEntity {
    id: string;
    name: string;      // encrypted
    balance: string;   // encrypted
}
export interface SavingEntity {
    id: string;
    name: string;      // encrypted
    balance: string;   // encrypted
    target: string;    // encrypted
}
export interface SavingHistoryEntity{
    id: string,
    walletName:string,
    amount:number,
    createdAt:string,
    note:string,
    walletId:string, //bank or cash ... to repay money
    foreignId:string, //debt_id
}
export interface DebtEntity {
    id: string;
    name: string;          
    type: 'loan_from' | 'loan_to';
    partnerName: string;   
    totalAmount: string;   
    remaining: string;     
    createdAt: string;
}
export interface DebtHistoryEntity{
    id:string,
    foreignId:string, //saving_book_id
    amount:number,
    createdAt:string,
    note:"string",
    type:'repay_from'|'repay_to'
    walletId:string, //bank or cash to repay money
    walletName:string,
}
export interface GroupFundEntity {
    id: string;
    fundName: string;   // không encrypt — dữ liệu dùng chung
    groupName: string;
    balance: number;
}
export interface WalletScreenEntity {
    wallets:    WalletEntity[];
    savings:    SavingEntity[];
    debts:      DebtEntity[];
    groupFunds: GroupFundEntity[];
}

//==========================CATEGORY=================
export interface CategoryEntity{
  id: string,
  name: string,
  type:string,
  iconName:string,
  iconColor: string,
  userId?: string;
  isDefault?: boolean;
}


//==========================Budget=================
// Raw transaction gắn kèm theo budget
export interface BudgetTransactionEntity {
  id: string;
  amount: string;        // encrypted
}

// Budget entity trả về client
export interface BudgetEntity {
  id: string;
  amountLimit: string;   // encrypted
  date: string;          // "2026-03-01"
  status: string;
  categoryId: string;
  categoryName: string;
  iconName: string;
  iconColor: string;
  categoryType: string;
  transactions: BudgetTransactionEntity[];
}