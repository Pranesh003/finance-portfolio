import { BaseEntity, CurrencyCode } from './common';

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface CategoryBudget {
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
}

export interface Budget extends BaseEntity {
  userId: string;
  name: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  totalLimitAmount: number;
  totalSpentAmount: number;
  currency: CurrencyCode;
  categoryBudgets: CategoryBudget[];
  alertThresholdPercentage: number; // e.g. 80%
  isActive: boolean;
}

export type GoalCategory =
  | 'EMERGENCY_FUND'
  | 'RETIREMENT'
  | 'HOME_DOWNPAYMENT'
  | 'VACATION'
  | 'VEHICLE_PURCHASE'
  | 'DEBT_PAYOFF'
  | 'EDUCATION'
  | 'WEDDING'
  | 'WEALTH_MILESTONE'
  | 'CUSTOM';

export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';

export interface GoalMilestone {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  isReached: boolean;
  reachedAt?: string;
}

export interface FinancialGoal extends BaseEntity {
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  targetDate: string;
  linkedAccountId?: string;
  monthlyContributionTarget: number;
  projectedCompletionDate?: string;
  milestones: GoalMilestone[];
}

