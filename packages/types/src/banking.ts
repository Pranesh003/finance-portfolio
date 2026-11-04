import { BaseEntity, CurrencyCode } from './common';

export type AccountType =
  | 'CHECKING'
  | 'SAVINGS'
  | 'MONEY_MARKET'
  | 'CERTIFICATE_OF_DEPOSIT'
  | 'CREDIT_CARD'
  | 'BROKERAGE'
  | 'RETIREMENT_401K'
  | 'RETIREMENT_IRA'
  | 'ROTH_IRA'
  | 'CRYPTO_WALLET'
  | 'MORTGAGE'
  | 'STUDENT_LOAN'
  | 'AUTO_LOAN'
  | 'PERSONAL_LOAN'
  | 'CASH'
  | 'OTHER_ASSET'
  | 'OTHER_LIABILITY';

export type AccountCategory = 'DEPOSITORY' | 'CREDIT' | 'INVESTMENT' | 'LOAN' | 'OTHER';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'FROZEN';

export interface FinancialAccount extends BaseEntity {
  userId: string;
  name: string;
  accountType: AccountType;
  category: AccountCategory;
  currency: CurrencyCode;
  currentBalance: number;
  availableBalance?: number;
  creditLimit?: number;
  interestRate?: number;
  institutionName: string;
  accountNumberMasked?: string;
  status: AccountStatus;
  isManual: boolean;
  institutionId?: string;
  lastSyncedAt?: string;
}

export interface BalanceSnapshot extends BaseEntity {
  accountId: string;
  balance: number;
  snapshotDate: string;
  currency: CurrencyCode;
}

export interface BankInstitution {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  primaryColor?: string;
  country: string;
  supportsOAuth: boolean;
}

