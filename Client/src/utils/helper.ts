import { ITransaction } from "@/src/models/IApp";
import { toInitialFormatCurrency } from "./format";
export const totalSenIn = async (dataS: ITransaction[], dataI:ITransaction[]) =>{
    const sending = dataS.filter(s=>s.type==='sending').reduce((sum, s)=>sum+ parseInt(toInitialFormatCurrency(s.amount)),0)
    const income = dataI.filter(i=>i.type==='income').reduce((sum, i)=>sum+ parseInt(toInitialFormatCurrency(i.amount)),0)
    return{
      sending:sending,
      income:income
    }
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