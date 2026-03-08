import type{ IMarketDataResponse } from "../../../../data/DTO/AppDTO.js";
export interface IMarketService {
  // Gọi khi server khởi động và theo scheduler
  scrapeAndSaveForeignCurrency(): Promise<void>;
  scrapeAndSaveGoldPrice(): Promise<void>;

  // API endpoint gọi khi client fetch
  getMarketData(): Promise<IMarketDataResponse>;
}