import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, Liability } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_LIABILITIES: Liability[] = [
  {
    id: 'liab_001',
    userId: '00000000-0000-0000-0000-000000000001',
    name: '30-Year Fixed Mortgage (Mock)',
    liabilityType: 'MORTGAGE',
    lenderName: 'Wells Fargo Home Mortgage',
    originalPrincipal: 680000.0,
    remainingPrincipal: 638450.0,
    interestRateAnnual: 5.85,
    monthlyPayment: 4012.5,
    currency: 'USD',
    originationDate: '2023-05-15T00:00:00Z',
    expectedPayoffDate: '2053-05-15T00:00:00Z',
    linkedAssetId: 'asset_001',
    createdAt: '2023-05-15T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<Liability[]> = {
      success: true,
      data: MOCK_LIABILITIES,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const liabilitiesRouter = router;

