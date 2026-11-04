import { BaseEntity } from './common';

export type InsightType =
  | 'SPENDING_ANOMALY'
  | 'SAVINGS_OPPORTUNITY'
  | 'RECURRING_SUBSCRIPTION_INCREASE'
  | 'PORTFOLIO_DIVERSIFICATION_ALERT'
  | 'TAX_LOSS_HARVESTING_CANDIDATE'
  | 'DEBT_OPTIMIZATION_RECOMMENDATION';

export type InsightImpact = 'POSITIVE' | 'NEUTRAL' | 'WARNING' | 'CRITICAL';

export interface FinancialInsight extends BaseEntity {
  userId: string;
  type: InsightType;
  title: string;
  summary: string;
  detailedAnalysis: string;
  impact: InsightImpact;
  actionableStep?: string;
  potentialSavingsEstimate?: number;
  confidenceScore: number; // 0 to 1
  isDismissed: boolean;
  expiresAt?: string;
}

export interface AIAdvisorQueryRequest {
  prompt: string;
  contextScope?: 'ALL' | 'INVESTMENTS' | 'BUDGETS' | 'TAX' | 'CASH_FLOW';
  conversationHistory?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}

export interface AIAdvisorQueryResponse {
  answer: string;
  sourcesUsed: string[];
  suggestedFollowUps: string[];
  disclaimer: string;
}

