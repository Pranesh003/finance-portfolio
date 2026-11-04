import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { FinancialGoal } from '@finance/types';
import { ProgressBar } from '../ui/ProgressBar';
import { Target } from 'lucide-react';

export interface GoalProgressCardProps {
  goal: FinancialGoal;
  style?: React.CSSProperties;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goal, style }) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();

  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <div
      style={{
        backgroundColor: colors.bg.surface,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '12px',
        padding: '18px 20px',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              backgroundColor: colors.brand.primaryMuted,
              color: colors.brand.primaryLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Target size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>
              {goal.title}
            </div>
            <div style={{ fontSize: '12px', color: colors.text.muted, marginTop: '2px' }}>
              Target Date: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: colors.brand.primaryLight,
            backgroundColor: colors.brand.primaryMuted,
            padding: '2px 8px',
            borderRadius: '6px'
          }}
        >
          {progress.toFixed(0)}%
        </span>
      </div>

      {/* Progress Amount & Bar */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
          <span style={{ color: colors.text.secondary }}>
            Funded: <b>{formatMoney(goal.currentAmount)}</b>
          </span>
          <span style={{ color: colors.text.secondary }}>
            Target: <b>{formatMoney(goal.targetAmount)}</b>
          </span>
        </div>

        <ProgressBar value={progress} color={colors.brand.primary} height={8} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '12px', color: colors.text.muted }}>
          <span>Remaining: {formatMoney(remaining)}</span>
          {goal.monthlyContributionTarget > 0 && (
            <span>+{formatMoney(goal.monthlyContributionTarget)}/mo</span>
          )}
        </div>
      </div>
    </div>
  );
};
