import { ToadScheduler, SimpleIntervalJob, AsyncTask, CronJob } from 'toad-scheduler';
import type { IMarketService } from '../domain/models/application/interface/IWebDataScrapeService.js';
import { ReminderService } from '../services/ReminderService.js';
import { LogService } from '../services/systemLogService.js'; // adjust path

// Helper: wrap một async job với log success/failure
function createTrackedTask(
  taskName: string,
  fn: () => Promise<void>
): AsyncTask {
  return new AsyncTask(taskName, async () => {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      console.log(`[Scheduler] ✅ ${taskName} completed in ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - start;
      console.error(`[Scheduler] ❌ ${taskName} failed:`, error.message);
      await LogService.write({
        message: `Scheduled job "${taskName}" failed: ${error.message}`,
        actor_type: 'system',
        type: 'error',
        status: 'failure',
        actionDetail: 'scheduler.job.failed',
        metaData: {
          jobName: taskName,
          durationMs: duration,
          error: error.message,
          stack: error.stack,
        } as any,
      });
    }
  });
}

export async function initMarketScheduler(marketService: IMarketService) {
  // Chạy ngay khi server khởi động — cũng cần track
  console.log('[Scheduler] Running initial scrape...');
  await Promise.all([
    createTrackedTask('initial-foreign-currency', () =>
      marketService.scrapeAndSaveForeignCurrency()
    ).execute(),
    createTrackedTask('initial-gold-price', () =>
      marketService.scrapeAndSaveGoldPrice()
    ).execute(),
  ]);

  const scheduler = new ToadScheduler();

  // ── Market jobs ──────────────────────────────────────────────
  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      { minutes: 10 },
      createTrackedTask('update-foreign-currency', () =>
        marketService.scrapeAndSaveForeignCurrency()
      )
    )
  );

  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      { minutes: 10 },
      createTrackedTask('update-gold-price', () =>
        marketService.scrapeAndSaveGoldPrice()
      )
    )
  );

  console.log('[Market] Scheduler started — interval: 10 minutes');

  // ── Reminder job: 21:00 mỗi ngày ────────────────────────────
  const reminderService = new ReminderService();
  scheduler.addCronJob(
    new CronJob(
      { cronExpression: '12 15 * * *' },
      createTrackedTask('daily-reminder', () =>
        reminderService.sendDailyReminder()
      )
    )
  );

  console.log('[Reminder] Scheduler started — runs at 21:00 daily');
}