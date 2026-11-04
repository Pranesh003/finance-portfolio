import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, BankInstitution } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_INSTITUTIONS: BankInstitution[] = [
  {
    id: 'inst_chase',
    name: 'JPMorgan Chase (Mock)',
    website: 'https://chase.com',
    country: 'US',
    supportsOAuth: true
  },
  {
    id: 'inst_bofa',
    name: 'Bank of America (Mock)',
    website: 'https://bankofamerica.com',
    country: 'US',
    supportsOAuth: true
  },
  {
    id: 'inst_wells',
    name: 'Wells Fargo (Mock)',
    website: 'https://wellsfargo.com',
    country: 'US',
    supportsOAuth: true
  }
];

const router = Router();
router.use(authenticate);

router.get('/institutions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<BankInstitution[]> = {
      success: true,
      data: MOCK_INSTITUTIONS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const bankingRouter = router;

