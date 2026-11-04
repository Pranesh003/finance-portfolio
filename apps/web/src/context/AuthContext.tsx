import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api';
import {
  User,
  LoginRequest,
  RegisterRequest,
  SocialAuthRequest,
  OnboardingRequest,
  UpdateProfileRequest,
  SessionDetail,
  AuditLogEntry
} from '@finance/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  authView: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'phone-otp' | 'onboarding' | 'recovery' | null;
  setAuthView: (view: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'phone-otp' | 'onboarding' | 'recovery' | null) => void;
  resetToken: string | null;
  setResetToken: (token: string | null) => void;
  verifyToken: string | null;
  setVerifyToken: (token: string | null) => void;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  socialLogin: (req: SocialAuthRequest) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyPhoneOtp: (phoneNumber: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; devResetToken?: string }>;
  resetPassword: (token: string, password: string, confirmPassword?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendEmailVerification: () => Promise<string | undefined>;
  submitOnboarding: (data: OnboardingRequest) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword?: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  getActiveSessions: () => Promise<SessionDetail[]>;
  revokeSession: (id: string) => Promise<void>;
  revokeAllOtherSessions: () => Promise<void>;
  deactivateAccount: () => Promise<void>;
  requestAccountDeletion: () => Promise<void>;
  getAuditLogs: () => Promise<AuditLogEntry[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'phone-otp' | 'onboarding' | 'recovery' | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);

  // Check URL params for token actions on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reset = params.get('reset_token') || params.get('token');
    const verify = params.get('verify_token');

    if (window.location.pathname.includes('reset-password') || reset) {
      if (reset) setResetToken(reset);
      setAuthView('reset-password');
    } else if (window.location.pathname.includes('verify-email') || verify) {
      if (verify) setVerifyToken(verify);
      setAuthView('verify-email');
    }
  }, []);

  // Silent session restoration
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const res = await apiClient.auth.me();
          if (res.data) {
            setUser(res.data);
            if (!res.data.onboardingCompleted) {
              setAuthView('onboarding');
            }
            return;
          }
        } catch {
          // Token might have expired, try refresh
        }
      }

      // Try refreshing with HttpOnly cookie
      try {
        const refreshRes = await apiClient.auth.refreshToken();
        if (refreshRes.data?.accessToken) {
          localStorage.setItem('access_token', refreshRes.data.accessToken);
          const meRes = await apiClient.auth.me();
          setUser(meRes.data);
          if (!meRes.data.onboardingCompleted) {
            setAuthView('onboarding');
          }
        }
      } catch {
        // No active session
        localStorage.removeItem('access_token');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (req: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.login(req);
      if (res.data?.tokens?.accessToken) {
        localStorage.setItem('access_token', res.data.tokens.accessToken);
        setUser(res.data.user);
        setSessionId(res.data.sessionId || null);

        if (!res.data.user.onboardingCompleted) {
          setAuthView('onboarding');
        } else {
          setAuthView(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (req: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.register(req);
      if (res.data?.tokens?.accessToken) {
        localStorage.setItem('access_token', res.data.tokens.accessToken);
        setUser(res.data.user);
        setSessionId(res.data.sessionId || null);
        // Direct new user to guided onboarding
        setAuthView('onboarding');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (req: SocialAuthRequest) => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.socialAuth(req);
      if (res.data?.tokens?.accessToken) {
        localStorage.setItem('access_token', res.data.tokens.accessToken);
        setUser(res.data.user);
        setSessionId(res.data.sessionId || null);

        if (!res.data.user.onboardingCompleted) {
          setAuthView('onboarding');
        } else {
          setAuthView(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneOtp = async (phoneNumber: string) => {
    const res = await apiClient.auth.sendPhoneOtp({ phoneNumber });
    return res.data;
  };

  const verifyPhoneOtp = async (phoneNumber: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.verifyPhoneOtp({ phoneNumber, otp });
      if (res.data?.tokens?.accessToken) {
        localStorage.setItem('access_token', res.data.tokens.accessToken);
        setUser(res.data.user);
        setSessionId(res.data.sessionId || null);

        if (!res.data.user.onboardingCompleted) {
          setAuthView('onboarding');
        } else {
          setAuthView(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    const res = await apiClient.auth.forgotPassword({ email });
    return res.data;
  };

  const resetPassword = async (token: string, password: string, confirmPassword?: string) => {
    setIsLoading(true);
    try {
      await apiClient.auth.resetPassword({ token, password, confirmPassword });
      setAuthView('login');
      setResetToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      await apiClient.auth.verifyEmail(token);
      if (user) {
        setUser({ ...user, isEmailVerified: true });
      }
      setVerifyToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmailVerification = async () => {
    const res = await apiClient.auth.resendEmailVerification();
    return res.data?.devVerifyToken;
  };

  const submitOnboarding = async (data: OnboardingRequest) => {
    setIsLoading(true);
    try {
      const res = await apiClient.users.submitOnboarding(data);
      setUser(res.data);
      setAuthView(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    const res = await apiClient.users.updateProfile(data);
    setUser(res.data);
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmNewPassword?: string) => {
    await apiClient.users.changePassword({ currentPassword, newPassword, confirmNewPassword });
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.auth.logout(sessionId || undefined);
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setSessionId(null);
      setAuthView('login');
      setIsLoading(false);
    }
  };

  const logoutAll = async () => {
    setIsLoading(true);
    try {
      await apiClient.auth.logoutAll();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setSessionId(null);
      setAuthView('login');
      setIsLoading(false);
    }
  };

  const getActiveSessions = async () => {
    const res = await apiClient.users.getSessions();
    return res.data;
  };

  const revokeSession = async (id: string) => {
    await apiClient.users.revokeSession(id);
  };

  const revokeAllOtherSessions = async () => {
    await apiClient.users.revokeAllOtherSessions();
  };

  const deactivateAccount = async () => {
    await apiClient.users.deactivateAccount();
    await logout();
  };

  const requestAccountDeletion = async () => {
    await apiClient.users.requestAccountDeletion();
  };

  const getAuditLogs = async () => {
    const res = await apiClient.users.getAuditLogs();
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sessionId,
        authView,
        setAuthView,
        resetToken,
        setResetToken,
        verifyToken,
        setVerifyToken,
        login,
        register,
        socialLogin,
        sendPhoneOtp,
        verifyPhoneOtp,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendEmailVerification,
        submitOnboarding,
        updateProfile,
        changePassword,
        logout,
        logoutAll,
        getActiveSessions,
        revokeSession,
        revokeAllOtherSessions,
        deactivateAccount,
        requestAccountDeletion,
        getAuditLogs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

