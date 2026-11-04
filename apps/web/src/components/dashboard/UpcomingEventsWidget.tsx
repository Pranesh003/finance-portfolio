import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { UpcomingFinancialEvent } from '@finance/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  CreditCard,
  Building2,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface UpcomingEventsWidgetProps {
  events: UpcomingFinancialEvent[];
  isLoading?: boolean;
}

export const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({
  events,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  void isLoading;

  const getEventIcon = (category: UpcomingFinancialEvent['category']) => {
    switch (category) {
      case 'SALARY':
        return <TrendingUp size={15} color={colors.financial.incomeText} />;
      case 'LOAN_EMI':
      case 'CREDIT_CARD':
        return <CreditCard size={15} color={colors.financial.liability} />;
      case 'SIP':
      case 'BOND_COUPON':
      case 'FD_MATURITY':
        return <Building2 size={15} color={colors.brand.primaryLight} />;
      case 'RENT':
      case 'UTILITY_BILL':
      case 'INSURANCE':
      case 'SUBSCRIPTION':
      default:
        return <Receipt size={15} color="#F59E0B" />;
    }
  };

  return (
    <Card
      title="Upcoming Financial Schedule & Dues"
      subtitle="Calendar commitments: Salary credits, loan EMIs, SIPs, and bill maturities"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.text.muted }}>
          <Calendar size={13} />
          <span>Next 30 Days</span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((event) => {
          const isIncome = event.category === 'SALARY' || event.category === 'BOND_COUPON';

          return (
            <div
              key={event.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: colors.bg.surfaceElevated,
                border: `1px solid ${colors.border.subtle}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: colors.bg.surface,
                    border: `1px solid ${colors.border.subtle}`
                  }}
                >
                  {getEventIcon(event.category)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                      {event.title}
                    </span>
                    {event.isAutomated ? (
                      <Badge variant="brand" size="sm">
                        Auto-Debit
                      </Badge>
                    ) : (
                      <Badge variant="liability" size="sm">
                        Manual Pay
                      </Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px' }}>
                    Due: <b>{event.dueDate}</b> • {event.accountName || 'Primary Account'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isIncome ? colors.financial.incomeText : colors.text.primary,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {isIncome ? '+' : '-'}{formatMoney(event.amount)}
                </div>
                <div style={{ fontSize: '10px', color: colors.text.muted, marginTop: '2px' }}>
                  {event.isPaid ? 'Completed' : 'Scheduled'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
