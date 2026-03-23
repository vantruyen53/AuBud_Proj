import type { IMarketService } from "../../domain/models/application/interface/IWebDataScrapeService.js";
import { LogService } from "../../services/systemLogService.js";

export class MarketController {
  constructor(private marketService: IMarketService) {}

  getMarketData = async (req: any, res: any) => {
    try {
      const result = await this.marketService.getMarketData();
      return res.status(200).json(result);
    } catch (error:any) {
      await LogService.write({
        message: `getMarketData error: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'market.get.error',
        ipAddress: req.ip,
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('getMarketData error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}