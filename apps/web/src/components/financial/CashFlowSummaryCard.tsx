import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

export interface CashFlowSummaryCardProps {
  income: number;
  expenses: number;
  periodLabel?: string;
  style?: React.CSSProperties;
}

export const CashFlowSummaryCard: React.FC<CashFlowSummaryCardProps> = ({
  income,
  expenses,
  periodLabel = 'This Month',
  style
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

  const netCashFlow = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, (netCashFlow / income) * 100) : 0;

  return (
    <div
      style={{
        backgroundColor: colors.bg.surface,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: colors.bg.surfaceElevated,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.brand.primaryLight
              }}
            >
              <PiggyBank size={16} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: colors.text.secondary }}>
              Cash Flow & Savings Rate
            </span>
          </div>

          <span style={{ fontSize: '12px', color: colors.text.muted }}>{periodLabel}</span>
        </div>

        {/* Dual Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginTop: '20px'
          }}
        >
          {/* Inflow */}
          <div
            style={{
              backgroundColor: colors.bg.surfaceElevated,
              padding: '14px',
              borderRadius: '10px',
              border: `1px solid ${colors.border.subtle}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.financial.incomeText }}>
              <ArrowDownLeft size={14} />
              <span>Inflow (Income)</span>
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.text.primary,
                marginTop: '6px',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {formatMoney(income)}
            </div>
          </div>

          {/* Outflow */}
          <div
            style={{
              backgroundColor: colors.bg.surfaceElevated,
              padding: '14px',
              borderRadius: '10px',
              border: `1px solid ${colors.border.subtle}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.financial.expenseText }}>
              <ArrowUpRight size={14} />
              <span>Outflow (Expenses)</span>
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.text.primary,
                marginTop: '6px',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {formatMoney(expenses)}
            </div>
          </div>
        </div>
      </div>

      {/* Net Cash Flow & Savings Rate Progress */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${colors.border.subtle}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', color: colors.text.secondary }}>
            Net Cash Flow:{' '}
            <b
              style={{
                color: netCashFlow >= 0 ? colors.financial.incomeText : colors.financial.expenseText,
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {netCashFlow >= 0 ? '+' : ''}
              {formatMoney(netCashFlow)}
            </b>
          </div>

          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: colors.financial.incomeText,
              backgroundColor: colors.financial.incomeBg,
              padding: '2px 8px',
              borderRadius: '6px'
            }}
          >
            {savingsRate.toFixed(1)}% Saved
          </div>
        </div>

        <ProgressBar
          value={savingsRate}
          color={colors.financial.income}
          height={6}
        />
      </div>
    </div>
  );
};

