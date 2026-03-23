import type { GroupSystemStats,DailyActive, TransactionInputStat,AIUsage } from "../model/type/dashboard.type";
import { DashboardService } from "../services/serviceImplement/dashboardService";

const dashboardService = new DashboardService();

function handleShortDay(data:DailyActive[]){
    const d:DailyActive[] = []

    data.forEach(item=>{
        const day = `${new Date(item.day).getDate()}-${new Date(item.day).getMonth()+1}`;
        const payLoad = {day, users: item.users}
        d.push(payLoad)
    })

    return d
}
function handleShortDay2(data:AIUsage[]){
    const d:AIUsage[] = []

    data.forEach(item=>{
        const day = new Date(item.day).getDate().toString();
        const payLoad = {day, value: item.value}
        d.push(payLoad)
    })

    return d
}

export const dashboardApp = {
    async getSystemStatsApp():Promise<GroupSystemStats>{
        const data = await dashboardService.getSystemStats();

        const totalUser = data.data.totalUser;
        const activetoday = data.data.activeToday
        const activeYesterday = data.data.activeYesterday===0?1:data.data.activeYesterday
        const newThisMonth = data.data.newThisMonth;
        const newPrevMonth = data.data.newPrevMonth===0?1:data.data.newPrevMonth;

        const activeChange = parseFloat((((activetoday - data.data.activeYesterday) / activeYesterday) * 100).toFixed(2))
        const newChange = parseFloat((((newThisMonth - data.data.newPrevMonth) / newPrevMonth) * 100).toFixed(2))

        return {
            totalUser,
            activeToday:{
                value:activetoday,
                statChange:{
                    status:activetoday>activeYesterday?"positive":"negative",
                    value:activeChange
                }
            },
            newUser:{
                value:newThisMonth,
                statChange:{
                    status:newThisMonth>newPrevMonth?"positive":"negative",
                    value:newChange
                }
            }
        }
    },
    async getDailyActive(month:string, year:string, timeLine:'7D'|'30D'='30D'):Promise<DailyActive[]>{
        const data =await dashboardService.getDailyActive(timeLine, month, year)

        const d = handleShortDay(data.data)
        console.log('[DailyActive Data]',d)
        return d;
    },

    async getTransactionInput(month:string, year:string, timeLine:'1D'|'7D'|'30D'='30D'):Promise<TransactionInputStat[]>{
        const data = await dashboardService.getTransactionInput(timeLine, month, year);

        return data.data;
    },

    async getAIUsage(month:string, year:string, timeLine:'7D'|'30D'='30D'):Promise<AIUsage[]>{
        const data =await dashboardService.getAiUsage(timeLine, month, year)

        const d = handleShortDay2(data.data)
        console.log('[AIUsage Data]',d)
        return d;
    }
}
