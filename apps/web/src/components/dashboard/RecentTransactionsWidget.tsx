import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { RecentTransactionItem } from '@finance/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface RecentTransactionsWidgetProps {
  transactions: RecentTransactionItem[];
  typeFilter: string;
  onFilterChange: (type: string) => void;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  typeFilter,
  onFilterChange,
  onViewAll,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  void isLoading;

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expenses' },
    { key: 'transfer', label: 'Transfers' },
    { key: 'investment', label: 'Investments' }
  ];

  const getTypeIcon = (type: RecentTransactionItem['type']) => {
    switch (type) {
      case 'INCOME':
        return <ArrowDownLeft size={14} color={colors.financial.incomeText} />;
      case 'EXPENSE':
        return <ArrowUpRight size={14} color={colors.financial.expenseText} />;
      case 'TRANSFER':
        return <ArrowLeftRight size={14} color="#A855F7" />;
      case 'INVESTMENT':
        return <TrendingUp size={14} color={colors.brand.primaryLight} />;
    }
  };

  const getAmountColor = (type: RecentTransactionItem['type'], amount: number) => {
    if (type === 'INCOME' || amount > 0) return colors.financial.incomeText;
    if (type === 'EXPENSE') return colors.financial.expenseText;
    if (type === 'TRANSFER') return '#A855F7';
    if (type === 'INVESTMENT') return colors.brand.primaryLight;
    return colors.text.primary;
  };

  return (
    <Card
      title="Recent Financial Transactions"
      subtitle="Unified ledger postings with double-entry classification"
      actions={
        <div style={{ display: 'flex', gap: '4px', backgroundColor: colors.bg.surfaceElevated, padding: '3px', borderRadius: '8px' }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              style={{
                backgroundColor: typeFilter === f.key ? colors.brand.primary : 'transparent',
                color: typeFilter === f.key ? '#FFFFFF' : colors.text.secondary,
                border: 'none',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: typeFilter === f.key ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: colors.text.muted, fontSize: '13px' }}>
            No transactions found for the selected filter.
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: colors.bg.surfaceElevated,
                border: `1px solid ${colors.border.subtle}`,
                transition: 'background 0.15s ease'
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
                  {getTypeIcon(tx.type)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                      {tx.description}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {tx.category}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px' }}>
                    {tx.date} • {tx.accountName}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: getAmountColor(tx.type, tx.amount),
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount)}
                </div>
                <div style={{ fontSize: '10px', color: colors.text.muted, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', marginTop: '1px' }}>
                  <CheckCircle2 size={10} color={colors.financial.incomeText} />
                  <span>{tx.status}</span>
                </div>
              </div>
            </div>
          ))
        )}

        {onViewAll && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View Complete Transaction Ledger
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
