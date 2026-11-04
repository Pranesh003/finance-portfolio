import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { LiabilityAllocationItem } from '@finance/types';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Percent, Clock } from 'lucide-react';

interface LiabilityDistributionWidgetProps {
  items: LiabilityAllocationItem[];
  isLoading?: boolean;
}

export const LiabilityDistributionWidget: React.FC<LiabilityDistributionWidgetProps> = ({
  items,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  void isLoading;

  const totalBalance = items.reduce((sum, item) => sum + item.balance, 0);
  const totalMonthlyEMI = items.reduce((sum, item) => sum + item.monthlyEMI, 0);

  return (
    <Card
      title="Liability & Debt Distribution"
      subtitle="Encumbrances, outstanding loan balances, and amortized EMIs"
      actions={
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: colors.text.muted }}>Monthly Obligation</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.financial.liability }}>
            {formatMoney(totalMonthlyEMI)} / mo
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: colors.bg.surfaceElevated,
              border: `1px solid ${colors.border.subtle}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text.primary }}>
                    {item.label}
                  </span>
                  {item.interestRate > 0 && (
                    <Badge variant="liability" size="sm">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Percent size={10} /> {item.interestRate}% APR
                      </span>
                    </Badge>
                  )}
                  {item.interestRate === 0 && (
                    <Badge variant="income" size="sm">
                      0% (Full Payoff)
                    </Badge>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px' }}>
                  {item.lender} • Monthly EMI: {formatMoney(item.monthlyEMI)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: colors.financial.liability, fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(item.balance)}
                </div>
                <div style={{ fontSize: '11px', color: colors.text.muted }}>
                  {item.percentage}% of total debt
                </div>
              </div>
            </div>

            <ProgressBar
              value={item.percentage}
              color={item.color || colors.financial.liability}
              height={6}
            />
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '10px',
            borderTop: `1px solid ${colors.border.subtle}`,
            fontSize: '11px',
            color: colors.text.muted
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Auto-debit active on all bank linked EMIs
          </span>
          <span style={{ color: colors.text.secondary }}>
            Total Principal: <b>{formatMoney(totalBalance)}</b>
          </span>
        </div>
      </div>
    </Card>
  );
};
