import { ITransactionItem } from "../models/interface/Entities";
import { WalletDTO, CreateDebtDTO, CreateSavingDTO,
  DebtTransactionDTO,SavingTransactionDTO,ConvertDTO,CreateTransactionDTO
 } from "../models/interface/DTO";
import { dateTimeStr,toInitialFormatCurrency } from "./format";

export const validateEmail = (email:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validateOTP = (otp:string) => /^\d{6}$/.test(otp);
export const passwordRegex = (pass: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/.test(pass);

export const totalSenIn = (data: ITransactionItem[], type: string) => {
  const filteredData = data.filter(s => s.type === type);
  const total = filteredData.reduce(
    (sum, s) => sum + (type === 'sending' ? Math.abs(s.amount) : s.amount), 
    0
  );
  return total;
}

export const createIconAcc=(name:string)=>{
    const nameArray =name.split(' ');
    return `${nameArray[0][0].toUpperCase()}${nameArray[nameArray.length-1][0].toUpperCase()}`;
  }


export const genereteWeekRange = (month:number, year:number)=>{
    const dayInMonth = new Date(year, month, 0).getDate();
    const startDay = 1
    const weekRang = [];
    for(let day = 1; day <=dayInMonth; day+=7){
      const endD = Math.min(day+6, dayInMonth)
      weekRang.push({startW: day, endW: endD})
    }
    return weekRang
  }
export const PaginationData = (data:any, page_size: number, page_number: number, maxIndex:number)=>{
  const startIndex = (page_number - 1) * page_size;
  let endIndex = page_number * page_size;
  if(endIndex > maxIndex-1)
    return endIndex=maxIndex-1;
  return data.slice(startIndex, endIndex);
}

export const monthLatinh =(m: number)=>{
  switch(m){
    case 1: return 'January'
    case 2: return 'February'
    case 3: return 'March'
    case 4: return 'April'
    case 5: return 'May'
    case 6: return 'June'
    case 7: return 'July'
    case 8: return 'August'
    case 9: return 'September'
    case 10: return 'Octobor'
    case 11: return 'November'
    case 12: return 'December'
    default: return ''
  }
}

export const extractWallet = (type: 'wallet' | 'saving' | 'debt'| "group" | null, data: any, userId:string)=>{
  try{
    switch(type){
      case 'wallet':
        return {
          id: data.id,
          name: data.name,
          balance:   isNaN(Number(data.balance)) ? 0 : Number(data.balance ?? 0), 
          createdAt:dateTimeStr(),
          userId:userId,
          status:'active',
          actionType:'wallet'
        } as WalletDTO;

      case 'debt':
        return {
          id: data.id,
          name:data.name,
          type: data.type,        
          partnerName: data.partnerName,
          totalAmount: isNaN(Number(data.totalAmount)) ? 0 : Number(data.totalAmount ?? 0),
          remaining:   isNaN(Number(data.remaining))   ? 0 : Number(data.remaining   ?? 0),
          status:'active',
          createdAt:dateTimeStr(),
          actionType:'debt'
        }as CreateDebtDTO;

      case 'saving':
        return{
          id: data.id,
          name: data.name,
          balance:   isNaN(Number(data.balance)) ? 0 : Number(data.balance ?? 0), 
        target:    isNaN(Number(data.target))  ? 0 : Number(data.target  ?? 0), 
          status:'active',
          createdAt:dateTimeStr(),
          actionType:'saving',
        } as CreateSavingDTO
    }
  }catch(err){
    console.log('===========extractWallet error: ', err)
    return null
  }
}

export const  extractTransaction= (type: 'Income' | 'Saving' | 'Debt'| "Sending" | 'Convert', data: any, userId:string)=>{
  try{
     const plainAmoun = parseInt(toInitialFormatCurrency(data.amount));
    switch(type){
      case 'Income':
        return{
          id: data?.id,
          categoryId: data.categoryId,
          amount: plainAmoun,
          type: 'income',
          walletId: data.walletId,
          createdAt: data.createdAt,
          note: data?.note,
          title: data.title,
          budgetId:data?.budgetId,
          status:'active',
          userId:userId
        } as CreateTransactionDTO;
      case "Sending":
        return{
          id: data?.id,
          categoryId: data.categoryId,
          amount: plainAmoun,
          type: 'sending',
          walletId: data.walletId,
          createdAt: data.createdAt,
          note: data?.note,
          title: data.title,
          budgetId:data?.budgetId,
          status:'active',
          userId:userId
        }as CreateTransactionDTO;
      case 'Debt':
        return{
          id:data?.id,
          type:data.debtType,
          debtId:data?.debtId,
          amount:plainAmoun,
          walletId:data.walletId,
          createdAt:data.createdAt,
          note:data?.note,
          actionType:'debt',
          userId:userId,
        }as DebtTransactionDTO;
      case 'Saving':
        return{
          id: data?.id, // cho update
          walletId:data.walletId,
          amount: plainAmoun,
          createdAt:data.createdAt,
          note:data?.note,
          type:'active',
          actionType:'saving',
          userId:userId,
          saving_book_id:data.savingId,
        }as SavingTransactionDTO;
      case 'Convert':
        return{
          fromWalletId:data.walletId,
          toWalletId:data.toWalletId,
          amount:plainAmoun,
          createdAt:data.createdAt,
          note:data?.note,
          actionType:'convert',
          userId:userId,
        }as ConvertDTO
    }
  }catch(err){
    console.log('===========extractWallet error: ', err)
    return null
  }
}