import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  dividerBefore?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: number | string;
  style?: React.CSSProperties;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  width = 200,
  style
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align]: 0,
            width,
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.border.strong}`,
            borderRadius: '10px',
            padding: '4px',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
            zIndex: 120
          }}
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.dividerBefore && (
                <div style={{ height: '1px', backgroundColor: colors.border.subtle, margin: '4px 0' }} />
              )}
              <button
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: item.danger
                    ? colors.financial.expenseText
                    : item.disabled
                    ? colors.text.muted
                    : colors.text.primary,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  opacity: item.disabled ? 0.5 : 1,
                  transition: 'background-color 0.12s'
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.backgroundColor = item.danger
                      ? colors.financial.expenseBg
                      : colors.bg.surfaceHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

