import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { SpendingCategoryItem } from '@finance/types';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface MonthlySpendingBreakdownProps {
  categories: SpendingCategoryItem[];
  isLoading?: boolean;
}

export const MonthlySpendingBreakdown: React.FC<MonthlySpendingBreakdownProps> = ({
  categories,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  void isLoading;

  const totalSpent = categories.reduce((sum, c) => sum + c.spentAmount, 0);
  const totalBudget = categories.reduce((sum, c) => sum + c.budgetedAmount, 0);

  // Sort categories by highest spend
  const sorted = [...categories].sort((a, b) => b.spentAmount - a.spentAmount);
  const highestCategory = sorted[0];

  return (
    <Card
      title="Monthly Spending Breakdown & Budget Utilization"
      subtitle="Envelope tracking across lifestyle categories against predefined caps"
      actions={
        highestCategory && (
          <Badge variant="asset" size="sm">
            Top Category: {highestCategory.category} ({((highestCategory.spentAmount / (totalSpent || 1)) * 100).toFixed(0)}%)
          </Badge>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sorted.map((item) => {
          const isOverBudget = item.percentageUsed > 100;
          const isNearCap = item.percentageUsed >= 85 && !isOverBudget;
          const barColor = isOverBudget
            ? colors.financial.liability
            : isNearCap
            ? '#F59E0B'
            : colors.financial.income;

          const changePositive = item.changePct > 0;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: colors.bg.surfaceElevated,
                border: `1px solid ${colors.border.subtle}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                    {item.category}
                  </span>
                  {isOverBudget && (
                    <Badge variant="expense" size="sm">
                      Over Cap
                    </Badge>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(item.spentAmount)} / <span style={{ color: colors.text.muted, fontSize: '11px' }}>{formatMoney(item.budgetedAmount)}</span>
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      color: changePositive ? colors.financial.expenseText : colors.financial.incomeText,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: 600
                    }}
                  >
                    {changePositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {changePositive ? '+' : ''}{item.changePct}% vs last mo
                  </span>
                </div>
              </div>

              <ProgressBar value={Math.min(item.percentageUsed, 100)} color={barColor} height={6} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: colors.text.muted }}>
                <span>{item.percentageUsed}% utilized</span>
                <span>
                  Remaining: <b>{formatMoney(Math.max(0, item.budgetedAmount - item.spentAmount))}</b>
                </span>
              </div>
            </div>
          );
        })}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '10px',
            borderTop: `1px solid ${colors.border.subtle}`,
            fontSize: '12px',
            color: colors.text.secondary
          }}
        >
          <span>Total Monthly Spending: <b style={{ color: colors.text.primary }}>{formatMoney(totalSpent)}</b></span>
          <span>Total Budget Cap: <b style={{ color: colors.text.primary }}>{formatMoney(totalBudget)}</b></span>
        </div>
      </div>
    </Card>
  );
};
