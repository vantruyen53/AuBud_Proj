import { apiClient } from '../../utils/configs/axios.config';
import axios from 'axios';

export class UserManaService{
    async getUser(role: string, status:string, offset:string, limit:string){
       try{
         const q = new URLSearchParams({status, offset, limit}).toString();
         const result = await apiClient.get(`/user-management/${role}?${q}`);
         return result.data
       }catch (error: unknown) { // Đổi any thành unknown
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

    async ban(userId:string, email:string, userName:string , reason:string, toState:'ban'|'active'){
        try {
            const result = await apiClient.post(`/user-management/${userId}`,{
                email, userName, reason, toState
            })

            if(result.status ===200)
                return {status: true, message:result.data.message}
            return {status: false, message:result.data.message}
        } catch (error: unknown) { // Đổi any thành unknown
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