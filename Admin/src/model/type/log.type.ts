export interface LogEntryDetailed{
  id:string,
    message:string,//
    actor_type:'user'|'admin'|'system',
    createdAt:string,//
    actorId?:string,//
    ipAddress?:string,
    type:'error' | 'warning' | 'info' | 'auth' | 'ai',
    actionDetail?:string,
    status:'success'|'failure'|'pending',
    metaData?:Record<string, unknown>
}

export interface LogsStats{
  all:number,
  info:number,
  warning:number,
  error:number,
  auth:number,
  ai:number
}