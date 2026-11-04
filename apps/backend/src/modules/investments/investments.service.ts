import {
  InvestmentPortfolio,
  StockHolding,
  MutualFundHolding,
  ETFHolding,
  BondHolding,
  CryptoHolding,
  PreciousMetalHolding
} from '@finance/types';

// Realistic development mock portfolio and holdings
export const MOCK_PORTFOLIO: InvestmentPortfolio = {
  id: 'port_001',
  userId: '00000000-0000-0000-0000-000000000001',
  name: 'Growth & Wealth Preservation Portfolio (Mock)',
  description: 'Balanced long-term portfolio across equities, crypto, and precious metals',
  currency: 'USD',
  totalCostBasis: 104500.0,
  currentValue: 132450.0,
  unrealizedGainLoss: 27950.0,
  unrealizedGainLossPercentage: 26.75,
  realizedGainLoss: 4200.0,
  holdingsCount: 6,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-11-04T05:00:00Z'
};

export const MOCK_STOCKS: StockHolding[] = [
  {
    id: 'stock_001',
    portfolioId: 'port_001',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    exchange: 'NASDAQ',
    shares: 80,
    averageCostPerShare: 165.5,
    currentPrice: 228.4,
    marketValue: 18272.0,
    currency: 'USD',
    dividendYield: 0.52,
    peRatio: 33.2,
    unrealizedGainLoss: 5032.0,
    unrealizedGainLossPercentage: 38.0,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  },
  {
    id: 'stock_002',
    portfolioId: 'port_001',
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    shares: 45,
    averageCostPerShare: 340.0,
    currentPrice: 425.5,
    marketValue: 19147.5,
    currency: 'USD',
    dividendYield: 0.75,
    peRatio: 35.8,
    unrealizedGainLoss: 3847.5,
    unrealizedGainLossPercentage: 25.15,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

export const MOCK_MUTUAL_FUNDS: MutualFundHolding[] = [
  {
    id: 'mf_001',
    portfolioId: 'port_001',
    schemeCode: 'VFIAX',
    fundName: 'Vanguard 500 Index Fund Admiral Shares',
    fundFamily: 'Vanguard',
    fundType: 'INDEX',
    units: 50,
    averageNav: 430.0,
    currentNav: 512.2,
    marketValue: 25610.0,
    expenseRatio: 0.04,
    currency: 'USD',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

export const MOCK_ETFS: ETFHolding[] = [
  {
    id: 'etf_001',
    portfolioId: 'port_001',
    ticker: 'QQQ',
    fundName: 'Invesco QQQ Trust',
    benchmarkIndex: 'Nasdaq-100',
    shares: 60,
    averageCostPerShare: 380.0,
    currentPrice: 485.0,
    marketValue: 29100.0,
    expenseRatio: 0.2,
    dividendYield: 0.58,
    currency: 'USD',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

export const MOCK_BONDS: BondHolding[] = [
  {
    id: 'bond_001',
    portfolioId: 'port_001',
    issuerName: 'US Treasury Note 10Y (Mock)',
    bondType: 'TREASURY',
    isinOrCusip: 'US91282CDP59',
    faceValue: 10000.0,
    couponRate: 4.25,
    couponFrequency: 'SEMI_ANNUAL',
    maturityDate: '2034-08-15T00:00:00Z',
    quantity: 1,
    purchasePrice: 9800.0,
    currentMarketPrice: 10050.0,
    yieldToMaturity: 4.18,
    currency: 'USD',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

export const MOCK_CRYPTO: CryptoHolding[] = [
  {
    id: 'crypto_001',
    portfolioId: 'port_001',
    symbol: 'BTC',
    coinName: 'Bitcoin',
    network: 'Bitcoin Mainnet',
    isColdStorage: true,
    quantity: 0.35,
    averageCostPerCoin: 58000.0,
    currentPrice: 72000.0,
    marketValue: 25200.0,
    currency: 'USD',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

export const MOCK_METALS: PreciousMetalHolding[] = [
  {
    id: 'metal_001',
    portfolioId: 'port_001',
    metalType: 'GOLD',
    storageType: 'ALLOCATED_VAULT',
    weight: 2,
    weightUnit: 'TROY_OUNCE',
    purity: 0.9999,
    totalPurchaseCost: 4100.0,
    currentSpotPricePerUnit: 2535.0,
    currentValue: 5070.0,
    currency: 'USD',
    vaultLocation: 'Zurich Vault Swiss A1',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

export class InvestmentsService {
  public async getPortfolios(): Promise<InvestmentPortfolio[]> {
    return [MOCK_PORTFOLIO];
  }

  public async getStocks(): Promise<StockHolding[]> {
    return MOCK_STOCKS;
  }

  public async getMutualFunds(): Promise<MutualFundHolding[]> {
    return MOCK_MUTUAL_FUNDS;
  }

  public async getETFs(): Promise<ETFHolding[]> {
    return MOCK_ETFS;
  }

  public async getBonds(): Promise<BondHolding[]> {
    return MOCK_BONDS;
  }

  public async getCrypto(): Promise<CryptoHolding[]> {
    return MOCK_CRYPTO;
  }

  public async getPreciousMetals(): Promise<PreciousMetalHolding[]> {
    return MOCK_METALS;
  }
}

export const investmentsService = new InvestmentsService();

