import { z } from 'zod';
import { currencyEnum, paginationQuerySchema } from './common';

export const transactionTypeEnum = z.enum([
  'INCOME',
  'EXPENSE',
  'TRANSFER',
  'INVESTMENT_BUY',
  'INVESTMENT_SELL',
  'DIVIDEND',
  'INTEREST',
  'FEE',
  'TAX',
  'REFUND'
]);

export const transactionStatusEnum = z.enum(['PENDING', 'POSTED', 'FAILED', 'RECONCILED']);

export const createTransactionSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  type: transactionTypeEnum,
  status: transactionStatusEnum.default('POSTED'),
  amount: z.number().positive('Amount must be positive'),
  currency: currencyEnum.default('USD'),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  description: z.string().min(1, 'Description is required').max(255),
  notes: z.string().max(1000).optional(),
  merchantName: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).default([]),
  transferDestinationAccountId: z.string().uuid().optional()
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFilterSchema = paginationQuerySchema.extend({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: transactionTypeEnum.optional(),
  status: transactionStatusEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional()
});

