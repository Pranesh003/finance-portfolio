import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { AccountOverviewItem } from '@finance/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Building2,
  CreditCard,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface AccountOverviewWidgetProps {
  accounts: AccountOverviewItem[];
  onAddAccount?: () => void;
  isLoading?: boolean;
}

export const AccountOverviewWidget: React.FC<AccountOverviewWidgetProps> = ({
  accounts,
  onAddAccount,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  void isLoading;

  const getAccountIcon = (type: AccountOverviewItem['accountType']) => {
    switch (type) {
      case 'CHECKING':
      case 'SAVINGS':
        return <Building2 size={16} />;
      case 'CREDIT_CARD':
        return <CreditCard size={16} />;
      case 'BROKERAGE':
        return <TrendingUp size={16} />;
      case 'VAULT':
      case 'WALLET':
      default:
        return <Wallet size={16} />;
    }
  };

  return (
    <Card
      title="Connected Accounts & Depository Overview"
      subtitle="Aggregated balances from Open Banking, Demat brokerages, and manual vaults"
      actions={
        <Button variant="outline" size="sm" onClick={onAddAccount} leftIcon={<Plus size={14} />}>
          Connect Account
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {accounts.map((acc) => {
          const isCredit = acc.accountType === 'CREDIT_CARD';
          const isNegative = acc.balance < 0;

          return (
            <div
              key={acc.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: colors.bg.surfaceElevated,
                border: `1px solid ${colors.border.subtle}`,
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: `${colors.brand.primary}18`,
                    color: colors.brand.primaryLight
                  }}
                >
                  {getAccountIcon(acc.accountType)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text.primary }}>
                      {acc.name}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {acc.accountType}
                    </Badge>
                    {acc.isManual && (
                      <Badge variant="brand" size="sm">
                        Manual
                      </Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.text.muted, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{acc.institutionName}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={10} color={colors.financial.incomeText} /> {acc.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: isNegative || isCredit ? colors.financial.liability : colors.financial.incomeText,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {formatMoney(Math.abs(acc.balance))}
                </div>
                <div style={{ fontSize: '10px', color: colors.text.muted, marginTop: '2px' }}>
                  {acc.currency} • Synced recently
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
