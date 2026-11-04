import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Badge } from '../ui/Badge';
import { FinancialMetricBadge } from './FinancialMetricBadge';

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  assetClass: 'EQUITY' | 'ETF' | 'MUTUAL_FUND' | 'CRYPTO' | 'BOND' | 'PRECIOUS_METAL';
  quantity: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercentage: number;
  dayChangePercentage?: number;
}

export interface PortfolioHoldingRowProps {
  holding: PortfolioHolding;
  onClick?: (holding: PortfolioHolding) => void;
  style?: React.CSSProperties;
}

export const PortfolioHoldingRow: React.FC<PortfolioHoldingRowProps> = ({
  holding,
  onClick,
  style
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

  const getAssetBadgeVariant = () => {
    switch (holding.assetClass) {
      case 'EQUITY':
      case 'ETF':
        return 'brand';
      case 'CRYPTO':
        return 'warning';
      case 'PRECIOUS_METAL':
        return 'neutral';
      case 'BOND':
      default:
        return 'income';
    }
  };

  return (
    <div
      onClick={() => onClick?.(holding)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: colors.bg.surface,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '10px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.backgroundColor = colors.bg.surface;
      }}
    >
      {/* Left: Symbol & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: colors.text.primary }}>
              {holding.symbol}
            </span>
            <Badge variant={getAssetBadgeVariant() as any} size="sm">
              {holding.assetClass}
            </Badge>
          </div>
          <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
            {holding.name}
          </div>
        </div>
      </div>

      {/* Middle: Quantity & Price */}
      <div style={{ textAlign: 'right', minWidth: '120px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
          {holding.quantity} shares
        </div>
        <div style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
          Avg: {formatMoney(holding.costBasis)}
        </div>
      </div>

      {/* Right: Market Value & Total P/L */}
      <div style={{ textAlign: 'right', minWidth: '140px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
          {formatMoney(holding.currentValue)}
        </div>
        <div style={{ marginTop: '3px' }}>
          <FinancialMetricBadge
            value={holding.unrealizedGainLoss}
            formattedValue={formatMoney(Math.abs(holding.unrealizedGainLoss))}
            percentage={holding.unrealizedGainLossPercentage}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

