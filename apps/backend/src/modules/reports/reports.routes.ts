import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, FinancialReportMetadata } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_REPORTS: FinancialReportMetadata[] = [
  {
    id: 'rep_001',
    userId: '00000000-0000-0000-0000-000000000001',
    title: 'Monthly Financial Health Report - October 2026 (Mock)',
    reportType: 'CASH_FLOW_SUMMARY',
    generatedAt: '2026-11-01T00:00:00Z',
    dateRangeStart: '2026-10-01T00:00:00Z',
    dateRangeEnd: '2026-10-31T23:59:59Z',
    format: 'PDF',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<FinancialReportMetadata[]> = {
      success: true,
      data: MOCK_REPORTS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const reportsRouter = router;

