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
  StockHolding,
  MutualFundHolding,
  CryptoHolding,
  PreciousMetalHolding,
  Budget,
  NetWorthSummary,
  PaginationParams,
  DashboardSummary,
  NetWorthHistoryPoint,
  DashboardAssetAllocationItem,
  LiabilityAllocationItem,
  CashFlowDataPoint,
  PortfolioSummary,
  AccountOverviewItem,
  RecentTransactionItem,
  SpendingCategoryItem,
  FinancialHealthOverview,
  UpcomingFinancialEvent,
  DashboardFinancialInsight,
  DashboardPreferences,
  QuickAddPayload,
  CasImportResult,
  CasParsedItem
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

  // Live Market Data (AMFI, NSE/BSE, Gold/Silver, Crypto)
  public readonly market = {
    getIndices: () => this.request<any[]>('/api/v1/market/indices'),
    searchMutualFunds: (query: string, limit = 20) =>
      this.request<any[]>(`/api/v1/market/mutual-funds/search?query=${encodeURIComponent(query)}&limit=${limit}`),
    getMutualFundByCode: (code: string) =>
      this.request<any>(`/api/v1/market/mutual-funds/${encodeURIComponent(code)}`),
    searchStocks: (query: string) =>
      this.request<any[]>(`/api/v1/market/stocks/search?query=${encodeURIComponent(query)}`),
    getStockQuote: (symbol: string) =>
      this.request<any>(`/api/v1/market/stocks/quote/${encodeURIComponent(symbol)}`),
    getPreciousMetals: () =>
      this.request<any>('/api/v1/market/commodities/gold-silver'),
    getCryptoRates: () =>
      this.request<any[]>('/api/v1/market/crypto/rates')
  };

  // Investments & Real Holdings
  public readonly investments = {
    getPortfolio: () => this.request<InvestmentPortfolio>('/api/v1/investments/portfolio'),
    listPortfolios: () => this.request<InvestmentPortfolio[]>('/api/v1/investments/portfolios'),
    getStocks: () => this.request<StockHolding[]>('/api/v1/investments/stocks'),
    addStock: (data: any) =>
      this.request<StockHolding>('/api/v1/investments/holdings/stock', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getMutualFunds: () => this.request<MutualFundHolding[]>('/api/v1/investments/mutual-funds'),
    addMutualFund: (data: any) =>
      this.request<MutualFundHolding>('/api/v1/investments/holdings/mutual-fund', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getCrypto: () => this.request<CryptoHolding[]>('/api/v1/investments/crypto'),
    addCrypto: (data: any) =>
      this.request<CryptoHolding>('/api/v1/investments/holdings/crypto', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getPreciousMetals: () => this.request<PreciousMetalHolding[]>('/api/v1/investments/precious-metals'),
    addPreciousMetal: (data: any) =>
      this.request<PreciousMetalHolding>('/api/v1/investments/holdings/precious-metal', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteHolding: (type: 'stock' | 'mutual-fund' | 'crypto' | 'metal', id: string) =>
      this.request<{ success: boolean; message: string }>(`/api/v1/investments/holdings/${type}/${id}`, {
        method: 'DELETE'
      }),
    getCasSample: () => this.request<CasImportResult>('/api/v1/investments/cas/sample'),
    parseCas: (payload: { fileBase64?: string; fileName?: string; password?: string; rawText?: string }) =>
      this.request<CasImportResult>('/api/v1/investments/cas/parse', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    commitCas: (items: CasParsedItem[]) =>
      this.request<CasImportResult>('/api/v1/investments/cas/commit', {
        method: 'POST',
        body: JSON.stringify({ items })
      })
  };

  // Budgets
  public readonly budgets = {
    list: () => this.request<Budget[]>('/api/v1/budgets')
  };

  // Analytics
  public readonly analytics = {
    getNetWorth: () => this.request<NetWorthSummary>('/api/v1/analytics/net-worth')
  };

  // Dashboard Aggregation Engine
  public readonly dashboard = {
    getSummary: (period = '30d', currency = 'INR') =>
      this.request<DashboardSummary>(`/api/v1/dashboard/summary?period=${period}&currency=${currency}`),
    getNetWorthHistory: (period = '30d', currency = 'INR') =>
      this.request<NetWorthHistoryPoint[]>(`/api/v1/dashboard/net-worth-history?period=${period}&currency=${currency}`),
    getAssetAllocation: (currency = 'INR') =>
      this.request<DashboardAssetAllocationItem[]>(`/api/v1/dashboard/asset-allocation?currency=${currency}`),
    getLiabilityAllocation: (currency = 'INR') =>
      this.request<LiabilityAllocationItem[]>(`/api/v1/dashboard/liability-allocation?currency=${currency}`),
    getCashFlow: (grouping = 'monthly', currency = 'INR') =>
      this.request<CashFlowDataPoint[]>(`/api/v1/dashboard/cash-flow?grouping=${grouping}&currency=${currency}`),
    getPortfolioSummary: (currency = 'INR') =>
      this.request<PortfolioSummary>(`/api/v1/dashboard/portfolio-summary?currency=${currency}`),
    getAccounts: (currency = 'INR') =>
      this.request<AccountOverviewItem[]>(`/api/v1/dashboard/accounts?currency=${currency}`),
    getRecentTransactions: (limit = 10, type = 'all', currency = 'INR') =>
      this.request<RecentTransactionItem[]>(`/api/v1/dashboard/transactions?limit=${limit}&type=${type}&currency=${currency}`),
    getSpendingBreakdown: (currency = 'INR') =>
      this.request<SpendingCategoryItem[]>(`/api/v1/dashboard/spending-breakdown?currency=${currency}`),
    getFinancialHealth: (currency = 'INR') =>
      this.request<FinancialHealthOverview>(`/api/v1/dashboard/financial-health?currency=${currency}`),
    getUpcomingEvents: () =>
      this.request<UpcomingFinancialEvent[]>('/api/v1/dashboard/upcoming-events'),
    getInsights: (currency = 'INR') =>
      this.request<DashboardFinancialInsight[]>(`/api/v1/dashboard/insights?currency=${currency}`),
    quickAdd: (payload: QuickAddPayload) =>
      this.request<{ success: boolean; message: string; recordId: string }>('/api/v1/dashboard/quick-add', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getPreferences: () =>
      this.request<DashboardPreferences>('/api/v1/dashboard/preferences'),
    updatePreferences: (prefs: Partial<DashboardPreferences>) =>
      this.request<DashboardPreferences>('/api/v1/dashboard/preferences', {
        method: 'PUT',
        body: JSON.stringify(prefs)
      }),
    resetData: () =>
      this.request<{ success: boolean; message: string }>('/api/v1/dashboard/reset', {
        method: 'POST'
      }),
    seedSampleData: () =>
      this.request<{ success: boolean; message: string }>('/api/v1/dashboard/seed', {
        method: 'POST'
      })
  };
}

export function createFinanceApiClient(config: ApiClientConfig): FinanceApiClient {
  return new FinanceApiClient(config);
}
