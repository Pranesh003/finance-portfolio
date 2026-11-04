import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FinancialHealthOverview, HealthStatus } from '@finance/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  HeartPulse,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FinancialHealthWidgetProps {
  health: FinancialHealthOverview;
  isLoading?: boolean;
}

export const FinancialHealthWidget: React.FC<FinancialHealthWidgetProps> = ({
  health,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const [expandedMetricId, setExpandedMetricId] = useState<string | null>(null);
  void isLoading;

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return <Badge variant="income" size="sm">Optimal</Badge>;
      case 'GOOD':
        return <Badge variant="brand" size="sm">Good</Badge>;
      case 'WARNING':
        return <Badge variant="liability" size="sm">Attention</Badge>;
      case 'CRITICAL':
        return <Badge variant="expense" size="sm">Critical</Badge>;
    }
  };

  return (
    <Card
      title="Financial Health & Solvency Diagnostics"
      subtitle="7 institutional wealth ratios computed dynamically against institutional benchmarks"
      actions={
        <Badge variant="income" size="md">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HeartPulse size={14} /> Overall Health: {health.overallScore} / 100
          </span>
        </Badge>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px'
          }}
        >
          {health.metrics.map((metric) => {
            const isExpanded = expandedMetricId === metric.id;

            return (
              <div
                key={metric.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: colors.bg.surfaceElevated,
                  border: `1px solid ${isExpanded ? colors.brand.primary : colors.border.subtle}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setExpandedMetricId(isExpanded ? null : metric.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: colors.text.muted, fontWeight: 600, textTransform: 'uppercase' }}>
                      {metric.name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text.primary, marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                      {metric.formattedValue}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getStatusBadge(metric.status)}
                    {isExpanded ? <ChevronUp size={14} color={colors.text.muted} /> : <ChevronDown size={14} color={colors.text.muted} />}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: colors.text.secondary }}>
                  <span>Benchmark: <b>{metric.benchmark}</b></span>
                  <span style={{ color: colors.brand.primaryLight }}>Click for formula</span>
                </div>

                {/* Expanded Formula & Explanation Accordion */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: `1px solid ${colors.border.subtle}`,
                      fontSize: '11px',
                      color: colors.text.secondary,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div>
                      <span style={{ color: colors.text.muted, fontWeight: 600 }}>Formula: </span>
                      <code style={{ backgroundColor: colors.bg.surface, padding: '2px 4px', borderRadius: '4px', fontSize: '10px', color: colors.brand.primaryLight }}>
                        {metric.formula}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: colors.text.muted, fontWeight: 600 }}>Insight: </span>
                      <span>{metric.guidance}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: `${colors.brand.primary}10`,
            borderRadius: '8px',
            border: `1px solid ${colors.brand.primary}30`,
            fontSize: '11px',
            color: colors.text.secondary
          }}
        >
          <Info size={14} color={colors.brand.primaryLight} style={{ flexShrink: 0 }} />
          <span>
            Financial health indices are mathematically calculated directly from double-entry accounts, debt commitments, and current cash runway without approximation.
          </span>
        </div>
      </div>
    </Card>
  );
};
