import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { FinancialAccount } from '@finance/types';
import { Badge } from '../ui/Badge';
import { Building2, CreditCard, ArrowRightLeft, ExternalLink } from 'lucide-react';

export interface AccountBalanceCardProps {
  account: FinancialAccount;
  onTransfer?: (acc: FinancialAccount) => void;
  onViewDetails?: (acc: FinancialAccount) => void;
  style?: React.CSSProperties;
}

export const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  account,
  onTransfer,
  onViewDetails,
  style
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

  const isCredit = account.category === 'CREDIT' || account.accountType === 'CREDIT_CARD';
  const isLoan = account.category === 'LOAN';

  const getTypeBadgeVariant = () => {
    if (isCredit) return 'expense';
    if (isLoan) return 'liability';
    return 'asset';
  };

  return (
    <div
      style={{
        backgroundColor: colors.bg.surface,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.border.strong;
        e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(0, 0, 0, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border.default;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Details */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: colors.bg.surfaceElevated,
                border: `1px solid ${colors.border.subtle}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.text.secondary
              }}
            >
              {isCredit ? <CreditCard size={18} /> : <Building2 size={18} />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>
                {account.name}
              </div>
              <div style={{ fontSize: '12px', color: colors.text.muted, marginTop: '2px' }}>
                {account.institutionName} {account.accountNumberMasked ? `• ${account.accountNumberMasked}` : ''}
              </div>
            </div>
          </div>

          <Badge variant={getTypeBadgeVariant()} size="sm">
            {account.accountType.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Balance Display */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', color: colors.text.secondary }}>
            {isCredit ? 'Current Balance (Owed)' : 'Current Balance'}
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: colors.text.primary,
              letterSpacing: '-0.02em',
              marginTop: '4px',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {formatMoney(account.currentBalance)}
          </div>

          {account.availableBalance !== undefined && !isCredit && (
            <div style={{ fontSize: '12px', color: colors.text.muted, marginTop: '4px' }}>
              Available: <b>{formatMoney(account.availableBalance)}</b>
            </div>
          )}

          {isCredit && account.creditLimit && (
            <div style={{ fontSize: '12px', color: colors.text.muted, marginTop: '4px' }}>
              Limit: <b>{formatMoney(account.creditLimit)}</b> (
              {((account.currentBalance / account.creditLimit) * 100).toFixed(0)}% utilized)
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          marginTop: '18px',
          paddingTop: '12px',
          borderTop: `1px solid ${colors.border.subtle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: colors.financial.income,
            backgroundColor: colors.financial.incomeBg,
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 500
          }}
        >
          {account.status}
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onTransfer && (
            <button
              onClick={() => onTransfer(account)}
              style={{
                background: 'none',
                border: 'none',
                color: colors.brand.primaryLight,
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <ArrowRightLeft size={13} />
              <span>Transfer</span>
            </button>
          )}

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(account)}
              style={{
                background: 'none',
                border: 'none',
                color: colors.text.secondary,
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>Details</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

