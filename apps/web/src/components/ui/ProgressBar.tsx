import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface ProgressSegment {
  value: number; // percentage (0 to 100)
  color: string;
  label?: string;
}

export interface ProgressBarProps {
  value?: number; // 0 to 100
  segments?: ProgressSegment[];
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  segments,
  height = 8,
  color,
  backgroundColor,
  showLabel = false,
  style
}) => {
  const { colors } = useTheme();
  const barBg = backgroundColor || colors.bg.surfaceHover;
  const barColor = color || colors.brand.primary;

  if (segments && segments.length > 0) {
    return (
      <div style={{ width: '100%', ...style }}>
        <div
          style={{
            width: '100%',
            height,
            backgroundColor: barBg,
            borderRadius: height / 2,
            overflow: 'hidden',
            display: 'flex'
          }}
        >
          {segments.map((seg, idx) => (
            <div
              key={idx}
              style={{
                width: `${Math.max(0, Math.min(100, seg.value))}%`,
                height: '100%',
                backgroundColor: seg.color,
                transition: 'width 0.4s ease'
              }}
              title={seg.label ? `${seg.label}: ${seg.value.toFixed(1)}%` : undefined}
            />
          ))}
        </div>
      </div>
    );
  }

  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div style={{ width: '100%', ...style }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: colors.text.secondary,
            marginBottom: '4px'
          }}
        >
          <span>Progress</span>
          <span style={{ fontWeight: 600 }}>{clampedValue.toFixed(0)}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: barBg,
          borderRadius: height / 2,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${clampedValue}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: height / 2,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};

