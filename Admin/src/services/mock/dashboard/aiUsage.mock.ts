import { type AIUsage } from "../../../model/type/dashboard.type";

// 7D — today-6 to today
const mockAIUsage7D: AIUsage[] = [
  { day: "2026-03-12", value: 45 },
  { day: "2026-03-13", value: 62 },
  { day: "2026-03-14", value: 58 },
  { day: "2026-03-15", value: 31 }, // weekend
  { day: "2026-03-16", value: 27 }, // chủ nhật
  { day: "2026-03-17", value: 70 },
  { day: "2026-03-18", value: 74 }, // today
];

// 30D — today-29 to today
const mockAIUsage30D: AIUsage[] = [
  { day: "2026-02-17", value: 38 },
  { day: "2026-02-18", value: 44 },
  { day: "2026-02-19", value: 51 },
  { day: "2026-02-20", value: 29 }, // weekend
  { day: "2026-02-21", value: 24 }, // chủ nhật
  { day: "2026-02-22", value: 55 },
  { day: "2026-02-23", value: 60 },
  { day: "2026-02-24", value: 63 },
  { day: "2026-02-25", value: 57 },
  { day: "2026-02-26", value: 49 },
  { day: "2026-02-27", value: 33 }, // weekend
  { day: "2026-02-28", value: 28 }, // chủ nhật
  { day: "2026-03-01", value: 58 },
  { day: "2026-03-02", value: 65 },
  { day: "2026-03-03", value: 70 },
  { day: "2026-03-04", value: 66 },
  { day: "2026-03-05", value: 61 },
  { day: "2026-03-06", value: 35 }, // weekend
  { day: "2026-03-07", value: 30 }, // chủ nhật
  { day: "2026-03-08", value: 68 },
  { day: "2026-03-09", value: 74 },
  { day: "2026-03-10", value: 79 },
  { day: "2026-03-11", value: 72 },
  { day: "2026-03-12", value: 45 },
  { day: "2026-03-13", value: 62 },
  { day: "2026-03-14", value: 58 },
  { day: "2026-03-15", value: 31 }, // weekend
  { day: "2026-03-16", value: 27 }, // chủ nhật
  { day: "2026-03-17", value: 70 },
  { day: "2026-03-18", value: 74 }, // today
];

function handleShortDay(data:AIUsage[]){
    const mockAIUsage:AIUsage[] = []

    data.forEach(item=>{
        const day = new Date(item.day).getDate().toString();
        const payLoad = {day, value: item.value}
        mockAIUsage.push(payLoad)
    })

    return mockAIUsage
}

async function getAIUsage(specificTime:object, timeLine:'7D'|'30D'='30D') {
    console.log('[AIUsage] specificTime:', specificTime)
    console.log('[AIUsage] timeLine:', timeLine)
    switch(timeLine){
        case '7D':
            return handleShortDay(mockAIUsage7D)
        case '30D':
            return handleShortDay(mockAIUsage30D)
        default: return [];
    }
}

export {getAIUsage, type AIUsage}