// domain/dtos/TransactionDTO.ts
export interface CreateTransactionDTO {
  categoryId: string;
  amount: number;
  type: 'sending' | 'income';
  walletId: string;
  createdAt: string;
  note: string;
  title: string;
  budgetId?:string
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {
  id: string;
}

// Request Query DTO (Cho hàm GET)
export interface TransactionQueryDTO {
  day?: string;
  month?: string;
  year?: string;
  categoryId?: string;
}

//==========================WALLET=================
export interface WalletActionDTO {
    // Query params
    userId: string;
    actionType: 'wallet' | 'saving' | 'debt';
}
export interface CreateWalletDTO {
    userId: string;
    name: string;        // encrypted
    balance: string;     // encrypted
    createdAt: string;
    status: 'active' | 'deleted';
    actionType: 'wallet';
}
export interface CreateSavingDTO {
    userId: string;
    name: string;        // encrypted
    balance: string;     // encrypted
    target: string;      // encrypted
    createdAt: string;
    status: 'active' | 'done' | 'deleted';
    actionType: 'saving';
}
export interface CreateSavingTransactionDTO{
  id?: string, // cho update
  walletId:string,
  amount: string,
  createdAt:string,
  note:string,
  type:'active',
  saving_book_id:string,
  actionType:'debt'|'saving',
  userId:string,
  newBalance:string,
  encryptedNewBalance:string
}
export interface CreateDebtDTO {
    userId: string;
    name: string;            // encrypted
    type: 'loan_from' | 'loan_to';
    partnerName: string;     // encrypted
    totalAmount: string;     // encrypted
    remaining: string;       // encrypted
    createdAt: string;
    status: 'active' | 'done' | 'deleted';
    actionType: 'debt';
}
export interface CreateDebtTransactionDTO{
  id?: string,
  type:'repay_to' | 'repay_from',//
  debtId:string,
  amount:number,
  walletId:string,
  createdAt:string,
  note:string,
  actionType:'debt'|'saving',
  userId:string,
  newRemaining:string,
  encryptedNewBalance:string,
}
export interface ConvertDTO{
  fromWalletId:string,
  toWalletId:string,
  amount:number,
  createdAt:string
  note:string,
  actionType:'convert',
  userId:string,
  fromWalletNewBalance:string, 
  toWalletNewBalance:string
}
// Update thì thêm id
export interface UpdateWalletDTO extends CreateWalletDTO { id: string; }
export interface UpdateSavingDTO extends CreateSavingDTO { id: string; }
export interface UpdateDebtDTO   extends CreateDebtDTO   { id: string; }

//==========================Category=================
export interface CategoryDTO{
  id: string,
  name: string,
  type:string,
  iconName:string,
  iconColor: string,
  userId:string,
  usageCount:number,
  status:'active'
}