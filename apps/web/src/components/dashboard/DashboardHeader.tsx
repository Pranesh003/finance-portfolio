import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TimeFilterPeriod } from '@finance/types';
import {
  Plus,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Calendar,
  FileSpreadsheet,
  Zap
} from 'lucide-react';

interface DashboardHeaderProps {
  period: TimeFilterPeriod;
  onPeriodChange: (p: TimeFilterPeriod) => void;
  onOpenQuickAdd: () => void;
  onOpenCustomize: () => void;
  onOpenCasImport?: () => void;
  onOpenBrokerSync?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const PERIODS: { key: TimeFilterPeriod; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '1y', label: '1Y' },
  { key: '3y', label: '3Y' },
  { key: '5y', label: '5Y' },
  { key: 'all', label: 'ALL' }
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  period,
  onPeriodChange,
  onOpenQuickAdd,
  onOpenCustomize,
  onOpenCasImport,
  onOpenBrokerSync,
  onRefresh,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { currency } = useCurrency();

  // Dynamic Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const displayName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
    : 'Portfolio Executive';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '20px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        {/* Title & Greeting */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.brand.primaryLight, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} /> WealthFlow Command Center
            </span>
            <Badge variant="brand" size="sm">
              Active Portfolio
            </Badge>
            <Badge variant="income" size="sm">
              Live Engine ({currency})
            </Badge>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '26px',
              fontWeight: 800,
              color: colors.text.primary,
              letterSpacing: '-0.02em'
            }}
          >
            {getGreeting()}, {displayName}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: colors.text.secondary,
              marginTop: '4px'
            }}
          >
            <Calendar size={13} />
            <span>{formattedDate}</span>
            <span>•</span>
            <span>Comprehensive 360° Financial Life Overview</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            leftIcon={<RefreshCw size={14} />}
            title="Refresh Financial Aggregates"
          >
            Sync
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenCustomize}
            leftIcon={<SlidersHorizontal size={14} />}
            title="Customize Dashboard Layout & Widgets"
          >
            Customize
          </Button>

          {onOpenCasImport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenCasImport}
              leftIcon={<FileSpreadsheet size={15} />}
              title="Fetch holdings from CDSL / NSDL Demat statement"
              style={{
                border: `1px solid ${colors.brand.primary}`,
                color: colors.brand.primaryLight,
                fontWeight: 600
              }}
            >
              Import Demat CAS
            </Button>
          )}

          {onOpenBrokerSync && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenBrokerSync}
              leftIcon={<Zap size={15} />}
              title="Direct sync from Angel One, Zerodha, and MFCentral"
              style={{
                border: '1px solid #3B82F6',
                color: '#3B82F6',
                fontWeight: 600
              }}
            >
              Broker Sync
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenQuickAdd}
            leftIcon={<Plus size={15} />}
            title="Quick-add Expense, Income, Transfer or Investment"
          >
            Quick Add
          </Button>
        </div>
      </div>

      {/* Period Selector Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '8px 14px',
          backgroundColor: colors.bg.surface,
          borderRadius: '12px',
          border: `1px solid ${colors.border.subtle}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase' }}>
            Period:
          </span>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: colors.bg.surfaceElevated, padding: '3px', borderRadius: '8px' }}>
            {PERIODS.map((p) => {
              const isActive = period === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => onPeriodChange(p.key)}
                  style={{
                    backgroundColor: isActive ? colors.brand.primary : 'transparent',
                    color: isActive ? '#FFFFFF' : colors.text.secondary,
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: '11px', color: colors.text.muted }}>
          Double-entry reconciliation: <span style={{ color: colors.financial.incomeText, fontWeight: 600 }}>Active</span> • Zero-leak internal transfers
        </div>
      </div>
    </div>
  );
};
