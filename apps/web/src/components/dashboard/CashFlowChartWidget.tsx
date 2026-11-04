import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CashFlowDataPoint, CashFlowGrouping } from '@finance/types';
import { Card } from '../ui/Card';

interface CashFlowChartWidgetProps {
  data: CashFlowDataPoint[];
  grouping: CashFlowGrouping;
  onGroupingChange: (g: CashFlowGrouping) => void;
  isLoading?: boolean;
}

export const CashFlowChartWidget: React.FC<CashFlowChartWidgetProps> = ({
  data,
  grouping,
  onGroupingChange,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  void isLoading;

  const GROUPINGS: { key: CashFlowGrouping; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'yearly', label: 'Yearly' }
  ];

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.income, d.expenses, d.investments, d.savings]),
    1000
  );

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <Card
      title="Cash Flow Dynamics & Allocation"
      subtitle="Comparing earned income, living spend, systematic investments, and retained savings"
      actions={
        <div style={{ display: 'flex', gap: '3px', backgroundColor: colors.bg.surfaceElevated, padding: '3px', borderRadius: '8px' }}>
          {GROUPINGS.map((g) => (
            <button
              key={g.key}
              onClick={() => onGroupingChange(g.key)}
              style={{
                backgroundColor: grouping === g.key ? colors.brand.primary : 'transparent',
                color: grouping === g.key ? '#FFFFFF' : colors.text.secondary,
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: grouping === g.key ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Category Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.text.secondary }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: colors.financial.income }} />
            <span>Income</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.text.secondary }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: colors.financial.liability }} />
            <span>Expenses</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.text.secondary }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: colors.brand.primaryLight }} />
            <span>Investments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.text.secondary }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#F59E0B' }} />
            <span>Savings</span>
          </div>
        </div>

        {/* Grouped Bar Chart Area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '12px',
            height: '180px',
            paddingTop: '20px',
            borderBottom: `1px solid ${colors.border.subtle}`
          }}
        >
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={item.periodLabel}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  height: '100%',
                  justifyContent: 'flex-end',
                  cursor: 'pointer',
                  opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1,
                  transition: 'opacity 0.15s ease'
                }}
              >
                {/* 4 Grouped Bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center' }}>
                  {/* Income */}
                  <div
                    style={{
                      width: '7px',
                      height: `${(item.income / maxVal) * 140}px`,
                      backgroundColor: colors.financial.income,
                      borderRadius: '3px 3px 0 0'
                    }}
                    title={`Income: ${formatMoney(item.income)}`}
                  />
                  {/* Expenses */}
                  <div
                    style={{
                      width: '7px',
                      height: `${(item.expenses / maxVal) * 140}px`,
                      backgroundColor: colors.financial.liability,
                      borderRadius: '3px 3px 0 0'
                    }}
                    title={`Expenses: ${formatMoney(item.expenses)}`}
                  />
                  {/* Investments */}
                  <div
                    style={{
                      width: '7px',
                      height: `${(item.investments / maxVal) * 140}px`,
                      backgroundColor: colors.brand.primaryLight,
                      borderRadius: '3px 3px 0 0'
                    }}
                    title={`Investments: ${formatMoney(item.investments)}`}
                  />
                  {/* Savings */}
                  <div
                    style={{
                      width: '7px',
                      height: `${(item.savings / maxVal) * 140}px`,
                      backgroundColor: '#F59E0B',
                      borderRadius: '3px 3px 0 0'
                    }}
                    title={`Savings: ${formatMoney(item.savings)}`}
                  />
                </div>

                {/* X Axis Label */}
                <span
                  style={{
                    fontSize: '11px',
                    color: isHovered ? colors.text.primary : colors.text.muted,
                    fontWeight: isHovered ? 700 : 500,
                    marginTop: '8px'
                  }}
                >
                  {item.periodLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Period Metrics Strip */}
        {activePoint && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.bg.surfaceElevated,
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${colors.border.subtle}`,
              fontSize: '12px'
            }}
          >
            <div style={{ fontWeight: 600, color: colors.text.primary }}>
              Period: {activePoint.periodLabel}
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span>Income: <b style={{ color: colors.financial.incomeText }}>{formatMoney(activePoint.income)}</b></span>
              <span>Expenses: <b style={{ color: colors.financial.expenseText }}>{formatMoney(activePoint.expenses)}</b></span>
              <span>Invested: <b style={{ color: colors.brand.primaryLight }}>{formatMoney(activePoint.investments)}</b></span>
              <span>Retained: <b style={{ color: '#F59E0B' }}>{formatMoney(activePoint.savings)}</b></span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
