import { CurrencyCode } from './common';

export type TimeFilterPeriod = '7d' | '30d' | '3m' | '6m' | '1y' | '3y' | '5y' | 'all';
export type CashFlowGrouping = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface DashboardSummary {
  netWorth: {
    current: number;
    absoluteChange: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'neutral';
    asOfDate: string;
  };
  metrics: {
    totalAssets: number;
    totalLiabilities: number;
    bankBalances: number;
    availableCash: number;
    totalInvestments: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    passiveIncome: number;
  };
  currency: CurrencyCode;
  period: TimeFilterPeriod;
  lastUpdated: string;
}

export interface NetWorthHistoryEvent {
  title: string;
  type: 'SALARY' | 'BONUS' | 'INVESTMENT_PURCHASE' | 'LOAN_PREPAYMENT' | 'ASSET_PURCHASE' | 'MARKET_RALLY' | 'MARKET_DIP';
  amount?: number;
}

export interface NetWorthHistoryPoint {
  date: string;
  formattedDate: string;
  netWorth: number;
  assets: number;
  liabilities: number;
  event?: NetWorthHistoryEvent;
}

export type AssetCategoryKey =
  | 'BANK_ACCOUNTS'
  | 'CASH'
  | 'INDIAN_STOCKS'
  | 'INTL_STOCKS'
  | 'MUTUAL_FUNDS'
  | 'ETFS'
  | 'BONDS'
  | 'FIXED_DEPOSITS'
  | 'CRYPTO'
  | 'GOLD'
  | 'SILVER'
  | 'REAL_ESTATE'
  | 'OTHER';

export interface DashboardAssetAllocationItem {
  id: string;
  category: AssetCategoryKey;
  label: string;
  amount: number;
  percentage: number;
  color: string;
  changePct?: number;
}

export type LiabilityTypeKey =
  | 'HOME_LOAN'
  | 'AUTO_LOAN'
  | 'PERSONAL_LOAN'
  | 'CREDIT_CARD'
  | 'EDUCATION_LOAN'
  | 'OTHER_DEBT';

export interface LiabilityAllocationItem {
  id: string;
  type: LiabilityTypeKey;
  label: string;
  lender: string;
  balance: number;
  percentage: number;
  interestRate: number;
  monthlyEMI: number;
  color: string;
}

export interface CashFlowDataPoint {
  periodLabel: string;
  date: string;
  income: number;
  expenses: number;
  investments: number;
  savings: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  realizedPnL: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  overallROI: number;
  dayPnL: number;
  dayPnLPct: number;
}

export interface AccountOverviewItem {
  id: string;
  name: string;
  institutionName: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'BROKERAGE' | 'WALLET' | 'VAULT';
  currency: CurrencyCode;
  balance: number;
  status: 'ACTIVE' | 'SYNCED' | 'DISCONNECTED' | 'ERROR';
  isManual: boolean;
  lastSyncedAt: string;
}

export interface RecentTransactionItem {
  id: string;
  date: string;
  description: string;
  category: string;
  accountName: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'INVESTMENT';
  status: 'POSTED' | 'PENDING' | 'CLEARED';
}

export interface SpendingCategoryItem {
  id: string;
  category: string;
  spentAmount: number;
  budgetedAmount: number;
  percentageUsed: number;
  previousMonthAmount: number;
  changePct: number;
  color: string;
}

export type HealthStatus = 'HEALTHY' | 'GOOD' | 'WARNING' | 'CRITICAL';

export interface FinancialHealthMetric {
  id: string;
  name: string;
  value: number;
  formattedValue: string;
  benchmark: string;
  status: HealthStatus;
  formula: string;
  description: string;
  guidance: string;
}

export interface FinancialHealthOverview {
  overallScore: number;
  status: HealthStatus;
  metrics: FinancialHealthMetric[];
}

export type FinancialEventType =
  | 'SALARY'
  | 'RENT'
  | 'UTILITY_BILL'
  | 'LOAN_EMI'
  | 'CREDIT_CARD'
  | 'SIP'
  | 'BOND_COUPON'
  | 'FD_MATURITY'
  | 'INSURANCE'
  | 'SUBSCRIPTION';

export interface UpcomingFinancialEvent {
  id: string;
  title: string;
  category: FinancialEventType;
  dueDate: string;
  amount: number;
  isAutomated: boolean;
  accountName?: string;
  isPaid: boolean;
}

export interface DashboardFinancialInsight {
  id: string;
  type: 'ANOMALY' | 'OPPORTUNITY' | 'WARNING' | 'SUCCESS';
  title: string;
  message: string;
  metricRef?: string;
  actionLabel?: string;
  impactAmount?: number;
  createdAt: string;
}

export interface DashboardPreferences {
  widgetVisibility: {
    netWorth: boolean;
    summaryCards: boolean;
    portfolioPerformance: boolean;
    assetAllocation: boolean;
    liabilityDistribution: boolean;
    cashFlow: boolean;
    accountsOverview: boolean;
    recentTransactions: boolean;
    spendingBreakdown: boolean;
    financialHealth: boolean;
    upcomingEvents: boolean;
    financialInsights: boolean;
  };
  widgetOrder: string[];
  defaultPeriod: TimeFilterPeriod;
  preferredCurrency: CurrencyCode;
}

export interface QuickAddPayload {
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'INVESTMENT' | 'ASSET' | 'LIABILITY';
  title: string;
  amount: number;
  category?: string;
  accountId?: string;
  toAccountId?: string;
  assetClass?: AssetCategoryKey;
  liabilityType?: LiabilityTypeKey;
  interestRate?: number;
  date?: string;
  notes?: string;
}
