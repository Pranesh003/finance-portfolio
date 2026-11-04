import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hasError?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, hasError = false, onClear, style, disabled, value, ...props }, ref) => {
    const { colors } = useTheme();

    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          backgroundColor: colors.bg.surfaceElevated,
          border: `1px solid ${hasError ? colors.financial.expense : colors.border.default}`,
          borderRadius: '8px',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxSizing: 'border-box'
        }}
      >
        {leftIcon && (
          <div
            style={{
              paddingLeft: '12px',
              display: 'flex',
              alignItems: 'center',
              color: colors.text.muted,
              pointerEvents: 'none'
            }}
          >
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          value={value}
          style={{
            width: '100%',
            height: '40px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            paddingLeft: leftIcon ? '10px' : '14px',
            paddingRight: rightIcon || onClear ? '36px' : '14px',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: colors.text.primary,
            boxSizing: 'border-box',
            ...style
          }}
          {...props}
        />

        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            style={{
              position: 'absolute',
              right: rightIcon ? '34px' : '10px',
              background: 'none',
              border: 'none',
              color: colors.text.muted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        )}

        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              color: colors.text.muted,
              pointerEvents: 'none'
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

