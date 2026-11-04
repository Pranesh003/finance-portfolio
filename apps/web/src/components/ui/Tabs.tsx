import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface TabItem<T = string> {
  id: T;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps<T = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  variant?: 'pill' | 'underline';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const Tabs = <T extends string | number>({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  size = 'md',
  style
}: TabsProps<T>) => {
  const { colors } = useTheme();

  if (variant === 'underline') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          borderBottom: `1px solid ${colors.border.subtle}`,
          ...style
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={String(tab.id)}
              onClick={() => onChange(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? colors.brand.primary : 'transparent'}`,
                padding: size === 'sm' ? '8px 0' : '12px 0',
                color: isActive ? colors.text.primary : colors.text.secondary,
                fontWeight: isActive ? 600 : 500,
                fontSize: size === 'sm' ? '13px' : '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '-1px',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? colors.brand.primaryMuted : colors.bg.surfaceElevated,
                    color: isActive ? colors.brand.primaryLight : colors.text.muted,
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: colors.bg.surfaceElevated,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '8px',
        padding: '3px',
        gap: '3px',
        ...style
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={String(tab.id)}
            onClick={() => onChange(tab.id)}
            style={{
              backgroundColor: isActive ? colors.bg.surfaceActive : 'transparent',
              color: isActive ? colors.text.primary : colors.text.secondary,
              border: isActive ? `1px solid ${colors.border.strong}` : '1px solid transparent',
              borderRadius: '6px',
              padding: size === 'sm' ? '4px 10px' : '6px 14px',
              fontWeight: isActive ? 600 : 500,
              fontSize: size === 'sm' ? '12px' : '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: colors.bg.surfaceHover,
                  padding: '1px 5px',
                  borderRadius: '8px'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

