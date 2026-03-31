// import type{ICategory} from ;

export interface CreateTransactionDTO {
  categoryId: string;
  amount: string;
  type: 'sending' | 'income';
  walletId: string;
  createdAt: string;
  note: string;
  title: string;
  budgetId?:string,
  handle:string,
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {
  id: string;
  oldWalletId:string,
  oldBalance:string,
  newWalletId:string,
  newBalance:string,
}

// Request Query DTO (Cho hàm GET)
export interface TransactionQueryDTO {
  day?: string;
  month?: string;
  year?: string;
  endDate?: string;
  startDate?: string;
  categoryId?: string;
  handleBy?:'bot'|'user'
}

export interface TransactionForGemini {
    id: string;
    amount:string,
    note:string,
    title:string,
    userId:string,
    walletId:string,
    categoryId:string,
    createdAt:string,
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
    remaining?: string;       // encrypted
    createdAt: string;
    status: 'active' | 'done' | 'deleted';
    actionType: 'debt';
    paymentWalletId?:string

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


//==========================Budget=================
export interface CreateBudgetDTO {
  userId: string;
  categoryId: string;
  target: string;        // encrypted
  date: string;          // "03/2026"
  status: 'active';
}

export interface UpdateBudgetDTO {
  userId: string;
  budgetId: string;
  target: string;        // encrypted
}

export interface DeleteBudgetDTO {
  userId: string;
  budgetId: string;
}

export interface GetBudgetsDTO {
  userId: string;
  month: string;
  year: string;
}
//=========================WEB DATA SCRAPE============
// Data sau khi scrape về — trước khi lưu DB
export interface IForeignCurrencyRaw {
  country: string;
  foreignCurrency: string;  // tên đơn vị, ví dụ "USD"
  rate: number;             // 1 đơn vị ngoại tệ = bao nhiêu VND (đã parse sang number)
}

export interface IGoldPriceRaw {
  type: string;             // loại vàng, ví dụ "VÀNG SJC"
  buyPrice: number;         // giá mua (đã parse)
  sellPrice: number;        // giá bán (đã parse)
}

// Entity lấy từ DB trả về client
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