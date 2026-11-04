import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface ProfitLossIndicatorProps {
  amount: number;
  percentage?: number;
  timeframe?: string;
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
  style?: React.CSSProperties;
}

export const ProfitLossIndicator: React.FC<ProfitLossIndicatorProps> = ({
  amount,
  percentage,
  timeframe,
  size = 'md',
  showBackground = false,
  style
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

  const isProfit = amount > 0;
  const isLoss = amount < 0;

  const color = isProfit
    ? colors.financial.incomeText
    : isLoss
    ? colors.financial.expenseText
    : colors.financial.neutral;

  const bg = isProfit
    ? colors.financial.incomeBg
    : isLoss
    ? colors.financial.expenseBg
    : colors.financial.neutralBg;

  const border = isProfit
    ? colors.financial.incomeBorder
    : isLoss
    ? colors.financial.expenseBorder
    : colors.financial.neutralBorder;

  const fontSize = {
    sm: '12px',
    md: '14px',
    lg: '18px'
  }[size];

  const iconSize = {
    sm: 13,
    md: 15,
    lg: 18
  }[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color,
        backgroundColor: showBackground ? bg : 'transparent',
        border: showBackground ? `1px solid ${border}` : 'none',
        borderRadius: '6px',
        padding: showBackground ? '4px 8px' : '0',
        fontWeight: 600,
        fontSize,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
        ...style
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {isProfit ? (
          <TrendingUp size={iconSize} strokeWidth={2.5} />
        ) : isLoss ? (
          <TrendingDown size={iconSize} strokeWidth={2.5} />
        ) : (
          <Minus size={iconSize} strokeWidth={2.5} />
        )}
      </span>

      <span>
        {isProfit ? '+' : ''}
        {formatMoney(amount)}
      </span>

      {percentage !== undefined && (
        <span style={{ opacity: 0.9 }}>
          ({isProfit ? '+' : ''}
          {percentage.toFixed(2)}%)
        </span>
      )}

      {timeframe && (
        <span style={{ fontSize: '11px', color: colors.text.muted, fontWeight: 400 }}>
          {timeframe}
        </span>
      )}
    </div>
  );
};

