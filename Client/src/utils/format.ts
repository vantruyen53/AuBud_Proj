const dateFormat = (day:number, month: number, year: number)=>{
    const dStr = day < 10 ? `0${day}` : `${day}`;
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const dateKey = `${monthStr}/${dStr}/${year}`;
    return dateKey;
}

const convertDateFormat = (dateString: string, showYear:boolean): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if(showYear) return `${day}/${month}/${year}`
  else return `${day}/${month}`
};

export const dateTimeStr = () => {
    const today = new Date();

    const year = today.getFullYear();          
    const month = today.getMonth() + 1;       
    const day = today.getDate();            
    const hours = today.getHours();          
    const minutes = today.getMinutes();      
    const seconds = today.getSeconds();      

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const formatCurrency = (amount: number, config: { showSign?: boolean, showCurrency?: boolean, absolute?: boolean } = {}) => {
  const { showSign = true, showCurrency = true, absolute = false } = config;
  const val = absolute ? Math.abs(amount) : amount;
  const absVal = Math.abs(val);
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  let result = formatted;
  if (showCurrency) result = `${result} ₫`;
  if (showSign && !absolute) {
    result = `${val >= 0 ? '+' : '-'}${result}`;
  }
  
  return result;
};

const toInitialFormatCurrency = (amount:String)=>{
  return amount.replace(/\D/g,"");
}
export const toDateTimeFormat=(year:string, month:string, day:string)=>{
  const today = new Date();
  const hours = today.getHours();          
  const minutes = today.getMinutes();      
  const seconds = today.getSeconds();

   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const formatShortCurrency = (amount: number) => {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}tr`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}k`;
  return `${sign}${abs}`;
};

export{dateFormat, formatCurrency, toInitialFormatCurrency, formatShortCurrency, convertDateFormat}

