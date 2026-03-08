import type { IMarketService } from "../domain/models/application/interface/IWebDataScrapeService.js";
export class MarketController {
  constructor(private marketService: IMarketService) {}

  getMarketData = async (req: any, res: any) => {
    try {
      const result = await this.marketService.getMarketData();
      return res.status(200).json(result);
    } catch (error) {
      console.error('getMarketData error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}