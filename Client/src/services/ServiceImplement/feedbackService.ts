import { apiFetch } from "../auth/apiService";
import { UserDTO } from "@/src/models/interface/DTO";

interface FeedbackDTO{
    userId:string
    content:string,
    rating:number
}

export class FeedbakcService{
    constructor(private user: UserDTO) {}

    async send(content:string, rating:number):Promise<boolean>{
        try{
            const payLoad:FeedbackDTO = {
                userId: this.user.id, content, rating
            }

            const res = await apiFetch('/feedback', {
                method:"POST",
                body:JSON.stringify(payLoad)
            });

            if(!res.ok) return false;

            const json = await res.json();
            return json ?? null;
        }catch (error) {
            console.error("Network error:", error);
            return false;
        }
    }
}