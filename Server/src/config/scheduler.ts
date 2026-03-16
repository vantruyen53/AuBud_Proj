import { ToadScheduler, SimpleIntervalJob, AsyncTask , CronJob } from 'toad-scheduler';
import type { IMarketService } from '../domain/models/application/interface/IWebDataScrapeService.js';
import { ReminderService } from '../services/ReminderService.js';

export async function initMarketScheduler(marketService: IMarketService) {
  // Chạy ngay khi server khởi động
  await Promise.all([
    marketService.scrapeAndSaveForeignCurrency(),
    marketService.scrapeAndSaveGoldPrice(),
  ]);

  const scheduler = new ToadScheduler();

  // ── Market jobs ──────────────────────────────────────────────
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

  // ── Reminder job: 21:00 mỗi ngày ─────────────────────────────────────────
  const reminderService = new ReminderService();
  scheduler.addCronJob(
    new CronJob(
      { cronExpression: '2 22 * * *' },    // 21:00 hàng ngày
      new AsyncTask('daily-reminder', async () => {
        await reminderService.sendDailyReminder();
      })
    )
  );

  console.log('[Reminder] Scheduler started — runs at 21:0 daily');
}