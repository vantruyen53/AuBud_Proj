import { apiClient } from "../../utils/configs/axios.config";
import axios from "axios";

export class LogService{
    async gettable(fromDate:string, toDate:string, offset:string, limit:string,
        type:'info'|'warning'|'error'|'ai'|'auth'|'all'){
        try{
            const q = new URLSearchParams({fromDate, toDate, offset, limit}).toString();

            const result = await apiClient.get(`/system-log/${type}?${q}`)
            return result.data;
        }catch (error: unknown) {
            let message = "Server error";

            // Kiểm tra xem error có phải là lỗi từ Axios không     
            if (axios.isAxiosError(error)) {
                // Bây giờ TypeScript đã biết 'error' là AxiosError
                message = error.response?.data?.message || error.message || "Network error";
            } else if (error instanceof Error) {
                // Trường hợp lỗi code JS thông thường
                message = error.message;
            }

            return { status: false, message: message };
        }
    }

    async getStats(){
        try{
            const result = await apiClient.get(`/system-log/stats/`)
            return result.data;
        }catch (error: unknown) {
            let message = "Server error";

            // Kiểm tra xem error có phải là lỗi từ Axios không     
            if (axios.isAxiosError(error)) {
                // Bây giờ TypeScript đã biết 'error' là AxiosError
                message = error.response?.data?.message || error.message || "Network error";
            } else if (error instanceof Error) {
                // Trường hợp lỗi code JS thông thường
                message = error.message;
            }

            return { status: false, message: message };
        }
    }
}