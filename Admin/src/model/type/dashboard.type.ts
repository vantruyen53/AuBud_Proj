export interface SystemStats{
    value:number,
    statChange:{
        status:'positive'|'negative',
        value:number
    }
}

export interface DailyActive{
    day:string,
    users:number
}

export interface TransactionInputStat{
    type:'user'|'bot'
    value:number
}

export interface AIUsage{
    day:string,
    value:number
}

export interface GroupSystemStats{
    totalUser:number,
    activeToday:SystemStats,
    newUser:SystemStats
}