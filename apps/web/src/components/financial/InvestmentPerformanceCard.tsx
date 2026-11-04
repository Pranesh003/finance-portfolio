import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { FinancialMetricBadge } from './FinancialMetricBadge';
import { Briefcase } from 'lucide-react';

export interface InvestmentPerformanceCardProps {
  portfolioName: string;
  totalValue: number;
  unrealizedGainLoss: number;
  unrealizedPercentage: number;
  dayChangeAmount: number;
  dayChangePercentage: number;
  holdingsCount: number;
  style?: React.CSSProperties;
}

export const InvestmentPerformanceCard: React.FC<InvestmentPerformanceCardProps> = ({
  portfolioName,
  totalValue,
  unrealizedGainLoss,
  unrealizedPercentage,
  dayChangeAmount,
  dayChangePercentage,
  holdingsCount,
  style
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

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
              <Briefcase size={16} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                {portfolioName}
              </div>
              <div style={{ fontSize: '12px', color: colors.text.muted }}>
                {holdingsCount} Asset Positions
              </div>
            </div>
          </div>

          <FinancialMetricBadge
            value={dayChangeAmount}
            formattedValue={formatMoney(dayChangeAmount)}
            percentage={dayChangePercentage}
            size="sm"
          />
        </div>

        {/* Portfolio Value */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', color: colors.text.secondary }}>Total Portfolio Value</div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: colors.text.primary,
              letterSpacing: '-0.02em',
              marginTop: '4px',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {formatMoney(totalValue)}
          </div>
        </div>
      </div>

      {/* Unrealized Gain/Loss Footer */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: `1px solid ${colors.border.subtle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ fontSize: '13px', color: colors.text.secondary }}>Total Unrealized Return</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: unrealizedGainLoss >= 0 ? colors.financial.incomeText : colors.financial.expenseText,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {unrealizedGainLoss >= 0 ? '+' : ''}
            {formatMoney(unrealizedGainLoss)}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: unrealizedGainLoss >= 0 ? colors.financial.incomeBg : colors.financial.expenseBg,
              color: unrealizedGainLoss >= 0 ? colors.financial.incomeText : colors.financial.expenseText,
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            {unrealizedGainLoss >= 0 ? '+' : ''}
            {unrealizedPercentage.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};
