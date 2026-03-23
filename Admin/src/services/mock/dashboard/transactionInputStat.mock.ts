import type { TransactionInputStat } from "../../../model/type/dashboard.type";

const mockInputStat1D: TransactionInputStat[] = [
  { type: "user", value: 34 },
  { type: "bot", value: 24 },
];

// 7D — today-6 to today
const mockInputStat7D: TransactionInputStat[] = [
  { type: "user", value: 108 },
  { type: "bot", value: 134 },
];

// 30D — today-29 to today
const mockInputStat30D: TransactionInputStat[] = [
  { type: "user", value: 321 },
  { type: "bot", value: 790 },
];


async function getInputPeriod(specificTime:object,  timeLine:'1D'|'7D'|'30D'='30D') {
    console.log('[TransactionInputStat] specificTime:', specificTime)
    console.log('[TransactionInputStat] timeLine:', timeLine)

    switch(timeLine){
        case '1D':
            return mockInputStat1D
        case '7D':
            return mockInputStat7D
        case '30D':
            return mockInputStat30D
        default: return [];
    }
}

export {getInputPeriod, type TransactionInputStat}
