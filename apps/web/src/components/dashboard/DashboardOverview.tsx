import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../api';
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
  DashboardPreferences
} from '@finance/types';
import { NavItemKey } from '../layout/Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { NetWorthHero } from './NetWorthHero';
import { SummaryCardsGrid } from './SummaryCardsGrid';
import { AssetAllocationWidget } from './AssetAllocationWidget';
import { LiabilityDistributionWidget } from './LiabilityDistributionWidget';
import { CashFlowChartWidget } from './CashFlowChartWidget';
import { PortfolioPerformanceWidget } from './PortfolioPerformanceWidget';
import { AccountOverviewWidget } from './AccountOverviewWidget';
import { RecentTransactionsWidget } from './RecentTransactionsWidget';
import { MonthlySpendingBreakdown } from './MonthlySpendingBreakdown';
import { FinancialHealthWidget } from './FinancialHealthWidget';
import { UpcomingEventsWidget } from './UpcomingEventsWidget';
import { FinancialInsightsWidget } from './FinancialInsightsWidget';
import { QuickAddModal } from './QuickAddModal';
import { DashboardCustomizerModal } from './DashboardCustomizerModal';
import { Button } from '../ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate?: (module: NavItemKey) => void;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
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
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { colors } = useTheme();
  const { currency } = useCurrency();
  const { toast } = useToast();

  // Dashboard Filters & Modals
  const [period, setPeriod] = useState<TimeFilterPeriod>('30d');
  const [cashFlowGrouping, setCashFlowGrouping] = useState<CashFlowGrouping>('monthly');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Live Data States
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthHistoryPoint[]>([]);
  const [assetAllocations, setAssetAllocations] = useState<DashboardAssetAllocationItem[]>([]);
  const [liabilityAllocations, setLiabilityAllocations] = useState<LiabilityAllocationItem[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowDataPoint[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [accounts, setAccounts] = useState<AccountOverviewItem[]>([]);
  const [transactions, setTransactions] = useState<RecentTransactionItem[]>([]);
  const [spendingBreakdown, setSpendingBreakdown] = useState<SpendingCategoryItem[]>([]);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthOverview | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingFinancialEvent[]>([]);
  const [insights, setInsights] = useState<DashboardFinancialInsight[]>([]);
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);

  // Fetch all dashboard data concurrently from live backend API
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);

    try {
      const [
        sumRes,
        nwRes,
        assetRes,
        liaRes,
        cfRes,
        portRes,
        accRes,
        txRes,
        spRes,
        healthRes,
        evRes,
        insRes,
        prefRes
      ] = await Promise.all([
        apiClient.dashboard.getSummary(period, currency),
        apiClient.dashboard.getNetWorthHistory(period, currency),
        apiClient.dashboard.getAssetAllocation(currency),
        apiClient.dashboard.getLiabilityAllocation(currency),
        apiClient.dashboard.getCashFlow(cashFlowGrouping, currency),
        apiClient.dashboard.getPortfolioSummary(currency),
        apiClient.dashboard.getAccounts(currency),
        apiClient.dashboard.getRecentTransactions(10, txTypeFilter, currency),
        apiClient.dashboard.getSpendingBreakdown(currency),
        apiClient.dashboard.getFinancialHealth(currency),
        apiClient.dashboard.getUpcomingEvents(),
        apiClient.dashboard.getInsights(currency),
        apiClient.dashboard.getPreferences()
      ]);

      setSummary(sumRes.data);
      setNetWorthHistory(nwRes.data);
      setAssetAllocations(assetRes.data);
      setLiabilityAllocations(liaRes.data);
      setCashFlow(cfRes.data);
      setPortfolio(portRes.data);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
      setSpendingBreakdown(spRes.data);
      setFinancialHealth(healthRes.data);
      setUpcomingEvents(evRes.data);
      setInsights(insRes.data);
      if (prefRes.data && prefRes.data.widgetOrder) {
        setPreferences(prefRes.data);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to sync with financial aggregation backend.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period, currency, cashFlowGrouping, txTypeFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Preferences update
  const handleSavePreferences = async (newPrefs: DashboardPreferences) => {
    setPreferences(newPrefs);
    try {
      await apiClient.dashboard.updatePreferences(newPrefs);
    } catch {
      // Local state fallback already updated
    }
  };

  // Seed sample data
  const handleSeedSampleData = async () => {
    try {
      await apiClient.dashboard.seedSampleData();
      toast.success('Demonstration Data Active', 'Loaded comprehensive multi-asset portfolio.');
      fetchDashboardData();
      setIsCustomizeOpen(false);
    } catch (err: any) {
      toast.error('Seed Failed', err.message);
    }
  };

  // Reset to zero state
  const handleResetToZero = async () => {
    try {
      await apiClient.dashboard.resetData();
      toast.info('Zero Baseline Active', 'Dashboard set to initial empty account baseline.');
      fetchDashboardData();
      setIsCustomizeOpen(false);
    } catch (err: any) {
      toast.error('Reset Failed', err.message);
    }
  };

  const handleModuleNavigate = (mod: NavItemKey) => {
    if (onNavigate) {
      onNavigate(mod);
    } else {
      toast.info('Navigation', `Navigating to ${mod} domain...`);
    }
  };

  // Render individual widget based on key
  const renderWidget = (key: string) => {
    switch (key) {
      case 'netWorth':
        if (!preferences.widgetVisibility.netWorth) return null;
        return (
          <NetWorthHero
            key="netWorth"
            currentNetWorth={summary ? summary.netWorth.current : 0}
            totalAssets={summary ? summary.metrics.totalAssets : 0}
            totalLiabilities={summary ? summary.metrics.totalLiabilities : 0}
            absoluteChange={summary ? summary.netWorth.absoluteChange : 0}
            percentageChange={summary ? summary.netWorth.percentageChange : 0}
            trend={summary ? summary.netWorth.trend : 'neutral'}
            historyPoints={netWorthHistory}
            isLoading={isLoading}
          />
        );

      case 'summaryCards':
        if (!preferences.widgetVisibility.summaryCards || !summary) return null;
        return (
          <SummaryCardsGrid
            key="summaryCards"
            metrics={summary.metrics}
            onNavigate={handleModuleNavigate}
            isLoading={isLoading}
          />
        );

      case 'portfolioPerformance':
        if (!preferences.widgetVisibility.portfolioPerformance || !portfolio) return null;
        return (
          <PortfolioPerformanceWidget
            key="portfolioPerformance"
            portfolio={portfolio}
            isLoading={isLoading}
          />
        );

      case 'assetAllocation':
      case 'liabilityDistribution':
        // Paired 2-column layout for Asset and Liability allocations
        if (!preferences.widgetVisibility.assetAllocation && !preferences.widgetVisibility.liabilityDistribution) {
          return null;
        }
        return (
          <div
            key="allocations-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '16px'
            }}
          >
            {preferences.widgetVisibility.assetAllocation && (
              <AssetAllocationWidget items={assetAllocations} isLoading={isLoading} />
            )}
            {preferences.widgetVisibility.liabilityDistribution && (
              <LiabilityDistributionWidget items={liabilityAllocations} isLoading={isLoading} />
            )}
          </div>
        );

      case 'cashFlow':
        if (!preferences.widgetVisibility.cashFlow) return null;
        return (
          <CashFlowChartWidget
            key="cashFlow"
            data={cashFlow}
            grouping={cashFlowGrouping}
            onGroupingChange={setCashFlowGrouping}
            isLoading={isLoading}
          />
        );

      case 'accountsOverview':
      case 'recentTransactions':
        // Paired 2-column layout for Accounts and Transactions
        if (!preferences.widgetVisibility.accountsOverview && !preferences.widgetVisibility.recentTransactions) {
          return null;
        }
        return (
          <div
            key="accounts-tx-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '16px'
            }}
          >
            {preferences.widgetVisibility.accountsOverview && (
              <AccountOverviewWidget
                accounts={accounts}
                onAddAccount={() => setIsQuickAddOpen(true)}
                isLoading={isLoading}
              />
            )}
            {preferences.widgetVisibility.recentTransactions && (
              <RecentTransactionsWidget
                transactions={transactions}
                typeFilter={txTypeFilter}
                onFilterChange={setTxTypeFilter}
                onViewAll={() => handleModuleNavigate('transactions')}
                isLoading={isLoading}
              />
            )}
          </div>
        );

      case 'spendingBreakdown':
        if (!preferences.widgetVisibility.spendingBreakdown) return null;
        return (
          <MonthlySpendingBreakdown
            key="spendingBreakdown"
            categories={spendingBreakdown}
            isLoading={isLoading}
          />
        );

      case 'financialHealth':
        if (!preferences.widgetVisibility.financialHealth || !financialHealth) return null;
        return (
          <FinancialHealthWidget
            key="financialHealth"
            health={financialHealth}
            isLoading={isLoading}
          />
        );

      case 'upcomingEvents':
      case 'financialInsights':
        // Paired layout for upcoming events & proactive alerts
        if (!preferences.widgetVisibility.upcomingEvents && !preferences.widgetVisibility.financialInsights) {
          return null;
        }
        return (
          <div
            key="events-insights-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '16px'
            }}
          >
            {preferences.widgetVisibility.upcomingEvents && (
              <UpcomingEventsWidget events={upcomingEvents} isLoading={isLoading} />
            )}
            {preferences.widgetVisibility.financialInsights && (
              <FinancialInsightsWidget insights={insights} isLoading={isLoading} />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dashboard Top Header & Controls */}
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenCustomize={() => setIsCustomizeOpen(true)}
        onRefresh={() => fetchDashboardData(true)}
        isLoading={isRefreshing}
      />

      {/* Error Banner */}
      {fetchError && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: `${colors.financial.expense}15`,
            border: `1px solid ${colors.financial.expense}`,
            borderRadius: '10px',
            color: colors.financial.expenseText,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{fetchError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchDashboardData()} leftIcon={<RefreshCw size={13} />}>
            Retry
          </Button>
        </div>
      )}

      {/* Render Widgets in User-Customized Order (preventing duplicates for paired rows) */}
      {(() => {
        const renderedPairs = new Set<string>();
        return preferences.widgetOrder.map((key) => {
          if (key === 'assetAllocation' || key === 'liabilityDistribution') {
            if (renderedPairs.has('allocations')) return null;
            renderedPairs.add('allocations');
            return renderWidget('assetAllocation');
          }
          if (key === 'accountsOverview' || key === 'recentTransactions') {
            if (renderedPairs.has('accounts-tx')) return null;
            renderedPairs.add('accounts-tx');
            return renderWidget('accountsOverview');
          }
          if (key === 'upcomingEvents' || key === 'financialInsights') {
            if (renderedPairs.has('events-insights')) return null;
            renderedPairs.add('events-insights');
            return renderWidget('upcomingEvents');
          }
          return renderWidget(key);
        });
      })()}

      {/* Quick-Add Transaction / Asset Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => fetchDashboardData(true)}
      />

      {/* Customizer Modal */}
      <DashboardCustomizerModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        onResetToZero={handleResetToZero}
        onSeedSampleData={handleSeedSampleData}
      />
    </div>
  );
};
