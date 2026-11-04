import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../api';
import { QuickAddPayload, AssetCategoryKey, LiabilityTypeKey } from '@finance/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { Tabs } from '../ui/Tabs';
import { ShieldCheck } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { colors } = useTheme();
  const { currency } = useCurrency();
  const { toast } = useToast();

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;

  const [activeType, setActiveType] = useState<QuickAddPayload['type']>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('HDFC Classic Salary');
  const [toAccountId, setToAccountId] = useState('SBI Wealth Privilege Savings');
  const [assetClass, setAssetClass] = useState<AssetCategoryKey>('INDIAN_STOCKS');
  const [liabilityType, setLiabilityType] = useState<LiabilityTypeKey>('PERSONAL_LOAN');
  const [interestRate, setInterestRate] = useState('8.5');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Invalid Input', 'Please enter a valid title and positive numeric amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: QuickAddPayload = {
        type: activeType,
        title: title.trim(),
        amount: numAmount,
        category: category || undefined,
        accountId: accountId || undefined,
        toAccountId: activeType === 'TRANSFER' ? toAccountId : undefined,
        assetClass: activeType === 'INVESTMENT' || activeType === 'ASSET' ? assetClass : undefined,
        liabilityType: activeType === 'LIABILITY' ? liabilityType : undefined,
        interestRate: activeType === 'LIABILITY' ? parseFloat(interestRate) : undefined,
        date: new Date().toISOString().split('T')[0],
        notes: notes || undefined
      };

      const res = await apiClient.dashboard.quickAdd(payload);
      toast.success('Record Saved', res.data.message);
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Submission Failed', err.message || 'Could not record financial transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick-Add Financial Record"
      maxWidth={540}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Type Selector Tabs */}
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <Tabs
            tabs={[
              { id: 'EXPENSE', label: 'Expense' },
              { id: 'INCOME', label: 'Income' },
              { id: 'TRANSFER', label: 'Transfer' },
              { id: 'INVESTMENT', label: 'Investment' },
              { id: 'ASSET', label: 'Asset' },
              { id: 'LIABILITY', label: 'Liability' }
            ]}
            activeTab={activeType}
            onChange={(t) => {
              setActiveType(t as QuickAddPayload['type']);
              resetForm();
            }}
            variant="pill"
          />
        </div>

        {activeType === 'TRANSFER' && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: `${colors.brand.primary}12`,
              borderRadius: '8px',
              fontSize: '11px',
              color: colors.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={14} color={colors.brand.primaryLight} />
            <span>Internal transfer: preserves Net Worth & prevents double counting.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Title */}
          <FormField label="Description / Title" required>
            <Input
              placeholder={
                activeType === 'EXPENSE'
                  ? 'e.g., Grocery Shopping at Nature Basket'
                  : activeType === 'INCOME'
                  ? 'e.g., TCS Quarterly Dividend'
                  : activeType === 'TRANSFER'
                  ? 'e.g., Transfer to Emergency Savings'
                  : activeType === 'INVESTMENT'
                  ? 'e.g., 10 shares of Reliance Industries'
                  : activeType === 'ASSET'
                  ? 'e.g., 2 BHK Apartment in Whitefield'
                  : 'e.g., Car Loan Balance'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          {/* Amount */}
          <FormField label="Amount" required>
            <Input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              leftIcon={<span style={{ fontWeight: 700 }}>{currencySymbol}</span>}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </FormField>

          {/* Type specific fields */}
          {(activeType === 'EXPENSE' || activeType === 'INCOME') && (
            <FormField label="Category">
              <Input
                placeholder={activeType === 'EXPENSE' ? 'e.g., Groceries, Housing, Dining' : 'e.g., Salary, Dividend, Consulting'}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </FormField>
          )}

          {activeType === 'TRANSFER' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <FormField label="From Account">
                <Input value={accountId} onChange={(e) => setAccountId(e.target.value)} />
              </FormField>
              <FormField label="To Account">
                <Input value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} />
              </FormField>
            </div>
          )}

          {activeType === 'INVESTMENT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <FormField label="Asset Class">
                <select
                  value={assetClass}
                  onChange={(e) => setAssetClass(e.target.value as AssetCategoryKey)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: colors.bg.surfaceElevated,
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.subtle}`
                  }}
                >
                  <option value="INDIAN_STOCKS">Indian Equities</option>
                  <option value="MUTUAL_FUNDS">Mutual Funds</option>
                  <option value="ETFS">ETFs</option>
                  <option value="INTL_STOCKS">International Stocks</option>
                  <option value="GOLD">Gold & Bullion</option>
                  <option value="BONDS">Bonds & Fixed Income</option>
                  <option value="CRYPTO">Cryptocurrency</option>
                </select>
              </FormField>

              <FormField label="Funding Account">
                <Input value={accountId} onChange={(e) => setAccountId(e.target.value)} />
              </FormField>
            </div>
          )}

          {activeType === 'LIABILITY' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <FormField label="Debt Type">
                <select
                  value={liabilityType}
                  onChange={(e) => setLiabilityType(e.target.value as LiabilityTypeKey)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: colors.bg.surfaceElevated,
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.subtle}`
                  }}
                >
                  <option value="HOME_LOAN">Home Loan / Mortgage</option>
                  <option value="AUTO_LOAN">Auto Loan</option>
                  <option value="PERSONAL_LOAN">Personal Loan</option>
                  <option value="CREDIT_CARD">Credit Card Outstanding</option>
                  <option value="EDUCATION_LOAN">Education Loan</option>
                </select>
              </FormField>

              <FormField label="Annual Interest Rate (%)">
                <Input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </FormField>
            </div>
          )}

          {/* Notes */}
          <FormField label="Notes & Tags (Optional)">
            <Input
              placeholder="e.g., Tax deductible, receipt attached"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Record {activeType}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
