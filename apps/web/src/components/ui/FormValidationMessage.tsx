import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export interface FormValidationMessageProps {
  message?: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  style?: React.CSSProperties;
}

export const FormValidationMessage: React.FC<FormValidationMessageProps> = ({
  message,
  type = 'error',
  style
}) => {
  const { colors } = useTheme();

  if (!message) return null;

  const config = {
    error: {
      color: colors.financial.expenseText,
      icon: <AlertCircle size={13} color={colors.financial.expenseText} />
    },
    warning: {
      color: colors.financial.liability,
      icon: <AlertTriangle size={13} color={colors.financial.liability} />
    },
    success: {
      color: colors.financial.incomeText,
      icon: <CheckCircle2 size={13} color={colors.financial.incomeText} />
    },
    info: {
      color: colors.brand.primaryLight,
      icon: <Info size={13} color={colors.brand.primaryLight} />
    }
  }[type];

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: config.color,
        marginTop: '4px',
        lineHeight: 1.3,
        ...style
      }}
    >
      <span style={{ display: 'inline-flex', flexShrink: 0 }}>{config.icon}</span>
      <span>{message}</span>
    </div>
  );
};

