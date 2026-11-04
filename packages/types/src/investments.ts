import { BaseEntity, CurrencyCode } from './common';

export type AssetClass =
  | 'EQUITY_STOCK'
  | 'MUTUAL_FUND'
  | 'ETF'
  | 'FIXED_INCOME_BOND'
  | 'CRYPTOCURRENCY'
  | 'PRECIOUS_METAL'
  | 'REAL_ESTATE'
  | 'COMMODITY'
  | 'CASH_EQUIVALENT';

export interface InvestmentPortfolio extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  currency: CurrencyCode;
  totalCostBasis: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercentage: number;
  realizedGainLoss: number;
  holdingsCount: number;
  stocks?: StockHolding[];
  mutualFunds?: MutualFundHolding[];
  cryptos?: CryptoHolding[];
  preciousMetals?: PreciousMetalHolding[];
}

export type OrderSide = 'BUY' | 'SELL';

// --- STOCKS ---
export interface StockHolding extends BaseEntity {
  portfolioId: string;
  ticker: string;
  companyName: string;
  exchange: string; // e.g. NYSE, NASDAQ, LSE, NSE
  shares: number;
  averageCostPerShare: number;
  currentPrice: number;
  marketValue: number;
  currency: CurrencyCode;
  dividendYield?: number;
  peRatio?: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercentage: number;
}

// --- MUTUAL FUNDS ---
export type MutualFundType = 'EQUITY' | 'DEBT' | 'HYBRID' | 'INDEX' | 'LIQUID' | 'TAX_SAVING';

export interface MutualFundHolding extends BaseEntity {
  portfolioId: string;
  schemeCode: string;
  fundName: string;
  fundFamily: string; // Vanguard, BlackRock, Fidelity, etc.
  fundType: MutualFundType;
  units: number;
  averageNav: number;
  currentNav: number;
  marketValue: number;
  expenseRatio?: number;
  currency: CurrencyCode;
  unrealizedGainLoss?: number;
  unrealizedGainLossPercentage?: number;
  navDate?: string;
}

// --- ETFS ---
export interface ETFHolding extends BaseEntity {
  portfolioId: string;
  ticker: string;
  fundName: string;
  benchmarkIndex: string; // e.g. S&P 500, MSCI World
  shares: number;
  averageCostPerShare: number;
  currentPrice: number;
  marketValue: number;
  expenseRatio: number;
  dividendYield?: number;
  currency: CurrencyCode;
}

// --- BONDS ---
export type BondType = 'TREASURY' | 'CORPORATE' | 'MUNICIPAL' | 'SOVEREIGN' | 'INFLATION_PROTECTED';

export interface BondHolding extends BaseEntity {
  portfolioId: string;
  issuerName: string;
  bondType: BondType;
  isinOrCusip?: string;
  faceValue: number;
  couponRate: number; // percentage, e.g. 4.5
  couponFrequency: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY';
  maturityDate: string;
  quantity: number;
  purchasePrice: number;
  currentMarketPrice: number;
  yieldToMaturity?: number;
  currency: CurrencyCode;
}

// --- CRYPTOCURRENCY ---
export interface CryptoHolding extends BaseEntity {
  portfolioId: string;
  symbol: string; // BTC, ETH, SOL
  coinName: string;
  network?: string; // Bitcoin, Ethereum, Solana
  walletAddress?: string;
  isColdStorage: boolean;
  quantity: number;
  averageCostPerCoin: number;
  currentPrice: number;
  marketValue: number;
  currency: CurrencyCode;
  stakingYieldPercentage?: number;
  unrealizedGainLoss?: number;
  unrealizedGainLossPercentage?: number;
  dayChangePercent?: number;
}

// --- PRECIOUS METALS ---
export type PreciousMetalType = 'GOLD' | 'SILVER' | 'PLATINUM' | 'PALLADIUM';
export type MetalStorageType = 'PHYSICAL_HOME' | 'ALLOCATED_VAULT' | 'DIGITAL_ETF' | 'SOVEREIGN_BOND';
export type WeightUnit = 'GRAM' | 'OUNCE' | 'TROY_OUNCE' | 'KILOGRAM';

export interface PreciousMetalHolding extends BaseEntity {
  portfolioId: string;
  metalType: PreciousMetalType;
  storageType: MetalStorageType;
  weight: number;
  weightUnit: WeightUnit;
  purity: number; // e.g. 0.999 for 24k gold
  totalPurchaseCost: number;
  currentSpotPricePerUnit: number;
  currentValue: number;
  currency: CurrencyCode;
  vaultLocation?: string;
  unrealizedGainLoss?: number;
  unrealizedGainLossPercentage?: number;
}

export interface AssetAllocationItem {
  assetClass: AssetClass;
  totalValue: number;
  percentage: number;
  targetPercentage?: number;
  rebalanceVariance?: number;
}

