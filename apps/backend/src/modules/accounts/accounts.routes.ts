import { Router, Request, Response, NextFunction } from 'express';
import { accountsService } from './accounts.service';
import { ApiResponse, FinancialAccount } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await accountsService.listAccounts();
    const response: ApiResponse<FinancialAccount[]> = {
      success: true,
      data: accounts,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await accountsService.getAccountById(req.params.id as string);
    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found', timestamp: new Date().toISOString() });
      return;
    }
    const response: ApiResponse<FinancialAccount> = {
      success: true,
      data: account,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await accountsService.createAccount(req.body);
    const response: ApiResponse<FinancialAccount> = {
      success: true,
      message: 'Account created successfully',
      data: created,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

export const accountsRouter = router;

