import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ButtonVariant, ButtonSize } from './Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isActive?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = 'ghost', size = 'md', isActive = false, style, ...props }, ref) => {
    const { colors } = useTheme();

    const dimensions = {
      sm: { width: 32, height: 32, iconSize: 14 },
      md: { width: 38, height: 38, iconSize: 18 },
      lg: { width: 44, height: 44, iconSize: 20 }
    }[size];

    const getVariantStyles = (): React.CSSProperties => {
      if (isActive) {
        return {
          backgroundColor: colors.bg.surfaceActive,
          color: colors.brand.primaryLight,
          border: `1px solid ${colors.border.strong}`
        };
      }

      switch (variant) {
        case 'primary':
          return {
            backgroundColor: colors.brand.primary,
            color: '#FFFFFF',
            border: 'none'
          };
        case 'secondary':
          return {
            backgroundColor: colors.bg.surfaceElevated,
            color: colors.text.primary,
            border: `1px solid ${colors.border.default}`
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            color: colors.text.primary,
            border: `1px solid ${colors.border.default}`
          };
        case 'ghost':
        default:
          return {
            backgroundColor: 'transparent',
            color: colors.text.secondary,
            border: 'none'
          };
      }
    };

    return (
      <button
        ref={ref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          width: dimensions.width,
          height: dimensions.height,
          ...getVariantStyles(),
          ...style
        }}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

