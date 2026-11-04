import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Tooltip } from '../ui/Tooltip';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Briefcase,
  Home,
  CreditCard,
  PieChart,
  Target,
  BarChart3,
  FileText,
  Calendar,
  FolderLock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

export type NavItemKey =
  | 'overview'
  | 'accounts'
  | 'transactions'
  | 'expenses'
  | 'income'
  | 'investments'
  | 'portfolio'
  | 'assets'
  | 'liabilities'
  | 'budgets'
  | 'goals'
  | 'analytics'
  | 'reports'
  | 'calendar'
  | 'documents'
  | 'settings';

export interface NavItemConfig {
  key: NavItemKey;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const NAV_ITEMS: { section: string; items: NavItemConfig[] }[] = [
  {
    section: 'MAIN',
    items: [
      { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
      { key: 'accounts', label: 'Accounts', icon: <Wallet size={18} />, badge: 3 },
      { key: 'transactions', label: 'Transactions', icon: <ArrowRightLeft size={18} /> }
    ]
  },
  {
    section: 'CASH FLOW',
    items: [
      { key: 'income', label: 'Income', icon: <ArrowDownLeft size={18} /> },
      { key: 'expenses', label: 'Expenses', icon: <ArrowUpRight size={18} /> },
      { key: 'budgets', label: 'Budgets', icon: <PieChart size={18} /> }
    ]
  },
  {
    section: 'WEALTH & INVESTMENTS',
    items: [
      { key: 'portfolio', label: 'Portfolio', icon: <Briefcase size={18} /> },
      { key: 'investments', label: 'Investments', icon: <TrendingUp size={18} /> },
      { key: 'assets', label: 'Assets', icon: <Home size={18} /> },
      { key: 'liabilities', label: 'Liabilities', icon: <CreditCard size={18} /> },
      { key: 'goals', label: 'Goals', icon: <Target size={18} />, badge: 'Active' }
    ]
  },
  {
    section: 'INTELLIGENCE & SYSTEM',
    items: [
      { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
      { key: 'reports', label: 'Reports', icon: <FileText size={18} /> },
      { key: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
      { key: 'documents', label: 'Documents', icon: <FolderLock size={18} /> },
      { key: 'settings', label: 'Settings', icon: <Settings size={18} /> }
    ]
  }
];

export interface SidebarProps {
  activeKey: NavItemKey;
  onSelect: (key: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  style?: React.CSSProperties;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeKey,
  onSelect,
  isCollapsed,
  onToggleCollapse,
  style
}) => {
  const { colors } = useTheme();

  return (
    <aside
      style={{
        width: isCollapsed ? 72 : 256,
        height: '100vh',
        backgroundColor: colors.bg.surface,
        borderRight: `1px solid ${colors.border.default}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        boxSizing: 'border-box',
        overflowX: 'hidden',
        ...style
      }}
    >
      {/* Brand Header */}
      <div>
        <div
          style={{
            height: 64,
            padding: isCollapsed ? '0 16px' : '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: `1px solid ${colors.border.subtle}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: colors.brand.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
                flexShrink: 0
              }}
            >
              <Layers size={20} />
            </div>

            {!isCollapsed && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: colors.text.primary }}>
                  Wealth<span style={{ color: colors.brand.primaryLight }}>Flow</span>
                </span>
                <div style={{ fontSize: '10px', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Wealth Platform
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div
          style={{
            padding: '12px 8px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 128px)'
          }}
        >
          {NAV_ITEMS.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '16px' }}>
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: colors.text.muted,
                    padding: '6px 12px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  {section.section}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.items.map((item) => {
                  const isActive = item.key === activeKey;

                  const buttonContent = (
                    <button
                      onClick={() => onSelect(item.key)}
                      style={{
                        width: '100%',
                        height: 38,
                        padding: isCollapsed ? '0' : '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        gap: '10px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? colors.bg.surfaceElevated : 'transparent',
                        color: isActive ? colors.brand.primaryLight : colors.text.secondary,
                        border: isActive ? `1px solid ${colors.border.strong}` : '1px solid transparent',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        boxSizing: 'border-box'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                          e.currentTarget.style.color = colors.text.primary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = colors.text.secondary;
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: isActive ? colors.brand.primaryLight : colors.text.secondary, display: 'flex' }}>
                          {item.icon}
                        </span>
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '10px',
                            backgroundColor: isActive ? colors.brand.primary : colors.bg.surfaceElevated,
                            color: '#FFFFFF'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.key} content={item.label} position="right">
                        {buttonContent}
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.key}>{buttonContent}</React.Fragment>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div
        style={{
          padding: '12px',
          borderTop: `1px solid ${colors.border.subtle}`,
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'flex-end'
        }}
      >
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.border.default}`,
            color: colors.text.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

