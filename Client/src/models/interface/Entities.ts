 export interface IDateState {
  y: string;
  m: string;
  d: string;
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
    debtId:string,
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
    savingId:string,
}
