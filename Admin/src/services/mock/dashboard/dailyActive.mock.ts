import { type DailyActive } from "../../../model/type/dashboard.type";

// 7D — today-6 to today
const mockData7D: DailyActive[] = [
  { day: "2026-03-12", users: 87 },
  { day: "2026-03-13", users: 102 },
  { day: "2026-03-14", users: 95 },
  { day: "2026-03-15", users: 78 },  // weekend, thấp hơn
  { day: "2026-03-16", users: 65 },  // chủ nhật
  { day: "2026-03-17", users: 113 },
  { day: "2026-03-18", users: 121 }, // today
];

// 30D — today-29 to today
const mockData30D: DailyActive[] = [
  { day: "2026-02-17", users: 38 },
  { day: "2026-02-18", users: 44 },
  { day: "2026-02-19", users: 51 },
  { day: "2026-02-20", users: 29 }, // weekend
  { day: "2026-02-21", users: 24 }, // chủ nhật
  { day: "2026-02-22", users: 55 },
  { day: "2026-02-23", users: 60 },
  { day: "2026-02-24", users: 63 },
  { day: "2026-02-25", users: 57 },
  { day: "2026-02-26", users: 49 },
  { day: "2026-02-27", users: 33 }, // weekend
  { day: "2026-02-28", users: 28 }, // chủ nhật
  { day: "2026-03-01", users: 58 },
  { day: "2026-03-02", users: 65 },
  { day: "2026-03-03", users: 70 },
  { day: "2026-03-04", users: 66 },
  { day: "2026-03-05", users: 61 },
  { day: "2026-03-06", users: 35 }, // weekend
  { day: "2026-03-07", users: 30 }, // chủ nhật
  { day: "2026-03-08", users: 68 },
  { day: "2026-03-09", users: 74 },
  { day: "2026-03-10", users: 79 },
  { day: "2026-03-11", users: 72 },
  { day: "2026-03-12", users: 45 },
  { day: "2026-03-13", users: 62 },
  { day: "2026-03-14", users: 58 },
  { day: "2026-03-15", users: 31 }, // weekend
  { day: "2026-03-16", users: 27 }, // chủ nhật
  { day: "2026-03-17", users: 70 },
  { day: "2026-03-18", users: 74 },
];

function handleShortDay(data:DailyActive[]){
    const mockDailyActive:DailyActive[] = []

    data.forEach(item=>{
        const day = `${new Date(item.day).getDate()}-${new Date(item.day).getMonth()+1}`;
        const payLoad = {day, users: item.users}
        mockDailyActive.push(payLoad)
    })

    return mockDailyActive
}

async function getDailyActive(month:string, year:string, timeLine:'7D'|'30D'='30D') {
    // console.log('[DailyActive] specificTime:', specificTime)
    // console.log('[DailyActive] timeLine:', timeLine)
    switch(timeLine){
        case '7D':
            return handleShortDay(mockData7D)
        case '30D':
            return handleShortDay(mockData30D)
        default: return [];
    }
}

export {getDailyActive, type DailyActive}

