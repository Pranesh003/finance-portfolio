import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { PortfolioSummary } from '@finance/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { AddInvestmentModal } from '../investments/AddInvestmentModal';

interface PortfolioPerformanceWidgetProps {
  portfolio: PortfolioSummary;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const PortfolioPerformanceWidget: React.FC<PortfolioPerformanceWidgetProps> = ({
  portfolio,
  isLoading = false,
  onRefresh
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  void isLoading;

  const isUnrealizedPositive = portfolio.unrealizedPnL >= 0;
  const isRealizedPositive = portfolio.realizedPnL >= 0;
  const isOverallPositive = portfolio.overallROI >= 0;

  return (
    <>
      <Card
        title="Investment Portfolio Performance"
        subtitle="Comprehensive holdings valuation across equities, mutual funds, ETFs, bullion and fixed income"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={13} /> Add Real Asset
            </Button>
            <Badge variant={portfolio.dayPnL >= 0 ? 'income' : 'expense'} size="sm">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {portfolio.dayPnL >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                Day: {portfolio.dayPnL >= 0 ? '+' : ''}{formatMoney(portfolio.dayPnL)} ({portfolio.dayPnLPct.toFixed(2)}%)
              </span>
            </Badge>
          </div>
        }
      >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Current Portfolio Value */}
        <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: colors.bg.surfaceElevated, border: `1px solid ${colors.border.subtle}` }}>
          <div style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>
            Current Portfolio Value
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: colors.text.primary, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(portfolio.currentValue)}
          </div>
          <div style={{ fontSize: '11px', color: colors.text.secondary, marginTop: '4px' }}>
            Total Invested: {formatMoney(portfolio.totalInvested)}
          </div>
        </div>

        {/* Unrealized P&L */}
        <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: colors.bg.surfaceElevated, border: `1px solid ${colors.border.subtle}` }}>
          <div style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>
            Unrealized Profit & Loss
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: isUnrealizedPositive ? colors.financial.incomeText : colors.financial.expenseText, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
            {isUnrealizedPositive ? '+' : ''}{formatMoney(portfolio.unrealizedPnL)}
          </div>
          <div style={{ fontSize: '11px', color: isUnrealizedPositive ? colors.financial.incomeText : colors.financial.expenseText, marginTop: '4px', fontWeight: 600 }}>
            {isUnrealizedPositive ? '+' : ''}{portfolio.unrealizedPnLPct.toFixed(2)}% on open positions
          </div>
        </div>

        {/* Realized Gains */}
        <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: colors.bg.surfaceElevated, border: `1px solid ${colors.border.subtle}` }}>
          <div style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>
            Realized Gains Booked
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: isRealizedPositive ? colors.financial.incomeText : colors.financial.expenseText, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
            {isRealizedPositive ? '+' : ''}{formatMoney(portfolio.realizedPnL)}
          </div>
          <div style={{ fontSize: '11px', color: colors.text.secondary, marginTop: '4px' }}>
            Net of realized trades & profit locks
          </div>
        </div>

        {/* Overall Portfolio ROI */}
        <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: colors.bg.surfaceElevated, border: `1px solid ${colors.border.subtle}` }}>
          <div style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>
            Overall Investment ROI
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: colors.brand.primaryLight, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
            {isOverallPositive ? '+' : ''}{portfolio.overallROI.toFixed(2)}%
          </div>
          <div style={{ fontSize: '11px', color: colors.text.secondary, marginTop: '4px' }}>
            Time-weighted total portfolio return
          </div>
        </div>
      </div>
    </Card>

    <AddInvestmentModal
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      onSuccess={() => {
        if (onRefresh) onRefresh();
      }}
    />
  </>
);
};
