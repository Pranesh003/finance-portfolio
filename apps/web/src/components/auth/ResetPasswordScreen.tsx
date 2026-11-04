import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { FormValidationMessage } from '../ui/FormValidationMessage';
import { PasswordStrengthMeter, evaluatePasswordStrength } from './PasswordStrengthMeter';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ResetPasswordScreen: React.FC = () => {
  const { colors } = useTheme();
  const { resetPassword, resetToken, setAuthView } = useAuth();

  const [tokenInput, setTokenInput] = useState(resetToken || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput || !password) {
      setError('Please provide the recovery token and your new password');
      return;
    }

    const strength = evaluatePasswordStrength(password);
    if (strength.score < 2) {
      setError('New password must satisfy minimum strength requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPassword(tokenInput, password, confirmPassword);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The token may be expired.');
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
        padding: '24px',
        backgroundColor: colors.bg.canvas,
        color: colors.text.primary,
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: colors.bg.surface,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          onClick={() => setAuthView('login')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: colors.text.secondary,
            fontSize: '13px',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '20px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: colors.brand.primaryMuted,
              color: colors.brand.primaryLight,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: colors.text.primary }}>
            Set New Password
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: colors.text.secondary }}>
            Create a new master password for your account.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={error} type="error" />
          </div>
        )}

        {success ? (
          <div
            style={{
              backgroundColor: colors.financial.incomeBg,
              border: `1px solid ${colors.financial.incomeBorder}`,
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <CheckCircle2 size={36} color={colors.financial.income} style={{ margin: '0 auto 10px auto' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: colors.financial.incomeText }}>
              Password Reset Complete!
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: colors.text.secondary }}>
              Your account password has been updated and all previous sessions have been safely invalidated.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setAuthView('login')}
              style={{ width: '100%' }}
            >
              Sign In with New Password
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Recovery Token" required>
              <Input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token received in instructions"
                required
              />
            </FormField>

            <FormField label="New Master Password" required>
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

            <FormField label="Confirm New Password" required>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                leftIcon={<Lock size={16} />}
                required
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              style={{ width: '100%', fontWeight: 600, marginTop: '4px' }}
            >
              Update Password & Terminate Other Sessions
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

