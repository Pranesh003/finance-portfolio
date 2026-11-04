import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Tabs } from './Tabs';

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  timeRangeOptions?: string[];
  legend?: React.ReactNode;
  actions?: React.ReactNode;
  height?: number | string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  timeRange,
  onTimeRangeChange,
  timeRangeOptions = ['1M', '3M', '6M', '1Y', 'ALL'],
  legend,
  actions,
  height = 280,
  children,
  style
}) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        backgroundColor: colors.bg.surface,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '13px', color: colors.text.secondary, marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {timeRange && onTimeRangeChange && (
            <Tabs
              variant="pill"
              size="sm"
              tabs={timeRangeOptions.map((opt) => ({ id: opt, label: opt }))}
              activeTab={timeRange}
              onChange={onTimeRangeChange}
            />
          )}
          {actions}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div style={{ width: '100%', height, position: 'relative' }}>{children}</div>

      {/* Legend Footer */}
      {legend && (
        <div
          style={{
            borderTop: `1px solid ${colors.border.subtle}`,
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          {legend}
        </div>
      )}
    </div>
  );
};

