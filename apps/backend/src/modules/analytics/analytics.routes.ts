import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, NetWorthSummary } from '@finance/types';
import { calculateNetWorth } from '@finance/utils';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/net-worth', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const liquidCash = 43651.05;
    const investments = 132450.0;
    const fixedAssets = 954000.0;
    const cryptoAndCommodities = 30270.0;
    const totalAssets = liquidCash + investments + fixedAssets + cryptoAndCommodities;

    const mortgages = 638450.0;
    const creditCards = 1240.5;
    const other = 0.0;
    const totalLiabilities = mortgages + creditCards + other;

    const netWorth = calculateNetWorth(totalAssets, totalLiabilities);

    const summary: NetWorthSummary = {
      userId: '00000000-0000-0000-0000-000000000001',
      calculatedAt: new Date().toISOString(),
      currency: 'USD',
      totalAssets,
      totalLiabilities,
      netWorth,
      assetsByCategory: {
        liquidCash,
        investments,
        fixedAssets,
        cryptoAndCommodities
      },
      liabilitiesByCategory: {
        mortgages,
        studentLoans: 0,
        autoLoans: 0,
        creditCards,
        other
      }
    };

    const response: ApiResponse<NetWorthSummary> = {
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const analyticsRouter = router;

