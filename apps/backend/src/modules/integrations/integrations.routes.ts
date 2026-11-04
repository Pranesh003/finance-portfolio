import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, IntegrationConnection } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_INTEGRATIONS: IntegrationConnection[] = [
  {
    id: 'conn_001',
    userId: '00000000-0000-0000-0000-000000000001',
    provider: 'PLAID',
    institutionName: 'Chase Bank (Mock Sandbox)',
    status: 'HEALTHY',
    lastSuccessfulSyncAt: '2026-11-04T02:00:00Z',
    accountsLinkedCount: 2,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-11-04T02:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<IntegrationConnection[]> = {
      success: true,
      data: MOCK_INTEGRATIONS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const integrationsRouter = router;

