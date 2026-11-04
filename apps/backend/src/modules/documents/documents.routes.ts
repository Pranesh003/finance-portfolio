import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, FinancialDocument } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_DOCS: FinancialDocument[] = [
  {
    id: 'doc_001',
    userId: '00000000-0000-0000-0000-000000000001',
    category: 'TAX_DOCUMENT',
    fileName: 'Form_1099_DIV_2025_Mock.pdf',
    fileSizeBytes: 245800,
    mimeType: 'application/pdf',
    storageKey: 'mock/users/001/taxes/2025_1099.pdf',
    uploadedAt: '2026-02-15T00:00:00Z',
    description: 'Annual dividend tax statement (Mock)',
    tags: ['tax', 'dividends', '2025'],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<FinancialDocument[]> = {
      success: true,
      data: MOCK_DOCS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const documentsRouter = router;

