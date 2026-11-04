import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

export interface MonthlyCashFlowPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface CashFlowBarChartProps {
  data: MonthlyCashFlowPoint[];
  height?: number;
}

export const CashFlowBarChart: React.FC<CashFlowBarChartProps> = ({
  data,
  height = 240
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) return null;

  const width = 800;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 40;

  const maxVal =
    Math.max(...data.flatMap((d) => [d.income, d.expenses])) * 1.15;

  const groupWidth = (width - paddingX * 2) / data.length;
  const barWidth = 14;
  const barGap = 6;

  const chartHeight = height - paddingTop - paddingBottom;

  const getBarHeight = (val: number) => {
    return Math.max(4, (val / maxVal) * chartHeight);
  };

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="none"
      >
        {/* Horizontal gridlines */}
        {[0, 0.33, 0.66, 1].map((pct, idx) => {
          const y = height - paddingBottom - pct * chartHeight;
          const val = pct * maxVal;
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke={colors.border.subtle}
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                fill={colors.text.muted}
                fontSize="10"
                fontFamily="inherit"
              >
                {formatMoney(val)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const groupCenterX = paddingX + i * groupWidth + groupWidth / 2;
          const incomeHeight = getBarHeight(d.income);
          const expenseHeight = getBarHeight(d.expenses);

          const incomeX = groupCenterX - barWidth - barGap / 2;
          const expenseX = groupCenterX + barGap / 2;

          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Income Bar */}
              <rect
                x={incomeX}
                y={height - paddingBottom - incomeHeight}
                width={barWidth}
                height={incomeHeight}
                rx={4}
                fill={colors.financial.income}
                opacity={hoveredIdx !== null && !isHovered ? 0.4 : 0.9}
                style={{ transition: 'opacity 0.2s ease' }}
              />

              {/* Expense Bar */}
              <rect
                x={expenseX}
                y={height - paddingBottom - expenseHeight}
                width={barWidth}
                height={expenseHeight}
                rx={4}
                fill={colors.financial.expense}
                opacity={hoveredIdx !== null && !isHovered ? 0.4 : 0.85}
                style={{ transition: 'opacity 0.2s ease' }}
              />

              {/* X Axis Label */}
              <text
                x={groupCenterX}
                y={height - 14}
                textAnchor="middle"
                fill={isHovered ? colors.text.primary : colors.text.secondary}
                fontSize="11"
                fontWeight={isHovered ? '600' : '400'}
                fontFamily="inherit"
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Floating Box */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: `${((paddingX + hoveredIdx * groupWidth + groupWidth / 2) / width) * 100}%`,
            transform: 'translateX(-50%)',
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.border.strong}`,
            borderRadius: '8px',
            padding: '8px 12px',
            pointerEvents: 'none',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
            zIndex: 10,
            minWidth: '130px'
          }}
        >
          <div style={{ fontSize: '11px', color: colors.text.muted, fontWeight: 600 }}>
            {data[hoveredIdx].month}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
            <span style={{ color: colors.financial.incomeText }}>Inflow:</span>
            <b style={{ color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(data[hoveredIdx].income)}
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '2px' }}>
            <span style={{ color: colors.financial.expenseText }}>Outflow:</span>
            <b style={{ color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(data[hoveredIdx].expenses)}
            </b>
          </div>
        </div>
      )}
    </div>
  );
};

