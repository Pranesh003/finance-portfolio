import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { Tabs } from '../ui/Tabs';
import { DollarSign, Tag, Calendar as CalendarIcon } from 'lucide-react';

export interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickAddTransactionModal: React.FC<QuickAddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Groceries');
  const [account, setAccount] = useState<string>('Chase Checking (•••• 4821)');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0] || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid positive financial transaction amount.');
      return;
    }
    if (!description.trim()) {
      toast.error('Missing Description', 'Please provide a brief note or merchant name.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        'Transaction Recorded',
        `Successfully logged ${type.toLowerCase()} of $${Number(amount).toFixed(2)} for "${description}".`
      );
      setAmount('');
      setDescription('');
      onClose();
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add Transaction"
      subtitle="Log a new income, expense, or transfer"
      maxWidth={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Record Transaction
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Type Selector Tabs */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, color: colors.text.secondary, marginBottom: '6px', display: 'block' }}>
            Transaction Type
          </label>
          <Tabs
            variant="pill"
            tabs={[
              { id: 'EXPENSE', label: 'Expense' },
              { id: 'INCOME', label: 'Income' },
              { id: 'TRANSFER', label: 'Transfer' }
            ]}
            activeTab={type}
            onChange={(val) => setType(val as any)}
            style={{ width: '100%', display: 'flex' }}
          />
        </div>

        {/* Amount */}
        <FormField label="Amount" required>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<DollarSign size={16} />}
            autoFocus
          />
        </FormField>

        {/* Description / Merchant */}
        <FormField label="Description or Merchant" required>
          <Input
            placeholder="e.g. Whole Foods, Monthly Rent, Freelance Client"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            leftIcon={<Tag size={16} />}
          />
        </FormField>

        {/* Account and Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FormField label="Account">
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              style={{
                height: 40,
                backgroundColor: colors.bg.surfaceElevated,
                border: `1px solid ${colors.border.default}`,
                borderRadius: 8,
                color: colors.text.primary,
                padding: '0 10px',
                fontSize: 13,
                outline: 'none'
              }}
            >
              <option value="Chase Checking (•••• 4821)">Chase Checking (•••• 4821)</option>
              <option value="Marcus HYSA (•••• 9014)">Marcus HYSA (•••• 9014)</option>
              <option value="Chase Sapphire Card (•••• 3389)">Chase Sapphire (•••• 3389)</option>
            </select>
          </FormField>

          <FormField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                height: 40,
                backgroundColor: colors.bg.surfaceElevated,
                border: `1px solid ${colors.border.default}`,
                borderRadius: 8,
                color: colors.text.primary,
                padding: '0 10px',
                fontSize: 13,
                outline: 'none'
              }}
            >
              <option value="Groceries">Groceries & Food</option>
              <option value="Housing">Housing & Rent</option>
              <option value="Utilities">Utilities & Bills</option>
              <option value="Investments">Investments</option>
              <option value="Salary">Salary & Wages</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </FormField>
        </div>

        {/* Date */}
        <FormField label="Date">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            leftIcon={<CalendarIcon size={16} />}
          />
        </FormField>
      </form>
    </Modal>
  );
};
