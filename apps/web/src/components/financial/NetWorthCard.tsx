import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { FinancialMetricBadge } from './FinancialMetricBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { ShieldCheck, TrendingUp } from 'lucide-react';

export interface NetWorthCardProps {
  totalAssets: number;
  totalLiabilities: number;
  periodChangeAmount: number;
  periodChangePercentage: number;
  periodLabel?: string;
  style?: React.CSSProperties;
}

export const NetWorthCard: React.FC<NetWorthCardProps> = ({
  totalAssets,
  totalLiabilities,
  periodChangeAmount,
  periodChangePercentage,
  periodLabel = 'Last 30 Days',
  style
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

  const netWorth = totalAssets - totalLiabilities;
  const assetRatio = (totalAssets / (totalAssets + totalLiabilities)) * 100;
  const liabilityRatio = 100 - assetRatio;

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
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: colors.brand.primaryMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.brand.primaryLight
              }}
            >
              <TrendingUp size={16} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: colors.text.secondary }}>
              Total Net Worth
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: colors.financial.incomeText,
              backgroundColor: colors.financial.incomeBg,
              border: `1px solid ${colors.financial.incomeBorder}`,
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 500
            }}
          >
            <ShieldCheck size={12} />
            <span>Audited</span>
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '34px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: colors.text.primary,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {formatMoney(netWorth)}
          </span>

          <FinancialMetricBadge
            value={periodChangeAmount}
            formattedValue={formatMoney(periodChangeAmount)}
            percentage={periodChangePercentage}
          />
        </div>

        <div style={{ fontSize: '12px', color: colors.text.muted, marginTop: '4px' }}>
          vs. {periodLabel}
        </div>
      </div>

      {/* Asset vs Liability Breakdown */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${colors.border.subtle}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.financial.asset }} />
            <span style={{ color: colors.text.secondary }}>Assets:</span>
            <span style={{ fontWeight: 600, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(totalAssets)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.financial.liability }} />
            <span style={{ color: colors.text.secondary }}>Liabilities:</span>
            <span style={{ fontWeight: 600, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(totalLiabilities)}
            </span>
          </div>
        </div>

        <ProgressBar
          segments={[
            { value: assetRatio, color: colors.financial.asset, label: 'Assets' },
            { value: liabilityRatio, color: colors.financial.liability, label: 'Liabilities' }
          ]}
          height={6}
        />
      </div>
    </div>
  );
};

