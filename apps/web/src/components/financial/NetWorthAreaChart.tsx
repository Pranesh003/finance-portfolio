import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

export interface DataPoint {
  label: string;
  value: number;
}

export interface NetWorthAreaChartProps {
  data: DataPoint[];
  height?: number;
}

export const NetWorthAreaChart: React.FC<NetWorthAreaChartProps> = ({
  data,
  height = 240
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const width = 800; // SVG viewBox coordinate system
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 40;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.96;
  const maxVal = Math.max(...values) * 1.02;

  const getX = (index: number) => {
    return paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
  };

  const getY = (value: number) => {
    return (
      height -
      paddingBottom -
      ((value - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom)
    );
  };

  // Build SVG Path
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(data.length - 1)},${height - paddingBottom} L ${getX(0)},${height - paddingBottom} Z`;

  // Gridlines
  const yTicks = [
    minVal,
    minVal + (maxVal - minVal) * 0.33,
    minVal + (maxVal - minVal) * 0.66,
    maxVal
  ];

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.brand.primary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors.brand.primary} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines */}
        {yTicks.map((val, idx) => (
          <g key={idx}>
            <line
              x1={paddingX}
              y1={getY(val)}
              x2={width - paddingX}
              y2={getY(val)}
              stroke={colors.border.subtle}
              strokeDasharray="4 4"
            />
            <text
              x={paddingX - 8}
              y={getY(val) + 4}
              textAnchor="end"
              fill={colors.text.muted}
              fontSize="10"
              fontFamily="inherit"
            >
              {formatMoney(val)}
            </text>
          </g>
        ))}

        {/* Area Gradient Fill */}
        <path d={areaPath} fill="url(#netWorthGradient)" />

        {/* Main Line */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.brand.primaryLight}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X Axis Labels & Interactive Nodes */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          const isHovered = hoverIndex === i;

          return (
            <g key={i}>
              <text
                x={cx}
                y={height - 12}
                textAnchor="middle"
                fill={isHovered ? colors.text.primary : colors.text.secondary}
                fontSize="11"
                fontWeight={isHovered ? '600' : '400'}
                fontFamily="inherit"
              >
                {d.label}
              </text>

              {/* Hover vertical guide line */}
              {isHovered && (
                <line
                  x1={cx}
                  y1={paddingTop}
                  x2={cx}
                  y2={height - paddingBottom}
                  stroke={colors.brand.primaryLight}
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />
              )}

              {/* Hit target circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#FFFFFF' : colors.brand.primary}
                stroke={colors.brand.primaryLight}
                strokeWidth={isHovered ? 3 : 1.5}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: `${(getX(hoverIndex) / width) * 100}%`,
            transform: 'translateX(-50%)',
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.border.strong}`,
            borderRadius: '8px',
            padding: '6px 12px',
            pointerEvents: 'none',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
            zIndex: 10
          }}
        >
          <div style={{ fontSize: '11px', color: colors.text.muted }}>{data[hoverIndex].label}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(data[hoverIndex].value)}
          </div>
        </div>
      )}
    </div>
  );
};

