import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, FinancialInsight, AIAdvisorQueryResponse } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_INSIGHTS: FinancialInsight[] = [
  {
    id: 'ai_insight_001',
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'SAVINGS_OPPORTUNITY',
    title: 'High-Yield Interest Opportunity (AI Insight Mock)',
    summary: 'You have $8,450 sitting in low-yield checking.',
    detailedAnalysis:
      'Moving $4,000 to your High-Yield Savings Account (4.85% APY) could generate approximately $194 in additional annual risk-free yield.',
    impact: 'POSITIVE',
    actionableStep: 'Transfer $4,000 from Checking to HYSA',
    potentialSavingsEstimate: 194.0,
    confidenceScore: 0.94,
    isDismissed: false,
    createdAt: '2026-11-04T00:00:00Z',
    updatedAt: '2026-11-04T00:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/insights', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<FinancialInsight[]> = {
      success: true,
      data: MOCK_INSIGHTS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/advisor/query', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompt = req.body.prompt || 'General query';
    const advisorResponse: AIAdvisorQueryResponse = {
      answer: `AI Financial Foundation Assistant: Received query regarding "${prompt}". Analysis shows healthy 35.8% savings rate with diversified exposure across 6 asset classes.`,
      sourcesUsed: ['Cash Flow Statement (Oct 2026)', 'Portfolio Asset Allocation'],
      suggestedFollowUps: [
        'How can I optimize my monthly tax withholding?',
        'What is my projected retirement corpus at age 60?'
      ],
      disclaimer: 'For educational and planning purposes only; not formal financial advice.'
    };
    const response: ApiResponse<AIAdvisorQueryResponse> = {
      success: true,
      data: advisorResponse,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const aiRouter = router;

