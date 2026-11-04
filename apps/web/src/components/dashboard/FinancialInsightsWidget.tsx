import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { DashboardFinancialInsight } from '@finance/types';
import { Card } from '../ui/Card';
import { Badge, BadgeVariant } from '../ui/Badge';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface FinancialInsightsWidgetProps {
  insights: DashboardFinancialInsight[];
  isLoading?: boolean;
}

export const FinancialInsightsWidget: React.FC<FinancialInsightsWidgetProps> = ({
  insights,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const { toast } = useToast();
  void isLoading;

  const getInsightIcon = (type: DashboardFinancialInsight['type']) => {
    switch (type) {
      case 'ANOMALY':
        return <AlertTriangle size={15} color="#F59E0B" />;
      case 'SUCCESS':
        return <CheckCircle2 size={15} color={colors.financial.incomeText} />;
      case 'WARNING':
        return <AlertTriangle size={15} color={colors.financial.expenseText} />;
      case 'OPPORTUNITY':
      default:
        return <Lightbulb size={15} color={colors.brand.primaryLight} />;
    }
  };

  const getInsightBadgeVariant = (type: DashboardFinancialInsight['type']): BadgeVariant => {
    switch (type) {
      case 'ANOMALY':
        return 'liability';
      case 'SUCCESS':
        return 'income';
      case 'WARNING':
        return 'expense';
      case 'OPPORTUNITY':
      default:
        return 'brand';
    }
  };

  return (
    <Card
      title="Proactive Financial Intelligence & Anomaly Alerts"
      subtitle="Automated heuristics tracking spending surges, rebalancing thresholds, and bill schedules"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.brand.primaryLight }}>
          <Sparkles size={13} />
          <span>Rule Engine Active</span>
        </div>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}
      >
        {insights.map((ins) => (
          <div
            key={ins.id}
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: colors.bg.surfaceElevated,
              border: `1px solid ${colors.border.subtle}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: colors.bg.surface
                    }}
                  >
                    {getInsightIcon(ins.type)}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text.primary }}>
                    {ins.title}
                  </span>
                </div>

                <Badge variant={getInsightBadgeVariant(ins.type)} size="sm">
                  {ins.type}
                </Badge>
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: colors.text.secondary, lineHeight: 1.5 }}>
                {ins.message}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px',
                borderTop: `1px solid ${colors.border.subtle}`
              }}
            >
              {ins.impactAmount ? (
                <span style={{ fontSize: '11px', color: colors.text.muted }}>
                  Impact: <b>{formatMoney(ins.impactAmount)}</b>
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: colors.text.muted }}>
                  {ins.metricRef}
                </span>
              )}

              {ins.actionLabel && (
                <button
                  onClick={() => toast.info(ins.title, `Action initiated: ${ins.actionLabel}`)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: colors.brand.primaryLight,
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <span>{ins.actionLabel}</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
