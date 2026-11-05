import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from './investments.service';
import { casParserService } from './cas-parser.service';
import { brokerSyncService } from './broker-sync.service';
import { ApiResponse, CasImportResult } from '@finance/types';
import { optionalAuthenticate } from '../../core/middleware/authenticate';
import { prisma } from '../../core/database/prisma';

const router = Router();
router.use(optionalAuthenticate);

async function getEffectiveUserId(req: Request): Promise<string> {
  if (req.user?.id) return req.user.id;
  try {
    const primaryUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    if (primaryUser) return primaryUser.id;
  } catch {
    // fallback
  }
  return '15fd3394-2993-4e4f-9b37-d35c72ecbb83';
}

// Consolidated Portfolio with Live Valuations
router.get('/portfolio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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
    const userId = await getEffectiveUserId(req);
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

// --- CDSL / NSDL / CAMS CAS IMPORT ---

// 1. Get Sample CAS Data for 1-click preview
router.get('/cas/sample', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rawText = casParserService.getSampleCdslStatementText();
    const parsed = casParserService.parseStatementText(rawText);
    const response: ApiResponse<CasImportResult> = {
      success: true,
      data: parsed,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// 2. Parse uploaded PDF or raw text statement
router.post('/cas/parse', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileBase64, password, rawText } = req.body;

    let statementText = rawText || '';

    if (fileBase64) {
      const buffer = Buffer.from(fileBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64');
      statementText = await casParserService.parsePdf(buffer, password);
    }

    if (!statementText || statementText.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Statement content is empty or unreadable'
      });
      return;
    }

    const parsed = casParserService.parseStatementText(statementText);
    const response: ApiResponse<CasImportResult> = {
      success: true,
      data: parsed,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err: any) {
    next(err);
  }
});

// 3. Commit selected holdings into Neon Database
router.post('/cas/commit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No holdings selected to import'
      });
      return;
    }

    const result = await casParserService.commitHoldingsToDatabase(userId, items);
    const response: ApiResponse<CasImportResult> = {
      success: true,
      message: `Successfully imported ${result.stocksCount} stocks and ${result.mutualFundsCount} mutual funds into your portfolio!`,
      data: result,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// --- DIRECT BROKER & MFCENTRAL SYNC ---

// 1. Angel One (SmartAPI)
router.post('/brokers/angel-one/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { clientCode, apiKey, passwordOrMpin, totp, isDemo } = req.body;
    const result = await brokerSyncService.syncAngelOne(userId, { clientCode, apiKey, passwordOrMpin, totp }, !!isDemo);
    res.json({
      success: true,
      message: `Synced ${result.stocksImported} stock holdings directly from Angel One!`,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// 2. Zerodha (Kite Connect)
router.post('/brokers/zerodha/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { apiKey, accessToken, isDemo } = req.body;
    const result = await brokerSyncService.syncZerodha(userId, { apiKey, accessToken }, !!isDemo);
    res.json({
      success: true,
      message: `Synced ${result.stocksImported} stock holdings directly from Zerodha!`,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// 3. MFCentral (All Mutual Funds across AMCs)
router.post('/brokers/mf-central/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { pan, mobile, casDataJson, isDemo } = req.body;
    const result = await brokerSyncService.syncMfCentral(userId, { pan, mobile, casDataJson }, !!isDemo);
    res.json({
      success: true,
      message: `Synced ${result.mutualFundsImported} mutual funds directly from MFCentral!`,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// 4. INDmoney (All-in-One Net Worth & Consolidated Portfolios)
router.post('/brokers/indmoney/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { rawText, jsonPayload, isDemo } = req.body;
    const result = await brokerSyncService.syncIndMoney(userId, { rawText, jsonPayload }, !!isDemo);
    res.json({
      success: true,
      message: `Synced ${result.stocksImported} stocks and ${result.mutualFundsImported} mutual funds from INDmoney!`,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export const investmentsRouter = router;
