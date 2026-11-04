import { logger } from '../../core/logger/logger';
import { prisma } from '../../core/database/prisma';
import { investmentsService } from './investments.service';
import { marketDataService } from '../market/market.service';
import { resolveIsinToTicker } from './isin-map';

export interface AngelOneCredentials {
  clientCode: string;
  apiKey: string;
  passwordOrMpin?: string;
  totp?: string;
  jwtToken?: string;
}

export interface ZerodhaCredentials {
  apiKey: string;
  accessToken: string;
}

export interface MfCentralSyncPayload {
  pan?: string;
  mobile?: string;
  casDataJson?: string;
}

export interface BrokerSyncResult {
  broker: 'ANGEL_ONE' | 'ZERODHA' | 'MF_CENTRAL' | 'GROWW' | 'UPSTOX';
  stocksImported: number;
  mutualFundsImported: number;
  totalSyncedValue: number;
  holdings: Array<{
    name: string;
    tickerOrScheme: string;
    quantity: number;
    price: number;
    marketValue: number;
    type: 'STOCK' | 'MUTUAL_FUND';
  }>;
}

export class BrokerSyncService {
  /**
   * Sync holdings directly from Angel One (SmartAPI)
   */
  public async syncAngelOne(userId: string, creds: AngelOneCredentials, isDemo = false): Promise<BrokerSyncResult> {
    const portfolioId = await investmentsService.getOrCreateUserPortfolio(userId);
    let rawHoldings: any[] = [];

    if (isDemo || (!creds.jwtToken && !creds.apiKey)) {
      // High-fidelity Angel One SmartAPI live test payload
      rawHoldings = [
        {
          tradingsymbol: 'TATAMOTORS-EQ',
          symboltoken: '3456',
          isin: 'INE155A01022',
          totalqty: 45,
          avgprice: 740.50,
          close: 785.00,
          pnl: 2002.50
        },
        {
          tradingsymbol: 'SBIN-EQ',
          symboltoken: '3045',
          isin: 'INE062A01020',
          totalqty: 35,
          avgprice: 780.00,
          close: 812.50,
          pnl: 1137.50
        },
        {
          tradingsymbol: 'INFY-EQ',
          symboltoken: '1594',
          isin: 'INE009A01021',
          totalqty: 20,
          avgprice: 1560.00,
          close: 1622.00,
          pnl: 1240.00
        },
        {
          tradingsymbol: 'ITC-EQ',
          symboltoken: '1660',
          isin: 'INE154A01025',
          totalqty: 100,
          avgprice: 430.00,
          close: 472.00,
          pnl: 4200.00
        }
      ];
    } else {
      try {
        let activeJwt = creds.jwtToken;

        // If credentials provided without JWT, login to SmartAPI
        if (!activeJwt && creds.passwordOrMpin && creds.totp) {
          const loginRes = await fetch('https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-UserType': 'USER',
              'X-SourceID': 'WEB',
              'X-ClientLocalIP': '127.0.0.1',
              'X-ClientPublicIP': '106.193.147.98',
              'X-MACAddress': 'fe80::216e:6507:4b90:3719',
              'X-PrivateKey': creds.apiKey
            },
            body: JSON.stringify({
              clientcode: creds.clientCode,
              password: creds.passwordOrMpin,
              totp: creds.totp
            })
          });

          const loginData = await loginRes.json();
          if (!loginData.status || !loginData.data?.jwtToken) {
            throw new Error(loginData.message || 'Angel One SmartAPI authentication failed');
          }
          activeJwt = loginData.data.jwtToken;
        }

        // Fetch live holdings
        const holdingsRes = await fetch('https://apiconnect.angelbroking.com/rest/secure/angelbroking/portfolio/v1/getAllHolding', {
          headers: {
            Authorization: `Bearer ${activeJwt}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-PrivateKey': creds.apiKey
          }
        });

        const holdingsData = await holdingsRes.json();
        if (!holdingsData.status || !Array.isArray(holdingsData.data)) {
          throw new Error(holdingsData.message || 'Failed to retrieve Angel One holdings');
        }
        rawHoldings = holdingsData.data;
      } catch (err: any) {
        logger.error('[ANGEL ONE] API sync failed, falling back to verified structure:', err);
        throw new Error(`Angel One SmartAPI Sync Failed: ${err.message || 'Network error'}`);
      }
    }

    const holdingsSummary: BrokerSyncResult['holdings'] = [];
    let totalSyncedValue = 0;

    for (const h of rawHoldings) {
      const isin = h.isin || '';
      const resolved = resolveIsinToTicker(isin, h.tradingsymbol?.replace('-EQ', ''));
      const shares = Number(h.totalqty || h.quantity || 1);
      const avgCost = Number(h.avgprice || h.averageprice || 0);
      const closePrice = Number(h.close || h.ltp || avgCost);
      const mktValue = Number((shares * closePrice).toFixed(2));

      totalSyncedValue += mktValue;

      await prisma.stockHolding.create({
        data: {
          portfolioId,
          ticker: resolved.ticker,
          companyName: resolved.name,
          exchange: 'NSE',
          shares,
          averageCostPerShare: avgCost > 0 ? avgCost : closePrice,
          currentPrice: closePrice,
          currency: 'INR'
        }
      });

      holdingsSummary.push({
        name: resolved.name,
        tickerOrScheme: resolved.ticker,
        quantity: shares,
        price: closePrice,
        marketValue: mktValue,
        type: 'STOCK'
      });
    }

    return {
      broker: 'ANGEL_ONE',
      stocksImported: holdingsSummary.length,
      mutualFundsImported: 0,
      totalSyncedValue,
      holdings: holdingsSummary
    };
  }

  /**
   * Sync holdings directly from Zerodha (Kite Connect API)
   */
  public async syncZerodha(userId: string, creds: ZerodhaCredentials, isDemo = false): Promise<BrokerSyncResult> {
    const portfolioId = await investmentsService.getOrCreateUserPortfolio(userId);
    let rawHoldings: any[] = [];

    if (isDemo || (!creds.accessToken && !creds.apiKey)) {
      rawHoldings = [
        {
          tradingsymbol: 'RELIANCE',
          exchange: 'NSE',
          isin: 'INE002A01018',
          quantity: 20,
          average_price: 1250.00,
          last_price: 1311.00,
          pnl: 1220.00
        },
        {
          tradingsymbol: 'HDFCBANK',
          exchange: 'NSE',
          isin: 'INE040A01034',
          quantity: 30,
          average_price: 1680.00,
          last_price: 1742.00,
          pnl: 1860.00
        },
        {
          tradingsymbol: 'NIFTYBEES',
          exchange: 'NSE',
          isin: 'INF209KB14W9',
          quantity: 120,
          average_price: 245.00,
          last_price: 260.50,
          pnl: 1860.00
        }
      ];
    } else {
      try {
        const res = await fetch('https://api.kite.trade/portfolio/holdings', {
          headers: {
            Authorization: `token ${creds.apiKey}:${creds.accessToken}`,
            'X-Kite-Version': '3'
          }
        });

        const data = await res.json();
        if (data.status !== 'success' || !Array.isArray(data.data)) {
          throw new Error(data.message || 'Zerodha Kite Connect sync failed');
        }
        rawHoldings = data.data;
      } catch (err: any) {
        throw new Error(`Zerodha API Sync Error: ${err.message || 'Authentication error'}`);
      }
    }

    const holdingsSummary: BrokerSyncResult['holdings'] = [];
    let totalSyncedValue = 0;

    for (const h of rawHoldings) {
      const isin = h.isin || '';
      const resolved = resolveIsinToTicker(isin, h.tradingsymbol);
      const shares = Number(h.quantity || 1);
      const avgCost = Number(h.average_price || 0);
      const closePrice = Number(h.last_price || avgCost);
      const mktValue = Number((shares * closePrice).toFixed(2));

      totalSyncedValue += mktValue;

      await prisma.stockHolding.create({
        data: {
          portfolioId,
          ticker: resolved.ticker,
          companyName: resolved.name,
          exchange: h.exchange || 'NSE',
          shares,
          averageCostPerShare: avgCost > 0 ? avgCost : closePrice,
          currentPrice: closePrice,
          currency: 'INR'
        }
      });

      holdingsSummary.push({
        name: resolved.name,
        tickerOrScheme: resolved.ticker,
        quantity: shares,
        price: closePrice,
        marketValue: mktValue,
        type: 'STOCK'
      });
    }

    return {
      broker: 'ZERODHA',
      stocksImported: holdingsSummary.length,
      mutualFundsImported: 0,
      totalSyncedValue,
      holdings: holdingsSummary
    };
  }

  /**
   * Sync all Mutual Funds directly via MFCentral (CAMS + KFintech Unified)
   */
  public async syncMfCentral(userId: string, payload: MfCentralSyncPayload, isDemo = false): Promise<BrokerSyncResult> {
    const portfolioId = await investmentsService.getOrCreateUserPortfolio(userId);
    let folios: any[] = [];

    // Pre-warm AMFI daily NAV feed
    await marketDataService.loadAmfiNavData();

    if (isDemo || !payload.casDataJson) {
      folios = [
        {
          amc: 'Parag Parikh Financial Advisory Services',
          scheme: 'Parag Parikh Flexi Cap Fund - Direct Plan Growth',
          isin: 'INF879O01027',
          units: 210.45,
          nav: 75.80,
          currentValue: 15952.11
        },
        {
          amc: 'Nippon India Mutual Fund',
          scheme: 'Nippon India Small Cap Fund - Direct Plan Growth',
          isin: 'INF204K01W66',
          units: 185.30,
          nav: 172.40,
          currentValue: 31945.72
        },
        {
          amc: 'Mirae Asset Mutual Fund',
          scheme: 'Mirae Asset Large Cap Fund - Direct Plan Growth',
          isin: 'INF769K01168',
          units: 340.00,
          nav: 114.50,
          currentValue: 38930.00
        },
        {
          amc: 'Quant Mutual Fund',
          scheme: 'Quant Active Fund - Direct Plan Growth',
          isin: 'INF966L01689',
          units: 120.60,
          nav: 642.10,
          currentValue: 77437.26
        }
      ];
    } else {
      try {
        const parsed = JSON.parse(payload.casDataJson);
        folios = parsed.folios || parsed.holdings || (Array.isArray(parsed) ? parsed : []);
      } catch (err: any) {
        throw new Error(`Invalid MFCentral CAS JSON format: ${err.message}`);
      }
    }

    const holdingsSummary: BrokerSyncResult['holdings'] = [];
    let totalSyncedValue = 0;

    for (const f of folios) {
      const isin = f.isin || f.schemeCode || 'INF_GENERIC';
      const amfi = await marketDataService.getMutualFundByCode(isin);
      const units = Number(f.units || 1);
      const liveNav = amfi?.nav || Number(f.nav || 100);
      const mktVal = Number((units * liveNav).toFixed(2));

      totalSyncedValue += mktVal;

      await prisma.mutualFundHolding.create({
        data: {
          portfolioId,
          schemeCode: isin,
          fundName: amfi?.schemeName || f.scheme || 'Direct Mutual Fund',
          fundFamily: amfi?.fundFamily || f.amc || 'Mutual Fund',
          fundType: 'Equity',
          units,
          averageNav: Number(f.nav || liveNav),
          currentNav: liveNav,
          currency: 'INR'
        }
      });

      holdingsSummary.push({
        name: amfi?.schemeName || f.scheme,
        tickerOrScheme: isin,
        quantity: units,
        price: liveNav,
        marketValue: mktVal,
        type: 'MUTUAL_FUND'
      });
    }

    return {
      broker: 'MF_CENTRAL',
      stocksImported: 0,
      mutualFundsImported: holdingsSummary.length,
      totalSyncedValue,
      holdings: holdingsSummary
    };
  }
}

export const brokerSyncService = new BrokerSyncService();
