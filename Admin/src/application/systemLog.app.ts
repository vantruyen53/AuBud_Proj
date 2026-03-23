import { LogService } from "../services/serviceImplement/systemLogService";
import type{ LogEntryDetailed, LogsStats } from "../model/type/log.type";

const _service = new LogService();

export class systemLogApp{

    async getTable(fromDate:string, toDate:string, offset:string, limit:string,
        type:'info'|'warning'|'error'|'ai'|'auth'|'all'):Promise<{total:number, logs:LogEntryDetailed[]}>{
        return  await _service.gettable(fromDate, toDate, offset, limit, type);
    }

    async getStats():Promise<LogsStats>{
        return  await _service.getStats();
    }
}