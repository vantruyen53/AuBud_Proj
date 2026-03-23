import { apiClient } from "../../utils/configs/axios.config";
import axios from "axios";
import type{ NotificationDTO } from "../../application/notification.app";

export class NotificationService{
    async get(type:string, value:string|undefined,offset:string, limit:string){
        try {
            let q;
            if(type!=='all' && value)
                q = new URLSearchParams({type, value, offset, limit}).toString();
            else
                q = new URLSearchParams({type, offset, limit}).toString()

            console.log(`/notifications?${q}`)

            const result = await apiClient.get(`/admin-notifications?${q}`)
            return result.data
        } catch (error:unknown) {
            let message = "Server error"
            if(axios.isAxiosError(error))
                message = error.response?.data?.message || error.message || "Network error";
            else if(error instanceof Error)
                message = error.message;

             return { status: false, message: message };
        }
    }

    async send(payLoad:NotificationDTO){
        try {
            const result = await apiClient.post("/admin-notifications/send",{
                ...payLoad
            })
            if(result.status ===200)
                return {status: true, message:result.data.message}
            return {status: false, message:result.data.message}

        } catch (error:unknown) {
            let message = "Server error"
            if(axios.isAxiosError(error))
                message = error.response?.data?.message || error.message || "Network error";
            else if(error instanceof Error)
                message = error.message;

             return { status: false, message: message };
        }
    }
}