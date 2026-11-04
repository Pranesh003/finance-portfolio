import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { NavItemKey } from '../layout/Sidebar';
import {
  Landmark,
  CreditCard,
  Building2,
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Coins,
  ChevronRight
} from 'lucide-react';

interface SummaryCardsGridProps {
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
  onNavigate: (module: NavItemKey) => void;
  isLoading?: boolean;
}

export const SummaryCardsGrid: React.FC<SummaryCardsGridProps> = ({
  metrics,
  onNavigate,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

  const cards: {
    id: string;
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    targetModule: NavItemKey;
  }[] = [
    {
      id: 'total-assets',
      title: 'Total Assets',
      value: metrics.totalAssets,
      subtitle: 'Real estate, stocks, gold & cash',
      icon: <Landmark size={18} />,
      color: colors.financial.incomeText,
      targetModule: 'assets'
    },
    {
      id: 'total-liabilities',
      title: 'Total Liabilities',
      value: metrics.totalLiabilities,
      subtitle: 'Home loan, auto loan & card dues',
      icon: <CreditCard size={18} />,
      color: colors.financial.liability,
      targetModule: 'liabilities'
    },
    {
      id: 'bank-balances',
      title: 'Bank Balances',
      value: metrics.bankBalances,
      subtitle: 'Checking & savings balances',
      icon: <Building2 size={18} />,
      color: '#06B6D4',
      targetModule: 'accounts'
    },
    {
      id: 'available-cash',
      title: 'Available Cash',
      value: metrics.availableCash,
      subtitle: 'Instant liquidity & vault reserves',
      icon: <Wallet size={18} />,
      color: '#10B981',
      targetModule: 'accounts'
    },
    {
      id: 'total-investments',
      title: 'Total Investments',
      value: metrics.totalInvestments,
      subtitle: 'Equities, mutual funds & bullion',
      icon: <TrendingUp size={18} />,
      color: colors.brand.primaryLight,
      targetModule: 'investments'
    },
    {
      id: 'monthly-income',
      title: 'Monthly Income',
      value: metrics.monthlyIncome,
      subtitle: 'Salary, consulting & dividends',
      icon: <ArrowDownLeft size={18} />,
      color: colors.financial.incomeText,
      targetModule: 'income'
    },
    {
      id: 'monthly-expenses',
      title: 'Monthly Expenses',
      value: metrics.monthlyExpenses,
      subtitle: 'Fixed EMIs & living overhead',
      icon: <ArrowUpRight size={18} />,
      color: colors.financial.expenseText,
      targetModule: 'expenses'
    },
    {
      id: 'monthly-savings',
      title: 'Monthly Savings',
      value: metrics.monthlySavings,
      subtitle: 'Free cash flow towards goals',
      icon: <PiggyBank size={18} />,
      color: '#F59E0B',
      targetModule: 'budgets'
    },
    {
      id: 'passive-income',
      title: 'Passive Income',
      value: metrics.passiveIncome,
      subtitle: 'Dividends, SGB coupons & FD interest',
      icon: <Coins size={18} />,
      color: '#A855F7',
      targetModule: 'investments'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        marginTop: '16px'
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onNavigate(card.targetModule)}
          style={{
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.brand.primary;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.subtle;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title={`Click to open ${card.title} module`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: `${card.color}15`,
                  color: card.color
                }}
              >
                {card.icon}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: colors.text.secondary }}>
                {card.title}
              </span>
            </div>

            <ChevronRight size={14} color={colors.text.muted} />
          </div>

          <div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: colors.text.primary,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em'
              }}
            >
              {isLoading ? '...' : formatMoney(card.value)}
            </div>

            <div
              style={{
                fontSize: '11px',
                color: colors.text.muted,
                marginTop: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {card.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
