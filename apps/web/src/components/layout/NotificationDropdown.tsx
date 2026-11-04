import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Check, ShieldAlert, Award, ArrowUpRight, DollarSign } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'security' | 'goal' | 'spending' | 'dividend';
  isRead: boolean;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Emergency Fund Milestone Reached',
    message: 'Congratulations! You reached 70% of your 6-Month Emergency Fund target.',
    time: '12m ago',
    type: 'goal',
    isRead: false
  },
  {
    id: 'n2',
    title: 'Apple Inc. Dividend Credited',
    message: 'Quarterly dividend of $41.60 was credited to your Brokerage account.',
    time: '2h ago',
    type: 'dividend',
    isRead: false
  },
  {
    id: 'n3',
    title: 'Unusual Dining Out Spike',
    message: 'Dining expenses were 24% higher this week compared to your 30-day average.',
    time: '1d ago',
    type: 'spending',
    isRead: true
  },
  {
    id: 'n4',
    title: 'New Security Login Verified',
    message: 'Successful authenticated session started from San Francisco, CA.',
    time: '2d ago',
    type: 'security',
    isRead: true
  }
];

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const { colors } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'goal':
        return <Award size={15} color={colors.financial.incomeText} />;
      case 'dividend':
        return <DollarSign size={15} color={colors.financial.asset} />;
      case 'spending':
        return <ArrowUpRight size={15} color={colors.financial.expenseText} />;
      case 'security':
        return <ShieldAlert size={15} color={colors.financial.liabilityText} />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div style={{ position: 'relative' }}>
        <IconButton
          icon={<Bell size={18} />}
          aria-label="Notifications"
          variant="ghost"
          size="md"
          isActive={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: colors.financial.income,
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 360,
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.border.strong}`,
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.45)',
            zIndex: 100,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: `1px solid ${colors.border.subtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: colors.brand.primaryMuted,
                    color: colors.brand.primaryLight,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.brand.primaryLight,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Check size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  backgroundColor: n.isRead ? 'transparent' : colors.bg.surfaceSubtle,
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : colors.bg.surfaceSubtle;
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    backgroundColor: colors.bg.surface,
                    border: `1px solid ${colors.border.subtle}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}
                >
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: colors.text.primary }}>
                      {n.title}
                    </div>
                    <span style={{ fontSize: '11px', color: colors.text.muted, marginLeft: '6px' }}>
                      {n.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '3px', lineHeight: 1.4 }}>
                    {n.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

