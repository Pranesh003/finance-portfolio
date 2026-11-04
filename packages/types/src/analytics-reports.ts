import { BaseEntity, CurrencyCode } from './common';

export interface AnalyticsTrendPoint {
  date: string; // ISO date e.g. 2026-01-01
  value: number;
}

export interface NetWorthHistoricalRecord extends BaseEntity {
  userId: string;
  recordDate: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currency: CurrencyCode;
}

export type ReportType =
  | 'NET_WORTH_STATEMENT'
  | 'CASH_FLOW_SUMMARY'
  | 'EXPENSE_BREAKDOWN'
  | 'TAX_SUMMARY'
  | 'INVESTMENT_PERFORMANCE'
  | 'BUDGET_ADHERENCE';

export interface FinancialReportMetadata extends BaseEntity {
  userId: string;
  title: string;
  reportType: ReportType;
  generatedAt: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  downloadUrl?: string;
  format: 'PDF' | 'CSV' | 'JSON';
}

