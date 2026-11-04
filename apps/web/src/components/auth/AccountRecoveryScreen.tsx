import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { FormValidationMessage } from '../ui/FormValidationMessage';
import { Card } from '../ui/Card';
import {
  ShieldAlert,
  KeyRound,
  ArrowLeft,
  Mail,
  CheckCircle2,
  HelpCircle,
  Lock
} from 'lucide-react';

export const AccountRecoveryScreen: React.FC = () => {
  const { colors } = useTheme();
  const { setAuthView } = useAuth();

  const [recoveryType, setRecoveryType] = useState<'LOCKOUT' | 'TWO_FACTOR' | 'RECOVERY_KEY'>('LOCKOUT');
  const [email, setEmail] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide your verified account email address');
      return;
    }

    if (recoveryType === 'RECOVERY_KEY' && !recoveryKey) {
      setError('Please enter your 24-character master recovery key');
      return;
    }

    setLoading(true);
    // Simulate secure cryptographic account recovery workflow
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
    }, 900);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg.canvas,
        padding: '24px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Card
          style={{
            backgroundColor: colors.bg.surface,
            borderColor: colors.border.default,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            borderRadius: '16px',
            padding: '32px'
          }}
        >
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: colors.financial.incomeBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={32} color={colors.financial.incomeText} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: colors.text.primary, margin: '0 0 8px 0' }}>
                Recovery Instructions Dispatched
              </h2>
              <p style={{ fontSize: '13px', color: colors.text.secondary, margin: '0 0 24px 0', lineHeight: 1.6 }}>
                If an institutional portfolio matches <strong>{email}</strong>, emergency cryptographic recovery credentials and unlock directives have been securely sent.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setAuthView('login')}
                style={{ width: '100%' }}
              >
                Return to Sign In
              </Button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    backgroundColor: colors.financial.liabilityBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldAlert size={20} color={colors.financial.liability} />
                </div>
                <div>
                  <h1 style={{ fontSize: '18px', fontWeight: 700, color: colors.text.primary, margin: 0 }}>
                    Account Recovery & Security Unlock
                  </h1>
                  <span style={{ fontSize: '12px', color: colors.text.muted }}>
                    Restore access to locked or inaccessible accounts
                  </span>
                </div>
              </div>

              {/* Recovery Reason Selector */}
              <div style={{ display: 'flex', gap: '8px', margin: '20px 0 16px' }}>
                {[
                  { id: 'LOCKOUT', label: 'Unlock Account', icon: <Lock size={13} /> },
                  { id: 'TWO_FACTOR', label: 'Reset 2FA', icon: <HelpCircle size={13} /> },
                  { id: 'RECOVERY_KEY', label: 'Master Key', icon: <KeyRound size={13} /> }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setRecoveryType(t.id as any);
                      setError(null);
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: `1px solid ${recoveryType === t.id ? colors.brand.primary : colors.border.default}`,
                      backgroundColor: recoveryType === t.id ? colors.brand.primaryMuted : colors.bg.surfaceElevated,
                      color: recoveryType === t.id ? colors.brand.primaryLight : colors.text.secondary,
                      cursor: 'pointer'
                    }}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ marginBottom: '16px' }}>
                  <FormValidationMessage message={error} type="error" />
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FormField label="Registered Account Email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@domain.com"
                    leftIcon={<Mail size={16} />}
                    required
                  />
                </FormField>

                {recoveryType === 'RECOVERY_KEY' && (
                  <FormField label="24-Character Master Recovery Key" required>
                    <Input
                      type="text"
                      value={recoveryKey}
                      onChange={(e) => setRecoveryKey(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                      leftIcon={<KeyRound size={16} />}
                      required
                    />
                  </FormField>
                )}

                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: colors.bg.surfaceElevated,
                    border: `1px solid ${colors.border.subtle}`,
                    fontSize: '12px',
                    color: colors.text.secondary,
                    lineHeight: 1.5
                  }}
                >
                  🔒 Account recovery verifies multi-factor biometric identifiers and institutional security event logs prior to releasing cryptographic private keys.
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  style={{ width: '100%', marginTop: '8px', fontWeight: 600 }}
                >
                  Initiate Secure Recovery
                </Button>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: colors.text.secondary,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

