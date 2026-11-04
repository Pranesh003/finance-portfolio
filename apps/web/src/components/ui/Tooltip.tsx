import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  delayMs?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  delayMs = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { colors } = useTheme();

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return {
          bottom: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          top: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          right: 'calc(100% + 6px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          left: 'calc(100% + 6px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
    }
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && content && (
        <div
          style={{
            position: 'absolute',
            zIndex: 9999,
            backgroundColor: colors.bg.surfaceElevated,
            color: colors.text.primary,
            border: `1px solid ${colors.border.strong}`,
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'none',
            ...getPositionStyles()
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

