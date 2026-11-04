import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { FormValidationMessage } from '../ui/FormValidationMessage';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Layers,
  Smartphone,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const { login, socialLogin, setAuthView } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both your email address and password');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password, rememberMe });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo.user@antigravity-finance.local');
    setPassword('Password123!');
    setError(null);
  };

  const handleGoogleMock = async () => {
    setLoading(true);
    try {
      await socialLogin({
        provider: 'GOOGLE',
        idToken: 'mock-google-token-xyz',
        email: 'alex.google@example.com',
        name: 'Alex Morgan'
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleMock = async () => {
    setLoading(true);
    try {
      await socialLogin({
        provider: 'APPLE',
        idToken: 'mock-apple-token-xyz',
        email: 'alex.apple@example.com',
        name: 'Alex Morgan'
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Apple authentication failed');
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
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: colors.brand.primary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              color: '#FFFFFF'
            }}
          >
            <Layers size={26} />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: colors.text.primary }}>
            Welcome to WealthFlow
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: colors.text.secondary }}>
            Sign in to access your personal wealth management dashboard
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={error} type="error" />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Email Address" required>
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

          <FormField
            label="Password"
            required
            actions={
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setAuthView('forgot-password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.brand.primaryLight,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
                <span style={{ color: colors.text.muted, fontSize: '12px' }}>•</span>
                <button
                  type="button"
                  onClick={() => setAuthView('recovery')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.text.secondary,
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Recover Account
                </button>
              </div>
            }
          >
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
          </FormField>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: colors.text.secondary }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: colors.brand.primary }}
              />
              <span>Remember this device for 30 days</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            style={{ width: '100%', marginTop: '4px', fontWeight: 600 }}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Switch to Phone OTP */}
        <div style={{ marginTop: '12px' }}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setAuthView('phone-otp')}
            leftIcon={<Smartphone size={16} />}
            style={{ width: '100%', fontSize: '13px' }}
          >
            Sign In with Mobile OTP
          </Button>
        </div>

        {/* Social Dividers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: colors.border.subtle }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase' }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: colors.border.subtle }} />
        </div>

        {/* Social Auth Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={handleGoogleMock}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              backgroundColor: colors.bg.surfaceElevated,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '8px',
              color: colors.text.primary,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleAppleMock}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              backgroundColor: colors.bg.surfaceElevated,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '8px',
              color: colors.text.primary,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.67 1.38-.56.64-1.05 1.7-0.92 2.74 1.04.08 2.06-.52 2.67-1.25z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Quick Demo Pre-fill Pill */}
        <div style={{ marginTop: '20px', borderTop: `1px solid ${colors.border.subtle}`, paddingTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleDemoFill}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: colors.brand.primaryMuted,
              border: `1px solid ${colors.brand.primaryLight}`,
              color: colors.brand.primaryLight,
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={13} />
            <span>Fill Demo Credentials (Password123!)</span>
          </button>
        </div>

        {/* Register Footer Link */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: colors.text.secondary }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => setAuthView('register')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.brand.primaryLight,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Create an Account <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

