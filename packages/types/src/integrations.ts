import { BaseEntity } from './common';

export type IntegrationProviderName =
  | 'PLAID'
  | 'YODLEE'
  | 'SALTEDGE'
  | 'COINBASE'
  | 'BINANCE'
  | 'ALPACA'
  | 'STRIPE'
  | 'CUSTOM_WEBHOOK';

export type SyncStatus = 'HEALTHY' | 'SYNCING' | 'ACTION_REQUIRED' | 'DISCONNECTED' | 'ERROR';

export interface IntegrationConnection extends BaseEntity {
  userId: string;
  provider: IntegrationProviderName;
  institutionId?: string;
  institutionName: string;
  status: SyncStatus;
  lastSuccessfulSyncAt?: string;
  lastAttemptedSyncAt?: string;
  errorMessage?: string;
  accountsLinkedCount: number;
}

