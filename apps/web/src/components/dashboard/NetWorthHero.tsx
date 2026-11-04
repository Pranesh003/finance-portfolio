import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { NetWorthHistoryPoint } from '@finance/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface NetWorthHeroProps {
  currentNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  absoluteChange: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'neutral';
  historyPoints: NetWorthHistoryPoint[];
  isLoading?: boolean;
}

export const NetWorthHero: React.FC<NetWorthHeroProps> = ({
  currentNetWorth,
  totalAssets,
  totalLiabilities,
  absoluteChange,
  percentageChange,
  trend,
  historyPoints,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const { formatMoney } = useCurrency();
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const isPositive = absoluteChange >= 0;
  const activePoint = hoveredPointIndex !== null && historyPoints[hoveredPointIndex]
    ? historyPoints[hoveredPointIndex]
    : null;

  // Chart Dimensions & Coordinate Calculations
  const chartHeight = 160;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 24;

  const points = historyPoints.length > 0 ? historyPoints : [];
  const minNW = Math.min(...points.map((p) => p.netWorth), 0);
  const maxNW = Math.max(...points.map((p) => p.netWorth), currentNetWorth * 1.1, 1000);
  const range = maxNW - minNW || 1;

  const getCoordinates = (index: number, value: number) => {
    if (points.length <= 1) return { x: paddingX, y: chartHeight - paddingY };
    const x = paddingX + (index / (points.length - 1)) * (chartWidth - 2 * paddingX);
    const y = chartHeight - paddingY - ((value - minNW) / range) * (chartHeight - 2 * paddingY);
    return { x, y };
  };

  const polylineCoords = points.map((p, idx) => {
    const { x, y } = getCoordinates(idx, p.netWorth);
    return `${x},${y}`;
  }).join(' ');

  const areaCoords = points.length > 0
    ? `${polylineCoords} ${chartWidth - paddingX},${chartHeight - paddingY} ${paddingX},${chartHeight - paddingY}`
    : '';

  return (
    <Card padding="none">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Left Column: Net Worth Metrics */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: `1px solid ${colors.border.subtle}`
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Total Net Worth
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color={colors.financial.incomeText} />
                <span style={{ fontSize: '11px', color: colors.text.muted }}>Assets − Liabilities</span>
              </div>
            </div>

            {/* Prominent Amount */}
            <div
              style={{
                fontSize: '38px',
                fontWeight: 800,
                color: colors.text.primary,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.03em',
                lineHeight: 1.1
              }}
            >
              {isLoading ? '...' : formatMoney(activePoint ? activePoint.netWorth : currentNetWorth)}
            </div>

            {/* Badges & Change */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              <Badge variant={isPositive ? 'income' : 'expense'} size="md">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isPositive ? '+' : ''}{formatMoney(absoluteChange)} ({isPositive ? '+' : ''}{percentageChange}%)
                </span>
              </Badge>

              <Badge variant="neutral" size="md">
                <span>{trend === 'up' ? 'Upward Trajectory' : 'Market Pullback'}</span>
              </Badge>

              {activePoint && (
                <Badge variant="brand" size="sm">
                  Inspecting: {activePoint.formattedDate}
                </Badge>
              )}
            </div>
          </div>

          {/* Asset vs Liability Footprint */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: `1px solid ${colors.border.subtle}`
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: colors.text.muted, fontWeight: 600, textTransform: 'uppercase' }}>
                Gross Total Assets
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: colors.financial.incomeText, marginTop: '2px' }}>
                {formatMoney(activePoint ? activePoint.assets : totalAssets)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: colors.text.muted, fontWeight: 600, textTransform: 'uppercase' }}>
                Total Liabilities
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: colors.financial.liability, marginTop: '2px' }}>
                {formatMoney(activePoint ? activePoint.liabilities : totalLiabilities)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Historical Growth Chart */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: colors.text.secondary }}>
              Historical Net Worth Growth & Significant Events
            </span>
            <span style={{ fontSize: '11px', color: colors.text.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} /> Hover data points to inspect
            </span>
          </div>

          {/* Interactive SVG Chart */}
          <div style={{ width: '100%', height: `${chartHeight}px`, position: 'relative' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.brand.primary} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={colors.brand.primary} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke={colors.border.subtle} strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke={colors.border.subtle} strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke={colors.border.subtle} />

              {/* Area Fill */}
              {areaCoords && (
                <polygon points={areaCoords} fill="url(#netWorthGradient)" />
              )}

              {/* Net Worth Line */}
              {polylineCoords && (
                <polyline
                  points={polylineCoords}
                  fill="none"
                  stroke={colors.brand.primaryLight}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points & Event Markers */}
              {points.map((p, idx) => {
                const { x, y } = getCoordinates(idx, p.netWorth);
                const isHovered = hoveredPointIndex === idx;
                const hasEvent = Boolean(p.event);

                return (
                  <g
                    key={p.date}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    {/* Event Halo */}
                    {hasEvent && (
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="none"
                        stroke={colors.financial.income}
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : hasEvent ? 5 : 3.5}
                      fill={hasEvent ? colors.financial.income : isHovered ? '#FFFFFF' : colors.brand.primaryLight}
                      stroke={colors.bg.surface}
                      strokeWidth="2"
                    />

                    {/* Date label underneath */}
                    <text
                      x={x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      fill={colors.text.muted}
                      fontSize="10"
                      fontWeight="500"
                    >
                      {p.formattedDate}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Event / Point Inspection Drawer */}
          {activePoint ? (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: colors.bg.surfaceElevated,
                borderRadius: '8px',
                border: `1px solid ${colors.brand.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={13} color={colors.brand.primaryLight} />
                <span style={{ fontWeight: 600, color: colors.text.primary }}>{activePoint.formattedDate}:</span>
                <span style={{ color: colors.text.secondary }}>Net Worth: <b>{formatMoney(activePoint.netWorth)}</b></span>
              </div>
              {activePoint.event ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.financial.incomeText, fontWeight: 600 }}>
                  <Sparkles size={13} /> {activePoint.event.title}
                </div>
              ) : (
                <span style={{ color: colors.text.muted, fontSize: '11px' }}>Assets: {formatMoney(activePoint.assets)}</span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: colors.text.muted }}>
              <span>Historical snapshot record verified</span>
              <span>Updated automatically on transactions</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
