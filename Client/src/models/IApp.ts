interface ITransaction { //Đã bỏ trong home
    id: string; 
    category: ICategory;
    amount: string;
    type: string;
    wallet: string;
    date: string;
    note: string;
    buget: string;
    title: string;
}
interface IDateState {
  y: string;
  m: string;
  d: string;
}
interface ITransactionSection {
  title: string;
  data: ITransaction[];
}

interface IDayData{
  day: number | null;
}

interface ICategory{
  id: string,
  name: string,
  type:string,
  iconName:any,
  iconColor: string,
}

export interface IWallet{
  id: string,
  name:string,
  balance:number ,
}

export interface IDebtMaster {
  id: string;
  partnerName?: string;
  type?: 'loan_to' | 'loan_from' | 'repay_to' | 'repay_from' | ''; 
  totalAmount: number ; // Tổng đã vay/cho vay (bao gồm cả các lần vay thêm)
  remaining: number ;   // Số tiền hiện tại còn nợ
  status?: 'active' | 'closed';
  createAt?: string;
}

export interface IDebtTransaction {
  id?: string;
  debtId?: string;      // Foreign Key trỏ tới IDebtMaster
  type?: 'loan_to' | 'loan_from' | 'repay_to' | 'repay_from';
  amount?: number;      // Số tiền của riêng giao dịch này
  createAt?: string;
  note?: string | null;
}

export interface ISaving{
  id:string | '',
  name: string | '',
  target: number,
  balance:number,
}

export interface BarChartProps {
  sending: number,
  income: number,
}

export interface IGroupFund { 
  id: string, 
  fundName: string,
  balance: number, 
  groupName: string,
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

export interface IBudgetCategory {
  id: string,
  category: ICategory,
  totalAmount: number,
  balance: number,
  date:string, //month-year
}

export interface IUser{
  id:string,
  name:string,
  email:string,
  accessToken:string,
}

export interface IMessage{
  _id: string, 
  text: string,
  createdAt: string,
  from: string
}

export {ITransaction, IDateState, ITransactionSection, IDayData, ICategory};