import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from './investments.service';
import { ApiResponse } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

// Consolidated Portfolio with Live Valuations
router.get('/portfolio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const portfolio = await investmentsService.getConsolidatedPortfolio(userId);
    const response: ApiResponse<typeof portfolio> = {
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// Stocks
router.get('/stocks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const stocks = await investmentsService.getStocks(userId);
    const response: ApiResponse<typeof stocks> = {
      success: true,
      data: stocks,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/holdings/stock', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const holding = await investmentsService.addStock(userId, req.body);
    const response: ApiResponse<typeof holding> = {
      success: true,
      message: 'Stock holding added successfully',
      data: holding,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// Mutual Funds
router.get('/mutual-funds', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const mutualFunds = await investmentsService.getMutualFunds(userId);
    const response: ApiResponse<typeof mutualFunds> = {
      success: true,
      data: mutualFunds,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/holdings/mutual-fund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const holding = await investmentsService.addMutualFund(userId, req.body);
    const response: ApiResponse<typeof holding> = {
      success: true,
      message: 'Mutual fund holding added successfully',
      data: holding,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// Crypto
router.get('/crypto', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const crypto = await investmentsService.getCrypto(userId);
    const response: ApiResponse<typeof crypto> = {
      success: true,
      data: crypto,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/holdings/crypto', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const holding = await investmentsService.addCrypto(userId, req.body);
    const response: ApiResponse<typeof holding> = {
      success: true,
      message: 'Crypto holding added successfully',
      data: holding,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// Precious Metals
router.get('/precious-metals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const metals = await investmentsService.getPreciousMetals(userId);
    const response: ApiResponse<typeof metals> = {
      success: true,
      data: metals,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/holdings/precious-metal', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const holding = await investmentsService.addPreciousMetal(userId, req.body);
    const response: ApiResponse<typeof holding> = {
      success: true,
      message: 'Precious metal holding added successfully',
      data: holding,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// Delete Holding
router.delete('/holdings/:type/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const type = req.params.type as 'stock' | 'mutual-fund' | 'crypto' | 'metal';
    const id = String(req.params.id || '');
    const success = await investmentsService.deleteHolding(userId, type, id);
    res.json({
      success,
      message: success ? 'Holding deleted successfully' : 'Failed to delete holding',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export const investmentsRouter = router;
