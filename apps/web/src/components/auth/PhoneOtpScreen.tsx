import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { FormValidationMessage } from '../ui/FormValidationMessage';
import { Smartphone, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

export const PhoneOtpScreen: React.FC = () => {
  const { colors } = useTheme();
  const { sendPhoneOtp, verifyPhoneOtp, setAuthView } = useAuth();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpNotice, setDevOtpNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please provide a valid mobile number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await sendPhoneOtp(phoneNumber);
      setStep('OTP');
      setCountdown(60);
      if (res.devOtp) {
        setDevOtpNotice(`[Local Dev Simulator] OTP dispatched: ${res.devOtp}`);
        setOtp(res.devOtp);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyPhoneOtp(phoneNumber, otp);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP code');
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
          onClick={() => (step === 'OTP' ? setStep('PHONE') : setAuthView('login'))}
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
          <span>{step === 'OTP' ? 'Change Phone Number' : 'Back to Email Sign In'}</span>
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
            {step === 'PHONE' ? <Smartphone size={24} /> : <KeyRound size={24} />}
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: colors.text.primary }}>
            {step === 'PHONE' ? 'Mobile Number Sign In' : 'Enter 6-Digit OTP'}
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: colors.text.secondary }}>
            {step === 'PHONE'
              ? 'Receive a one-time cryptographic passcode for passwordless authentication'
              : `Passcode sent to ${phoneNumber}`}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={error} type="error" />
          </div>
        )}

        {devOtpNotice && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={devOtpNotice} type="info" />
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Mobile Number" required helperText="Include country code (e.g. +91 for India)">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                leftIcon={<Smartphone size={16} />}
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
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="6-Digit Verification Passcode" required>
              <Input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                required
                style={{
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.25em'
                }}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              style={{ width: '100%', fontWeight: 600 }}
            >
              Verify Passcode & Enter Dashboard
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '12px' }}>
              <span style={{ color: colors.text.muted }}>
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Code expired?'}
              </span>
              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={handleSendOtp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: countdown > 0 ? colors.text.muted : colors.brand.primaryLight,
                  fontWeight: 600,
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <RefreshCw size={12} />
                <span>Resend OTP</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

