export interface FeedbackEntity{
    id:string,
    userId:string,
    userName:string,
    email:string,
    content:string,
    createdAt:string,
    rating:string,
    isMark:number
}

export interface FeedbackTable{
    total:number,
    data:FeedbackEntity[]
}

export interface FeedbackStats{
    total:number,
    totalMark:number,
    totalToday:number,
}