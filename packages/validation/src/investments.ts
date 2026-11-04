import { z } from 'zod';
import { currencyEnum } from './common';

export const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(100),
  description: z.string().max(500).optional(),
  currency: currencyEnum.default('USD')
});

export const createStockHoldingSchema = z.object({
  portfolioId: z.string().uuid(),
  ticker: z.string().min(1).max(20).toUpperCase(),
  companyName: z.string().min(1).max(150),
  exchange: z.string().min(1).max(50).default('NASDAQ'),
  shares: z.number().positive(),
  averageCostPerShare: z.number().positive(),
  currentPrice: z.number().positive().optional(),
  currency: currencyEnum.default('USD')
});

export const createCryptoHoldingSchema = z.object({
  portfolioId: z.string().uuid(),
  symbol: z.string().min(1).max(20).toUpperCase(),
  coinName: z.string().min(1).max(100),
  network: z.string().max(50).optional(),
  walletAddress: z.string().max(255).optional(),
  isColdStorage: z.boolean().default(false),
  quantity: z.number().positive(),
  averageCostPerCoin: z.number().positive(),
  currentPrice: z.number().positive().optional(),
  currency: currencyEnum.default('USD')
});

export const createPreciousMetalHoldingSchema = z.object({
  portfolioId: z.string().uuid(),
  metalType: z.enum(['GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM']),
  storageType: z.enum(['PHYSICAL_HOME', 'ALLOCATED_VAULT', 'DIGITAL_ETF', 'SOVEREIGN_BOND']),
  weight: z.number().positive(),
  weightUnit: z.enum(['GRAM', 'OUNCE', 'TROY_OUNCE', 'KILOGRAM']),
  purity: z.number().min(0).max(1).default(0.999),
  totalPurchaseCost: z.number().positive(),
  currentSpotPricePerUnit: z.number().positive(),
  currency: currencyEnum.default('USD'),
  vaultLocation: z.string().max(100).optional()
});

