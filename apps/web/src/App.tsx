import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { NavItemKey } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { Input } from './components/ui/Input';
import { Table } from './components/ui/Table';
import { Tabs } from './components/ui/Tabs';
import { ProgressBar } from './components/ui/ProgressBar';
import { EmptyState } from './components/ui/EmptyState';
import { DateRangeSelector } from './components/ui/DateRangeSelector';
import { SearchableSelect } from './components/ui/SearchableSelect';
import { DatePicker } from './components/ui/DatePicker';
import { FinancialMetricBadge } from './components/financial/FinancialMetricBadge';
import { PortfolioHoldingRow, PortfolioHolding } from './components/financial/PortfolioHoldingRow';
import { ProfitLossIndicator } from './components/financial/ProfitLossIndicator';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { VerifyEmailScreen } from './components/auth/VerifyEmailScreen';
import { PhoneOtpScreen } from './components/auth/PhoneOtpScreen';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import { AccountRecoveryScreen } from './components/auth/AccountRecoveryScreen';
import { UserProfileView } from './components/user/UserProfileView';
import { AccountSecurityView } from './components/user/AccountSecurityView';
import { apiClient } from './api';
import { HealthCheckResponse } from '@finance/types';
import {
  calculateCompoundInterest,
  calculateLoanEMI,
  formatCurrency,
  formatPercentage
} from '@finance/utils';
import {
  CheckCircle2,
  RefreshCw,
  Plus,
  Download,
  Search,
  Layers,
  Cpu,
  FileText,
  LogIn
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const { toast } = useToast();
  const { user, isAuthenticated, authView, setAuthView } = useAuth();

  const [activeNav, setActiveNav] = useState<NavItemKey>('overview');
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security'>('profile');
  const [showFoundationModal, setShowFoundationModal] = useState<boolean>(false);
  const [holdingTimeframe, setHoldingTimeframe] = useState<string>('ytd');
  const [selectedTxAccount, setSelectedTxAccount] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Health and Foundation state from Step 01
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  // Financial Math Simulator state
  const [principal, setPrincipal] = useState<number>(25000);
  const [rate, setRate] = useState<number>(8.5);
  const years = 10;
  const monthlyContribution = 500;

  const compoundResult = calculateCompoundInterest(
    principal,
    rate / 100,
    years,
    12,
    monthlyContribution * 12
  );
  const emiResult = calculateLoanEMI(400000, 0.065, 360);

  const fetchHealth = async () => {
    try {
      const res = await apiClient.health.check();
      setHealth(res.data);
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Full-screen Authentication Flows
  if (authView === 'login') return <LoginScreen />;
  if (authView === 'register') return <RegisterScreen />;
  if (authView === 'forgot-password') return <ForgotPasswordScreen />;
  if (authView === 'reset-password') return <ResetPasswordScreen />;
  if (authView === 'verify-email') return <VerifyEmailScreen />;
  if (authView === 'phone-otp') return <PhoneOtpScreen />;
  if (authView === 'onboarding') return <OnboardingWizard />;
  if (authView === 'recovery') return <AccountRecoveryScreen />;

  const sampleHoldings: PortfolioHolding[] = [
    {
      id: 'h-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      assetClass: 'EQUITY',
      quantity: 80,
      costBasis: 172.50,
      currentPrice: 230.62,
      currentValue: 18450.00,
      unrealizedGainLoss: 4650.00,
      unrealizedGainLossPercentage: 33.69
    },
    {
      id: 'h-2',
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      assetClass: 'ETF',
      quantity: 65,
      costBasis: 410.00,
      currentPrice: 447.69,
      currentValue: 29100.00,
      unrealizedGainLoss: 2450.00,
      unrealizedGainLossPercentage: 9.19
    },
    {
      id: 'h-3',
      symbol: 'BTC',
      name: 'Bitcoin (Cold Storage Vault)',
      assetClass: 'CRYPTO',
      quantity: 0.38,
      costBasis: 42000.00,
      currentPrice: 66315.78,
      currentValue: 25200.00,
      unrealizedGainLoss: 9240.00,
      unrealizedGainLossPercentage: 57.90
    },
    {
      id: 'h-4',
      symbol: 'US-10Y',
      name: 'US Treasury 10-Yr Benchmark',
      assetClass: 'BOND',
      quantity: 10,
      costBasis: 1000.00,
      currentPrice: 1005.00,
      currentValue: 10050.00,
      unrealizedGainLoss: 50.00,
      unrealizedGainLossPercentage: 0.50
    },
    {
      id: 'h-5',
      symbol: 'XAU',
      name: 'Physical Allocated Gold (Zurich)',
      assetClass: 'PRECIOUS_METAL',
      quantity: 2.1,
      costBasis: 2150.00,
      currentPrice: 2414.52,
      currentValue: 5070.50,
      unrealizedGainLoss: 555.50,
      unrealizedGainLossPercentage: 12.30
    }
  ];

  // Render individual navigation view prototypes using design system components
  const renderModuleView = () => {
    switch (activeNav) {
      case 'overview':
        return <DashboardOverview />;

      case 'settings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
                  Account Settings & Security
                </h1>
                <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
                  Manage profile information, regional preferences, and active security sessions.
                </p>
              </div>

              <div style={{ width: '320px' }}>
                <Tabs
                  tabs={[
                    { id: 'profile', label: 'User Profile' },
                    { id: 'security', label: 'Security & Sessions' }
                  ]}
                  activeTab={settingsTab}
                  onChange={(id) => setSettingsTab(id as 'profile' | 'security')}
                  variant="pill"
                />
              </div>
            </div>

            {settingsTab === 'profile' ? <UserProfileView /> : <AccountSecurityView />}
          </div>
        );

      case 'accounts':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
                  Connected Accounts & Institutions
                </h1>
                <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
                  Manage depository checking, savings, credit lines, and brokerage accounts.
                </p>
              </div>
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => toast.success('Link Institution', 'Initiating Plaid/Open Banking link dialog...')}
              >
                Connect New Account
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <Card title="Depository Checking" subtitle="JPMorgan Chase •••• 4821">
                <div style={{ margin: '14px 0' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(8450.25)}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.financial.incomeText, marginTop: '4px' }}>
                    Available balance • Direct Deposit linked
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${colors.border.subtle}`, paddingTop: '12px' }}>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Transfer', 'Open transfer modal')}>Transfer</Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info('Statement', 'Download statement')}>Statement</Button>
                </div>
              </Card>

              <Card title="High Yield Savings" subtitle="Marcus by Goldman •••• 9014">
                <div style={{ margin: '14px 0' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: colors.financial.incomeText, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(35200.80)}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '4px' }}>
                    4.85% APY • Accrued this month: $142.10
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${colors.border.subtle}`, paddingTop: '12px' }}>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Deposit', 'Automate monthly recurring deposit')}>Deposit</Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info('Interest', 'View interest breakdown')}>Interest</Button>
                </div>
              </Card>

              <Card title="Sapphire Preferred" subtitle="Chase Card Services •••• 3389">
                <div style={{ margin: '14px 0' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: colors.financial.liability, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(1240.50)}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '4px' }}>
                    Limit: $15,000 • Due in 14 days
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${colors.border.subtle}`, paddingTop: '12px' }}>
                  <Button variant="primary" size="sm" onClick={() => toast.success('Payment', 'Schedule full balance payoff')}>Pay Balance</Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info('Transactions', 'View card debits')}>History</Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'investments':
      case 'portfolio':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
                  Investment Portfolio & Assets
                </h1>
                <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
                  Multi-asset performance across equities, ETFs, crypto, fixed income, and vaulted bullion.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DateRangeSelector
                  value={holdingTimeframe}
                  onChange={(val) => setHoldingTimeframe(val as string)}
                  size="sm"
                />
                <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>Add Holding</Button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <Card title="Total Portfolio Value">
                <div style={{ fontSize: '28px', fontWeight: 800, color: colors.text.primary }}>
                  {formatMoney(132450.00)}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <ProfitLossIndicator amount={27950.00} percentage={26.75} timeframe="All Time" showBackground />
                </div>
              </Card>

              <Card title="Daily P&L">
                <div style={{ fontSize: '28px', fontWeight: 800, color: colors.financial.incomeText }}>
                  +{formatMoney(1240.50)}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <ProfitLossIndicator amount={1240.50} percentage={0.95} timeframe="Today" showBackground />
                </div>
              </Card>

              <Card title="Diversification Score">
                <div style={{ fontSize: '28px', fontWeight: 800, color: colors.brand.primaryLight }}>
                  94 / 100
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '8px' }}>
                  Optimal multi-asset risk parity
                </div>
              </Card>
            </div>

            <Card title="Portfolio Holding Breakdown (5 Assets)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sampleHoldings.map((holding) => (
                  <PortfolioHoldingRow
                    key={holding.id}
                    holding={holding}
                    onClick={(h) => toast.info('Holding Selected', `${h.name} (${h.symbol}) - ${formatMoney(h.currentValue)}`)}
                  />
                ))}
              </div>
            </Card>
          </div>
        );

      case 'transactions':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
                  Transactions & Cash Flow Ledger
                </h1>
                <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
                  Unified double-entry records with categorization, receipt tags, and reconciliation status.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="secondary" leftIcon={<Download size={15} />}>Export CSV</Button>
                <Button variant="primary" leftIcon={<Plus size={15} />}>Add Transaction</Button>
              </div>
            </div>

            <Card>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
                <div style={{ maxWidth: '300px', width: '100%' }}>
                  <Input placeholder="Search descriptions..." leftIcon={<Search size={16} />} />
                </div>

                <div style={{ width: '220px' }}>
                  <SearchableSelect
                    options={[
                      { value: 'all', label: 'All Accounts' },
                      { value: 'chase-check', label: 'Chase Checking', subLabel: '•••• 4821' },
                      { value: 'marcus-hysa', label: 'Marcus HYSA', subLabel: '•••• 9014' },
                      { value: 'chase-card', label: 'Sapphire Preferred', subLabel: '•••• 3389' }
                    ]}
                    value={selectedTxAccount}
                    onChange={(v) => setSelectedTxAccount(v)}
                    placeholder="Filter by Account"
                  />
                </div>

                <div style={{ width: '180px' }}>
                  <DatePicker
                    value={filterDate}
                    onChange={(d) => setFilterDate(d)}
                    placeholder="Filter by Date"
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <Badge variant="brand" size="md">All (28)</Badge>
                  <Badge variant="income" size="md">Income (6)</Badge>
                  <Badge variant="expense" size="md">Expenses (19)</Badge>
                </div>
              </div>

              <Table
                columns={[
                  { key: 'date', header: 'Date', render: (tx: any) => tx.date },
                  { key: 'desc', header: 'Description', render: (tx: any) => <b>{tx.desc}</b> },
                  { key: 'category', header: 'Category', render: (tx: any) => <Badge variant="neutral" size="sm">{tx.category}</Badge> },
                  { key: 'account', header: 'Account', render: (tx: any) => <span style={{ color: colors.text.secondary }}>{tx.account}</span> },
                  { key: 'status', header: 'Status', render: (tx: any) => (
                    <span style={{ color: colors.financial.incomeText, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> {tx.status}
                    </span>
                  )},
                  { key: 'amount', header: 'Amount', align: 'right', render: (tx: any) => (
                    <span style={{ fontWeight: 700, color: tx.amount > 0 ? colors.financial.incomeText : colors.financial.expenseText }}>
                      {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount)}
                    </span>
                  )}
                ]}
                data={[
                  { date: 'Nov 04, 2026', desc: 'City Electric Utility', category: 'Utilities', account: 'Chase Sapphire', status: 'POSTED', amount: -85.00 },
                  { date: 'Nov 03, 2026', desc: 'Apple Inc. Dividend', category: 'Investment', account: 'Chase Checking', status: 'POSTED', amount: 41.60 },
                  { date: 'Nov 03, 2026', desc: 'Savings Deposit to Marcus', category: 'Transfer', account: 'Marcus HYSA', status: 'POSTED', amount: 1000.00 },
                  { date: 'Nov 02, 2026', desc: 'Whole Foods Market', category: 'Groceries', account: 'Chase Sapphire', status: 'POSTED', amount: -142.50 },
                  { date: 'Nov 01, 2026', desc: 'Acme Technologies Payroll', category: 'Salary', account: 'Chase Checking', status: 'POSTED', amount: 5200.00 }
                ]}
                keyExtractor={(_item: any, index: number) => index.toString()}
              />
            </Card>
          </div>
        );

      case 'budgets':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
                  Budgets & Spending Discipline
                </h1>
                <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
                  Track category caps, recurring allowances, and real-time envelope balances.
                </p>
              </div>
              <Button variant="primary" leftIcon={<Plus size={15} />}>Create Budget</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <Card title="Groceries & Dining" subtitle="$1,200 Monthly Cap">
                <div style={{ margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: colors.text.secondary }}>Spent: {formatMoney(430.50)}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.financial.incomeText }}>Remaining: {formatMoney(769.50)}</span>
                  </div>
                  <ProgressBar value={35.8} color={colors.financial.income} height={10} />
                </div>
                <div style={{ fontSize: '12px', color: colors.text.muted }}>35.8% used • 26 days left in cycle</div>
              </Card>

              <Card title="Housing & Utilities" subtitle="$2,400 Monthly Cap">
                <div style={{ margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: colors.text.secondary }}>Spent: {formatMoney(2100.00)}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.financial.liability }}>Remaining: {formatMoney(300.00)}</span>
                  </div>
                  <ProgressBar value={87.5} color={colors.financial.liability} height={10} />
                </div>
                <div style={{ fontSize: '12px', color: colors.text.muted }}>87.5% used • Rent paid on 1st</div>
              </Card>

              <Card title="Entertainment & Leisure" subtitle="$500 Monthly Cap">
                <div style={{ margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: colors.text.secondary }}>Spent: {formatMoney(115.00)}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.financial.incomeText }}>Remaining: {formatMoney(385.00)}</span>
                  </div>
                  <ProgressBar value={23.0} color={colors.financial.income} height={10} />
                </div>
                <div style={{ fontSize: '12px', color: colors.text.muted }}>23.0% used • On track</div>
              </Card>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
                  Financial Goals & Milestones
                </h1>
                <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
                  Target date wealth planning, automated savings earmarks, and debt payoff milestones.
                </p>
              </div>
              <Button variant="primary" leftIcon={<Plus size={15} />}>Add Goal</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              <Card title="6-Month Emergency Vault" subtitle="Target: $50,000 • Due June 2027">
                <div style={{ margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: colors.text.primary }}>{formatMoney(35200.80)}</span>
                    <Badge variant="income" size="sm">70.4% Funded</Badge>
                  </div>
                  <ProgressBar value={70.4} color={colors.brand.primary} height={10} />
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary }}>
                  Remaining: {formatMoney(14799.20)} • $1,000/mo automated deposit to Marcus HYSA
                </div>
              </Card>

              <Card title="Real Estate Down Payment" subtitle="Target: $120,000 • Due Dec 2028">
                <div style={{ margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: colors.text.primary }}>{formatMoney(48000.00)}</span>
                    <Badge variant="brand" size="sm">40.0% Funded</Badge>
                  </div>
                  <ProgressBar value={40.0} color={colors.brand.accent} height={10} />
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary }}>
                  Remaining: {formatMoney(72000.00)} • Earmarked across index ETFs
                </div>
              </Card>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
                  Secure Document Vault
                </h1>
                <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
                  AES-256 encrypted storage for tax filings, bank statements, deed titles, and trust deeds.
                </p>
              </div>
              <Button variant="primary" leftIcon={<Plus size={15} />}>Upload Document</Button>
            </div>

            <Card>
              <Table
                columns={[
                  { key: 'name', header: 'Document Title', render: (d: any) => <b>{d.name}</b> },
                  { key: 'category', header: 'Category', render: (d: any) => <Badge variant="neutral" size="sm">{d.category}</Badge> },
                  { key: 'date', header: 'Upload Date', render: (d: any) => d.date },
                  { key: 'size', header: 'Size', render: (d: any) => d.size },
                  { key: 'action', header: 'Action', align: 'right', render: () => (
                    <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>Download</Button>
                  )}
                ]}
                data={[
                  { name: '2025_Form_1099_DIV_Consolidated.pdf', category: 'Tax Documents', date: 'Feb 15, 2026', size: '1.4 MB' },
                  { name: 'Chase_Checking_Oct_2026_Statement.pdf', category: 'Bank Statements', date: 'Nov 01, 2026', size: '420 KB' },
                  { name: 'Marcus_HYSA_Q3_Interest_Summary.pdf', category: 'Bank Statements', date: 'Oct 05, 2026', size: '310 KB' },
                  { name: 'Residential_Mortgage_Deed_Executed.pdf', category: 'Legal & Real Estate', date: 'Jan 12, 2024', size: '4.8 MB' }
                ]}
                keyExtractor={(item: any) => item.name}
              />
            </Card>
          </div>
        );

      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary, textTransform: 'capitalize' }}>
                  {activeNav} Module
                </h1>
                <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
                  Component and layout demonstration for {activeNav} subsystem.
                </p>
              </div>
              <Button variant="primary" leftIcon={<Plus size={15} />}>New {activeNav} Record</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <Card title={`${activeNav.toUpperCase()} Metric Summary`}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: colors.text.primary }}>
                  {formatMoney(24850.00)}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <FinancialMetricBadge value={1420.00} formattedValue={formatMoney(1420.00)} percentage={6.1} />
                </div>
              </Card>

              <Card title="Activity Index">
                <div style={{ fontSize: '26px', fontWeight: 800, color: colors.brand.primaryLight }}>
                  Active & Synced
                </div>
                <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '10px' }}>
                  Last reconciliation: 5 minutes ago
                </div>
              </Card>
            </div>

            <Card title="Subsystem Records Ledger">
              <EmptyState
                icon={<FileText size={40} />}
                title={`No Historical Discrepancies in ${activeNav}`}
                description="All ledger transactions and automated reconciliations are currently up-to-date."
                actionLabel="Generate Audit Log"
                onAction={() => toast.info('Export', 'Generating data audit log...')}
              />
            </Card>
          </div>
        );
    }
  };

  return (
    <MainLayout
      activeNav={activeNav}
      onNavChange={(key) => setActiveNav(key)}
    >
      {/* Floating System Foundation Inspector Pill */}
      <div style={{ position: 'fixed', bottom: 20, right: 24, zIndex: 90 }}>
        <button
          onClick={() => setShowFoundationModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.brand.primary}`,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            padding: '8px 14px',
            borderRadius: '9999px',
            color: colors.brand.primaryLight,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Cpu size={15} />
          <span>System Foundation Diagnostics</span>
        </button>
      </div>

      {/* Main Module Content */}
      {renderModuleView()}

      {/* Foundation Diagnostics Modal (Step 01 Health & Math Verifications) */}
      {showFoundationModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowFoundationModal(false)}
        >
          <div
            style={{
              backgroundColor: colors.bg.surfaceElevated,
              border: `1px solid ${colors.border.strong}`,
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={22} color={colors.brand.primary} />
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.text.primary }}>
                  Technical Foundation & Health Diagnostics
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowFoundationModal(false)}>
                ✕ Close
              </Button>
            </div>

            {/* Health Status Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: colors.bg.surface, border: `1px solid ${colors.border.default}` }}>
                <span style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>Backend API</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: health?.services.api.status === 'up' ? colors.financial.incomeText : colors.financial.expenseText, marginTop: '4px' }}>
                  {health ? 'API Online (v1)' : 'Degraded / Standalone'}
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: colors.bg.surface, border: `1px solid ${colors.border.default}` }}>
                <span style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>PostgreSQL (Prisma)</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: colors.brand.primaryLight, marginTop: '4px' }}>
                  26 Models Ready
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: colors.bg.surface, border: `1px solid ${colors.border.default}` }}>
                <span style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>Auth & Sessions</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: colors.financial.incomeText, marginTop: '4px' }}>
                  {isAuthenticated ? `Signed in (${user?.email})` : 'Guest Mode'}
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: colors.bg.surface, border: `1px solid ${colors.border.default}` }}>
                <span style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>Shared Client</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: colors.brand.primaryLight, marginTop: '4px' }}>
                  @finance/api-client
                </div>
              </div>
            </div>

            {/* Financial Calculator Interactive Controls */}
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: colors.bg.surface, border: `1px solid ${colors.border.default}`, marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                Shared Financial Calculation Engine Test (@finance/utils)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary }}>
                    Principal: <b>{formatCurrency(principal)}</b>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="5000"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    style={{ width: '100%', marginTop: '6px' }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary }}>
                    Forecast Return: <b>{formatPercentage(rate)}</b>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="0.5"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    style={{ width: '100%', marginTop: '6px' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: `1px solid ${colors.border.subtle}`, paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: colors.text.secondary }}>Calculated Future Value (10 Yrs):</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: colors.financial.incomeText }}>
                    {formatCurrency(compoundResult.futureValue)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: colors.text.secondary }}>30-Year Mortgage EMI ($400k @ 6.5%):</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: colors.financial.asset }}>
                    {formatCurrency(emiResult.monthlyEMI)} / mo
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {!isAuthenticated && (
                <Button variant="primary" size="sm" onClick={() => { setShowFoundationModal(false); setAuthView('login'); }} leftIcon={<LogIn size={14} />}>
                  Sign In
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={fetchHealth} leftIcon={<RefreshCw size={14} />}>
                Re-verify Health
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
};
