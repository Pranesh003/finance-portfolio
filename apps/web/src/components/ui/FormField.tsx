import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;
  actions?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  helperText,
  actions,
  required = false,
  children,
  style
}) => {
  const { colors } = useTheme();
  const effectiveHint = hint || helperText;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      {(label || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <label
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: colors.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{label}</span>
              {required && <span style={{ color: colors.financial.expense }}>*</span>}
            </label>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}

      {children}

      {error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: colors.financial.expense
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : effectiveHint ? (
        <span style={{ fontSize: '12px', color: colors.text.tertiary }}>{effectiveHint}</span>
      ) : null}
    </div>
  );
};

