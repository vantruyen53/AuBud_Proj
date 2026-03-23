import { apiClient } from '../../utils/configs/axios.config';


export class DashboardService{
    private async _getRequest(endpoint:string,period?:'1D'|'7D'|'30D',query?:Record<string,string>){

        console.log('[END POINT] ', endpoint)
        try {
            const periodPath = period ? `/${period}` : '';
            const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
            const url = `/dashboard/${endpoint}${periodPath}${queryString}`;
            console.log('[URL]', url)

            const result = await apiClient.get(url);
            return { status: true, data: result.data };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
            const message = error.response?.data?.message || "Server error";
            return { status: false, message };
        }
    }

    async getSystemStats(){
        return this._getRequest('systems-tatus');
    }

    async getDailyActive(period:'7D'|'30D', month:string, year:string){
        return this._getRequest('daily-active',period, {month, year})
    }

    async getTransactionInput(period:'1D'|'7D'|'30D', month:string, year:string){
        return this._getRequest('transaction-input',period, {month, year})
    }

    async getAiUsage(period:'7D'|'30D', month:string, year:string){
        return this._getRequest('ai-usage',period, {month, year})
    }
}