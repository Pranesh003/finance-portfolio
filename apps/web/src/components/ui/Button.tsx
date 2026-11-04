import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'subtle';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    const sizeStyles = {
      sm: { padding: '6px 12px', fontSize: '13px', height: '32px', gap: '6px' },
      md: { padding: '8px 16px', fontSize: '14px', height: '40px', gap: '8px' },
      lg: { padding: '10px 20px', fontSize: '15px', height: '46px', gap: '10px' }
    }[size];

    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: colors.brand.primary,
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 1px 3px 0 rgba(79, 70, 229, 0.4)'
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
            border: `1px solid ${colors.border.strong}`
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: colors.text.secondary,
            border: 'none'
          };
        case 'danger':
          return {
            backgroundColor: colors.financial.expense,
            color: '#FFFFFF',
            border: 'none'
          };
        case 'success':
          return {
            backgroundColor: colors.financial.income,
            color: '#FFFFFF',
            border: 'none'
          };
        case 'subtle':
          return {
            backgroundColor: colors.bg.surfaceSubtle,
            color: colors.text.primary,
            border: `1px solid ${colors.border.subtle}`
          };
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'inherit',
          fontWeight: 500,
          borderRadius: '8px',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled || isLoading ? 0.6 : 1,
          transition: 'all 0.15s ease',
          width: fullWidth ? '100%' : 'auto',
          boxSizing: 'border-box',
          outline: 'none',
          ...sizeStyles,
          ...getVariantStyles(),
          ...style
        }}
        {...props}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

