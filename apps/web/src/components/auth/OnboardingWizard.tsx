import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Sparkles,
  Wallet,
  TrendingUp,
  CreditCard,
  PieChart,
  Target,
  Home,
  FolderLock,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Users,
  User,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { CurrencyCode, WorkspaceType } from '@finance/types';

interface ModuleOption {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  defaultSelected: boolean;
}

export const OnboardingWizard: React.FC = () => {
  const { colors } = useTheme();
  const { user, submitOnboarding, setAuthView } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState<boolean>(false);

  const handleSkip = () => {
    localStorage.setItem('skip_onboarding', 'true');
    setAuthView(null);
  };

  // Step state
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    user?.preferences?.defaultCurrency || 'INR'
  );
  const [financialYear, setFinancialYear] = useState<string>(
    user?.preferences?.financialYear || 'APRIL_MARCH'
  );
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('INDIVIDUAL');

  const availableModules: ModuleOption[] = [
    {
      id: 'accounts',
      name: 'Banking & Depository Accounts',
      desc: 'Checking, high-yield savings, and automated multi-institution balance tracking',
      icon: <Wallet size={18} />,
      defaultSelected: true
    },
    {
      id: 'transactions',
      name: 'Cash Flow & Double-Entry Ledger',
      desc: 'Real-time debits, credits, transfers, and tax categorization',
      icon: <Coins size={18} />,
      defaultSelected: true
    },
    {
      id: 'investments',
      name: 'Investment Portfolio Manager',
      desc: 'Stocks, mutual funds, index ETFs, fixed income, cryptocurrency, and gold bullion',
      icon: <TrendingUp size={18} />,
      defaultSelected: true
    },
    {
      id: 'budgets',
      name: 'Monthly Budgets & Spending Caps',
      desc: 'Category envelope budgeting with automated threshold alerts',
      icon: <PieChart size={18} />,
      defaultSelected: true
    },
    {
      id: 'goals',
      name: 'Financial Goals & Milestones',
      desc: 'Target-date wealth forecasting, emergency reserves, and major purchases',
      icon: <Target size={18} />,
      defaultSelected: true
    },
    {
      id: 'assets',
      name: 'Physical Assets & Real Estate',
      desc: 'Appreciation tracking for primary homes, vehicles, and private equity',
      icon: <Home size={18} />,
      defaultSelected: false
    },
    {
      id: 'liabilities',
      name: 'Liabilities, Mortgages & Loans',
      desc: 'Amortization schedules, monthly EMI calculators, and debt payoff acceleration',
      icon: <CreditCard size={18} />,
      defaultSelected: false
    },
    {
      id: 'documents',
      name: 'Encrypted Document Vault',
      desc: 'Secure storage for tax 1099s, bank statements, property deeds, and trust agreements',
      icon: <FolderLock size={18} />,
      defaultSelected: false
    }
  ];

  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>(
    availableModules.filter((m) => m.defaultSelected).map((m) => m.id)
  );

  const [goalTitle, setGoalTitle] = useState('Emergency Reserve (6 Months)');
  const [goalAmount, setGoalAmount] = useState('300000');

  const toggleModule = (id: string) => {
    if (selectedModuleIds.includes(id)) {
      if (selectedModuleIds.length > 1) {
        setSelectedModuleIds(selectedModuleIds.filter((m) => m !== id));
      }
    } else {
      setSelectedModuleIds([...selectedModuleIds, id]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await submitOnboarding({
        enabledModules: selectedModuleIds,
        defaultCurrency: selectedCurrency,
        financialYear,
        workspaceType,
        initialGoal: goalTitle && goalAmount ? { title: goalTitle, targetAmount: Number(goalAmount) } : undefined
      });
      localStorage.setItem('skip_onboarding', 'true');
      setAuthView(null);
    } catch {
      localStorage.setItem('skip_onboarding', 'true');
      setAuthView(null);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        backgroundColor: colors.bg.canvas,
        color: colors.text.primary,
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: colors.bg.surface,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '18px',
          padding: '36px 36px',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5)',
          boxSizing: 'border-box'
        }}
      >
        {/* Skip to Dashboard link */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: colors.brand.primaryLight,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            Skip to Dashboard &rarr;
          </button>
        </div>

        {/* Progress Bar Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: colors.brand.primaryLight, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span style={{ fontSize: '12px', color: colors.text.muted }}>
              {currentStep === 1 && 'Welcome & Overview'}
              {currentStep === 2 && 'Regional & Workspace Customization'}
              {currentStep === 3 && 'Module Selection'}
              {currentStep === 4 && 'Initial Milestone Target'}
            </span>
          </div>
          <ProgressBar value={progressPercentage} color={colors.brand.primary} height={6} />
        </div>

        {/* Step 1: Welcome & Overview */}
        {currentStep === 1 && (
          <div>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                backgroundColor: colors.brand.primaryMuted,
                color: colors.brand.primaryLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}
            >
              <Sparkles size={28} />
            </div>

            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800, color: colors.text.primary }}>
              Welcome to WealthFlow, {user?.profile?.firstName || 'Valued Member'}
            </h1>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: colors.text.secondary, lineHeight: 1.6 }}>
              Your private wealth management suite is ready. We combine digital banking clarity, institutional portfolio oversight, and cash flow forecasting in a unified workspace.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', gap: '14px', backgroundColor: colors.bg.surfaceElevated, border: `1px solid ${colors.border.subtle}`, borderRadius: '12px', padding: '16px' }}>
                <ShieldCheck size={24} color={colors.financial.income} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                    Privacy First • Zero Pressure
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: colors.text.secondary, lineHeight: 1.5 }}>
                    You will never be forced to connect bank credentials or reveal sensitive banking logins during setup. Manual tracking, imports, and read-only connectors are fully optional.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', backgroundColor: colors.bg.surfaceElevated, border: `1px solid ${colors.border.subtle}`, borderRadius: '12px', padding: '16px' }}>
                <Coins size={24} color={colors.brand.primaryLight} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                    Multi-Asset & Global Currencies
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: colors.text.secondary, lineHeight: 1.5 }}>
                    Track traditional depository balances, index funds, real estate equity, gold bullion, and cryptocurrency with real-time foreign exchange normalization.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="ghost"
                size="md"
                onClick={handleSkip}
                style={{ color: colors.text.secondary }}
              >
                Skip & Enter Dashboard
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentStep(2)}
                rightIcon={<ArrowRight size={16} />}
                style={{ fontWeight: 600 }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Regional & Workspace Customization */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: colors.text.primary }}>
              Regional & Workspace Configuration
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: colors.text.secondary }}>
              Configure your reporting currency and choose whether this workspace is managed individually or as a shared household.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
              {/* Workspace Type Selector */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'block', marginBottom: '8px' }}>
                  Workspace Structure
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div
                    onClick={() => setWorkspaceType('INDIVIDUAL')}
                    style={{
                      border: `1.5px solid ${workspaceType === 'INDIVIDUAL' ? colors.brand.primary : colors.border.default}`,
                      backgroundColor: workspaceType === 'INDIVIDUAL' ? colors.brand.primaryMuted : colors.bg.surfaceElevated,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <User size={20} color={workspaceType === 'INDIVIDUAL' ? colors.brand.primaryLight : colors.text.muted} />
                      {workspaceType === 'INDIVIDUAL' && <Check size={16} color={colors.brand.primaryLight} />}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: colors.text.primary }}>Individual</div>
                    <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>Personal finances and solo portfolio tracking</div>
                  </div>

                  <div
                    onClick={() => setWorkspaceType('HOUSEHOLD')}
                    style={{
                      border: `1.5px solid ${workspaceType === 'HOUSEHOLD' ? colors.brand.primary : colors.border.default}`,
                      backgroundColor: workspaceType === 'HOUSEHOLD' ? colors.brand.primaryMuted : colors.bg.surfaceElevated,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Users size={20} color={workspaceType === 'HOUSEHOLD' ? colors.brand.primaryLight : colors.text.muted} />
                      {workspaceType === 'HOUSEHOLD' && <Check size={16} color={colors.brand.primaryLight} />}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: colors.text.primary }}>Household</div>
                    <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>Shared family budget with member permissions</div>
                  </div>
                </div>
              </div>

              {/* Base Currency & Financial Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormField label="Base Reporting Currency" helperText="Default currency for consolidated net worth">
                  <Select
                    value={selectedCurrency}
                    onChange={(val) => setSelectedCurrency(val as CurrencyCode)}
                    options={[
                      { value: 'INR', label: 'INR (₹) - Indian Rupee (Default)' },
                      { value: 'USD', label: 'USD ($) - US Dollar' },
                      { value: 'EUR', label: 'EUR (€) - Euro' },
                      { value: 'GBP', label: 'GBP (£) - British Pound' },
                      { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
                      { value: 'SGD', label: 'SGD (S$) - Singapore Dollar' }
                    ]}
                  />
                </FormField>

                <FormField label="Financial Year Cycle" helperText="Determines tax and annual budget reports">
                  <Select
                    value={financialYear}
                    onChange={(val) => setFinancialYear(val)}
                    options={[
                      { value: 'APRIL_MARCH', label: 'April to March (India Fiscal)' },
                      { value: 'JANUARY_DECEMBER', label: 'January to December (Calendar)' },
                      { value: 'JULY_JUNE', label: 'July to June' },
                      { value: 'OCTOBER_SEPTEMBER', label: 'October to September' }
                    ]}
                  />
                </FormField>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="ghost" size="md" onClick={() => setCurrentStep(1)} leftIcon={<ArrowLeft size={16} />}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setCurrentStep(3)} rightIcon={<ArrowRight size={16} />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Module Selection */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: colors.text.primary }}>
              Select Active Financial Modules
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: colors.text.secondary }}>
              Choose which capabilities to display in your navigation. You can adjust these at any time in Settings.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '360px', overflowY: 'auto', marginBottom: '24px', paddingRight: '4px' }}>
              {availableModules.map((mod) => {
                const isSelected = selectedModuleIds.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? colors.bg.surfaceElevated : colors.bg.surfaceSubtle,
                      border: `1.5px solid ${isSelected ? colors.brand.primary : colors.border.subtle}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? colors.brand.primaryMuted : colors.bg.surface,
                        color: isSelected ? colors.brand.primaryLight : colors.text.muted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {mod.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                          {mod.name}
                        </span>
                        {isSelected && <Check size={14} color={colors.brand.primaryLight} />}
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: colors.text.secondary, lineHeight: 1.4 }}>
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="ghost" size="md" onClick={() => setCurrentStep(2)} leftIcon={<ArrowLeft size={16} />}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setCurrentStep(4)} rightIcon={<ArrowRight size={16} />}>
                Continue ({selectedModuleIds.length} Active)
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Initial Milestone Target (Optional) */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: colors.text.primary }}>
              Set Your Initial Financial Milestone
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: colors.text.secondary }}>
              Optional: Give your wealth journey a clear anchor milestone, such as an emergency fund or investment allocation target.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <FormField label="Milestone Title">
                <Input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. 6-Month Emergency Fund"
                  leftIcon={<Target size={16} />}
                />
              </FormField>

              <FormField label={`Target Amount (${selectedCurrency})`}>
                <Input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="300000"
                  leftIcon={<Coins size={16} />}
                />
              </FormField>

              <div style={{ backgroundColor: colors.bg.surfaceElevated, border: `1px solid ${colors.border.subtle}`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color={colors.financial.income} />
                <div style={{ fontSize: '13px', color: colors.text.secondary }}>
                  Your platform is configured with <b>{selectedCurrency}</b> base currency and <b>{selectedModuleIds.length} active financial domains</b>.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="ghost" size="md" onClick={() => setCurrentStep(3)} leftIcon={<ArrowLeft size={16} />}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={loading}
                onClick={handleFinish}
                style={{ fontWeight: 700 }}
              >
                Complete Onboarding & Enter Workspace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

