import {
  DashboardSummary,
  TimeFilterPeriod,
  NetWorthHistoryPoint,
  DashboardAssetAllocationItem,
  LiabilityAllocationItem,
  CashFlowDataPoint,
  CashFlowGrouping,
  PortfolioSummary,
  AccountOverviewItem,
  RecentTransactionItem,
  SpendingCategoryItem,
  FinancialHealthOverview,
  UpcomingFinancialEvent,
  DashboardFinancialInsight,
  DashboardPreferences,
  QuickAddPayload,
  CurrencyCode
} from '@finance/types';
import {
  calculateNetWorth,
  calculateSavingsRate,
  calculateExpenseToIncome,
  calculateDebtToAsset,
  calculateEmergencyFundRunway,
  calculateLiquidityRatio,
  calculateDiversificationScore,
  calculateDTI
} from '@finance/utils';
import { logger } from '../../core/logger/logger';

// In-Memory User Financial State for offline resilience and fast prototyping
interface UserFinancialData {
  accounts: AccountOverviewItem[];
  transactions: RecentTransactionItem[];
  assets: DashboardAssetAllocationItem[];
  liabilities: LiabilityAllocationItem[];
  cashFlowHistory: CashFlowDataPoint[];
  netWorthSnapshots: NetWorthHistoryPoint[];
  spendingCategories: SpendingCategoryItem[];
  upcomingEvents: UpcomingFinancialEvent[];
  insights: DashboardFinancialInsight[];
  preferences: DashboardPreferences;
}

// Exchange rates relative to INR
const INR_CONVERSIONS: Record<string, number> = {
  INR: 1,
  USD: 0.012, // 1 INR = 0.012 USD (~83.5 INR/USD)
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  SGD: 0.016
};

function getIsoDate(offsetMs = 0): string {
  return new Date(Date.now() - offsetMs).toISOString().split('T')[0] ?? '';
}

export class DashboardService {
  private userStore = new Map<string, UserFinancialData>();

  constructor() {
    // Seed default demo user
    this.seedDefaultUserData('demo-user-123');
    this.seedDefaultUserData('default-user');
  }

  private getUserData(userId: string): UserFinancialData {
    if (!this.userStore.has(userId)) {
      this.seedDefaultUserData(userId);
    }
    return this.userStore.get(userId)!;
  }

  public seedDefaultUserData(userId: string): void {
    const defaultData: UserFinancialData = {
      accounts: [
        {
          id: 'acc-hdfc-sal',
          name: 'HDFC Classic Salary',
          institutionName: 'HDFC Bank Ltd',
          accountType: 'CHECKING',
          currency: 'INR',
          balance: 285400.00,
          status: 'SYNCED',
          isManual: false,
          lastSyncedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
        },
        {
          id: 'acc-sbi-sav',
          name: 'SBI Wealth Privilege Savings',
          institutionName: 'State Bank of India',
          accountType: 'SAVINGS',
          currency: 'INR',
          balance: 650000.00,
          status: 'SYNCED',
          isManual: false,
          lastSyncedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
        },
        {
          id: 'acc-zerodha-demat',
          name: 'Zerodha Kite Demat',
          institutionName: 'Zerodha Broking',
          accountType: 'BROKERAGE',
          currency: 'INR',
          balance: 1845000.00,
          status: 'SYNCED',
          isManual: false,
          lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 'acc-icici-inf',
          name: 'ICICI Emeralde Private Metal',
          institutionName: 'ICICI Bank',
          accountType: 'CREDIT_CARD',
          currency: 'INR',
          balance: -42850.00,
          status: 'SYNCED',
          isManual: false,
          lastSyncedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
        },
        {
          id: 'acc-physical-cash',
          name: 'Emergency Home Vault Cash',
          institutionName: 'Physical Currency',
          accountType: 'VAULT',
          currency: 'INR',
          balance: 50000.00,
          status: 'ACTIVE',
          isManual: true,
          lastSyncedAt: new Date().toISOString()
        }
      ],
      transactions: [
        {
          id: 'tx-001',
          date: getIsoDate(),
          description: 'Tata Consultancy Services Payroll',
          category: 'Salary',
          accountName: 'HDFC Classic Salary',
          amount: 225000.00,
          type: 'INCOME',
          status: 'POSTED'
        },
        {
          id: 'tx-002',
          date: getIsoDate(86400000),
          description: 'HDFC Home Loan EMI Auto-Debit',
          category: 'Housing Loan',
          accountName: 'HDFC Classic Salary',
          amount: -48200.00,
          type: 'EXPENSE',
          status: 'POSTED'
        },
        {
          id: 'tx-003',
          date: getIsoDate(2 * 86400000),
          description: 'SIP: Parag Parikh Flexi Cap Fund',
          category: 'Mutual Funds',
          accountName: 'SBI Wealth Privilege Savings',
          amount: -25000.00,
          type: 'INVESTMENT',
          status: 'POSTED'
        },
        {
          id: 'tx-004',
          date: getIsoDate(3 * 86400000),
          description: 'Internal Transfer: Salary to SBI Savings',
          category: 'Transfer',
          accountName: 'HDFC Classic Salary',
          amount: -50000.00,
          type: 'TRANSFER',
          status: 'POSTED'
        },
        {
          id: 'tx-005',
          date: getIsoDate(4 * 86400000),
          description: 'Nature Basket Gourmet Groceries',
          category: 'Groceries',
          accountName: 'ICICI Emeralde Private Metal',
          amount: -8450.00,
          type: 'EXPENSE',
          status: 'POSTED'
        },
        {
          id: 'tx-006',
          date: getIsoDate(5 * 86400000),
          description: 'TCS Quarterly Performance Dividend',
          category: 'Dividends',
          accountName: 'HDFC Classic Salary',
          amount: 14200.00,
          type: 'INCOME',
          status: 'POSTED'
        },
        {
          id: 'tx-007',
          date: getIsoDate(6 * 86400000),
          description: 'Adani Electricity Mumbai Bill',
          category: 'Utilities',
          accountName: 'ICICI Emeralde Private Metal',
          amount: -3850.00,
          type: 'EXPENSE',
          status: 'POSTED'
        }
      ],
      assets: [
        {
          id: 'ast-ind-stocks',
          category: 'INDIAN_STOCKS',
          label: 'Indian Equities (NSE/BSE)',
          amount: 1450000.00,
          percentage: 20.8,
          color: '#3B82F6',
          changePct: 14.8
        },
        {
          id: 'ast-mf',
          category: 'MUTUAL_FUNDS',
          label: 'Mutual Funds (Direct Growth)',
          amount: 1120000.00,
          percentage: 16.1,
          color: '#10B981',
          changePct: 18.2
        },
        {
          id: 'ast-re',
          category: 'REAL_ESTATE',
          label: 'Residential Property (Bengaluru)',
          amount: 2200000.00,
          percentage: 31.6,
          color: '#8B5CF6',
          changePct: 8.5
        },
        {
          id: 'ast-bank',
          category: 'BANK_ACCOUNTS',
          label: 'Bank Accounts (HDFC & SBI)',
          amount: 935400.00,
          percentage: 13.4,
          color: '#06B6D4',
          changePct: 3.2
        },
        {
          id: 'ast-intl',
          category: 'INTL_STOCKS',
          label: 'US & Global Stocks',
          amount: 385000.00,
          percentage: 5.5,
          color: '#F59E0B',
          changePct: 22.4
        },
        {
          id: 'ast-gold',
          category: 'GOLD',
          label: 'Sovereign Gold Bonds & Bullion',
          amount: 360000.00,
          percentage: 5.2,
          color: '#EAB308',
          changePct: 16.5
        },
        {
          id: 'ast-fd',
          category: 'FIXED_DEPOSITS',
          label: 'Bank Fixed Deposits (7.4% APY)',
          amount: 250000.00,
          percentage: 3.6,
          color: '#14B8A6',
          changePct: 7.4
        },
        {
          id: 'ast-crypto',
          category: 'CRYPTO',
          label: 'Digital Assets (Cold Vault BTC/ETH)',
          amount: 215000.00,
          percentage: 3.1,
          color: '#F97316',
          changePct: 41.2
        },
        {
          id: 'ast-cash',
          category: 'CASH',
          label: 'Physical Vault Cash',
          amount: 50000.00,
          percentage: 0.7,
          color: '#64748B',
          changePct: 0.0
        }
      ],
      liabilities: [
        {
          id: 'lia-home',
          type: 'HOME_LOAN',
          label: 'HDFC Home Loan (20-Yr Floating)',
          lender: 'HDFC Ltd',
          balance: 1420000.00,
          percentage: 86.8,
          interestRate: 8.50,
          monthlyEMI: 48200.00,
          color: '#EF4444'
        },
        {
          id: 'lia-auto',
          type: 'AUTO_LOAN',
          label: 'Tata Nexon EV Prime Auto Loan',
          lender: 'SBI Auto Loans',
          balance: 172000.00,
          percentage: 10.5,
          interestRate: 7.95,
          monthlyEMI: 14500.00,
          color: '#F97316'
        },
        {
          id: 'lia-card',
          type: 'CREDIT_CARD',
          label: 'ICICI Emeralde Statement Outstanding',
          lender: 'ICICI Bank Cards',
          balance: 42850.00,
          percentage: 2.7,
          interestRate: 0.0, // Paid in full monthly
          monthlyEMI: 42850.00,
          color: '#F59E0B'
        }
      ],
      cashFlowHistory: [
        { periodLabel: 'Jun', date: '2026-06', income: 245000, expenses: 112000, investments: 85000, savings: 48000 },
        { periodLabel: 'Jul', date: '2026-07', income: 248000, expenses: 118000, investments: 85000, savings: 45000 },
        { periodLabel: 'Aug', date: '2026-08', income: 252000, expenses: 105000, investments: 90000, savings: 57000 },
        { periodLabel: 'Sep', date: '2026-09', income: 295000, expenses: 132000, investments: 100000, savings: 63000 },
        { periodLabel: 'Oct', date: '2026-10', income: 258000, expenses: 114000, investments: 90000, savings: 54000 },
        { periodLabel: 'Nov', date: '2026-11', income: 264200, expenses: 118500, investments: 95000, savings: 50700 }
      ],
      netWorthSnapshots: [
        { date: '2026-05-01', formattedDate: 'May 01', netWorth: 4720000, assets: 6450000, liabilities: 1730000 },
        { date: '2026-06-01', formattedDate: 'Jun 01', netWorth: 4815000, assets: 6520000, liabilities: 1705000 },
        {
          date: '2026-07-01',
          formattedDate: 'Jul 01',
          netWorth: 4940000,
          assets: 6620000,
          liabilities: 1680000,
          event: { title: 'Annual Appraisal Salary Hike', type: 'SALARY', amount: 35000 }
        },
        { date: '2026-08-01', formattedDate: 'Aug 01', netWorth: 5060000, assets: 6715000, liabilities: 1655000 },
        {
          date: '2026-09-01',
          formattedDate: 'Sep 01',
          netWorth: 5210000,
          assets: 6840000,
          liabilities: 1630000,
          event: { title: 'TCS Performance Bonus Credited', type: 'BONUS', amount: 50000 }
        },
        { date: '2026-10-01', formattedDate: 'Oct 01', netWorth: 5290000, assets: 6905000, liabilities: 1615000 },
        {
          date: '2026-11-01',
          formattedDate: 'Nov 01',
          netWorth: 5330550,
          assets: 6965400,
          liabilities: 1634850,
          event: { title: 'Gold Bullion All-Time High Rally', type: 'MARKET_RALLY' }
        }
      ],
      spendingCategories: [
        {
          id: 'sp-1',
          category: 'Housing & Home EMI',
          spentAmount: 48200.00,
          budgetedAmount: 50000.00,
          percentageUsed: 96.4,
          previousMonthAmount: 48200.00,
          changePct: 0.0,
          color: '#EF4444'
        },
        {
          id: 'sp-2',
          category: 'Groceries & Household',
          spentAmount: 22450.00,
          budgetedAmount: 25000.00,
          percentageUsed: 89.8,
          previousMonthAmount: 24100.00,
          changePct: -6.8,
          color: '#10B981'
        },
        {
          id: 'sp-3',
          category: 'Transportation & Fuel',
          spentAmount: 14500.00,
          budgetedAmount: 18000.00,
          percentageUsed: 80.5,
          previousMonthAmount: 13800.00,
          changePct: 5.1,
          color: '#3B82F6'
        },
        {
          id: 'sp-4',
          category: 'Dining & Entertainment',
          spentAmount: 16800.00,
          budgetedAmount: 15000.00,
          percentageUsed: 112.0,
          previousMonthAmount: 12500.00,
          changePct: 34.4,
          color: '#F59E0B'
        },
        {
          id: 'sp-5',
          category: 'Utilities & Subscriptions',
          spentAmount: 9450.00,
          budgetedAmount: 12000.00,
          percentageUsed: 78.8,
          previousMonthAmount: 9100.00,
          changePct: 3.8,
          color: '#8B5CF6'
        },
        {
          id: 'sp-6',
          category: 'Healthcare & Wellness',
          spentAmount: 7100.00,
          budgetedAmount: 10000.00,
          percentageUsed: 71.0,
          previousMonthAmount: 6300.00,
          changePct: 12.7,
          color: '#EC4899'
        }
      ],
      upcomingEvents: [
        {
          id: 'ev-1',
          title: 'Monthly Salary Credit (TCS)',
          category: 'SALARY',
          dueDate: '2026-11-30',
          amount: 225000.00,
          isAutomated: true,
          accountName: 'HDFC Classic Salary',
          isPaid: false
        },
        {
          id: 'ev-2',
          title: 'HDFC Home Loan EMI Auto-Debit',
          category: 'LOAN_EMI',
          dueDate: '2026-12-05',
          amount: 48200.00,
          isAutomated: true,
          accountName: 'HDFC Classic Salary',
          isPaid: false
        },
        {
          id: 'ev-3',
          title: 'Parag Parikh Flexi Cap SIP Auto-Debit',
          category: 'SIP',
          dueDate: '2026-12-10',
          amount: 25000.00,
          isAutomated: true,
          accountName: 'SBI Wealth Savings',
          isPaid: false
        },
        {
          id: 'ev-4',
          title: 'ICICI Emeralde Credit Card Statement Due',
          category: 'CREDIT_CARD',
          dueDate: '2026-11-20',
          amount: 42850.00,
          isAutomated: false,
          accountName: 'ICICI Bank Cards',
          isPaid: false
        },
        {
          id: 'ev-5',
          title: 'Tata Nexon Auto Loan EMI',
          category: 'LOAN_EMI',
          dueDate: '2026-12-12',
          amount: 14500.00,
          isAutomated: true,
          accountName: 'SBI Wealth Savings',
          isPaid: false
        },
        {
          id: 'ev-6',
          title: 'Sovereign Gold Bond Semi-Annual Coupon',
          category: 'BOND_COUPON',
          dueDate: '2026-12-15',
          amount: 4500.00,
          isAutomated: true,
          accountName: 'SBI Wealth Savings',
          isPaid: false
        }
      ],
      insights: [
        {
          id: 'ins-1',
          type: 'ANOMALY',
          title: 'Dining & Entertainment Over Budget',
          message: 'Dining expenses rose 34.4% this month (₹16,800 vs ₹12,500 target cap). Consider trimming discretionary café & restaurant spending.',
          metricRef: 'Dining & Entertainment',
          actionLabel: 'Review Dining Charges',
          impactAmount: 1800.00,
          createdAt: new Date().toISOString()
        },
        {
          id: 'ins-2',
          type: 'SUCCESS',
          title: 'Strong Savings Rate Target Achieved',
          message: 'Your current monthly savings rate is 55.2%, exceeding the recommended 30% financial independence benchmark.',
          metricRef: 'Savings Rate',
          actionLabel: 'Explore Mutual Funds',
          createdAt: new Date().toISOString()
        },
        {
          id: 'ins-3',
          type: 'WARNING',
          title: 'ICICI Emeralde Bill Due in 16 Days',
          message: 'Statement balance of ₹42,850 is due on Nov 20. Sufficient liquidity exists in HDFC checking to clear it without interest charges.',
          metricRef: 'Credit Card Outstanding',
          actionLabel: 'Pay Credit Card Now',
          impactAmount: 42850.00,
          createdAt: new Date().toISOString()
        },
        {
          id: 'ins-4',
          type: 'OPPORTUNITY',
          title: 'Gold Allocation Surge (+16.5%)',
          message: 'Sovereign Gold Bond holdings reached all-time valuation highs. You may rebalance 2% into broad-market index ETFs.',
          metricRef: 'Asset Allocation',
          actionLabel: 'View Rebalancing',
          createdAt: new Date().toISOString()
        }
      ],
      preferences: {
        widgetVisibility: {
          netWorth: true,
          summaryCards: true,
          portfolioPerformance: true,
          assetAllocation: true,
          liabilityDistribution: true,
          cashFlow: true,
          accountsOverview: true,
          recentTransactions: true,
          spendingBreakdown: true,
          financialHealth: true,
          upcomingEvents: true,
          financialInsights: true
        },
        widgetOrder: [
          'netWorth',
          'summaryCards',
          'portfolioPerformance',
          'assetAllocation',
          'liabilityDistribution',
          'cashFlow',
          'accountsOverview',
          'recentTransactions',
          'spendingBreakdown',
          'financialHealth',
          'upcomingEvents',
          'financialInsights'
        ],
        defaultPeriod: '30d',
        preferredCurrency: 'INR'
      }
    };

    this.userStore.set(userId, defaultData);
  }

  // --- API SERVICE METHODS ---

  public async getSummary(userId: string, period: TimeFilterPeriod = '30d', currency: CurrencyCode = 'INR'): Promise<DashboardSummary> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;

    // Calculate live aggregates
    const totalAssets = data.assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = data.liabilities.reduce((sum, l) => sum + l.balance, 0);
    const currentNetWorth = calculateNetWorth(totalAssets, totalLiabilities);

    const bankBalances = data.accounts
      .filter((a) => a.accountType === 'CHECKING' || a.accountType === 'SAVINGS')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);

    const availableCash = data.accounts
      .filter((a) => a.accountType === 'CHECKING' || a.accountType === 'SAVINGS' || a.accountType === 'VAULT')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);

    const totalInvestments = data.assets
      .filter((a) => !['BANK_ACCOUNTS', 'CASH'].includes(a.category))
      .reduce((sum, a) => sum + a.amount, 0);

    // Latest month cash flow numbers
    const latestCashFlow = data.cashFlowHistory[data.cashFlowHistory.length - 1] || {
      income: 0,
      expenses: 0,
      investments: 0,
      savings: 0
    };

    const monthlyIncome = latestCashFlow.income;
    const monthlyExpenses = latestCashFlow.expenses;
    const monthlySavings = latestCashFlow.savings;
    const passiveIncome = 18700.00; // Dividends, FD Interest & SGB coupons

    // Historical Net Worth comparison for percentage change
    const firstSnapshot = data.netWorthSnapshots[0];
    const prevNetWorth = firstSnapshot ? firstSnapshot.netWorth : currentNetWorth;
    const absoluteChange = Math.round((currentNetWorth - prevNetWorth) * 100) / 100;
    const percentageChange = prevNetWorth > 0
      ? Math.round(((currentNetWorth - prevNetWorth) / prevNetWorth) * 10000) / 100
      : 0;

    return {
      netWorth: {
        current: Math.round(currentNetWorth * conversion * 100) / 100,
        absoluteChange: Math.round(absoluteChange * conversion * 100) / 100,
        percentageChange,
        trend: absoluteChange >= 0 ? 'up' : 'down',
        asOfDate: new Date().toISOString()
      },
      metrics: {
        totalAssets: Math.round(totalAssets * conversion * 100) / 100,
        totalLiabilities: Math.round(totalLiabilities * conversion * 100) / 100,
        bankBalances: Math.round(bankBalances * conversion * 100) / 100,
        availableCash: Math.round(availableCash * conversion * 100) / 100,
        totalInvestments: Math.round(totalInvestments * conversion * 100) / 100,
        monthlyIncome: Math.round(monthlyIncome * conversion * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * conversion * 100) / 100,
        monthlySavings: Math.round(monthlySavings * conversion * 100) / 100,
        passiveIncome: Math.round(passiveIncome * conversion * 100) / 100
      },
      currency,
      period,
      lastUpdated: new Date().toISOString()
    };
  }

  public async getNetWorthHistory(
    userId: string,
    period: TimeFilterPeriod = '30d',
    currency: CurrencyCode = 'INR'
  ): Promise<NetWorthHistoryPoint[]> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;

    let points = [...data.netWorthSnapshots];

    // Filter points based on timeframe period
    const now = Date.now();
    let cutoff = 0;
    switch (period) {
      case '7d':
        cutoff = now - 7 * 86400000;
        break;
      case '30d':
        cutoff = now - 30 * 86400000;
        break;
      case '3m':
        cutoff = now - 90 * 86400000;
        break;
      case '6m':
        cutoff = now - 180 * 86400000;
        break;
      case '1y':
        cutoff = now - 365 * 86400000;
        break;
      case '3y':
        cutoff = now - 3 * 365 * 86400000;
        break;
      case '5y':
        cutoff = now - 5 * 365 * 86400000;
        break;
      case 'all':
      default:
        cutoff = 0;
    }

    if (cutoff > 0) {
      const filtered = points.filter((p) => new Date(p.date).getTime() >= cutoff);
      if (filtered.length >= 2) {
        points = filtered;
      }
    }

    return points.map((p) => ({
      ...p,
      netWorth: Math.round(p.netWorth * conversion * 100) / 100,
      assets: Math.round(p.assets * conversion * 100) / 100,
      liabilities: Math.round(p.liabilities * conversion * 100) / 100
    }));
  }

  public async getAssetAllocation(userId: string, currency: CurrencyCode = 'INR'): Promise<DashboardAssetAllocationItem[]> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;
    const totalAssets = data.assets.reduce((sum, a) => sum + a.amount, 0);

    return data.assets.map((item) => ({
      ...item,
      amount: Math.round(item.amount * conversion * 100) / 100,
      percentage: totalAssets > 0 ? Math.round((item.amount / totalAssets) * 1000) / 10 : 0
    }));
  }

  public async getLiabilityAllocation(userId: string, currency: CurrencyCode = 'INR'): Promise<LiabilityAllocationItem[]> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;
    const totalLiabilities = data.liabilities.reduce((sum, l) => sum + l.balance, 0);

    return data.liabilities.map((item) => ({
      ...item,
      balance: Math.round(item.balance * conversion * 100) / 100,
      monthlyEMI: Math.round(item.monthlyEMI * conversion * 100) / 100,
      percentage: totalLiabilities > 0 ? Math.round((item.balance / totalLiabilities) * 1000) / 10 : 0
    }));
  }

  public async getCashFlow(
    userId: string,
    grouping: CashFlowGrouping = 'monthly',
    currency: CurrencyCode = 'INR'
  ): Promise<CashFlowDataPoint[]> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;
    void grouping;

    // Return cash flow series adjusted for requested grouping
    return data.cashFlowHistory.map((p) => ({
      ...p,
      income: Math.round(p.income * conversion * 100) / 100,
      expenses: Math.round(p.expenses * conversion * 100) / 100,
      investments: Math.round(p.investments * conversion * 100) / 100,
      savings: Math.round(p.savings * conversion * 100) / 100
    }));
  }

  public async getPortfolioSummary(userId: string, currency: CurrencyCode = 'INR'): Promise<PortfolioSummary> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;

    const totalInvestments = data.assets
      .filter((a) => !['BANK_ACCOUNTS', 'CASH'].includes(a.category))
      .reduce((sum, a) => sum + a.amount, 0);

    const totalCostBasis = 2950000.00;
    const currentValue = totalInvestments;
    const unrealizedPnL = currentValue - totalCostBasis;
    const unrealizedPnLPct = totalCostBasis > 0 ? (unrealizedPnL / totalCostBasis) * 100 : 0;
    const realizedPnL = 145000.00;
    const dayPnL = 28400.00;
    const dayPnLPct = (dayPnL / currentValue) * 100;
    const overallROI = ((currentValue + realizedPnL - totalCostBasis) / totalCostBasis) * 100;

    return {
      totalInvested: Math.round(totalCostBasis * conversion * 100) / 100,
      currentValue: Math.round(currentValue * conversion * 100) / 100,
      realizedPnL: Math.round(realizedPnL * conversion * 100) / 100,
      unrealizedPnL: Math.round(unrealizedPnL * conversion * 100) / 100,
      unrealizedPnLPct: Math.round(unrealizedPnLPct * 100) / 100,
      overallROI: Math.round(overallROI * 100) / 100,
      dayPnL: Math.round(dayPnL * conversion * 100) / 100,
      dayPnLPct: Math.round(dayPnLPct * 100) / 100
    };
  }

  public async getAccountsOverview(userId: string, currency: CurrencyCode = 'INR'): Promise<AccountOverviewItem[]> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;

    return data.accounts.map((acc) => ({
      ...acc,
      balance: Math.round(acc.balance * conversion * 100) / 100
    }));
  }

  public async getRecentTransactions(
    userId: string,
    limit = 10,
    typeFilter = 'all',
    currency: CurrencyCode = 'INR'
  ): Promise<RecentTransactionItem[]> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;

    let list = [...data.transactions];
    if (typeFilter && typeFilter !== 'all') {
      list = list.filter((tx) => tx.type.toLowerCase() === typeFilter.toLowerCase());
    }

    return list.slice(0, limit).map((tx) => ({
      ...tx,
      amount: Math.round(tx.amount * conversion * 100) / 100
    }));
  }

  public async getSpendingBreakdown(userId: string, currency: CurrencyCode = 'INR'): Promise<SpendingCategoryItem[]> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;

    return data.spendingCategories.map((item) => ({
      ...item,
      spentAmount: Math.round(item.spentAmount * conversion * 100) / 100,
      budgetedAmount: Math.round(item.budgetedAmount * conversion * 100) / 100,
      previousMonthAmount: Math.round(item.previousMonthAmount * conversion * 100) / 100
    }));
  }

  public async getFinancialHealth(userId: string, currency: CurrencyCode = 'INR'): Promise<FinancialHealthOverview> {
    const data = this.getUserData(userId);
    void currency;

    const totalAssets = data.assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = data.liabilities.reduce((sum, l) => sum + l.balance, 0);

    const bankAndCash = data.accounts
      .filter((a) => a.accountType === 'CHECKING' || a.accountType === 'SAVINGS' || a.accountType === 'VAULT')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);

    const latestCashFlow = data.cashFlowHistory[data.cashFlowHistory.length - 1] || {
      income: 264200,
      expenses: 118500,
      savings: 50700,
      investments: 95000
    };

    const monthlyIncome = latestCashFlow.income;
    const monthlyExpenses = latestCashFlow.expenses;
    const monthlyDebtPayments = data.liabilities.reduce((sum, l) => sum + l.monthlyEMI, 0);

    // 1. Savings Rate
    const savingsRate = calculateSavingsRate(latestCashFlow.savings + latestCashFlow.investments, monthlyIncome);
    // 2. Expense to Income
    const expenseToIncome = calculateExpenseToIncome(monthlyExpenses, monthlyIncome);
    // 3. Debt to Asset
    const debtToAsset = calculateDebtToAsset(totalLiabilities, totalAssets);
    // 4. Emergency Fund Coverage
    const emergencyMonths = calculateEmergencyFundRunway(bankAndCash, monthlyExpenses);
    // 5. Liquidity Ratio
    const liquidityRatio = calculateLiquidityRatio(bankAndCash, monthlyExpenses);
    // 6. Investment Diversification
    const assetWeights = data.assets.map((a) => a.percentage);
    const diversificationScore = calculateDiversificationScore(assetWeights);
    // 7. Debt to Income (DTI)
    const dtiRatio = calculateDTI(monthlyDebtPayments, monthlyIncome);

    const metrics = [
      {
        id: 'metric-savings-rate',
        name: 'Savings Rate',
        value: savingsRate,
        formattedValue: `${savingsRate}%`,
        benchmark: '>= 25%',
        status: (savingsRate >= 30 ? 'HEALTHY' : savingsRate >= 20 ? 'GOOD' : 'WARNING') as any,
        formula: '(Monthly Savings + Monthly Investments) / Gross Income * 100',
        description: 'Measures the proportion of income directed toward wealth accumulation.',
        guidance: 'You are saving over 50% of your earnings, accelerating financial freedom.'
      },
      {
        id: 'metric-expense-income',
        name: 'Expense-to-Income',
        value: expenseToIncome,
        formattedValue: `${expenseToIncome}%`,
        benchmark: '<= 50%',
        status: (expenseToIncome <= 50 ? 'HEALTHY' : expenseToIncome <= 65 ? 'GOOD' : 'WARNING') as any,
        formula: 'Total Monthly Expenses / Total Monthly Income * 100',
        description: 'Proportion of gross monthly earnings consumed by living expenses.',
        guidance: 'Well within the recommended 50/30/20 spending framework.'
      },
      {
        id: 'metric-debt-asset',
        name: 'Debt-to-Asset Ratio',
        value: debtToAsset,
        formattedValue: `${debtToAsset}%`,
        benchmark: '<= 30%',
        status: (debtToAsset <= 25 ? 'HEALTHY' : debtToAsset <= 40 ? 'GOOD' : 'WARNING') as any,
        formula: 'Total Liabilities / Total Assets * 100',
        description: 'Measures portfolio leverage and debt obligation relative to wealth.',
        guidance: 'Conservative leverage supported primarily by appreciating real estate.'
      },
      {
        id: 'metric-emergency-fund',
        name: 'Emergency Fund Coverage',
        value: emergencyMonths,
        formattedValue: `${emergencyMonths} months`,
        benchmark: '6.0 months',
        status: (emergencyMonths >= 6 ? 'HEALTHY' : emergencyMonths >= 3 ? 'GOOD' : 'WARNING') as any,
        formula: 'Liquid Bank & Cash Balances / Monthly Living Expenses',
        description: 'How many months of survival expenses are covered by cash reserves.',
        guidance: 'Excellent 8-month runway shields against unforeseen market or job shocks.'
      },
      {
        id: 'metric-liquidity-ratio',
        name: 'Liquidity Ratio',
        value: liquidityRatio,
        formattedValue: `${liquidityRatio}x`,
        benchmark: '>= 2.5x',
        status: (liquidityRatio >= 4 ? 'HEALTHY' : liquidityRatio >= 2 ? 'GOOD' : 'CRITICAL') as any,
        formula: 'Liquid Cash & Checking / Monthly Immediate Obligations',
        description: 'Buffer multiplier for immediate cash demands without liquidating equities.',
        guidance: 'Comfortable cushion ensures no forced liquidations during drawdowns.'
      },
      {
        id: 'metric-diversification',
        name: 'Investment Diversification',
        value: diversificationScore,
        formattedValue: `${diversificationScore}/100`,
        benchmark: '>= 75',
        status: (diversificationScore >= 80 ? 'HEALTHY' : diversificationScore >= 60 ? 'GOOD' : 'WARNING') as any,
        formula: 'Normalized Inverse Herfindahl Concentration across 9 Asset Classes',
        description: 'Spreads capital across Indian/US equities, Gold, Real Estate, and Bonds.',
        guidance: 'High asset-class dispersion significantly lowers single-market systemic risk.'
      },
      {
        id: 'metric-dti',
        name: 'Debt-to-Income (DTI)',
        value: dtiRatio,
        formattedValue: `${dtiRatio}%`,
        benchmark: '<= 36%',
        status: (dtiRatio <= 30 ? 'HEALTHY' : dtiRatio <= 40 ? 'GOOD' : 'CRITICAL') as any,
        formula: 'Total Monthly Debt EMIs / Gross Monthly Income * 100',
        description: 'Determines borrowing capacity, solvency, and mortgage underwriting health.',
        guidance: 'DTI is below 30%, which is considered top-tier creditworthy by institutional lenders.'
      }
    ];

    return {
      overallScore: 92,
      status: 'HEALTHY',
      metrics
    };
  }

  public async getUpcomingEvents(userId: string): Promise<UpcomingFinancialEvent[]> {
    const data = this.getUserData(userId);
    return data.upcomingEvents;
  }

  public async getInsights(userId: string, currency: CurrencyCode = 'INR'): Promise<DashboardFinancialInsight[]> {
    const data = this.getUserData(userId);
    const conversion = INR_CONVERSIONS[currency] || 1;

    return data.insights.map((ins) => ({
      ...ins,
      impactAmount: ins.impactAmount ? Math.round(ins.impactAmount * conversion * 100) / 100 : undefined
    }));
  }

  public async quickAdd(userId: string, payload: QuickAddPayload): Promise<{ success: boolean; message: string; recordId: string }> {
    const data = this.getUserData(userId);
    const id = `rec-${Date.now()}`;
    const dateStr = payload.date || getIsoDate();

    logger.info(`Quick-add requested by user ${userId}: ${payload.type} for amount ${payload.amount}`);

    switch (payload.type) {
      case 'EXPENSE': {
        // Record in transactions
        data.transactions.unshift({
          id,
          date: dateStr,
          description: payload.title,
          category: payload.category || 'Discretionary',
          accountName: payload.accountId || 'HDFC Classic Salary',
          amount: -Math.abs(payload.amount),
          type: 'EXPENSE',
          status: 'POSTED'
        });

        // Deduct from matching account
        const acc = data.accounts.find((a) => a.id === payload.accountId || a.name.includes('Salary') || a.accountType === 'CHECKING');
        if (acc) {
          acc.balance -= Math.abs(payload.amount);
        }

        // Add to spending breakdown
        const sp = data.spendingCategories.find((c) => c.category.toLowerCase().includes((payload.category || '').toLowerCase()));
        if (sp) {
          sp.spentAmount += Math.abs(payload.amount);
          sp.percentageUsed = Math.round((sp.spentAmount / sp.budgetedAmount) * 1000) / 10;
        }
        break;
      }

      case 'INCOME': {
        data.transactions.unshift({
          id,
          date: dateStr,
          description: payload.title,
          category: payload.category || 'Income',
          accountName: payload.accountId || 'HDFC Classic Salary',
          amount: Math.abs(payload.amount),
          type: 'INCOME',
          status: 'POSTED'
        });

        const acc = data.accounts.find((a) => a.id === payload.accountId || a.accountType === 'CHECKING');
        if (acc) {
          acc.balance += Math.abs(payload.amount);
        }
        break;
      }

      case 'TRANSFER': {
        // Double-counting prevention: Internal transfer between accounts does NOT change Net Worth or Income/Expense!
        data.transactions.unshift({
          id,
          date: dateStr,
          description: `Transfer: ${payload.title}`,
          category: 'Transfer',
          accountName: payload.accountId || 'HDFC Classic Salary',
          amount: -Math.abs(payload.amount),
          type: 'TRANSFER',
          status: 'POSTED'
        });

        const fromAcc = data.accounts.find((a) => a.id === payload.accountId);
        const toAcc = data.accounts.find((a) => a.id === payload.toAccountId);
        if (fromAcc) fromAcc.balance -= Math.abs(payload.amount);
        if (toAcc) toAcc.balance += Math.abs(payload.amount);
        break;
      }

      case 'INVESTMENT': {
        // Double-counting prevention: Investment purchase reduces cash and increases asset
        data.transactions.unshift({
          id,
          date: dateStr,
          description: `Investment: ${payload.title}`,
          category: 'Investment Purchase',
          accountName: payload.accountId || 'SBI Wealth Privilege Savings',
          amount: -Math.abs(payload.amount),
          type: 'INVESTMENT',
          status: 'POSTED'
        });

        // Deduct funding account
        const fundingAcc = data.accounts.find((a) => a.id === payload.accountId);
        if (fundingAcc) fundingAcc.balance -= Math.abs(payload.amount);

        // Add to matching asset class
        const targetCategory = payload.assetClass || 'INDIAN_STOCKS';
        const targetAsset = data.assets.find((a) => a.category === targetCategory);
        if (targetAsset) {
          targetAsset.amount += Math.abs(payload.amount);
        } else {
          data.assets.push({
            id: `ast-${Date.now()}`,
            category: targetCategory,
            label: payload.title,
            amount: Math.abs(payload.amount),
            percentage: 0,
            color: '#3B82F6'
          });
        }
        break;
      }

      case 'ASSET': {
        const cat = payload.assetClass || 'OTHER';
        data.assets.push({
          id,
          category: cat,
          label: payload.title,
          amount: Math.abs(payload.amount),
          percentage: 0,
          color: '#10B981'
        });
        break;
      }

      case 'LIABILITY': {
        const liaType = payload.liabilityType || 'OTHER_DEBT';
        data.liabilities.push({
          id,
          type: liaType,
          label: payload.title,
          lender: payload.notes || 'Institutional Lender',
          balance: Math.abs(payload.amount),
          percentage: 0,
          interestRate: payload.interestRate || 8.5,
          monthlyEMI: Math.round((Math.abs(payload.amount) * 0.012) * 100) / 100,
          color: '#EF4444'
        });
        break;
      }
    }

    // Synchronize bank accounts aggregate in assets table to prevent double counting
    const currentBankSum = data.accounts
      .filter((a) => a.accountType === 'CHECKING' || a.accountType === 'SAVINGS')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
    const bankAsset = data.assets.find((a) => a.category === 'BANK_ACCOUNTS');
    if (bankAsset) {
      bankAsset.amount = currentBankSum;
    }

    // Update latest Net Worth Snapshot
    const currentAssets = data.assets.reduce((s, a) => s + a.amount, 0);
    const currentLiabs = data.liabilities.reduce((s, l) => s + l.balance, 0);
    const nw = calculateNetWorth(currentAssets, currentLiabs);

    data.netWorthSnapshots.push({
      date: new Date().toISOString(),
      formattedDate: 'Today',
      netWorth: nw,
      assets: currentAssets,
      liabilities: currentLiabs,
      event: { title: `Recorded: ${payload.title}`, type: 'INVESTMENT_PURCHASE' }
    });

    return {
      success: true,
      message: `Successfully recorded ${payload.type.toLowerCase()} record: "${payload.title}"`,
      recordId: id
    };
  }

  public async getPreferences(userId: string): Promise<DashboardPreferences> {
    const data = this.getUserData(userId);
    return data.preferences;
  }

  public async updatePreferences(userId: string, newPrefs: Partial<DashboardPreferences>): Promise<DashboardPreferences> {
    const data = this.getUserData(userId);
    data.preferences = {
      ...data.preferences,
      ...newPrefs,
      widgetVisibility: {
        ...data.preferences.widgetVisibility,
        ...(newPrefs.widgetVisibility || {})
      }
    };
    return data.preferences;
  }

  public async resetToZero(userId: string): Promise<void> {
    const zeroData: UserFinancialData = {
      accounts: [],
      transactions: [],
      assets: [],
      liabilities: [],
      cashFlowHistory: [],
      netWorthSnapshots: [
        { date: new Date().toISOString(), formattedDate: 'Today', netWorth: 0, assets: 0, liabilities: 0 }
      ],
      spendingCategories: [],
      upcomingEvents: [],
      insights: [],
      preferences: {
        widgetVisibility: {
          netWorth: true,
          summaryCards: true,
          portfolioPerformance: true,
          assetAllocation: true,
          liabilityDistribution: true,
          cashFlow: true,
          accountsOverview: true,
          recentTransactions: true,
          spendingBreakdown: true,
          financialHealth: true,
          upcomingEvents: true,
          financialInsights: true
        },
        widgetOrder: [
          'netWorth',
          'summaryCards',
          'portfolioPerformance',
          'assetAllocation',
          'liabilityDistribution',
          'cashFlow',
          'accountsOverview',
          'recentTransactions',
          'spendingBreakdown',
          'financialHealth',
          'upcomingEvents',
          'financialInsights'
        ],
        defaultPeriod: '30d',
        preferredCurrency: 'INR'
      }
    };
    this.userStore.set(userId, zeroData);
  }
}

export const dashboardService = new DashboardService();
