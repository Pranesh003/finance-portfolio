import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface FinancialMetricBadgeProps {
  value: number; // positive = gain, negative = loss, 0 = neutral
  formattedValue?: string;
  percentage?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const FinancialMetricBadge: React.FC<FinancialMetricBadgeProps> = ({
  value,
  formattedValue,
  percentage,
  showIcon = true,
  size = 'md',
  style
}) => {
  const { colors } = useTheme();

  const isPositive = value > 0;
  const isNegative = value < 0;

  const bg = isPositive
    ? colors.financial.incomeBg
    : isNegative
    ? colors.financial.expenseBg
    : colors.financial.neutralBg;

  const textColor = isPositive
    ? colors.financial.incomeText
    : isNegative
    ? colors.financial.expenseText
    : colors.financial.neutral;

  const border = isPositive
    ? colors.financial.incomeBorder
    : isNegative
    ? colors.financial.expenseBorder
    : colors.financial.neutralBorder;

  const padding = size === 'sm' ? '2px 6px' : '3px 8px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: bg,
        color: textColor,
        border: `1px solid ${border}`,
        borderRadius: '6px',
        fontWeight: 600,
        fontSize,
        padding,
        lineHeight: 1.2,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {showIcon && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {isPositive ? (
            <ArrowUpRight size={13} strokeWidth={2.5} />
          ) : isNegative ? (
            <ArrowDownRight size={13} strokeWidth={2.5} />
          ) : (
            <Minus size={13} strokeWidth={2.5} />
          )}
        </span>
      )}
      <span>
        {isPositive ? '+' : ''}
        {formattedValue}
        {percentage !== undefined && (
          <span style={{ marginLeft: formattedValue ? '4px' : '0' }}>
            ({isPositive ? '+' : ''}
            {percentage.toFixed(2)}%)
          </span>
        )}
      </span>
    </span>
  );
};

