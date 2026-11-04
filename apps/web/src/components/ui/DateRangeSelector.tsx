import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Calendar } from 'lucide-react';

export type DateRangePreset = 'today' | '7d' | '30d' | '3m' | '6m' | 'ytd' | '1y' | 'all' | 'custom';

export interface DateRangeSelectorProps {
  value: DateRangePreset | string;
  onChange: (preset: DateRangePreset | string) => void;
  presets?: { key: DateRangePreset | string; label: string }[];
  startDate?: string;
  endDate?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  presets = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: 'ytd', label: 'YTD' },
    { key: '1y', label: '1Y' },
    { key: 'all', label: 'ALL' }
  ],
  startDate,
  endDate,
  showIcon = true,
  size = 'md',
  style
}) => {
  const { colors } = useTheme();

  const isSmall = size === 'sm';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: colors.bg.surfaceElevated,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '8px',
        padding: '3px',
        ...style
      }}
    >
      {showIcon && (
        <div style={{ padding: '0 6px', color: colors.text.muted, display: 'flex', alignItems: 'center' }}>
          <Calendar size={isSmall ? 13 : 15} />
        </div>
      )}

      {presets.map((preset) => {
        const isSelected = value === preset.key;
        return (
          <button
            key={preset.key}
            type="button"
            onClick={() => onChange(preset.key)}
            style={{
              border: 'none',
              borderRadius: '6px',
              backgroundColor: isSelected ? colors.brand.primary : 'transparent',
              color: isSelected ? '#FFFFFF' : colors.text.secondary,
              fontWeight: isSelected ? 700 : 500,
              fontSize: isSmall ? '11px' : '12px',
              padding: isSmall ? '3px 8px' : '4px 10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              lineHeight: 1.2
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                e.currentTarget.style.color = colors.text.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.text.secondary;
              }
            }}
          >
            {preset.label}
          </button>
        );
      })}

      {(startDate || endDate) && (
        <span
          style={{
            fontSize: '11px',
            color: colors.text.muted,
            paddingLeft: '6px',
            paddingRight: '6px',
            borderLeft: `1px solid ${colors.border.subtle}`
          }}
        >
          {startDate} — {endDate}
        </span>
      )}
    </div>
  );
};

