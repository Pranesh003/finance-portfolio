import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

export interface AllocationItem {
  id: string;
  name: string;
  value: number; // dollar value
  color: string;
}

export interface AssetAllocationDonutProps {
  items: AllocationItem[];
  title?: string;
  subtitle?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const AssetAllocationDonut: React.FC<AssetAllocationDonutProps> = ({
  items,
  title = 'Asset Allocation',
  subtitle = 'Diversification across asset classes',
  size = 200,
  style
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = items.reduce((acc, curr) => acc + curr.value, 0);

  // SVG Geometry calculation
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div
      style={{
        backgroundColor: colors.bg.surface,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
          {title}
        </div>
        <div style={{ fontSize: '13px', color: colors.text.secondary, marginTop: '2px' }}>
          {subtitle}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          marginTop: '20px'
        }}
      >
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            {items.map((item, idx) => {
              const percentage = total > 0 ? item.value / total : 0;
              const strokeDasharray = `${circumference * percentage} ${circumference}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += percentage;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={item.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Label */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '11px', color: colors.text.muted, fontWeight: 500 }}>
              {hoveredIdx !== null ? items[hoveredIdx]?.name : 'TOTAL ASSETS'}
            </div>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: colors.text.primary,
                marginTop: '2px',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {hoveredIdx !== null
                ? formatMoney(items[hoveredIdx]?.value || 0)
                : formatMoney(total)}
            </div>
            <div style={{ fontSize: '11px', color: colors.text.secondary, marginTop: '2px' }}>
              {hoveredIdx !== null
                ? `${(((items[hoveredIdx]?.value || 0) / total) * 100).toFixed(1)}%`
                : `${items.length} Classes`}
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '180px' }}>
          {items.map((item, idx) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: isHovered ? colors.bg.surfaceElevated : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '3px',
                      backgroundColor: item.color,
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '13px', color: colors.text.primary, fontWeight: isHovered ? 600 : 400 }}>
                    {item.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: colors.text.muted, fontVariantNumeric: 'tabular-nums' }}>
                    {pct.toFixed(1)}%
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {formatMoney(item.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

