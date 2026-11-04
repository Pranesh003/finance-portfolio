import { BaseEntity, CurrencyCode } from './common';

export type TransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'TRANSFER'
  | 'INVESTMENT_BUY'
  | 'INVESTMENT_SELL'
  | 'DIVIDEND'
  | 'INTEREST'
  | 'FEE'
  | 'TAX'
  | 'REFUND';

export type TransactionStatus = 'PENDING' | 'POSTED' | 'FAILED' | 'RECONCILED';

export interface TransactionCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  parentCategoryId?: string;
  isCustom: boolean;
}

export interface FinancialTransaction extends BaseEntity {
  userId: string;
  accountId: string;
  categoryId?: string;
  category?: TransactionCategory;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;
  date: string; // ISO date string
  description: string;
  notes?: string;
  merchantName?: string;
  tags: string[];
  isRecurring: boolean;
  recurringScheduleId?: string;
  transferDestinationAccountId?: string;
  exchangeRate?: number;
}

export type RecurringFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUALLY';

export interface RecurringSchedule extends BaseEntity {
  userId: string;
  accountId: string;
  categoryId?: string;
  amount: number;
  currency: CurrencyCode;
  description: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  nextExecutionDate: string;
  isActive: boolean;
}

export interface CashFlowSummary {
  periodStart: string;
  periodEnd: string;
  currency: CurrencyCode;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  savingsRatePercentage: number;
  breakdownByCategory: {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    percentage: number;
    type: 'INCOME' | 'EXPENSE';
  }[];
}

