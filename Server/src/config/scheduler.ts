import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import type { IMarketService } from '../domain/models/application/interface/IWebDataScrapeService.js';
export async function initMarketScheduler(marketService: IMarketService) {
  // Chạy ngay khi server khởi động
  await Promise.all([
    marketService.scrapeAndSaveForeignCurrency(),
    marketService.scrapeAndSaveGoldPrice(),
  ]);

  const scheduler = new ToadScheduler();

  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      { minutes: 10 },
      new AsyncTask('update-foreign-currency', () => marketService.scrapeAndSaveForeignCurrency())
    )
  );

  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      { minutes: 10 },
      new AsyncTask('update-gold-price', () => marketService.scrapeAndSaveGoldPrice())
    )
  );

  console.log('[Market] Scheduler started — interval: 10 minutes');
}