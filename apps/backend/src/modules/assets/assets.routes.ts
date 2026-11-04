import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, FixedAsset } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_ASSETS: FixedAsset[] = [
  {
    id: 'asset_001',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Primary Residence (San Francisco Condo - Mock)',
    assetType: 'REAL_ESTATE_PRIMARY_RESIDENCE',
    purchaseDate: '2023-05-15T00:00:00Z',
    purchasePrice: 850000.0,
    estimatedCurrentValue: 920000.0,
    currency: 'USD',
    appreciationRateAnnual: 4.0,
    address: '742 Evergreen Terrace, San Francisco, CA',
    isInsured: true,
    linkedLiabilityId: 'liab_001',
    createdAt: '2023-05-15T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  },
  {
    id: 'asset_002',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Tesla Model Y Long Range (Mock)',
    assetType: 'VEHICLE',
    purchaseDate: '2024-03-10T00:00:00Z',
    purchasePrice: 48000.0,
    estimatedCurrentValue: 34000.0,
    currency: 'USD',
    depreciationRateAnnual: 12.0,
    isInsured: true,
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<FixedAsset[]> = {
      success: true,
      data: MOCK_ASSETS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const assetsRouter = router;

