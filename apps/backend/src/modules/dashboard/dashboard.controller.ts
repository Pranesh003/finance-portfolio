import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { TimeFilterPeriod, CurrencyCode, CashFlowGrouping, QuickAddPayload } from '@finance/types';
import { ApiResponse } from '@finance/types';

export class DashboardController {
  private getUserId(req: Request): string {
    return req.user?.id || 'demo-user-123';
  }

  public async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const period = (req.query.period as TimeFilterPeriod) || '30d';
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const summary = await dashboardService.getSummary(userId, period, currency);
      const response: ApiResponse<typeof summary> = {
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getNetWorthHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const period = (req.query.period as TimeFilterPeriod) || '30d';
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const history = await dashboardService.getNetWorthHistory(userId, period, currency);
      const response: ApiResponse<typeof history> = {
        success: true,
        data: history,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getAssetAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const allocation = await dashboardService.getAssetAllocation(userId, currency);
      const response: ApiResponse<typeof allocation> = {
        success: true,
        data: allocation,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getLiabilityAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const liabilities = await dashboardService.getLiabilityAllocation(userId, currency);
      const response: ApiResponse<typeof liabilities> = {
        success: true,
        data: liabilities,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getCashFlow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const grouping = (req.query.grouping as CashFlowGrouping) || 'monthly';
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const cashFlow = await dashboardService.getCashFlow(userId, grouping, currency);
      const response: ApiResponse<typeof cashFlow> = {
        success: true,
        data: cashFlow,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getPortfolioSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const portfolio = await dashboardService.getPortfolioSummary(userId, currency);
      const response: ApiResponse<typeof portfolio> = {
        success: true,
        data: portfolio,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getAccountsOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const accounts = await dashboardService.getAccountsOverview(userId, currency);
      const response: ApiResponse<typeof accounts> = {
        success: true,
        data: accounts,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getRecentTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const limit = Number(req.query.limit) || 10;
      const type = (req.query.type as string) || 'all';
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const transactions = await dashboardService.getRecentTransactions(userId, limit, type, currency);
      const response: ApiResponse<typeof transactions> = {
        success: true,
        data: transactions,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getSpendingBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const spending = await dashboardService.getSpendingBreakdown(userId, currency);
      const response: ApiResponse<typeof spending> = {
        success: true,
        data: spending,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getFinancialHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const health = await dashboardService.getFinancialHealth(userId, currency);
      const response: ApiResponse<typeof health> = {
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getUpcomingEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);

      const events = await dashboardService.getUpcomingEvents(userId);
      const response: ApiResponse<typeof events> = {
        success: true,
        data: events,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const currency = (req.query.currency as CurrencyCode) || 'INR';

      const insights = await dashboardService.getInsights(userId, currency);
      const response: ApiResponse<typeof insights> = {
        success: true,
        data: insights,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async quickAdd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const payload = req.body as QuickAddPayload;

      const result = await dashboardService.quickAdd(userId, payload);
      res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public async getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);

      const prefs = await dashboardService.getPreferences(userId);
      const response: ApiResponse<typeof prefs> = {
        success: true,
        data: prefs,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const newPrefs = req.body;

      const prefs = await dashboardService.updatePreferences(userId, newPrefs);
      const response: ApiResponse<typeof prefs> = {
        success: true,
        data: prefs,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async resetData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      await dashboardService.resetToZero(userId);
      res.json({
        success: true,
        message: 'Financial state reset to empty account baseline.',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public async seedSampleData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      dashboardService.seedDefaultUserData(userId);
      res.json({
        success: true,
        message: 'Demonstration portfolio seeded successfully.',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
