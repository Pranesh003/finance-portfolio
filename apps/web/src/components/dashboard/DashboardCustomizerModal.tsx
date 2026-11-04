import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { DashboardPreferences } from '@finance/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: DashboardPreferences;
  onSavePreferences: (prefs: DashboardPreferences) => void;
  onResetToZero: () => void;
  onSeedSampleData: () => void;
}

const WIDGET_LABELS: Record<string, string> = {
  netWorth: 'Total Net Worth & Historical Growth Area Chart',
  summaryCards: '9 Core Financial Metric Cards (Assets, Cash, Income, etc.)',
  portfolioPerformance: 'Investment Portfolio Performance & ROI Matrix',
  assetAllocation: 'Asset Allocation by Class (Equities, Bullion, Real Estate)',
  liabilityDistribution: 'Liability Distribution & Amortized Debt Burden',
  cashFlow: 'Cash Flow Dynamics (Income vs Spend vs Save)',
  accountsOverview: 'Connected & Manual Bank Accounts Overview',
  recentTransactions: 'Recent Transactions Ledger with Category Filters',
  spendingBreakdown: 'Monthly Spending Breakdown & Budget Utilization',
  financialHealth: '7 Financial Health & Solvency Diagnostic Ratios',
  upcomingEvents: 'Upcoming Financial Schedule & Dues Calendar',
  financialInsights: 'Proactive Financial Intelligence & Anomaly Alerts'
};

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onResetToZero,
  onSeedSampleData
}) => {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [currentPrefs, setCurrentPrefs] = React.useState<DashboardPreferences>(preferences);

  React.useEffect(() => {
    setCurrentPrefs(preferences);
  }, [preferences]);

  const toggleVisibility = (key: string) => {
    setCurrentPrefs((prev) => ({
      ...prev,
      widgetVisibility: {
        ...prev.widgetVisibility,
        [key]: !(prev.widgetVisibility as any)[key]
      }
    }));
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...currentPrefs.widgetOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setCurrentPrefs((prev) => ({
      ...prev,
      widgetOrder: newOrder
    }));
  };

  const handleSave = () => {
    onSavePreferences(currentPrefs);
    toast.success('Customization Saved', 'Your dashboard layout and widget preferences have been persisted.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Dashboard Layout & Widgets"
      maxWidth={640}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: colors.text.secondary }}>
          Rearrange modules, toggle section visibility, or reset demonstration test state. Changes are automatically saved to your profile.
        </p>

        {/* Widget Order & Visibility List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '360px',
            overflowY: 'auto',
            paddingRight: '6px'
          }}
        >
          {currentPrefs.widgetOrder.map((key, index) => {
            const isVisible = (currentPrefs.widgetVisibility as any)[key] !== false;
            const label = WIDGET_LABELS[key] || key;

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: colors.bg.surfaceElevated,
                  border: `1px solid ${colors.border.subtle}`,
                  opacity: isVisible ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => toggleVisibility(key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isVisible ? colors.brand.primaryLight : colors.text.muted,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={isVisible ? 'Hide Widget' : 'Show Widget'}
                  >
                    {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>

                  <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                    {label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => moveWidget(index, 'up')}
                    disabled={index === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      color: index === 0 ? colors.text.muted : colors.text.secondary,
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>

                  <button
                    onClick={() => moveWidget(index, 'down')}
                    disabled={index === currentPrefs.widgetOrder.length - 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: index === currentPrefs.widgetOrder.length - 1 ? 'not-allowed' : 'pointer',
                      color: index === currentPrefs.widgetOrder.length - 1 ? colors.text.muted : colors.text.secondary,
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Development & Demo Testing Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: `1px solid ${colors.border.subtle}`,
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onSeedSampleData}
              leftIcon={<Sparkles size={13} />}
              title="Populate comprehensive demo portfolio"
            >
              Seed Demo Portfolio
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetToZero}
              leftIcon={<RotateCcw size={13} />}
              title="Reset dashboard to 0 (empty account state)"
            >
              Reset to Zero State
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Layout
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
