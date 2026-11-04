import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { FormValidationMessage } from '../ui/FormValidationMessage';
import { MailCheck, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';

export const VerifyEmailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { verifyEmail, resendEmailVerification, verifyToken, user, setAuthView } = useAuth();

  const [tokenInput, setTokenInput] = useState(verifyToken || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput) {
      setError('Please provide the verification token');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyEmail(tokenInput);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification token is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const devToken = await resendEmailVerification();
      if (devToken) {
        setTokenInput(devToken);
        setResendNotice(`Verification dispatched! [Local Dev Token auto-filled]`);
      } else {
        setResendNotice('Verification link resent to your email address.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification');
    } finally {
      setResending(false);
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
          onClick={() => setAuthView(null)}
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
          <span>Back to Dashboard</span>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: colors.financial.incomeBg,
              color: colors.financial.incomeText,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}
          >
            <MailCheck size={28} />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: colors.text.primary }}>
            Verify Your Email
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: colors.text.secondary, lineHeight: 1.5 }}>
            Confirming your email address safeguards account recovery, institutional transaction alerts, and document vault encryption keys.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={error} type="error" />
          </div>
        )}

        {resendNotice && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={resendNotice} type="success" />
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
              Email Confirmed!
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: colors.text.secondary }}>
              Your email is now verified. Full access to export statements and multi-device sync is active.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setAuthView(null)}
              style={{ width: '100%' }}
            >
              Continue to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Verification Token" required>
              <Input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token or link code"
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
              Confirm Email Verification
            </Button>

            {user && (
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  isLoading={resending}
                  leftIcon={<RefreshCw size={14} />}
                >
                  Resend Verification Token
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

