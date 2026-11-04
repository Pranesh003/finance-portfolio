import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sidebar, NavItemKey } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Drawer } from '../ui/Drawer';
import { QuickAddTransactionModal } from './QuickAddTransactionModal';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Search, ArrowRight } from 'lucide-react';

export interface MainLayoutProps {
  activeNav: NavItemKey;
  onNavChange: (key: NavItemKey) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeNav,
  onNavChange,
  children
}) => {
  const { colors } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = [
    { title: 'Chase Checking (•••• 4821)', category: 'Account', nav: 'accounts' as NavItemKey },
    { title: 'Apple Inc. (AAPL)', category: 'Holding', nav: 'investments' as NavItemKey },
    { title: 'Bitcoin Cold Storage (BTC)', category: 'Crypto', nav: 'investments' as NavItemKey },
    { title: 'Whole Foods Market ($142.50)', category: 'Transaction', nav: 'transactions' as NavItemKey },
    { title: 'Emergency Fund 6 Months', category: 'Goal', nav: 'goals' as NavItemKey },
    { title: 'Form 1099-DIV Tax Statement', category: 'Document', nav: 'documents' as NavItemKey }
  ].filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.bg.canvas,
        color: colors.text.primary,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Desktop Collapsible Left Sidebar */}
      <div className="desktop-sidebar-wrapper">
        <Sidebar
          activeKey={activeNav}
          onSelect={(key) => onNavChange(key)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        position="left"
        width={280}
        title="WealthFlow Navigation"
      >
        <Sidebar
          activeKey={activeNav}
          onSelect={(key) => {
            onNavChange(key);
            setIsMobileMenuOpen(false);
          }}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          style={{ width: '100%', height: 'auto', borderRight: 'none', position: 'static' }}
        />
      </Drawer>

      {/* Main View Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <TopNavbar
          onOpenMobileSidebar={() => setIsMobileMenuOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onGlobalSearchClick={() => setIsCommandPaletteOpen(true)}
          onSelectNav={onNavChange}
        />

        <main
          style={{
            flex: 1,
            padding: '28px 32px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
        >
          {children}
        </main>
      </div>

      {/* Quick Add Modal */}
      <QuickAddTransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* Global Command Palette Modal */}
      <Modal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        maxWidth={560}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            placeholder="Type to search modules, assets, transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
            autoFocus
          />

          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
              Quick Navigation & Results ({searchResults.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onNavChange(item.nav);
                    setIsCommandPaletteOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: colors.brand.primaryMuted, color: colors.brand.primaryLight }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text.primary }}>
                      {item.title}
                    </span>
                  </div>
                  <ArrowRight size={14} color={colors.text.muted} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
