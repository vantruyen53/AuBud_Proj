import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import type{ IMarketDataResponse, IForeignCurrencyRaw, IGoldPriceRaw } from '../../data/DTO/AppDTO.js';
import type{ IMarketService } from '../../domain/models/application/interface/IWebDataScrapeService.js';
import { allPagesUrl } from '../../data/local/allContries.js';
import type { Pool } from 'mysql2/promise';
import { LogService } from '../systemLogService.js';

export class MarketService implements IMarketService {
  constructor(private pool: Pool) {}

  // Parse chuỗi tiền tệ sang number
  // ví dụ: "26,233.50" → 26233.50
  private _parsePrice(raw: string): number {
    // Format châu Âu: "15.462,80" → 15462.80
    // Bước 1: xóa dấu . (phân cách nghìn)
    // Bước 2: đổi dấu , thành . (thập phân)
    const cleaned = raw
      .trim()
      .replace(/\./g, '')   // xóa dấu chấm nghìn
      .replace(',', '.');   // đổi phẩy thập phân thành chấm

    return parseFloat(cleaned) || 0;
  }

  async scrapeAndSaveForeignCurrency(): Promise<void> {
    const dateTime = new Date()

    try {
      const scraped: IForeignCurrencyRaw[] = [];

      for (const page of allPagesUrl) {
        try {
          const response = await fetch(page.url);
          const html = await response.text();
          const $ = cheerio.load(html);

          const foreignCurrencyStr = $('.rates-data-container.indirect-rates-data span.converter-rate-to').text().trim();
          const vndStr = $('.rates-data-container.indirect-rates-data span.converter-rate-from').text().trim();

          // Lấy tên đơn vị từ URL, ví dụ "vnd-usd" → "USD"
          const unit = page.url.split('vnd-')[1]?.replace('/', '').toUpperCase() || '';

          // vndStr dạng "26,233 VND" → lấy số
          const rate = this._parsePrice(vndStr);

          scraped.push({
            country: page.contry,
            foreignCurrency: unit,
            rate,
          });
        } catch {
          console.error(`Scrape failed: ${page.contry}`);
        }
      }

      if (scraped.length === 0) return;

      // Xóa data cũ rồi insert mới — đơn giản hơn upsert
      const conn = await this.pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute(`DELETE FROM foreign_currency`);

        for (const item of scraped) {
          await conn.execute(
            `INSERT INTO foreign_currency (id, country, foreign_currency, rate, updated_at) VALUES (?, ?, ?, ?, ?)`,
            [uuidv4(), item.country, item.foreignCurrency, item.rate, dateTime]
          );
        } 

        await conn.commit();
        console.log(`[Market] Foreign currency updated: ${scraped.length} records`);
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }

    } catch (error:any) {
      await LogService.write({
        message: `scrapeAndSaveForeignCurrency failed: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'market.scrape.foreign_currency.error',
        metaData: {
          error: error.message,
          stack: error.stack,
          // third-party timeout sẽ hiện ở đây
        } as any,
      });
      console.error('[Market] scrapeAndSaveForeignCurrency error:', error);
    }
  }

  async scrapeAndSaveGoldPrice(): Promise<void> {
    const dateTime = new Date()
    
    try {
      const response = await fetch('https://www.24h.com.vn/gia-vang-hom-nay-c425.html');
      const html = await response.text();
      const $ = cheerio.load(html);

      const scraped: IGoldPriceRaw[] = [];

      $('table.gia-vang-search-data-table tbody tr').each((_, element) => {
        const type      = $(element).find('td').eq(0).find('h2').text().trim();
        const buyPrice  = this._parsePrice($(element).find('td').eq(1).find('span.fixW').text().trim());
        const sellPrice = this._parsePrice($(element).find('td').eq(2).find('span.fixW').text().trim());

        if (type) scraped.push({ type, buyPrice, sellPrice });
      });

      if (scraped.length === 0) return;

      const conn = await this.pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute(`DELETE FROM gold_price`);

        for (const item of scraped) {
          await conn.execute(
            `INSERT INTO gold_price (id, type, buy_price, sell_price, datetime) VALUES (?, ?, ?, ?, ? )`,
            [uuidv4(), item.type, item.buyPrice, item.sellPrice, dateTime]
          );
        }

        await conn.commit();
        console.log(`[Market] Gold price updated: ${scraped.length} records`);
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }

    } catch (error:any) {
      await LogService.write({
        message: `scrapeAndSaveGoldPrice failed: ${error.message}`,
        actor_type: 'system', type: 'error', status: 'failure',
        actionDetail: 'market.scrape.gold_price.error',
        metaData: { error: error.message, stack: error.stack } as any,
      });
      console.error('[Market] scrapeAndSaveGoldPrice error:', error);
    }
  }

  async getMarketData(): Promise<IMarketDataResponse> {
    const [[foreignRows], [goldRows]]: any = await Promise.all([
      this.pool.execute(`SELECT * FROM foreign_currency ORDER BY country ASC`),
      this.pool.execute(`SELECT * FROM gold_price ORDER BY type ASC`),
    ]);

    const updatedAt = foreignRows[0]?.updated_at ?? new Date().toISOString();

    return {
      foreignCurrencies: foreignRows.map((r: any) => ({
        id:              r.id,
        country:         r.country,
        foreignCurrency: r.foreign_currency,
        rate:            Number(r.rate),
        updatedAt:       r.updated_at,
      })),
      goldPrices: goldRows.map((r: any) => ({
        id:        r.id,
        type:      r.type,
        buyPrice:  Number(r.buy_price),
        sellPrice: Number(r.sell_price),
        datetime:  r.datetime,
      })),
      updatedAt,
    };
  }
}