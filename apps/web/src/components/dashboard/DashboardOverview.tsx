import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { NetWorthCard } from '../financial/NetWorthCard';
import { AccountBalanceCard } from '../financial/AccountBalanceCard';
import { CashFlowSummaryCard } from '../financial/CashFlowSummaryCard';
import { InvestmentPerformanceCard } from '../financial/InvestmentPerformanceCard';
import { AssetAllocationDonut } from '../financial/AssetAllocationDonut';
import { NetWorthAreaChart } from '../financial/NetWorthAreaChart';
import { CashFlowBarChart } from '../financial/CashFlowBarChart';
import { GoalProgressCard } from '../financial/GoalProgressCard';
import { Table, Column } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChartContainer } from '../ui/ChartContainer';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Download,
  Sparkles,
  ArrowUpRight,
  Briefcase,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { FinancialAccount, FinancialTransaction, FinancialGoal } from '@finance/types';

export const DashboardOverview: React.FC = () => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const { toast } = useToast();

  const [timeRange, setTimeRange] = useState<string>('6M');

  // Sample High-Fidelity Data
  const sampleAccounts: FinancialAccount[] = [
    {
      id: 'acc-1',
      userId: 'user-1',
      name: 'Primary Checking',
      accountType: 'CHECKING',
      category: 'DEPOSITORY',
      currency: 'USD',
      currentBalance: 8450.25,
      availableBalance: 8450.25,
      institutionName: 'JPMorgan Chase',
      accountNumberMasked: '•••• 4821',
      status: 'ACTIVE',
      isManual: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-11-04T00:00:00Z'
    },
    {
      id: 'acc-2',
      userId: 'user-1',
      name: 'High Yield Savings',
      accountType: 'SAVINGS',
      category: 'DEPOSITORY',
      currency: 'USD',
      currentBalance: 35200.8,
      availableBalance: 35200.8,
      interestRate: 4.85,
      institutionName: 'Marcus by Goldman',
      accountNumberMasked: '•••• 9014',
      status: 'ACTIVE',
      isManual: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-11-04T00:00:00Z'
    },
    {
      id: 'acc-3',
      userId: 'user-1',
      name: 'Sapphire Preferred',
      accountType: 'CREDIT_CARD',
      category: 'CREDIT',
      currency: 'USD',
      currentBalance: 1240.5,
      creditLimit: 15000.0,
      institutionName: 'Chase Card Services',
      accountNumberMasked: '•••• 3389',
      status: 'ACTIVE',
      isManual: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-11-04T00:00:00Z'
    }
  ];

  const netWorthHistoricalData = [
    { label: 'Jun', value: 468000 },
    { label: 'Jul', value: 479200 },
    { label: 'Aug', value: 491500 },
    { label: 'Sep', value: 504800 },
    { label: 'Oct', value: 512400 },
    { label: 'Nov', value: 520680 }
  ];

  const monthlyCashFlowData = [
    { month: 'Jun', income: 10400, expenses: 6200 },
    { month: 'Jul', income: 10400, expenses: 6450 },
    { month: 'Aug', income: 11200, expenses: 6100 },
    { month: 'Sep', income: 10400, expenses: 6800 },
    { month: 'Oct', income: 10400, expenses: 6350 },
    { month: 'Nov', income: 10400, expenses: 5845 }
  ];

  const assetAllocationItems = [
    { id: '1', name: 'US Equities', value: 37419.5, color: colors.assetClasses.equity },
    { id: '2', name: 'Index ETFs', value: 29100.0, color: colors.assetClasses.etfs },
    { id: '3', name: 'Mutual Funds', value: 25610.0, color: colors.assetClasses.mutualFunds },
    { id: '4', name: 'Bitcoin (Crypto)', value: 25200.0, color: colors.assetClasses.crypto },
    { id: '5', name: 'Treasury Bonds', value: 10050.0, color: colors.assetClasses.fixedIncome },
    { id: '6', name: 'Vaulted Gold', value: 5070.5, color: colors.assetClasses.preciousMetals }
  ];

  const sampleGoal: FinancialGoal = {
    id: 'goal-1',
    userId: 'user-1',
    title: '6-Month Emergency Fund',
    category: 'EMERGENCY_FUND',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    targetAmount: 50000.0,
    currentAmount: 35200.8,
    currency: 'USD',
    targetDate: '2027-06-30T00:00:00Z',
    monthlyContributionTarget: 1000.0,
    milestones: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-11-04T00:00:00Z'
  };

  const sampleTransactions: FinancialTransaction[] = [
    {
      id: 'tx-1',
      userId: 'user-1',
      accountId: 'acc-1',
      type: 'INCOME',
      status: 'POSTED',
      amount: 5200.0,
      currency: 'USD',
      date: '2026-11-01T09:00:00Z',
      description: 'Bi-Weekly Payroll Direct Deposit',
      merchantName: 'Acme Global Technologies Inc',
      tags: ['salary', 'primary'],
      isRecurring: true,
      createdAt: '2026-11-01T09:00:00Z',
      updatedAt: '2026-11-01T09:00:00Z'
    },
    {
      id: 'tx-2',
      userId: 'user-1',
      accountId: 'acc-3',
      type: 'EXPENSE',
      status: 'POSTED',
      amount: 142.5,
      currency: 'USD',
      date: '2026-11-02T14:30:00Z',
      description: 'Whole Foods Market (Groceries)',
      merchantName: 'Whole Foods',
      tags: ['groceries', 'food'],
      isRecurring: false,
      createdAt: '2026-11-02T14:30:00Z',
      updatedAt: '2026-11-02T14:30:00Z'
    },
    {
      id: 'tx-3',
      userId: 'user-1',
      accountId: 'acc-1',
      type: 'TRANSFER',
      status: 'POSTED',
      amount: 1000.0,
      currency: 'USD',
      date: '2026-11-03T10:15:00Z',
      description: 'Automated Savings Transfer to Marcus HYSA',
      tags: ['savings'],
      isRecurring: true,
      createdAt: '2026-11-03T10:15:00Z',
      updatedAt: '2026-11-03T10:15:00Z'
    },
    {
      id: 'tx-4',
      userId: 'user-1',
      accountId: 'acc-1',
      type: 'DIVIDEND',
      status: 'POSTED',
      amount: 41.6,
      currency: 'USD',
      date: '2026-11-03T16:00:00Z',
      description: 'Apple Inc. (AAPL) Q3 Dividend',
      tags: ['dividend', 'investment'],
      isRecurring: false,
      createdAt: '2026-11-03T16:00:00Z',
      updatedAt: '2026-11-03T16:00:00Z'
    },
    {
      id: 'tx-5',
      userId: 'user-1',
      accountId: 'acc-3',
      type: 'EXPENSE',
      status: 'POSTED',
      amount: 85.0,
      currency: 'USD',
      date: '2026-11-04T08:15:00Z',
      description: 'City Electric & Utilities Bill',
      tags: ['utilities'],
      isRecurring: true,
      createdAt: '2026-11-04T08:15:00Z',
      updatedAt: '2026-11-04T08:15:00Z'
    }
  ];

  const columns: Column<FinancialTransaction>[] = [
    {
      key: 'description',
      header: 'Description / Merchant',
      render: (tx) => {
        const isInc = tx.type === 'INCOME';
        const isTransfer = tx.type === 'TRANSFER';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: isInc
                  ? colors.financial.incomeBg
                  : isTransfer
                  ? colors.brand.primaryMuted
                  : colors.financial.expenseBg,
                color: isInc
                  ? colors.financial.incomeText
                  : isTransfer
                  ? colors.brand.primaryLight
                  : colors.financial.expenseText,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isInc ? <Briefcase size={14} /> : isTransfer ? <ArrowUpRight size={14} /> : <ShoppingBag size={14} />}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.text.primary }}>{tx.description}</div>
              <div style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px' }}>
                {tx.merchantName ? tx.merchantName : 'Electronic Transfer'}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'type',
      header: 'Type',
      render: (tx) => {
        const isInc = tx.type === 'INCOME';
        const isTransfer = tx.type === 'TRANSFER';
        return (
          <Badge variant={isInc ? 'income' : isTransfer ? 'brand' : 'expense'} size="sm">
            {tx.type}
          </Badge>
        );
      }
    },
    {
      key: 'date',
      header: 'Date',
      render: (tx) => (
        <span style={{ color: colors.text.secondary }}>
          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (tx) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.financial.incomeText }}>
          <CheckCircle2 size={12} color={colors.financial.income} />
          <span>{tx.status}</span>
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (tx) => {
        const isInc = tx.type === 'INCOME';
        const isTransfer = tx.type === 'TRANSFER';
        return (
          <span
            style={{
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: isInc
                ? colors.financial.incomeText
                : isTransfer
                ? colors.text.primary
                : colors.financial.expenseText
            }}
          >
            {isInc ? '+' : isTransfer ? '' : '-'}
            {formatMoney(tx.amount)}
          </span>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Dashboard Top Header Greeting */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: colors.text.primary }}>
              Welcome back, Alex Morgan
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: colors.financial.incomeText,
                backgroundColor: colors.financial.incomeBg,
                border: `1px solid ${colors.financial.incomeBorder}`,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={11} />
              <span>Real-time Sync Active</span>
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
            Wealth portfolio net asset value aggregated across 3 financial institutions and 6 asset classes.
          </p>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={() => toast.info('Export Initiated', 'Generating comprehensive portfolio statement PDF...')}
          >
            Export Statement
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.success('Connection Hub', 'Opening Open Banking institution selector...')}
          >
            Connect Account
          </Button>
        </div>
      </div>

      {/* Row 1: Core Key Financial Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        <NetWorthCard
          totalAssets={1160371.05}
          totalLiabilities={639690.5}
          periodChangeAmount={24500.0}
          periodChangePercentage={4.82}
          periodLabel="Last 30 Days"
        />

        <CashFlowSummaryCard
          income={10400.0}
          expenses={5845.2}
          periodLabel="November 2026"
        />

        <InvestmentPerformanceCard
          portfolioName="Global Wealth Portfolio"
          totalValue={132450.0}
          unrealizedGainLoss={27950.0}
          unrealizedPercentage={26.75}
          dayChangeAmount={1240.5}
          dayChangePercentage={0.95}
          holdingsCount={6}
        />
      </div>

      {/* Row 2: Performance Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Net Worth Performance Area Chart */}
        <ChartContainer
          title="Net Worth Growth Trajectory"
          subtitle="6-Month historical performance with inflation-adjusted trajectory"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          legend={
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: colors.text.secondary }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.brand.primaryLight }} />
                <span>Net Portfolio Value</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 2, backgroundColor: colors.financial.income }} />
                <span>Compound Benchmark</span>
              </span>
            </div>
          }
        >
          <NetWorthAreaChart data={netWorthHistoricalData} height={240} />
        </ChartContainer>

        {/* Monthly Cash Flow Bar Chart */}
        <ChartContainer
          title="Monthly Cash Inflow vs Outflow"
          subtitle="Income vs expenses with 43.8% target savings discipline"
          legend={
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: colors.text.secondary }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: colors.financial.income }} />
                <span>Monthly Income</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: colors.financial.expense }} />
                <span>Monthly Expenses</span>
              </span>
            </div>
          }
        >
          <CashFlowBarChart data={monthlyCashFlowData} height={240} />
        </ChartContainer>
      </div>

      {/* Row 3: Connected Accounts Ledger Carousel & Asset Allocation Donut */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Left Column: Depository & Credit Accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text.primary }}>
                Connected Accounts
              </div>
              <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                Real-time depository, savings, and credit ledger
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Transfer', 'Open funds transfer wizard...')}
            >
              Transfer Funds
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sampleAccounts.map((acc) => (
              <AccountBalanceCard
                key={acc.id}
                account={acc}
                onTransfer={(a) => toast.info('Transfer', `Initiating transfer from ${a.name}...`)}
                onViewDetails={(a) => toast.info('Account Details', `Viewing statement history for ${a.name}...`)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Asset Allocation Donut Visualization */}
        <AssetAllocationDonut
          items={assetAllocationItems}
          title="Wealth Asset Allocation"
          subtitle="Portfolio balance across equities, fixed income, crypto & gold"
        />
      </div>

      {/* Row 4: Recent Transactions Ledger Table & Goals / Budget Tracker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Left: Transactions Table */}
        <div
          style={{
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text.primary }}>
                Recent Transactions
              </div>
              <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                Latest debits, credits, and dividends across linked institutions
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.info('Filter View', 'Filtering posted transactions...')}
            >
              View All (28)
            </Button>
          </div>

          <Table
            columns={columns}
            data={sampleTransactions}
            keyExtractor={(item) => item.id}
            onRowClick={(tx) => toast.info('Transaction Selected', `${tx.description} - $${tx.amount.toFixed(2)}`)}
          />
        </div>

        {/* Right: Goals & Budget Health Meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Financial Goal Card */}
          <GoalProgressCard goal={sampleGoal} />

          {/* Budget Health Tracker */}
          <div
            style={{
              backgroundColor: colors.bg.surface,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
                  November Spending Budget
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                  {formatMoney(1845.2)} of {formatMoney(5000.0)} limit used (36.9%)
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: colors.financial.incomeBg,
                  color: colors.financial.incomeText,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                On Track
              </span>
            </div>

            <ProgressBar value={36.9} color={colors.financial.income} height={8} />

            {/* Category Sub-Budgets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: colors.text.primary }}>Groceries & Dining</span>
                  <span style={{ color: colors.text.secondary, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(430.5)} / {formatMoney(1200.0)}
                  </span>
                </div>
                <ProgressBar value={35.8} color={colors.financial.asset} height={5} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: colors.text.primary }}>Utilities & Subscriptions</span>
                  <span style={{ color: colors.text.secondary, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(310.0)} / {formatMoney(600.0)}
                  </span>
                </div>
                <ProgressBar value={51.6} color={colors.financial.liability} height={5} />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
