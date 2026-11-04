import { prisma } from '../../core/database/prisma';
import { logger } from '../../core/logger/logger';
import { marketDataService } from '../market/market.service';
import {
  InvestmentPortfolio,
  StockHolding,
  MutualFundHolding,
  ETFHolding,
  BondHolding,
  CryptoHolding,
  PreciousMetalHolding
} from '@finance/types';

export interface AddStockPayload {
  ticker: string;
  companyName: string;
  exchange: string;
  shares: number;
  averageCostPerShare: number;
  currency?: string;
}

export interface AddMutualFundPayload {
  schemeCode: string;
  fundName: string;
  fundFamily?: string;
  fundType?: string;
  units: number;
  averageNav: number;
  currency?: string;
}

export interface AddCryptoPayload {
  symbol: string;
  coinName: string;
  quantity: number;
  averageCostPerCoin: number;
  currency?: string;
  isColdStorage?: boolean;
}

export interface AddMetalPayload {
  metalType: 'GOLD' | 'SILVER' | 'PLATINUM' | 'PALLADIUM';
  weight: number;
  weightUnit: 'GRAM' | 'OUNCE' | 'TROY_OUNCE' | 'KILOGRAM';
  purchaseCostPerUnit: number;
  currency?: string;
}

export class InvestmentsService {
  /**
   * Ensure user has a default investment portfolio in Neon PostgreSQL
   */
  public async getOrCreateUserPortfolio(userId: string): Promise<string> {
    try {
      const existing = await prisma.portfolio.findFirst({
        where: { userId }
      });
      if (existing) return existing.id;

      const created = await prisma.portfolio.create({
        data: {
          userId,
          name: 'Primary Wealth & Investment Portfolio',
          description: 'Live multi-asset wealth tracker',
          currency: 'INR'
        }
      });
      return created.id;
    } catch (err) {
      logger.warn('[INVESTMENTS] DB error creating portfolio, using default fallback ID:', err);
      return 'default_portfolio_' + userId;
    }
  }

  /**
   * Get all live stock holdings with real-time Yahoo Finance CMP
   */
  public async getStocks(userId: string): Promise<StockHolding[]> {
    try {
      const portfolioId = await this.getOrCreateUserPortfolio(userId);
      const holdings = await prisma.stockHolding.findMany({
        where: { portfolioId }
      });

      if (holdings.length === 0) return [];

      const symbols = holdings.map((h) => h.ticker);
      const quotes = await marketDataService.getStockQuotes(symbols);

      return holdings.map((h) => {
        const quote = quotes[h.ticker.toUpperCase()];
        const shares = Number(h.shares);
        const avgCost = Number(h.averageCostPerShare);
        const livePrice = quote ? quote.price : Number(h.currentPrice);
        const marketValue = Number((shares * livePrice).toFixed(2));
        const totalCost = Number((shares * avgCost).toFixed(2));
        const gainLoss = Number((marketValue - totalCost).toFixed(2));
        const gainLossPct = totalCost > 0 ? Number(((gainLoss / totalCost) * 100).toFixed(2)) : 0;

        return {
          id: h.id,
          portfolioId: h.portfolioId,
          ticker: h.ticker,
          companyName: quote?.name || h.companyName,
          exchange: h.exchange,
          shares,
          averageCostPerShare: avgCost,
          currentPrice: livePrice,
          marketValue,
          currency: (h.currency as any),
          unrealizedGainLoss: gainLoss,
          unrealizedGainLossPercentage: gainLossPct,
          dayChange: quote?.change,
          dayChangePercent: quote?.changePercent,
          createdAt: h.createdAt.toISOString(),
          updatedAt: h.updatedAt.toISOString()
        };
      });
    } catch (err) {
      logger.warn('[INVESTMENTS] Error getting stocks from Neon DB:', err);
      return [];
    }
  }

  /**
   * Get all live mutual funds with real-time AMFI NAV
   */
  public async getMutualFunds(userId: string): Promise<MutualFundHolding[]> {
    try {
      const portfolioId = await this.getOrCreateUserPortfolio(userId);
      const holdings = await prisma.mutualFundHolding.findMany({
        where: { portfolioId }
      });

      if (holdings.length === 0) return [];

      // Pre-warm AMFI data
      await marketDataService.loadAmfiNavData();

      return await Promise.all(
        holdings.map(async (h) => {
          const amfiRecord = await marketDataService.getMutualFundByCode(h.schemeCode);
          const units = Number(h.units);
          const avgNav = Number(h.averageNav);
          const liveNav = amfiRecord ? amfiRecord.nav : Number(h.currentNav);
          const marketValue = Number((units * liveNav).toFixed(2));
          const totalCost = Number((units * avgNav).toFixed(2));
          const gainLoss = Number((marketValue - totalCost).toFixed(2));
          const gainLossPct = totalCost > 0 ? Number(((gainLoss / totalCost) * 100).toFixed(2)) : 0;

          return {
            id: h.id,
            portfolioId: h.portfolioId,
            schemeCode: h.schemeCode,
            fundName: amfiRecord?.schemeName || h.fundName,
            fundFamily: amfiRecord?.fundFamily || h.fundFamily,
            fundType: (h.fundType as any || 'INDEX'),
            units,
            averageNav: avgNav,
            currentNav: liveNav,
            marketValue,
            currency: (h.currency as any),
            unrealizedGainLoss: gainLoss,
            unrealizedGainLossPercentage: gainLossPct,
            navDate: amfiRecord?.date,
            createdAt: h.createdAt.toISOString(),
            updatedAt: h.updatedAt.toISOString()
          };
        })
      );
    } catch (err) {
      logger.warn('[INVESTMENTS] Error getting mutual funds from Neon DB:', err);
      return [];
    }
  }

  /**
   * Get all live crypto holdings with real-time CoinGecko rates
   */
  public async getCrypto(userId: string): Promise<CryptoHolding[]> {
    try {
      const portfolioId = await this.getOrCreateUserPortfolio(userId);
      const holdings = await prisma.cryptoHolding.findMany({
        where: { portfolioId }
      });

      if (holdings.length === 0) return [];

      const rates = await marketDataService.getCryptoRates();
      const rateMap = new Map(rates.map((r) => [r.symbol.toUpperCase(), r]));

      return holdings.map((h) => {
        const rate = rateMap.get(h.symbol.toUpperCase());
        const quantity = Number(h.quantity);
        const avgCost = Number(h.averageCostPerCoin);
        const livePrice = rate ? rate.priceInr : Number(h.currentPrice);
        const marketValue = Number((quantity * livePrice).toFixed(2));
        const totalCost = Number((quantity * avgCost).toFixed(2));
        const gainLoss = Number((marketValue - totalCost).toFixed(2));
        const gainLossPct = totalCost > 0 ? Number(((gainLoss / totalCost) * 100).toFixed(2)) : 0;

        return {
          id: h.id,
          portfolioId: h.portfolioId,
          symbol: h.symbol,
          coinName: rate?.name || h.coinName,
          quantity,
          averageCostPerCoin: avgCost,
          currentPrice: livePrice,
          marketValue,
          currency: 'INR',
          isColdStorage: h.isColdStorage,
          unrealizedGainLoss: gainLoss,
          unrealizedGainLossPercentage: gainLossPct,
          dayChangePercent: rate?.change24h,
          createdAt: h.createdAt.toISOString(),
          updatedAt: h.updatedAt.toISOString()
        };
      });
    } catch (err) {
      logger.warn('[INVESTMENTS] Error getting crypto from Neon DB:', err);
      return [];
    }
  }

  /**
   * Get precious metal holdings with real-time gold/silver spot rates
   */
  public async getPreciousMetals(userId: string): Promise<PreciousMetalHolding[]> {
    try {
      const portfolioId = await this.getOrCreateUserPortfolio(userId);
      const holdings = await prisma.preciousMetalHolding.findMany({
        where: { portfolioId }
      });

      if (holdings.length === 0) return [];

      const rates = await marketDataService.getPreciousMetalRates();

      return holdings.map((h) => {
        const weight = Number(h.weight);
        const totalPurchaseCost = Number(h.totalPurchaseCost);
        let liveSpotPerGram = rates.gold24kPerGram;
        if (h.metalType === 'SILVER') liveSpotPerGram = rates.silverPerGram;

        const marketValue = Number((weight * liveSpotPerGram).toFixed(2));
        const gainLoss = Number((marketValue - totalPurchaseCost).toFixed(2));
        const gainLossPct = totalPurchaseCost > 0 ? Number(((gainLoss / totalPurchaseCost) * 100).toFixed(2)) : 0;

        return {
          id: h.id,
          portfolioId: h.portfolioId,
          metalType: h.metalType as any,
          storageType: h.storageType as any,
          weight,
          weightUnit: h.weightUnit as any,
          purity: Number(h.purity),
          totalPurchaseCost,
          currentSpotPricePerUnit: liveSpotPerGram,
          currentValue: marketValue,
          currency: 'INR',
          unrealizedGainLoss: gainLoss,
          unrealizedGainLossPercentage: gainLossPct,
          createdAt: h.createdAt.toISOString(),
          updatedAt: h.updatedAt.toISOString()
        };
      });
    } catch (err) {
      logger.warn('[INVESTMENTS] Error getting precious metals from Neon DB:', err);
      return [];
    }
  }

  /**
   * Get full consolidated portfolio summary with real-time valuations
   */
  public async getConsolidatedPortfolio(userId: string): Promise<InvestmentPortfolio> {
    const portfolioId = await this.getOrCreateUserPortfolio(userId);

    const [stocks, mutualFunds, cryptos, metals] = await Promise.all([
      this.getStocks(userId),
      this.getMutualFunds(userId),
      this.getCrypto(userId),
      this.getPreciousMetals(userId)
    ]);

    let totalCostBasis = 0;
    let currentValue = 0;

    stocks.forEach((s) => {
      totalCostBasis += (s.averageCostPerShare || 0) * (s.shares || 0);
      currentValue += s.marketValue || 0;
    });

    mutualFunds.forEach((mf) => {
      totalCostBasis += (mf.averageNav || 0) * (mf.units || 0);
      currentValue += mf.marketValue || 0;
    });

    cryptos.forEach((c) => {
      totalCostBasis += (c.averageCostPerCoin || 0) * (c.quantity || 0);
      currentValue += c.marketValue || 0;
    });

    metals.forEach((m) => {
      totalCostBasis += m.totalPurchaseCost || 0;
      currentValue += m.currentValue || 0;
    });

    const unrealizedGainLoss = Number((currentValue - totalCostBasis).toFixed(2));
    const unrealizedGainLossPercentage =
      totalCostBasis > 0 ? Number(((unrealizedGainLoss / totalCostBasis) * 100).toFixed(2)) : 0;
    const holdingsCount = stocks.length + mutualFunds.length + cryptos.length + metals.length;

    return {
      id: portfolioId,
      userId,
      name: 'Primary Wealth & Investment Portfolio',
      description: 'Real-time multi-asset holdings across Equities, Mutual Funds, Gold & Crypto',
      currency: 'INR',
      totalCostBasis: Number(totalCostBasis.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      unrealizedGainLoss,
      unrealizedGainLossPercentage,
      realizedGainLoss: 0,
      holdingsCount,
      stocks,
      mutualFunds,
      cryptos,
      preciousMetals: metals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Add a real stock holding to Neon DB
   */
  public async addStock(userId: string, data: AddStockPayload): Promise<StockHolding> {
    const portfolioId = await this.getOrCreateUserPortfolio(userId);
    const quote = await marketDataService.getStockQuote(data.ticker);
    const currentPrice = quote ? quote.price : data.averageCostPerShare;

    const created = await prisma.stockHolding.create({
      data: {
        portfolioId,
        ticker: data.ticker.toUpperCase().trim(),
        companyName: quote?.name || data.companyName,
        exchange: data.exchange || (data.ticker.includes('.NS') ? 'NSE' : data.ticker.includes('.BO') ? 'BSE' : 'NASDAQ'),
        shares: data.shares,
        averageCostPerShare: data.averageCostPerShare,
        currentPrice,
        currency: data.currency || (data.ticker.includes('.NS') || data.ticker.includes('.BO') ? 'INR' : 'USD')
      }
    });

    const shares = Number(created.shares);
    const cost = Number(created.averageCostPerShare);
    const price = Number(created.currentPrice);
    const marketValue = Number((shares * price).toFixed(2));
    const totalCost = Number((shares * cost).toFixed(2));
    const gainLoss = Number((marketValue - totalCost).toFixed(2));

    return {
      id: created.id,
      portfolioId: created.portfolioId,
      ticker: created.ticker,
      companyName: created.companyName,
      exchange: created.exchange,
      shares,
      averageCostPerShare: cost,
      currentPrice: price,
      marketValue,
      currency: (created.currency as any),
      unrealizedGainLoss: gainLoss,
      unrealizedGainLossPercentage: totalCost > 0 ? Number(((gainLoss / totalCost) * 100).toFixed(2)) : 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString()
    };
  }

  /**
   * Add a real mutual fund holding to Neon DB
   */
  public async addMutualFund(userId: string, data: AddMutualFundPayload): Promise<MutualFundHolding> {
    const portfolioId = await this.getOrCreateUserPortfolio(userId);
    const amfi = await marketDataService.getMutualFundByCode(data.schemeCode);
    const currentNav = amfi ? amfi.nav : data.averageNav;

    const created = await prisma.mutualFundHolding.create({
      data: {
        portfolioId,
        schemeCode: data.schemeCode,
        fundName: amfi?.schemeName || data.fundName,
        fundFamily: amfi?.fundFamily || data.fundFamily || 'Mutual Fund',
        fundType: data.fundType || 'Equity',
        units: data.units,
        averageNav: data.averageNav,
        currentNav,
        currency: data.currency || 'INR'
      }
    });

    const units = Number(created.units);
    const cost = Number(created.averageNav);
    const price = Number(created.currentNav);
    const marketValue = Number((units * price).toFixed(2));
    const totalCost = Number((units * cost).toFixed(2));
    const gainLoss = Number((marketValue - totalCost).toFixed(2));

    return {
      id: created.id,
      portfolioId: created.portfolioId,
      schemeCode: created.schemeCode,
      fundName: created.fundName,
      fundFamily: created.fundFamily,
      fundType: (created.fundType as any || 'INDEX'),
      units,
      averageNav: cost,
      currentNav: price,
      marketValue,
      currency: (created.currency as any),
      unrealizedGainLoss: gainLoss,
      unrealizedGainLossPercentage: totalCost > 0 ? Number(((gainLoss / totalCost) * 100).toFixed(2)) : 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString()
    };
  }

  /**
   * Add a real crypto holding to Neon DB
   */
  public async addCrypto(userId: string, data: AddCryptoPayload): Promise<CryptoHolding> {
    const portfolioId = await this.getOrCreateUserPortfolio(userId);
    const rates = await marketDataService.getCryptoRates();
    const rate = rates.find((r) => r.symbol.toUpperCase() === data.symbol.toUpperCase());
    const currentPrice = rate ? rate.priceInr : data.averageCostPerCoin;

    const created = await prisma.cryptoHolding.create({
      data: {
        portfolioId,
        symbol: data.symbol.toUpperCase().trim(),
        coinName: rate?.name || data.coinName,
        quantity: data.quantity,
        averageCostPerCoin: data.averageCostPerCoin,
        currentPrice,
        currency: data.currency || 'INR',
        isColdStorage: data.isColdStorage || false
      }
    });

    const qty = Number(created.quantity);
    const cost = Number(created.averageCostPerCoin);
    const price = Number(created.currentPrice);
    const marketValue = Number((qty * price).toFixed(2));
    const totalCost = Number((qty * cost).toFixed(2));
    const gainLoss = Number((marketValue - totalCost).toFixed(2));

    return {
      id: created.id,
      portfolioId: created.portfolioId,
      symbol: created.symbol,
      coinName: created.coinName,
      quantity: qty,
      averageCostPerCoin: cost,
      currentPrice: price,
      marketValue,
      currency: (created.currency as any),
      isColdStorage: created.isColdStorage,
      unrealizedGainLoss: gainLoss,
      unrealizedGainLossPercentage: totalCost > 0 ? Number(((gainLoss / totalCost) * 100).toFixed(2)) : 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString()
    };
  }

  /**
   * Add a real gold or silver holding to Neon DB
   */
  public async addPreciousMetal(userId: string, data: AddMetalPayload): Promise<PreciousMetalHolding> {
    const portfolioId = await this.getOrCreateUserPortfolio(userId);
    const rates = await marketDataService.getPreciousMetalRates();
    let spotRate = rates.gold24kPerGram;
    if (data.metalType === 'SILVER') spotRate = rates.silverPerGram;

    const totalPurchaseCost = data.weight * data.purchaseCostPerUnit;

    const created = await prisma.preciousMetalHolding.create({
      data: {
        portfolioId,
        metalType: data.metalType,
        storageType: 'PHYSICAL_HOME',
        weight: data.weight,
        weightUnit: data.weightUnit,
        purity: data.metalType === 'GOLD' ? 0.9999 : 0.999,
        totalPurchaseCost,
        currentSpotPricePerUnit: spotRate,
        currency: data.currency || 'INR'
      }
    });

    const weight = Number(created.weight);
    const marketValue = Number((weight * spotRate).toFixed(2));
    const gainLoss = Number((marketValue - totalPurchaseCost).toFixed(2));

    return {
      id: created.id,
      portfolioId: created.portfolioId,
      metalType: created.metalType as any,
      storageType: created.storageType as any,
      weight,
      weightUnit: created.weightUnit as any,
      purity: Number(created.purity),
      totalPurchaseCost,
      currentSpotPricePerUnit: spotRate,
      currentValue: marketValue,
      currency: (created.currency as any),
      unrealizedGainLoss: gainLoss,
      unrealizedGainLossPercentage: totalPurchaseCost > 0 ? Number(((gainLoss / totalPurchaseCost) * 100).toFixed(2)) : 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString()
    };
  }

  /**
   * Delete a holding from Neon DB
   */
  public async deleteHolding(
    userId: string,
    type: 'stock' | 'mutual-fund' | 'crypto' | 'metal',
    id: string
  ): Promise<boolean> {
    const portfolioId = await this.getOrCreateUserPortfolio(userId);
    try {
      if (type === 'stock') {
        await prisma.stockHolding.deleteMany({ where: { id, portfolioId } });
      } else if (type === 'mutual-fund') {
        await prisma.mutualFundHolding.deleteMany({ where: { id, portfolioId } });
      } else if (type === 'crypto') {
        await prisma.cryptoHolding.deleteMany({ where: { id, portfolioId } });
      } else if (type === 'metal') {
        await prisma.preciousMetalHolding.deleteMany({ where: { id, portfolioId } });
      }
      return true;
    } catch (err) {
      logger.warn('[INVESTMENTS] Delete holding error:', err);
      return false;
    }
  }

  // Backwards compatibility methods
  public async getPortfolios(): Promise<InvestmentPortfolio[]> {
    return [];
  }
  public async getETFs(): Promise<ETFHolding[]> {
    return [];
  }
  public async getBonds(): Promise<BondHolding[]> {
    return [];
  }
}

export const investmentsService = new InvestmentsService();
