import {
  ApiResponse,
  HealthCheckResponse,
  AuthUserResponse,
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  SocialAuthRequest,
  SendPhoneOtpRequest,
  VerifyPhoneOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  OnboardingRequest,
  UpdateProfileRequest,
  User,
  UserPreferences,
  SessionDetail,
  AuditLogEntry,
  FinancialAccount,
  FinancialTransaction,
  InvestmentPortfolio,
  Budget,
  NetWorthSummary,
  PaginationParams
} from '@finance/types';

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  onUnauthorized?: () => void;
  defaultHeaders?: Record<string, string>;
}

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class FinanceApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, '')
    };
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...this.config.defaultHeaders,
      ...((options.headers as Record<string, string>) || {})
    };

    if (this.config.getAccessToken) {
      const token = await this.config.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // enables HttpOnly cookie exchange
      });

      const data = (await response.json()) as ApiResponse<T>;

      if (!response.ok) {
        if (response.status === 401 && this.config.onUnauthorized) {
          this.config.onUnauthorized();
        }
        throw new ApiError(data.message || 'Request failed', response.status, data);
      }

      return data;
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        err instanceof Error ? err.message : 'Network request failed',
        0,
        err
      );
    }
  }

  // Health
  public readonly health = {
    check: () => this.request<HealthCheckResponse>('/api/health')
  };

  // Auth Module
  public readonly auth = {
    login: (credentials: LoginRequest) =>
      this.request<AuthUserResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (data: RegisterRequest) =>
      this.request<AuthUserResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    socialAuth: (data: SocialAuthRequest) =>
      this.request<AuthUserResponse>('/api/v1/auth/social', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    sendPhoneOtp: (data: SendPhoneOtpRequest) =>
      this.request<{ success: boolean; message: string; devOtp?: string }>('/api/v1/auth/phone/send-otp', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    verifyPhoneOtp: (data: VerifyPhoneOtpRequest) =>
      this.request<AuthUserResponse>('/api/v1/auth/phone/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    forgotPassword: (data: ForgotPasswordRequest) =>
      this.request<{ success: boolean; message: string; devResetToken?: string }>('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    resetPassword: (data: ResetPasswordRequest) =>
      this.request<{ success: boolean; message: string }>('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    verifyEmail: (token: string) =>
      this.request<{ success: boolean; message: string }>('/api/v1/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token })
      }),
    resendEmailVerification: () =>
      this.request<{ success: boolean; message: string; devVerifyToken?: string }>('/api/v1/auth/resend-verification', {
        method: 'POST'
      }),
    refreshToken: (refreshToken?: string) =>
      this.request<AuthTokens>('/api/v1/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      }),
    logout: (sessionId?: string) =>
      this.request<{ loggedOut: boolean }>('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      }),
    logoutAll: () =>
      this.request<{ loggedOutAll: boolean }>('/api/v1/auth/logout-all', {
        method: 'POST'
      }),
    me: () => this.request<User>('/api/v1/auth/me')
  };

  // User Management Module
  public readonly users = {
    getProfile: () => this.request<User>('/api/v1/users/profile'),
    updateProfile: (data: UpdateProfileRequest) =>
      this.request<User>('/api/v1/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    updatePreferences: (data: Partial<UserPreferences>) =>
      this.request<User>('/api/v1/users/preferences', {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    submitOnboarding: (data: OnboardingRequest) =>
      this.request<User>('/api/v1/users/onboarding', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    changePassword: (data: ChangePasswordRequest) =>
      this.request<{ changed: boolean }>('/api/v1/users/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getSessions: () => this.request<SessionDetail[]>('/api/v1/users/sessions'),
    revokeSession: (id: string) =>
      this.request<{ revoked: boolean }>(`/api/v1/users/sessions/${id}`, {
        method: 'DELETE'
      }),
    revokeAllOtherSessions: () =>
      this.request<{ revokedOther: boolean }>('/api/v1/users/sessions', {
        method: 'DELETE'
      }),
    deactivateAccount: () =>
      this.request<{ deactivated: boolean }>('/api/v1/users/deactivate', {
        method: 'POST'
      }),
    requestAccountDeletion: () =>
      this.request<{ requested: boolean }>('/api/v1/users/delete-request', {
        method: 'POST'
      }),
    getAuditLogs: () => this.request<AuditLogEntry[]>('/api/v1/users/audit-logs')
  };

  // Accounts & Banking
  public readonly accounts = {
    list: () => this.request<FinancialAccount[]>('/api/v1/accounts'),
    getById: (id: string) => this.request<FinancialAccount>(`/api/v1/accounts/${id}`),
    create: (data: Partial<FinancialAccount>) =>
      this.request<FinancialAccount>('/api/v1/accounts', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  };

  // Transactions
  public readonly transactions = {
    list: (params?: PaginationParams) => {
      const query = params ? `?page=${params.page}&limit=${params.limit}` : '';
      return this.request<FinancialTransaction[]>(`/api/v1/transactions${query}`);
    },
    create: (data: Partial<FinancialTransaction>) =>
      this.request<FinancialTransaction>('/api/v1/transactions', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  };

  // Investments
  public readonly investments = {
    listPortfolios: () => this.request<InvestmentPortfolio[]>('/api/v1/investments/portfolios')
  };

  // Budgets
  public readonly budgets = {
    list: () => this.request<Budget[]>('/api/v1/budgets')
  };

  // Analytics
  public readonly analytics = {
    getNetWorth: () => this.request<NetWorthSummary>('/api/v1/analytics/net-worth')
  };
}

export function createFinanceApiClient(config: ApiClientConfig): FinanceApiClient {
  return new FinanceApiClient(config);
}
