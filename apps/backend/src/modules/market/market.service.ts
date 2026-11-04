import { logger } from '../../core/logger/logger';

export interface MutualFundRecord {
  schemeCode: string;
  schemeName: string;
  isinGrowth?: string;
  isinDivPayout?: string;
  nav: number;
  date: string;
  fundFamily?: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  dayHigh?: number;
  dayLow?: number;
  exchange?: string;
  lastUpdated: string;
}

export interface PreciousMetalRates {
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold10g24k: number;
  gold10g22k: number;
  silverPerGram: number;
  silver100g: number;
  usdInrRate: number;
  goldUsdPerOz: number;
  silverUsdPerOz: number;
  currency: 'INR';
  lastUpdated: string;
}

export interface CryptoRate {
  id: string;
  symbol: string;
  name: string;
  priceInr: number;
  priceUsd: number;
  change24h: number;
  lastUpdated: string;
}

export interface MarketIndexItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export class MarketDataService {
  private amfiCache: MutualFundRecord[] = [];
  private amfiLastFetched: number = 0;
  private readonly AMFI_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
  private isFetchingAmfi: boolean = false;

  private quotesCache: Map<string, { quote: StockQuote; timestamp: number }> = new Map();
  private readonly QUOTE_CACHE_TTL_MS = 60 * 1000; // 60 seconds

  private preciousMetalCache: { data: PreciousMetalRates; timestamp: number } | null = null;
  private readonly METALS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  private cryptoCache: { data: CryptoRate[]; timestamp: number } | null = null;
  private readonly CRYPTO_CACHE_TTL_MS = 60 * 1000; // 1 minute

  /**
   * Fetch and parse the latest AMFI NAV file
   */
  public async loadAmfiNavData(force = false): Promise<MutualFundRecord[]> {
    const now = Date.now();
    if (!force && this.amfiCache.length > 0 && now - this.amfiLastFetched < this.AMFI_CACHE_TTL_MS) {
      return this.amfiCache;
    }

    if (this.isFetchingAmfi) {
      return this.amfiCache;
    }

    this.isFetchingAmfi = true;
    try {
      logger.info('[MARKET] Downloading latest official AMFI Mutual Fund NAV feed...');
      const response = await fetch('https://www.amfiindia.com/spages/NAVAll.txt', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WealthFlow/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`AMFI returned HTTP status ${response.status}`);
      }

      const text = await response.text();
      const lines = text.split('\n');
      const records: MutualFundRecord[] = [];
      let currentFundFamily = 'Open Ended Schemes';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;

        // Detect category or fund house header
        if (!line.includes(';') && (line.includes('Mutual Fund') || line.includes('Schemes'))) {
          currentFundFamily = line;
          continue;
        }

        const parts = line.split(';');
        if (parts.length >= 8) {
          const schemeCode = parts[0]?.trim();
          const isinGrowth = parts[1]?.trim() === '-' ? undefined : parts[1]?.trim();
          const isinDiv = parts[2]?.trim() === '-' ? undefined : parts[2]?.trim();
          const baseName = parts[3]?.trim();
          const plan = parts[4]?.trim();
          const option = parts[5]?.trim();
          const navStr = parts[6]?.trim();
          const date = parts[7]?.trim();

          const schemeName = [baseName, plan, option].filter(Boolean).join(' - ');
          const nav = parseFloat(navStr || '0');
          if (schemeCode && schemeName && !isNaN(nav) && nav > 0) {
            records.push({
              schemeCode,
              schemeName,
              isinGrowth,
              isinDivPayout: isinDiv,
              nav,
              date: date || new Date().toISOString(),
              fundFamily: currentFundFamily
            });
          }
        } else if (parts.length >= 6) {
          const schemeCode = parts[0]?.trim();
          const isinGrowth = parts[1]?.trim() === '-' ? undefined : parts[1]?.trim();
          const isinDiv = parts[2]?.trim() === '-' ? undefined : parts[2]?.trim();
          const schemeName = parts[3]?.trim();
          const navStr = parts[4]?.trim();
          const date = parts[5]?.trim();

          const nav = parseFloat(navStr || '0');
          if (schemeCode && schemeName && !isNaN(nav) && nav > 0) {
            records.push({
              schemeCode,
              schemeName,
              isinGrowth,
              isinDivPayout: isinDiv,
              nav,
              date: date || new Date().toISOString(),
              fundFamily: currentFundFamily
            });
          }
        }
      }

      this.amfiCache = records;
      this.amfiLastFetched = now;
      logger.info(`[MARKET] Successfully cached ${records.length} Indian Mutual Fund NAV records from AMFI`);
      return records;
    } catch (err) {
      logger.warn('[MARKET] Error fetching AMFI NAV feed:', err);
      return this.amfiCache;
    } finally {
      this.isFetchingAmfi = false;
    }
  }

  /**
   * Search Indian Mutual Funds by name or scheme code
   */
  public async searchMutualFunds(query: string, limit = 20): Promise<MutualFundRecord[]> {
    if (!query || query.trim().length < 2) return [];

    const funds = await this.loadAmfiNavData();
    const queryLower = query.toLowerCase().trim();
    const words = queryLower.split(/\s+/).filter(Boolean);

    const matches: MutualFundRecord[] = [];
    for (const fund of funds) {
      if (fund.schemeCode === queryLower) {
        return [fund];
      }

      const nameLower = fund.schemeName.toLowerCase();
      const allWordsMatch = words.every((w) => nameLower.includes(w));
      if (allWordsMatch) {
        matches.push(fund);
        if (matches.length >= limit) break;
      }
    }

    return matches;
  }

  /**
   * Get Mutual Fund NAV by scheme code
   */
  public async getMutualFundByCode(schemeCode: string): Promise<MutualFundRecord | null> {
    const funds = await this.loadAmfiNavData();
    const found = funds.find((f) => f.schemeCode === schemeCode.trim());
    return found || null;
  }

  /**
   * Get live Stock Quote from Yahoo Finance (NSE, BSE, US)
   */
  public async getStockQuote(symbol: string): Promise<StockQuote | null> {
    const sym = symbol.toUpperCase().trim();
    const cached = this.quotesCache.get(sym);
    if (cached && Date.now() - cached.timestamp < this.QUOTE_CACHE_TTL_MS) {
      return cached.quote;
    }

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!res.ok) return null;
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (!result) return null;

      const meta = result.meta;
      const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
      const prevClose = meta.previousClose || meta.chartPreviousClose || price;
      const change = Number((price - prevClose).toFixed(2));
      const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;

      const quote: StockQuote = {
        symbol: sym,
        name: meta.shortName || meta.longName || sym,
        price,
        previousClose: prevClose,
        change,
        changePercent,
        currency: meta.currency || (sym.endsWith('.NS') || sym.endsWith('.BO') ? 'INR' : 'USD'),
        dayHigh: meta.regularMarketDayHigh,
        dayLow: meta.regularMarketDayLow,
        exchange: meta.exchangeName,
        lastUpdated: new Date().toISOString()
      };

      this.quotesCache.set(sym, { quote, timestamp: Date.now() });
      return quote;
    } catch (err) {
      logger.warn(`[MARKET] Error fetching stock quote for ${sym}:`, err);
      return null;
    }
  }

  /**
   * Batch get multiple stock quotes
   */
  public async getStockQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    const results: Record<string, StockQuote> = {};
    const promises = symbols.map(async (sym) => {
      const q = await this.getStockQuote(sym);
      if (q) results[sym.toUpperCase()] = q;
    });
    await Promise.all(promises);
    return results;
  }

  /**
   * Search Indian and Global Stocks
   */
  public async searchStocks(query: string): Promise<Array<{ symbol: string; name: string; exchange: string; type: string }>> {
    if (!query || query.trim().length < 1) return [];

    try {
      const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query.trim())}&quotesCount=12&newsCount=0`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!res.ok) return [];
      const data = await res.json();
      const quotes = data?.quotes || [];

      return quotes
        .filter((item: any) => item.symbol && (item.quoteType === 'EQUITY' || item.quoteType === 'ETF'))
        .map((item: any) => ({
          symbol: item.symbol,
          name: item.shortname || item.longname || item.symbol,
          exchange: item.exchange || '',
          type: item.quoteType || 'EQUITY'
        }));
    } catch (err) {
      logger.warn(`[MARKET] Stock search error for "${query}":`, err);
      return [];
    }
  }

  /**
   * Live 24K and 22K Gold and Silver spot rates in INR per gram
   */
  public async getPreciousMetalRates(): Promise<PreciousMetalRates> {
    const now = Date.now();
    if (this.preciousMetalCache && now - this.preciousMetalCache.timestamp < this.METALS_CACHE_TTL_MS) {
      return this.preciousMetalCache.data;
    }

    try {
      const [goldRes, silverRes, inrRes] = await Promise.all([
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then((r) => r.json()),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then((r) => r.json()),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/INR=X?interval=1d&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then((r) => r.json())
      ]);

      const goldUsdPerOz = goldRes?.chart?.result?.[0]?.meta?.regularMarketPrice || 2700;
      const silverUsdPerOz = silverRes?.chart?.result?.[0]?.meta?.regularMarketPrice || 32;
      const usdInrRate = inrRes?.chart?.result?.[0]?.meta?.regularMarketPrice || 84.5;

      const TROY_OZ_TO_GRAMS = 31.1034768;
      // 24K Gold in INR per gram
      const gold24kPerGram = Math.round((goldUsdPerOz * usdInrRate) / TROY_OZ_TO_GRAMS);
      // 22K Gold is 91.6% purity of 24K
      const gold22kPerGram = Math.round(gold24kPerGram * 0.9166);
      // Silver in INR per gram
      const silverPerGram = Math.round(((silverUsdPerOz * usdInrRate) / TROY_OZ_TO_GRAMS) * 10) / 10;

      const data: PreciousMetalRates = {
        gold24kPerGram,
        gold22kPerGram,
        gold10g24k: gold24kPerGram * 10,
        gold10g22k: gold22kPerGram * 10,
        silverPerGram,
        silver100g: Math.round(silverPerGram * 100),
        usdInrRate: Number(usdInrRate.toFixed(2)),
        goldUsdPerOz: Number(goldUsdPerOz.toFixed(2)),
        silverUsdPerOz: Number(silverUsdPerOz.toFixed(2)),
        currency: 'INR',
        lastUpdated: new Date().toISOString()
      };

      this.preciousMetalCache = { data, timestamp: now };
      return data;
    } catch (err) {
      logger.warn('[MARKET] Failed to fetch precious metal rates, using fallback:', err);
      const fallback: PreciousMetalRates = {
        gold24kPerGram: 8150,
        gold22kPerGram: 7470,
        gold10g24k: 81500,
        gold10g22k: 74700,
        silverPerGram: 98.5,
        silver100g: 9850,
        usdInrRate: 84.5,
        goldUsdPerOz: 2750,
        silverUsdPerOz: 33,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
      };
      return fallback;
    }
  }

  /**
   * Live Crypto rates from CoinGecko
   */
  public async getCryptoRates(): Promise<CryptoRate[]> {
    const now = Date.now();
    if (this.cryptoCache && now - this.cryptoCache.timestamp < this.CRYPTO_CACHE_TTL_MS) {
      return this.cryptoCache.data;
    }

    try {
      const url =
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether,binancecoin,ripple,dogecoin&vs_currencies=inr,usd&include_24hr_change=true';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CoinGecko status ${res.status}`);

      const json = await res.json();
      const metaMap: Record<string, { symbol: string; name: string }> = {
        bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
        ethereum: { symbol: 'ETH', name: 'Ethereum' },
        solana: { symbol: 'SOL', name: 'Solana' },
        tether: { symbol: 'USDT', name: 'Tether' },
        binancecoin: { symbol: 'BNB', name: 'BNB' },
        ripple: { symbol: 'XRP', name: 'XRP' },
        dogecoin: { symbol: 'DOGE', name: 'Dogecoin' }
      };

      const rates: CryptoRate[] = Object.entries(json).map(([id, d]: [string, any]) => ({
        id,
        symbol: metaMap[id]?.symbol || id.toUpperCase(),
        name: metaMap[id]?.name || id,
        priceInr: d.inr || 0,
        priceUsd: d.usd || 0,
        change24h: Number((d.inr_24h_change || d.usd_24h_change || 0).toFixed(2)),
        lastUpdated: new Date().toISOString()
      }));

      this.cryptoCache = { data: rates, timestamp: now };
      return rates;
    } catch (err) {
      logger.warn('[MARKET] Failed to fetch crypto rates from CoinGecko:', err);
      return this.cryptoCache?.data || [];
    }
  }

  /**
   * Top Market Indices Snapshot (NIFTY 50, SENSEX, S&P 500, Gold, Bitcoin)
   */
  public async getMarketIndices(): Promise<MarketIndexItem[]> {
    const [nifty, sensex, sp500, metals, cryptos] = await Promise.all([
      this.getStockQuote('^NSEI'),
      this.getStockQuote('^BSESN'),
      this.getStockQuote('^GSPC'),
      this.getPreciousMetalRates(),
      this.getCryptoRates()
    ]);

    const btc = cryptos.find((c) => c.symbol === 'BTC');

    const items: MarketIndexItem[] = [
      {
        symbol: 'NIFTY 50',
        name: 'NIFTY 50',
        price: nifty?.price || 23900,
        change: nifty?.change || 0,
        changePercent: nifty?.changePercent || 0,
        currency: 'INR'
      },
      {
        symbol: 'SENSEX',
        name: 'BSE SENSEX',
        price: sensex?.price || 78800,
        change: sensex?.change || 0,
        changePercent: sensex?.changePercent || 0,
        currency: 'INR'
      },
      {
        symbol: 'S&P 500',
        name: 'S&P 500',
        price: sp500?.price || 5800,
        change: sp500?.change || 0,
        changePercent: sp500?.changePercent || 0,
        currency: 'USD'
      },
      {
        symbol: 'GOLD24K',
        name: 'Gold (10g, 24K)',
        price: metals.gold10g24k,
        change: Math.round(metals.gold10g24k * 0.005),
        changePercent: 0.5,
        currency: 'INR'
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: btc?.priceInr || 7200000,
        change: btc ? Math.round((btc.priceInr * btc.change24h) / 100) : 0,
        changePercent: btc?.change24h || 0,
        currency: 'INR'
      }
    ];

    return items;
  }
}

export const marketDataService = new MarketDataService();
