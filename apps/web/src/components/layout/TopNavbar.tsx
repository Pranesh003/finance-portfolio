import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { NavItemKey } from './Sidebar';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  User,
  ShieldCheck,
  Settings,
  LogOut,
  Command,
  LogIn
} from 'lucide-react';

export interface TopNavbarProps {
  onOpenMobileSidebar?: () => void;
  onOpenQuickAdd: () => void;
  onGlobalSearchClick?: () => void;
  onSelectNav?: (key: NavItemKey) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileSidebar,
  onOpenQuickAdd,
  onGlobalSearchClick,
  onSelectNav
}) => {
  const { theme, toggleTheme, colors } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const { user, isAuthenticated, logout, setAuthView } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Guest Member';
  const initials = user?.profile
    ? `${user.profile.firstName[0] || 'U'}${user.profile.lastName[0] || ''}`
    : 'U';

  return (
    <header
      style={{
        height: 64,
        backgroundColor: colors.bg.surface,
        borderBottom: `1px solid ${colors.border.default}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Mobile Menu & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '440px' }}>
        {/* Mobile Hamburger */}
        <div style={{ display: 'none' }} className="mobile-menu-trigger">
          <IconButton
            icon={<Menu size={20} />}
            aria-label="Open navigation menu"
            onClick={onOpenMobileSidebar}
          />
        </div>

        {/* Global Search Box */}
        <div
          onClick={onGlobalSearchClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '8px',
            padding: '7px 14px',
            width: '100%',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.border.strong;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.default;
          }}
        >
          <Search size={15} color={colors.text.muted} />
          <span style={{ fontSize: '13px', color: colors.text.muted, flex: 1 }}>
            Search accounts, holdings, transactions...
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              backgroundColor: colors.bg.surface,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: '4px',
              padding: '1px 5px',
              fontSize: '11px',
              color: colors.text.muted
            }}
          >
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Add Button */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={15} />}
          onClick={onOpenQuickAdd}
          style={{ fontWeight: 600 }}
        >
          <span>Transaction</span>
        </Button>

        {/* Currency Selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            aria-label="Display currency"
            style={{
              height: 34,
              backgroundColor: colors.bg.surfaceElevated,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '8px',
              padding: '0 26px 0 10px',
              fontSize: '12px',
              fontWeight: 600,
              color: colors.text.primary,
              appearance: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code} style={{ backgroundColor: colors.bg.surfaceElevated, color: colors.text.primary }}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              color: colors.text.muted
            }}
          >
            <ChevronDown size={13} />
          </div>
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <IconButton
          icon={theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#4F46E5" />}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          onClick={toggleTheme}
          size="sm"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        />

        {/* Notification Center */}
        <NotificationDropdown />

        <div style={{ width: 1, height: 24, backgroundColor: colors.border.subtle, margin: '0 4px' }} />

        {/* User Profile Menu or Sign In Button */}
        {isAuthenticated && user ? (
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '8px',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: colors.brand.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                {initials}
              </div>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{fullName}</span>
                  <ShieldCheck size={13} color={colors.financial.incomeText} />
                </div>
                <span style={{ fontSize: '11px', color: colors.text.muted }}>
                  {user.role === 'ADMIN' ? 'System Administrator' : 'Private Wealth'}
                </span>
              </div>

              <ChevronDown size={14} color={colors.text.muted} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 220,
                  backgroundColor: colors.bg.surfaceElevated,
                  border: `1px solid ${colors.border.strong}`,
                  borderRadius: '10px',
                  padding: '6px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.45)',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border.subtle}`, marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: colors.text.primary }}>{fullName}</div>
                  <div style={{ fontSize: '11px', color: colors.text.muted }}>{user.email}</div>
                </div>

                <button
                  onClick={() => {
                    onSelectNav?.('settings');
                    setIsProfileOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    color: colors.text.secondary,
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                    e.currentTarget.style.color = colors.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                >
                  <User size={14} />
                  <span>Account Profile</span>
                </button>

                <button
                  onClick={() => {
                    onSelectNav?.('settings');
                    setIsProfileOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    color: colors.text.secondary,
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                    e.currentTarget.style.color = colors.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                >
                  <Settings size={14} />
                  <span>Security & Settings</span>
                </button>

                <div style={{ height: 1, backgroundColor: colors.border.subtle, margin: '4px 0' }} />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    color: colors.financial.expenseText,
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.financial.expenseBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<LogIn size={14} />}
            onClick={() => setAuthView('login')}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};
