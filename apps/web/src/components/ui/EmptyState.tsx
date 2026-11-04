import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style
}) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        borderRadius: '12px',
        backgroundColor: colors.bg.surfaceSubtle,
        border: `1px dashed ${colors.border.strong}`,
        ...style
      }}
    >
      {icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: colors.bg.surfaceElevated,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.text.secondary,
            marginBottom: '16px'
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text.primary }}>
        {title}
      </div>
      {description && (
        <p
          style={{
            fontSize: '13px',
            color: colors.text.secondary,
            maxWidth: '380px',
            margin: '6px 0 20px 0',
            lineHeight: 1.5
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

