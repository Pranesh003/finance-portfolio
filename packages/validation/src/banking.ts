import { z } from 'zod';
import { currencyEnum } from './common';

export const accountTypeEnum = z.enum([
  'CHECKING',
  'SAVINGS',
  'MONEY_MARKET',
  'CERTIFICATE_OF_DEPOSIT',
  'CREDIT_CARD',
  'BROKERAGE',
  'RETIREMENT_401K',
  'RETIREMENT_IRA',
  'ROTH_IRA',
  'CRYPTO_WALLET',
  'MORTGAGE',
  'STUDENT_LOAN',
  'AUTO_LOAN',
  'PERSONAL_LOAN',
  'CASH',
  'OTHER_ASSET',
  'OTHER_LIABILITY'
]);

export const accountCategoryEnum = z.enum([
  'DEPOSITORY',
  'CREDIT',
  'INVESTMENT',
  'LOAN',
  'OTHER'
]);

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  accountType: accountTypeEnum,
  category: accountCategoryEnum,
  currency: currencyEnum.default('USD'),
  initialBalance: z.number().default(0),
  institutionName: z.string().min(1, 'Institution name is required').max(100),
  creditLimit: z.number().positive().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  accountNumberMasked: z.string().max(10).optional(),
  isManual: z.boolean().default(true)
});

export const updateAccountSchema = createAccountSchema.partial();

