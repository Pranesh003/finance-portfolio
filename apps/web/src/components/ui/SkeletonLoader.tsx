import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  variant = 'rectangular',
  style
}) => {
  const { colors } = useTheme();

  const radiusVal = variant === 'circular' ? '50%' : borderRadius;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radiusVal,
        backgroundColor: colors.bg.surfaceHover,
        animation: 'pulse 1.6s ease-in-out infinite',
        opacity: 0.75,
        ...style
      }}
    />
  );
};

