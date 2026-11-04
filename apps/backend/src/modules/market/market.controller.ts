import { Request, Response, NextFunction } from 'express';
import { marketDataService } from './market.service';
import { ApiResponse } from '@finance/types';

export class MarketController {
  public async getMarketIndices(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await marketDataService.getMarketIndices();
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async searchMutualFunds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = String(req.query.query || req.query.q || '');
      const limit = Number(req.query.limit || 20);
      const data = await marketDataService.searchMutualFunds(query, limit);
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getMutualFundByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = String(req.params.code || '');
      const data = await marketDataService.getMutualFundByCode(code);
      if (!data) {
        res.status(404).json({ success: false, message: 'Mutual Fund not found in AMFI database' });
        return;
      }
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async searchStocks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = String(req.query.query || req.query.q || '');
      const data = await marketDataService.searchStocks(query);
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getStockQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const symbol = String(req.params.symbol || req.query.symbol || '');
      const data = await marketDataService.getStockQuote(symbol);
      if (!data) {
        res.status(404).json({ success: false, message: `Quote for ${symbol} not found` });
        return;
      }
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getPreciousMetals(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await marketDataService.getPreciousMetalRates();
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getCryptoRates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await marketDataService.getCryptoRates();
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const marketController = new MarketController();
