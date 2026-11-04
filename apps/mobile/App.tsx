import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { darkThemeColors, lightThemeColors } from '@finance/ui';
import { formatCurrency, formatPercentage } from '@finance/utils';

// Platform Secure Storage Interface (Foundations for Expo SecureStore)
class MobileSecureStorage {
  private static tokenStore: Record<string, string> = {};

  static async setItemAsync(key: string, value: string): Promise<void> {
    this.tokenStore[key] = value;
  }

  static async getItemAsync(key: string): Promise<string | null> {
    return this.tokenStore[key] || null;
  }

  static async deleteItemAsync(key: string): Promise<void> {
    delete this.tokenStore[key];
  }
}

export default function App() {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'investments' | 'more'>('overview');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authView, setAuthView] = useState<'login' | 'register' | 'otp' | 'forgot' | 'onboarding'>('login');
  const [user, setUser] = useState({
    name: 'Alex Morgan',
    email: 'alex.morgan@wealthflow.internal',
    phoneNumber: '+91 98765 43210',
    country: 'India',
    currency: 'INR',
    financialYear: 'APRIL_MARCH',
    isEmailVerified: true,
    isPhoneVerified: true,
    isOnboarded: true
  });

  // Auth Inputs
  const [emailInput, setEmailInput] = useState('demo@wealthflow.internal');
  const [passwordInput, setPasswordInput] = useState('WealthFlow@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('Alex Morgan');
  const [phoneInput, setPhoneInput] = useState('+91 98765 43210');
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Quick Add State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [quickAddAmount, setQuickAddAmount] = useState('');
  const [quickAddNote, setQuickAddNote] = useState('');

  // Password Change Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const colors = themeMode === 'dark' ? darkThemeColors : lightThemeColors;

  // Password strength evaluation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { label: 'Weak', color: colors.financial.expense };
    if (score === 2) return { label: 'Fair', color: colors.financial.liability };
    if (score === 3) return { label: 'Good', color: colors.financial.income };
    return { label: 'Strong', color: colors.financial.asset };
  };

  const handleLogin = async () => {
    setAuthError(null);
    if (!emailInput || !passwordInput) {
      setAuthError('Please fill in both email and password');
      return;
    }
    await MobileSecureStorage.setItemAsync('access_token', 'jwt_mobile_simulated_token');
    await MobileSecureStorage.setItemAsync('refresh_token', 'jwt_mobile_refresh_token');
    setIsAuthenticated(true);
  };

  const handleRegister = async () => {
    setAuthError(null);
    if (!emailInput || !passwordInput || !fullNameInput) {
      setAuthError('Please complete all required fields');
      return;
    }
    setUser({
      name: fullNameInput,
      email: emailInput,
      phoneNumber: phoneInput,
      country: 'India',
      currency: 'INR',
      financialYear: 'APRIL_MARCH',
      isEmailVerified: false,
      isPhoneVerified: false,
      isOnboarded: false
    });
    await MobileSecureStorage.setItemAsync('access_token', 'jwt_mobile_simulated_token');
    setIsAuthenticated(true);
    setAuthView('onboarding');
  };

  const handleSocialAuth = async (provider: 'Google' | 'Apple') => {
    await MobileSecureStorage.setItemAsync('access_token', `jwt_${provider.toLowerCase()}_token`);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await MobileSecureStorage.deleteItemAsync('access_token');
    await MobileSecureStorage.deleteItemAsync('refresh_token');
    setIsAuthenticated(false);
    setAuthView('login');
  };

  const sampleAccounts = [
    { id: '1', name: 'HDFC Imperia Premium Checking', balance: 345000.00, type: 'Savings •••• 4821', institution: 'HDFC Bank' },
    { id: '2', name: 'ICICI Wealth Savings', balance: 852000.80, type: 'Savings (7.25% FD)', institution: 'ICICI Bank' },
    { id: '3', name: 'SBI Prime Credit Card', balance: -45200.50, type: 'Credit Card', institution: 'State Bank of India' }
  ];

  const sampleHoldings = [
    { symbol: 'TCS', name: 'Tata Consultancy Services', value: 420000.00, returnPct: 22.4, type: 'Equity' },
    { symbol: 'NIFTY50', name: 'Nippon India Nifty 50 BeES', value: 890000.00, returnPct: 15.8, type: 'Index ETF' },
    { symbol: 'GOLD', name: 'Sovereign Gold Bonds (2029)', value: 310000.00, returnPct: 18.2, type: 'Precious Metals' },
    { symbol: 'GOI-7.18', name: 'Govt of India 7.18% 2033 Bond', value: 250000.00, returnPct: 7.18, type: 'Govt Bonds' }
  ];

  const sampleTransactions = [
    { id: 't1', title: 'Nature Basket Supermarket', category: 'Groceries', amount: -3250.00, date: 'Today' },
    { id: 't2', title: 'Infosys Consulting Salary', category: 'Salary', amount: 185000.00, date: 'Nov 01' },
    { id: 't3', title: 'TCS Quarterly Dividend', category: 'Dividend', amount: 5600.00, date: 'Nov 03' },
    { id: 't4', title: 'Tata Power Utility Bill', category: 'Utilities', amount: -2450.00, date: 'Nov 04' }
  ];

  // If user is unauthenticated or in onboarding flow:
  if (!isAuthenticated || (!user.isOnboarded && authView === 'onboarding')) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
        <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

        <ScrollView contentContainerStyle={styles.authScrollBody} showsVerticalScrollIndicator={false}>
          {/* Brand Header */}
          <View style={styles.authHeader}>
            <View style={[styles.logoBadge, { backgroundColor: colors.brand.primary }]}>
              <Text style={{ fontSize: 24, color: '#FFFFFF', fontWeight: '900' }}>W</Text>
            </View>
            <Text style={[styles.authTitle, { color: colors.text.primary }]}>WealthFlow</Text>
            <Text style={[styles.authSubtitle, { color: colors.text.muted }]}>
              All-in-One Wealth & Personal Finance Management
            </Text>
          </View>

          {authError && (
            <View style={[styles.errorBox, { backgroundColor: colors.financial.expenseBg, borderColor: colors.financial.expenseBorder }]}>
              <Text style={[styles.errorText, { color: colors.financial.expenseText }]}>{authError}</Text>
            </View>
          )}

          {/* LOGIN SCREEN */}
          {authView === 'login' && (
            <View style={[styles.authCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Sign In to Your Portfolio</Text>
              <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
                Access your encrypted institutional wealth dashboard
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email Address</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@domain.com"
                placeholderTextColor={colors.text.muted}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary, marginTop: 0 }]}>Password</Text>
                <TouchableOpacity onPress={() => setAuthView('forgot')}>
                  <Text style={{ fontSize: 12, color: colors.brand.primaryLight, fontWeight: '600' }}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.text.muted}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{ color: colors.text.muted, fontSize: 11, fontWeight: '700' }}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.brand.primary }]}
                onPress={handleLogin}
              >
                <Text style={styles.submitBtnText}>Sign In Securely</Text>
              </TouchableOpacity>

              {/* Social Logins */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
                <Text style={[styles.dividerText, { color: colors.text.muted }]}>OR CONTINUE WITH</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: colors.bg.surfaceElevated, borderColor: colors.border.default }]}
                  onPress={() => handleSocialAuth('Google')}
                >
                  <Text style={[styles.socialBtnText, { color: colors.text.primary }]}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: colors.bg.surfaceElevated, borderColor: colors.border.default }]}
                  onPress={() => handleSocialAuth('Apple')}
                >
                  <Text style={[styles.socialBtnText, { color: colors.text.primary }]}>Apple</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.secondaryLinkBtn, { borderColor: colors.border.default }]}
                onPress={() => setAuthView('otp')}
              >
                <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '600' }}>
                  📱 Sign In with Mobile OTP
                </Text>
              </TouchableOpacity>

              <View style={styles.toggleAuthRow}>
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => setAuthView('register')}>
                  <Text style={{ color: colors.brand.primaryLight, fontSize: 13, fontWeight: '700' }}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* REGISTER SCREEN */}
          {authView === 'register' && (
            <View style={[styles.authCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Create Your Account</Text>
              <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
                Configured with India defaults (INR ₹ & April–March fiscal year)
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Full Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
                value={fullNameInput}
                onChangeText={setFullNameInput}
                placeholder="Alex Morgan"
                placeholderTextColor={colors.text.muted}
              />

              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email Address</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@domain.com"
                placeholderTextColor={colors.text.muted}
              />

              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Mobile Number</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.text.muted}
              />

              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Create Password</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry={!showPassword}
                placeholder="Minimum 8 characters"
                placeholderTextColor={colors.text.muted}
              />

              {/* Password Strength Indicator */}
              {passwordInput.length > 0 && (
                <View style={styles.strengthContainer}>
                  <Text style={{ fontSize: 12, color: colors.text.muted }}>Password Strength: </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: getPasswordStrength(passwordInput).color }}>
                    {getPasswordStrength(passwordInput).label}
                  </Text>
                </View>
              )}

              {/* Regional Defaults Notice */}
              <View style={[styles.regionalPill, { backgroundColor: colors.bg.surfaceElevated, borderColor: colors.border.subtle }]}>
                <Text style={{ fontSize: 11, color: colors.text.secondary }}>
                  🇮🇳 Regional Base: <Text style={{ fontWeight: '700', color: colors.text.primary }}>India (INR ₹)</Text> • Fiscal: <Text style={{ fontWeight: '700', color: colors.text.primary }}>Apr-Mar</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.brand.primary, marginTop: 16 }]}
                onPress={handleRegister}
              >
                <Text style={styles.submitBtnText}>Create Account & Continue</Text>
              </TouchableOpacity>

              <View style={styles.toggleAuthRow}>
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Already have an account? </Text>
                <TouchableOpacity onPress={() => setAuthView('login')}>
                  <Text style={{ color: colors.brand.primaryLight, fontSize: 13, fontWeight: '700' }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* OTP AUTH SCREEN */}
          {authView === 'otp' && (
            <View style={[styles.authCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Mobile OTP Verification</Text>
              <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
                We sent a 6-digit cryptographic verification code to {phoneInput}
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>6-Digit OTP</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default, textAlign: 'center', fontSize: 20, letterSpacing: 6 }]}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="123456"
                placeholderTextColor={colors.text.muted}
              />

              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ fontSize: 12, color: colors.text.muted }}>
                  Dev Token Code: <Text style={{ fontWeight: '700', color: colors.brand.primaryLight }}>123456</Text> (Simulated)
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.brand.primary }]}
                onPress={() => {
                  setIsAuthenticated(true);
                  setUser({ ...user, isPhoneVerified: true });
                }}
              >
                <Text style={styles.submitBtnText}>Verify & Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ alignItems: 'center', marginTop: 14 }}
                onPress={() => setAuthView('login')}
              >
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>← Back to Email Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FORGOT PASSWORD */}
          {authView === 'forgot' && (
            <View style={[styles.authCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Reset Password</Text>
              <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
                Enter your account email to receive a secure password reset link
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email Address</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@domain.com"
                placeholderTextColor={colors.text.muted}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.brand.primary, marginTop: 16 }]}
                onPress={() => {
                  Alert.alert('Reset Link Dispatched', `Password reset instructions sent to ${emailInput}`);
                  setAuthView('login');
                }}
              >
                <Text style={styles.submitBtnText}>Send Reset Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ alignItems: 'center', marginTop: 14 }}
                onPress={() => setAuthView('login')}
              >
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>← Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ONBOARDING FLOW */}
          {authView === 'onboarding' && (
            <View style={[styles.authCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Welcome to WealthFlow</Text>
              <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
                Step 1 of 1: Confirm your regional preferences & portfolio workspace
              </Text>

              <View style={[styles.onboardingBox, { backgroundColor: colors.bg.surfaceElevated, borderColor: colors.border.default }]}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}>
                  🇮🇳 Regional Defaults
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 4 }}>
                  • Currency: <Text style={{ color: colors.financial.asset, fontWeight: '700' }}>INR (₹) Indian Rupee</Text>
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                  • Accounting: <Text style={{ color: colors.text.primary, fontWeight: '700' }}>April to March Cycle</Text>
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                  • Time Zone: <Text style={{ color: colors.text.primary, fontWeight: '700' }}>Asia/Kolkata (IST)</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.brand.primary, marginTop: 16 }]}
                onPress={() => {
                  setUser({ ...user, isOnboarded: true });
                  setAuthView('login');
                }}
              >
                <Text style={styles.submitBtnText}>Finish Setup & Enter Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // AUTHENTICATED APP EXPERIENCE
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.bg.surface, borderBottomColor: colors.border.default }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.text.muted }]}>WealthFlow Institutional</Text>
          <Text style={[styles.userName, { color: colors.text.primary }]}>{user.name}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.themePill, { backgroundColor: colors.bg.surfaceElevated, borderColor: colors.border.default }]}
            onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brand.primaryLight }}>
              {themeMode === 'dark' ? '☀️ LIGHT' : '🌙 DARK'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab Content */}
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Primary Net Worth Hero Card */}
            <View style={[styles.heroCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <View style={styles.heroHeader}>
                <Text style={[styles.cardTag, { color: colors.text.muted }]}>TOTAL NET WORTH</Text>
                <View style={[styles.changeBadge, { backgroundColor: colors.financial.incomeBg, borderColor: colors.financial.incomeBorder }]}>
                  <Text style={[styles.changeBadgeText, { color: colors.financial.incomeText }]}>+18.4% (₹7.45L)</Text>
                </View>
              </View>

              <Text style={[styles.netWorthAmount, { color: colors.text.primary }]}>
                {formatCurrency(4850000.00, 'INR')}
              </Text>

              <View style={styles.heroFooter}>
                <View>
                  <Text style={[styles.statLabel, { color: colors.text.muted }]}>Total Assets</Text>
                  <Text style={[styles.statValue, { color: colors.financial.asset }]}>₹56,40,000</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.statLabel, { color: colors.text.muted }]}>Liabilities</Text>
                  <Text style={[styles.statValue, { color: colors.financial.liability }]}>₹7,90,000</Text>
                </View>
              </View>
            </View>

            {/* Monthly Cash Flow Quick Summary */}
            <View style={styles.metricsRow}>
              <View style={[styles.compactMetric, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
                <Text style={[styles.metricLabel, { color: colors.text.muted }]}>Monthly Inflow</Text>
                <Text style={[styles.metricValue, { color: colors.financial.income }]}>₹1,85,000</Text>
              </View>
              <View style={[styles.compactMetric, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
                <Text style={[styles.metricLabel, { color: colors.text.muted }]}>Monthly Spends</Text>
                <Text style={[styles.metricValue, { color: colors.financial.expense }]}>₹48,200</Text>
              </View>
            </View>

            {/* Recent Verified Transactions */}
            <View style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <Text style={[styles.sectionHeader, { color: colors.text.primary }]}>Recent Transactions</Text>
              {sampleTransactions.map((tx) => (
                <View key={tx.id} style={[styles.txItem, { borderBottomColor: colors.border.subtle }]}>
                  <View>
                    <Text style={[styles.txTitle, { color: colors.text.primary }]}>{tx.title}</Text>
                    <Text style={[styles.txSubtitle, { color: colors.text.muted }]}>{tx.category} • {tx.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.amount > 0 ? colors.financial.incomeText : colors.text.primary }
                    ]}
                  >
                    {tx.amount > 0 ? `+₹${tx.amount.toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'accounts' && (
          <View style={styles.tabContent}>
            <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Bank Accounts & Cards</Text>
            {sampleAccounts.map((acc) => (
              <View key={acc.id} style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default, marginBottom: 12 }]}>
                <View style={styles.txItem}>
                  <View>
                    <Text style={[styles.txTitle, { color: colors.text.primary }]}>{acc.name}</Text>
                    <Text style={[styles.txSubtitle, { color: colors.text.muted }]}>{acc.type}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: acc.balance >= 0 ? colors.text.primary : colors.financial.liability }]}>
                    {formatCurrency(acc.balance, 'INR')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'investments' && (
          <View style={styles.tabContent}>
            <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Investment Portfolio</Text>
            {sampleHoldings.map((h, i) => (
              <View key={i} style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default, marginBottom: 12 }]}>
                <View style={styles.txItem}>
                  <View>
                    <Text style={[styles.txTitle, { color: colors.text.primary }]}>{h.name}</Text>
                    <Text style={[styles.txSubtitle, { color: colors.text.muted }]}>{h.symbol} • {h.type}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txAmount, { color: colors.text.primary }]}>
                      {formatCurrency(h.value, 'INR')}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.financial.incomeText }}>
                      +{formatPercentage(h.returnPct)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* MORE / USER PROFILE & SECURITY TAB */}
        {activeTab === 'more' && (
          <View style={styles.tabContent}>
            {/* User Profile Card */}
            <View style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default, marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.brand.primary }]}>
                  <Text style={{ fontSize: 20, color: '#FFFFFF', fontWeight: '800' }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>{user.name}</Text>
                  <Text style={{ fontSize: 13, color: colors.text.secondary }}>{user.email}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <View style={[styles.badge, { backgroundColor: colors.financial.incomeBg }]}>
                      <Text style={{ fontSize: 10, color: colors.financial.incomeText, fontWeight: '700' }}>
                        EMAIL VERIFIED
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.bg.surfaceElevated }]}>
                      <Text style={{ fontSize: 10, color: colors.text.secondary, fontWeight: '700' }}>
                        🇮🇳 INR (₹)
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Active Sessions & Security */}
            <Text style={[styles.pageTitle, { color: colors.text.primary, fontSize: 15, marginBottom: 8 }]}>
              Security & Active Sessions
            </Text>

            <View style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default, marginBottom: 14 }]}>
              <View style={styles.sessionItem}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text.primary }}>
                    This iPhone 16 Pro (Current Device)
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.text.muted }}>iOS 18.2 • Mumbai, India (IP: 103.21.244.x)</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.brand.primaryMuted }]}>
                  <Text style={{ fontSize: 10, color: colors.brand.primaryLight, fontWeight: '700' }}>ACTIVE NOW</Text>
                </View>
              </View>

              <View style={[styles.sessionItem, { borderTopWidth: 1, borderTopColor: colors.border.subtle, paddingTop: 10, marginTop: 10 }]}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.primary }}>
                    MacBook Pro (Chrome 122)
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.text.muted }}>macOS • Bengaluru, India • Last active 2h ago</Text>
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert('Session Revoked', 'MacBook Pro session has been invalidated.')}
                >
                  <Text style={{ fontSize: 12, color: colors.financial.expense, fontWeight: '600' }}>Revoke</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Account Actions */}
            <View style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default, marginBottom: 20 }]}>
              <TouchableOpacity
                style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: colors.border.subtle }]}
                onPress={() => setIsChangePasswordOpen(true)}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                  🔐 Change Cryptographic Password
                </Text>
                <Text style={{ color: colors.text.muted }}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: colors.border.subtle }]}
                onPress={() => Alert.alert('Logged Out', 'All other active sessions have been terminated.')}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.financial.liability }}>
                  🚫 Log Out All Other Devices
                </Text>
                <Text style={{ color: colors.text.muted }}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={handleLogout}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.financial.expense }}>
                  🚪 Sign Out of WealthFlow
                </Text>
                <Text style={{ color: colors.financial.expense }}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Quick-Add Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.brand.primary }]}
        onPress={() => setIsQuickAddOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.bg.surface, borderTopColor: colors.border.default }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.navIcon, { color: activeTab === 'overview' ? colors.brand.primaryLight : colors.text.muted }]}>
            ◈
          </Text>
          <Text style={[styles.navLabel, { color: activeTab === 'overview' ? colors.brand.primaryLight : colors.text.muted }]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('accounts')}
        >
          <Text style={[styles.navIcon, { color: activeTab === 'accounts' ? colors.brand.primaryLight : colors.text.muted }]}>
            ▤
          </Text>
          <Text style={[styles.navLabel, { color: activeTab === 'accounts' ? colors.brand.primaryLight : colors.text.muted }]}>
            Accounts
          </Text>
        </TouchableOpacity>

        {/* Center FAB spacer */}
        <View style={{ width: 56 }} />

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('investments')}
        >
          <Text style={[styles.navIcon, { color: activeTab === 'investments' ? colors.brand.primaryLight : colors.text.muted }]}>
            ▲
          </Text>
          <Text style={[styles.navLabel, { color: activeTab === 'investments' ? colors.brand.primaryLight : colors.text.muted }]}>
            Invest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('more')}
        >
          <Text style={[styles.navIcon, { color: activeTab === 'more' ? colors.brand.primaryLight : colors.text.muted }]}>
            ≡
          </Text>
          <Text style={[styles.navLabel, { color: activeTab === 'more' ? colors.brand.primaryLight : colors.text.muted }]}>
            Security
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Add Modal */}
      <Modal visible={isQuickAddOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.bg.surfaceElevated, borderColor: colors.border.strong }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Quick Add Transaction</Text>
            
            <View style={styles.quickTypeRow}>
              {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: quickAddType === t ? colors.brand.primary : colors.bg.surface,
                      borderColor: colors.border.default
                    }
                  ]}
                  onPress={() => setQuickAddType(t)}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: quickAddType === t ? '#FFFFFF' : colors.text.muted }}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
              placeholder="Amount (₹0.00)"
              placeholderTextColor={colors.text.muted}
              keyboardType="decimal-pad"
              value={quickAddAmount}
              onChangeText={setQuickAddAmount}
            />

            <TextInput
              style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
              placeholder="Description (e.g. Grocery store)"
              placeholderTextColor={colors.text.muted}
              value={quickAddNote}
              onChangeText={setQuickAddNote}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}
                onPress={() => setIsQuickAddOpen(false)}
              >
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.brand.primary }]}
                onPress={() => {
                  setIsQuickAddOpen(false);
                  setQuickAddAmount('');
                  setQuickAddNote('');
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={isChangePasswordOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.bg.surfaceElevated, borderColor: colors.border.strong }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Change Password</Text>
            
            <TextInput
              style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
              placeholder="Current Password"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
              value={currentPw}
              onChangeText={setCurrentPw}
            />

            <TextInput
              style={[styles.inputField, { backgroundColor: colors.bg.canvas, color: colors.text.primary, borderColor: colors.border.default }]}
              placeholder="New Secure Password (min 8 chars)"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}
                onPress={() => setIsChangePasswordOpen(false)}
              >
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.brand.primary }]}
                onPress={() => {
                  setIsChangePasswordOpen(false);
                  Alert.alert('Success', 'Cryptographic password updated successfully.');
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topHeader: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1
  },
  greeting: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  userName: {
    fontSize: 18,
    fontWeight: '700'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  themePill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 90
  },
  tabContent: {
    gap: 16
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1
  },
  changeBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  netWorthAmount: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginVertical: 4
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12
  },
  compactMetric: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500'
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  txSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700'
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 99
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2
  },
  bottomBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingHorizontal: 8
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    width: 60
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 14
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  quickTypeRow: {
    flexDirection: 'row',
    gap: 8
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  inputField: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  // Auth Styles
  authScrollBody: {
    padding: 24,
    justifyContent: 'center'
  },
  authHeader: {
    alignItems: 'center',
    marginVertical: 24
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  authSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280
  },
  authCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 14
  },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10
  },
  socialBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: '600'
  },
  secondaryLinkBtn: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  toggleAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600'
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  regionalPill: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12
  },
  onboardingBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 12
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14
  }
});
