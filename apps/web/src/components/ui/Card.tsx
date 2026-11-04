import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  header?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  header,
  title,
  subtitle,
  actions,
  padding = 'md',
  children,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.bg.surfaceElevated,
          border: `1px solid ${colors.border.strong}`,
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.35)'
        };
      case 'subtle':
        return {
          backgroundColor: colors.bg.surfaceSubtle,
          border: `1px solid ${colors.border.subtle}`
        };
      case 'interactive':
        return {
          backgroundColor: colors.bg.surface,
          border: `1px solid ${colors.border.default}`,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.bg.surface,
          border: `1px solid ${colors.border.default}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        };
    }
  };

  const paddingValues = {
    none: '0px',
    sm: '14px',
    md: '20px',
    lg: '24px'
  }[padding];

  return (
    <div
      style={{
        borderRadius: '12px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        ...getVariantStyles(),
        ...style
      }}
      {...props}
    >
      {(header || title || actions) && (
        <div
          style={{
            padding: `${paddingValues} ${paddingValues} 0 ${paddingValues}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          {header ? (
            header
          ) : (
            <div>
              {title && (
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
                  {title}
                </div>
              )}
              {subtitle && (
                <div style={{ fontSize: '13px', color: colors.text.secondary, marginTop: '2px' }}>
                  {subtitle}
                </div>
              )}
            </div>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div style={{ padding: (title || header) ? `0 ${paddingValues} ${paddingValues} ${paddingValues}` : paddingValues }}>
        {children}
      </div>
    </div>
  );
};
