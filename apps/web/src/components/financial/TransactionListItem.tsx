import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { FinancialTransaction } from '@finance/types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  ShoppingBag,
  Home,
  Briefcase,
  Zap,
  Coffee,
  CheckCircle2,
  Clock
} from 'lucide-react';

export interface TransactionListItemProps {
  transaction: FinancialTransaction;
  accountName?: string;
  onClick?: (tx: FinancialTransaction) => void;
  style?: React.CSSProperties;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  accountName,
  onClick,
  style
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

  const isIncome = transaction.type === 'INCOME';
  const isTransfer = transaction.type === 'TRANSFER';

  const getCategoryIcon = () => {
    const desc = (transaction.description + ' ' + (transaction.merchantName || '')).toLowerCase();
    if (desc.includes('payroll') || desc.includes('salary') || desc.includes('deposit')) return <Briefcase size={16} />;
    if (desc.includes('food') || desc.includes('market') || desc.includes('grocery')) return <ShoppingBag size={16} />;
    if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('home')) return <Home size={16} />;
    if (desc.includes('util') || desc.includes('electric') || desc.includes('bill')) return <Zap size={16} />;
    if (desc.includes('coffee') || desc.includes('dining') || desc.includes('cafe')) return <Coffee size={16} />;
    if (isTransfer) return <ArrowRightLeft size={16} />;
    return isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />;
  };

  const getCategoryColor = () => {
    if (isIncome) return { bg: colors.financial.incomeBg, text: colors.financial.incomeText };
    if (isTransfer) return { bg: colors.brand.primaryMuted, text: colors.brand.primaryLight };
    return { bg: colors.financial.expenseBg, text: colors.financial.expenseText };
  };

  const iconColors = getCategoryColor();

  return (
    <div
      onClick={() => onClick && onClick(transaction)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.12s ease',
        boxSizing: 'border-box',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg.surfaceElevated;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Left: Icon & Merchant */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            backgroundColor: iconColors.bg,
            color: iconColors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {getCategoryIcon()}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: colors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {transaction.description}
          </div>
          <div style={{ fontSize: '12px', color: colors.text.muted, marginTop: '2px', display: 'flex', gap: '6px' }}>
            <span>{new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {accountName && <span>• {accountName}</span>}
          </div>
        </div>
      </div>

      {/* Right: Amount & Status */}
      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: isIncome
              ? colors.financial.incomeText
              : isTransfer
              ? colors.text.primary
              : colors.financial.expenseText
          }}
        >
          {isIncome ? '+' : isTransfer ? '' : '-'}
          {formatMoney(transaction.amount)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '3px' }}>
          {transaction.status === 'POSTED' ? (
            <span style={{ fontSize: '11px', color: colors.text.muted, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={11} color={colors.financial.income} />
              <span>Posted</span>
            </span>
          ) : (
            <span style={{ fontSize: '11px', color: colors.financial.liabilityText, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={11} />
              <span>Pending</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

