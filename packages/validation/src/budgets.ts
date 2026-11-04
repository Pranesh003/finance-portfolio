import { z } from 'zod';
import { currencyEnum } from './common';

export const createBudgetSchema = z.object({
  name: z.string().min(1).max(100),
  period: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL']).default('MONTHLY'),
  startDate: z.string(),
  endDate: z.string(),
  totalLimitAmount: z.number().positive(),
  currency: currencyEnum.default('USD'),
  alertThresholdPercentage: z.number().min(1).max(100).default(80),
  categoryBudgets: z.array(
    z.object({
      categoryId: z.string().uuid(),
      limitAmount: z.number().positive()
    })
  ).default([])
});

export const createFinancialGoalSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
  category: z.enum([
    'EMERGENCY_FUND',
    'RETIREMENT',
    'HOME_DOWNPAYMENT',
    'VACATION',
    'VEHICLE_PURCHASE',
    'DEBT_PAYOFF',
    'EDUCATION',
    'WEDDING',
    'WEALTH_MILESTONE',
    'CUSTOM'
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  targetAmount: z.number().positive(),
  initialAmount: z.number().min(0).default(0),
  currency: currencyEnum.default('USD'),
  targetDate: z.string(),
  monthlyContributionTarget: z.number().min(0).default(0),
  linkedAccountId: z.string().uuid().optional()
});

