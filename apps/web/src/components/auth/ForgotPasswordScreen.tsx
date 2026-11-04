import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { FormValidationMessage } from '../ui/FormValidationMessage';
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordScreen: React.FC = () => {
  const { colors } = useTheme();
  const { forgotPassword, setAuthView, setResetToken } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; devResetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your account email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await forgotPassword(email);
      setSuccessInfo(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to request password reset');
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
          maxWidth: '440px',
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
            <KeyRound size={24} />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: colors.text.primary }}>
            Reset Your Password
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: colors.text.secondary, lineHeight: 1.5 }}>
            Enter your registered email address and we'll dispatch an expiring secure recovery token.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={error} type="error" />
          </div>
        )}

        {successInfo ? (
          <div
            style={{
              backgroundColor: colors.financial.incomeBg,
              border: `1px solid ${colors.financial.incomeBorder}`,
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <CheckCircle2 size={32} color={colors.financial.income} style={{ margin: '0 auto 8px auto' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: colors.financial.incomeText }}>
              Reset Instructions Dispatched
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: colors.text.secondary, lineHeight: 1.5 }}>
              {successInfo.message}
            </p>

            {successInfo.devResetToken && (
              <div style={{ marginBottom: '16px', backgroundColor: colors.bg.surfaceElevated, padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border.default}`, textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: colors.text.muted, display: 'block', fontWeight: 600 }}>
                  [LOCAL DEV SIMULATOR] Direct Reset Link:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setResetToken(successInfo.devResetToken!);
                    setAuthView('reset-password');
                  }}
                  style={{
                    marginTop: '6px',
                    background: 'none',
                    border: 'none',
                    color: colors.brand.primaryLight,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Proceed to Reset Screen with Token
                </button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthView('login')}
              style={{ width: '100%' }}
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Registered Email Address" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                leftIcon={<Mail size={16} />}
                autoFocus
                required
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              style={{ width: '100%', fontWeight: 600 }}
            >
              Dispatch Recovery Instructions
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

