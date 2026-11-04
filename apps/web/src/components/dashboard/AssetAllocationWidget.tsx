import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { DashboardAssetAllocationItem } from '@finance/types';
import { Card } from '../ui/Card';
import { Sparkles } from 'lucide-react';

interface AssetAllocationWidgetProps {
  items: DashboardAssetAllocationItem[];
  isLoading?: boolean;
}

export const AssetAllocationWidget: React.FC<AssetAllocationWidgetProps> = ({
  items,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  void isLoading;

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const activeItem = items.find((i) => i.id === hoveredId) || items[0];

  // SVG Donut calculations
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <Card
      title="Asset Allocation by Class"
      subtitle="Multi-asset distribution across 9 wealth domains"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.text.muted }}>
          <Sparkles size={12} color={colors.brand.primaryLight} />
          <span>{items.length} Asset Classes</span>
        </div>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        {/* SVG Donut */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${size}px`,
            height: `${size}px`,
            margin: '0 auto'
          }}
        >
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={colors.bg.surfaceElevated}
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {items.map((item) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += item.percentage;
              const isHovered = hoveredId === item.id;

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
                  strokeLinecap="round"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: hoveredId && !isHovered ? 0.4 : 1
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              );
            })}
          </svg>

          {/* Center Info */}
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '11px', color: colors.text.muted, textTransform: 'uppercase', fontWeight: 600 }}>
              {activeItem ? activeItem.label.split(' ')[0] : 'Assets'}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {activeItem ? `${activeItem.percentage}%` : '100%'}
            </span>
            <span style={{ fontSize: '10px', color: colors.brand.primaryLight, fontWeight: 600 }}>
              {activeItem ? formatMoney(activeItem.amount) : formatMoney(totalAmount)}
            </span>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '220px',
            overflowY: 'auto',
            paddingRight: '6px'
          }}
        >
          {items.map((item) => {
            const isHovered = hoveredId === item.id;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: isHovered ? colors.bg.surfaceElevated : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      backgroundColor: item.color,
                      flexShrink: 0
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      color: colors.text.primary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: isHovered ? 700 : 500
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(item.amount)}
                  </div>
                  <div style={{ fontSize: '10px', color: colors.text.muted }}>
                    {item.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
