import axios from "axios";
import { apiClient } from "../../utils/configs/axios.config";

export class FeedbackService{
    async get(type:string, offset:string, limit:string, rating?:string){
        try {
            let q;

            if(rating)
                q = new URLSearchParams({rating, offset, limit}).toString()
            else
                q = new URLSearchParams({offset, limit}).toString()

            const result = await apiClient.get(`/feedback/${type}?${q}`)
            return result.data;

        } catch (error:unknown) {
            let message="Server error";

            if(axios.isAxiosError(error))
                message = error.response?.data?.message || error.message || "Network error";
            else if(error instanceof Error)
                message = error.message;

             return { status: false, message: message };
        }
    }

    async getStats(){
        try {
            const result = await apiClient.get(`/feedback/stats`)
            return result.data;
        }catch (error:unknown) {
            let message="Server error";

            if(axios.isAxiosError(error))
                message = error.response?.data?.message || error.message || "Network error";
            else if(error instanceof Error)
                message = error.message;

             return { status: false, message: message };
        }
    }

    async mark(id:string, isMark:'true'|'false'){
        try {
            const result = await apiClient.post(`/feedback/${id}/${isMark}`)
            return result.data;

        } catch (error:unknown) {
            let message="Server error";

            if(axios.isAxiosError(error))
                message = error.response?.data?.message || error.message || "Network error";
            else if(error instanceof Error)
                message = error.message;

             return { status: false, message: message };
        }
    }
}