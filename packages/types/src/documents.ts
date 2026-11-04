import { BaseEntity } from './common';

export type DocumentCategory =
  | 'BANK_STATEMENT'
  | 'TAX_DOCUMENT'
  | 'INVESTMENT_REPORT'
  | 'INSURANCE_POLICY'
  | 'RECEIPT'
  | 'LOAN_AGREEMENT'
  | 'PROPERTY_DEED'
  | 'OTHER';

export interface FinancialDocument extends BaseEntity {
  userId: string;
  category: DocumentCategory;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageKey: string;
  uploadedAt: string;
  description?: string;
  tags: string[];
  extractedMetadata?: Record<string, unknown>;
  associatedAccountId?: string;
  associatedTransactionId?: string;
}

