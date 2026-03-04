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
  userId: string; // Quan trọng để lọc dữ liệu theo người dùng
  categoryId: string;
  category?: ICategory; // Populate khi trả về client
  amount: number;
  type: 'sending' | 'income';
  wallet: string;
  date: string; // YYYY-MM-DD
  note: string;
  title: string;
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
    savingId:string,
}
export interface DebtEntity {
    id: string;
    name: string;          // encrypted
    type: 'loan_from' | 'loan_to';  // không encrypt
    partnerName: string;   // encrypted
    totalAmount: string;   // encrypted
    remaining: string;     // encrypted
    createdAt: string;
}
export interface DebtHistoryEntity{
    id:string,
    debtId:string,
    type:'loan_from'|'loan_to', 
    amount:number,
    createdAt:string,
    note:"string"
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