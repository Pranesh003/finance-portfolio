import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import { FormValidationMessage } from '../ui/FormValidationMessage';
import { PasswordStrengthMeter, evaluatePasswordStrength } from './PasswordStrengthMeter';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  Layers
} from 'lucide-react';
import { CurrencyCode } from '@finance/types';

export const RegisterScreen: React.FC = () => {
  const { colors, theme } = useTheme();
  const { register, setAuthView } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('India');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [financialYear, setFinancialYear] = useState('APRIL_MARCH');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !password) {
      setError('Please provide your name, email address, and a secure password');
      return;
    }

    const strength = evaluatePasswordStrength(password);
    if (strength.score < 2) {
      setError('Please select a stronger password satisfying the security criteria');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password confirmation.');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || undefined,
        country,
        defaultCurrency: currency,
        financialYear,
        timeZone,
        password,
        confirmPassword,
        theme: theme === 'dark' ? 'dark' : 'light'
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: '560px',
          backgroundColor: colors.bg.surface,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: colors.brand.primary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              color: '#FFFFFF'
            }}
          >
            <Layers size={24} />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: colors.text.primary }}>
            Create Your WealthFlow Account
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: colors.text.secondary }}>
            All-in-One Personal Finance & Private Wealth Management Platform
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={error} type="error" />
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="First Name" required>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                leftIcon={<UserIcon size={16} />}
                required
              />
            </FormField>

            <FormField label="Last Name" required>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Morgan"
                leftIcon={<UserIcon size={16} />}
                required
              />
            </FormField>
          </div>

          {/* Email & Optional Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <FormField label="Email Address" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                leftIcon={<Mail size={16} />}
                required
              />
            </FormField>

            <FormField label="Mobile Number" helperText="Optional for OTP sign-in">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                leftIcon={<Phone size={16} />}
              />
            </FormField>
          </div>

          {/* Regional Settings Defaults (India, INR, April-March, Asia/Kolkata) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Country / Region">
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

            <FormField label="Base Currency">
              <Select
                value={currency}
                onChange={(val) => setCurrency(val as CurrencyCode)}
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
          </div>

          {/* Password & Confirm Password with Visibility Toggle */}
          <FormField label="Create Master Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters with numbers & symbols"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: colors.text.muted,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />
            <PasswordStrengthMeter password={password} />
          </FormField>

          <FormField label="Confirm Master Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password to confirm"
              leftIcon={<Lock size={16} />}
              required
            />
          </FormField>

          {/* Terms Agreement Note */}
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: colors.text.muted, lineHeight: 1.4 }}>
            By registering, you agree to our Wealth Security Safeguards and encryption standards. Data is isolated per tenant with strict ownership boundaries.
          </p>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            style={{ width: '100%', marginTop: '6px', fontWeight: 600 }}
          >
            Create Account & Continue to Onboarding
          </Button>
        </form>

        {/* Back to Login Link */}
        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: colors.text.secondary }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setAuthView('login')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.brand.primaryLight,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};

