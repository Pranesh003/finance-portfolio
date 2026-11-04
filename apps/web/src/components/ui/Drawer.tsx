import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  width?: number | string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  title,
  subtitle,
  children,
  width = 380
}) => {
  const { colors } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: position === 'right' ? 'flex-end' : 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width,
          maxWidth: '100%',
          height: '100%',
          backgroundColor: colors.bg.surfaceElevated,
          borderLeft: position === 'right' ? `1px solid ${colors.border.strong}` : 'none',
          borderRight: position === 'left' ? `1px solid ${colors.border.strong}` : 'none',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {title && (
              <div style={{ fontSize: '17px', fontWeight: 600, color: colors.text.primary }}>
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: '13px', color: colors.text.secondary, marginTop: '2px' }}>
                {subtitle}
              </div>
            )}
          </div>
          <IconButton
            icon={<X size={18} />}
            aria-label="Close drawer"
            size="sm"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

