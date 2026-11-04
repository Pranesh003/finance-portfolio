import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export type BadgeVariant =
  | 'income'
  | 'expense'
  | 'asset'
  | 'liability'
  | 'neutral'
  | 'brand'
  | 'outline';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  dot = false,
  size = 'md',
  icon,
  style
}) => {
  const { colors } = useTheme();

  const getStyles = (): { bg: string; text: string; border: string; dotColor: string } => {
    switch (variant) {
      case 'income':
        return {
          bg: colors.financial.incomeBg,
          text: colors.financial.incomeText,
          border: colors.financial.incomeBorder,
          dotColor: colors.financial.income
        };
      case 'expense':
        return {
          bg: colors.financial.expenseBg,
          text: colors.financial.expenseText,
          border: colors.financial.expenseBorder,
          dotColor: colors.financial.expense
        };
      case 'asset':
        return {
          bg: colors.financial.assetBg,
          text: colors.financial.assetText,
          border: colors.financial.assetBorder,
          dotColor: colors.financial.asset
        };
      case 'liability':
        return {
          bg: colors.financial.liabilityBg,
          text: colors.financial.liabilityText,
          border: colors.financial.liabilityBorder,
          dotColor: colors.financial.liability
        };
      case 'brand':
        return {
          bg: colors.brand.primaryMuted,
          text: colors.brand.primaryLight,
          border: colors.border.strong,
          dotColor: colors.brand.primary
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.text.secondary,
          border: colors.border.default,
          dotColor: colors.text.muted
        };
      case 'neutral':
      default:
        return {
          bg: colors.financial.neutralBg,
          text: colors.financial.neutral,
          border: colors.financial.neutralBorder,
          dotColor: colors.financial.neutral
        };
    }
  };

  const s = getStyles();
  const padding = size === 'sm' ? '2px 6px' : '3px 8px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        borderRadius: '6px',
        fontWeight: 500,
        fontSize,
        padding,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: s.dotColor,
            flexShrink: 0
          }}
        />
      )}
      {icon}
      <span>{children}</span>
    </span>
  );
};

