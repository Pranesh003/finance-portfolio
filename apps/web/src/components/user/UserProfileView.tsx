import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  Bell,
  Shield,
  Smartphone
} from 'lucide-react';
import { CurrencyCode } from '@finance/types';

export const UserProfileView: React.FC = () => {
  const { colors } = useTheme();
  const { user, updateProfile, setAuthView } = useAuth();
  const { setCurrency } = useCurrency();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(user?.profile?.firstName || '');
  const [lastName, setLastName] = useState(user?.profile?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || '');
  const [country, setCountry] = useState(user?.profile?.country || 'India');
  const [city, setCity] = useState(user?.profile?.city || 'Mumbai');
  const [timeZone, setTimeZone] = useState(user?.profile?.timeZone || 'Asia/Kolkata');
  const [financialYear, setFinancialYear] = useState(user?.profile?.financialYear || 'APRIL_MARCH');
  const [dateFormat, setDateFormat] = useState(user?.profile?.dateFormat || 'DD/MM/YYYY');
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(user?.preferences?.defaultCurrency || 'INR');

  // Notification Preferences
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(user?.preferences?.enableEmailAlerts ?? true);
  const [enablePushNotifications, setEnablePushNotifications] = useState(user?.preferences?.enablePushNotifications ?? true);
  const [enableTwoFactor, setEnableTwoFactor] = useState(user?.preferences?.enableTwoFactor ?? false);
  const [enableBiometrics, setEnableBiometrics] = useState(user?.preferences?.enableBiometrics ?? false);

  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        phoneNumber,
        avatarUrl,
        country,
        city,
        timeZone,
        financialYear,
        dateFormat,
        defaultCurrency: baseCurrency,
        enableEmailAlerts,
        enablePushNotifications,
        enableTwoFactor,
        enableBiometrics
      });
      setCurrency(baseCurrency);
      toast.success('Profile Saved', 'Your user profile and notification preferences have been updated.');
    } catch (err: unknown) {
      toast.error('Update Failed', err instanceof Error ? err.message : 'Could not save profile changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
          User Profile & Identity
        </h1>
        <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
          Manage your personal details, regional preferences, and institutional communication settings.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile Header Card */}
        <Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
            {/* Avatar with Upload simulation */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: colors.brand.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#FFFFFF'
                }}
              >
                {(firstName[0] || 'U') + (lastName[0] || '')}
              </div>
              <button
                type="button"
                onClick={() => toast.info('Avatar Photo', 'Image upload dialog simulation')}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  backgroundColor: colors.bg.surfaceElevated,
                  border: `1px solid ${colors.border.strong}`,
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text.primary,
                  cursor: 'pointer'
                }}
              >
                <Camera size={13} />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.text.primary }}>
                  {firstName} {lastName}
                </h2>
                <Badge variant="brand" size="sm">
                  {user?.role || 'USER'}
                </Badge>
              </div>
              <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                {user?.email} • Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </div>

            {/* Email & Phone Verification Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              {user?.isEmailVerified ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.financial.incomeText }}>
                  <CheckCircle2 size={13} color={colors.financial.income} />
                  <span>Email Verified</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthView('verify-email')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: colors.financial.liability,
                    backgroundColor: colors.financial.liabilityBg,
                    border: `1px solid ${colors.financial.liabilityBorder}`,
                    borderRadius: '6px',
                    padding: '3px 8px',
                    cursor: 'pointer'
                  }}
                >
                  <AlertCircle size={12} />
                  <span>Verify Email</span>
                </button>
              )}

              {user?.isPhoneVerified ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.financial.incomeText }}>
                  <CheckCircle2 size={13} color={colors.financial.income} />
                  <span>Phone Verified</span>
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: colors.text.muted }}>Phone unverified</span>
              )}
            </div>
          </div>
        </Card>

        {/* Identity Details Card */}
        <Card title="Personal Information">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <FormField label="First Name" required>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                leftIcon={<User size={15} />}
                required
              />
            </FormField>

            <FormField label="Last Name" required>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                leftIcon={<User size={15} />}
                required
              />
            </FormField>

            <FormField label="Primary Email" helperText="Email address used for authentication and statements">
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                leftIcon={<Mail size={15} />}
              />
            </FormField>

            <FormField label="Mobile Number">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                leftIcon={<Phone size={15} />}
              />
            </FormField>

            <FormField label="Profile Photo URL" hint="Direct HTTPS image link to display as your custom avatar">
              <Input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                leftIcon={<Camera size={15} />}
              />
            </FormField>
          </div>
        </Card>

        {/* Regional & Financial Preferences */}
        <Card title="Regional & Accounting Preferences">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <FormField label="Country of Residence">
              <Select
                value={country}
                onChange={(val) => setCountry(val)}
                options={[
                  { value: 'India', label: 'India (Default)' },
                  { value: 'United States', label: 'United States' },
                  { value: 'United Kingdom', label: 'United Kingdom' },
                  { value: 'Singapore', label: 'Singapore' },
                  { value: 'United Arab Emirates', label: 'UAE' },
                  { value: 'Canada', label: 'Canada' },
                  { value: 'Australia', label: 'Australia' }
                ]}
              />
            </FormField>

            <FormField label="City">
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                leftIcon={<MapPin size={15} />}
                placeholder="Mumbai"
              />
            </FormField>

            <FormField label="Preferred Base Currency" helperText="Currency in which portfolio net asset values are summarized">
              <Select
                value={baseCurrency}
                onChange={(val) => setBaseCurrency(val as CurrencyCode)}
                options={[
                  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                  { value: 'USD', label: 'USD ($) - US Dollar' },
                  { value: 'EUR', label: 'EUR (€) - Euro' },
                  { value: 'GBP', label: 'GBP (£) - British Pound' },
                  { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
                  { value: 'SGD', label: 'SGD (S$) - Singapore Dollar' }
                ]}
              />
            </FormField>

            <FormField label="Financial Year Cycle">
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

            <FormField label="Time Zone">
              <Select
                value={timeZone}
                onChange={(val) => setTimeZone(val)}
                options={[
                  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
                  { value: 'America/New_York', label: 'America/New_York (EST)' },
                  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT)' },
                  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +4:00)' },
                  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT +8:00)' }
                ]}
              />
            </FormField>

            <FormField label="Date Format">
              <Select
                value={dateFormat}
                onChange={(val) => setDateFormat(val)}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Standard India)' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO 8601)' }
                ]}
              />
            </FormField>
          </div>
        </Card>

        {/* Notification & Communication Preferences */}
        <Card title="Notification & Security Communication Preferences">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${colors.border.subtle}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: colors.brand.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} color={colors.brand.primaryLight} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>Email Financial Alerts & Statements</div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary }}>Receive monthly wealth digests, tax statements, and transaction confirmations</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableEmailAlerts}
                onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: colors.brand.primary }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${colors.border.subtle}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: colors.brand.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={18} color={colors.brand.primaryLight} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>Push Notifications & Price Alerts</div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary }}>Real-time alerts for budget limits, portfolio rebalancing, and dividend deposits</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enablePushNotifications}
                onChange={(e) => setEnablePushNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: colors.brand.primary }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${colors.border.subtle}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: colors.brand.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} color={colors.brand.primaryLight} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary }}>Require an OTP code whenever signing in from a new or unrecognized browser</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableTwoFactor}
                onChange={(e) => setEnableTwoFactor(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: colors.brand.primary }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: colors.brand.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={18} color={colors.brand.primaryLight} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>Mobile Biometric Authentication</div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary }}>Allow Face ID and Touch ID fast authentication on supported mobile devices</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableBiometrics}
                onChange={(e) => setEnableBiometrics(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: colors.brand.primary }}
              />
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Save size={16} />}
            style={{ fontWeight: 600 }}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

