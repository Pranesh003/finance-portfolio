import {
  ApiResponse,
  HealthCheckResponse,
  AuthUserResponse,
  LoginRequest,
  RegisterRequest,
  AuthTokens,
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
        headers
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

  // Auth
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
    refreshToken: (refreshToken: string) =>
      this.request<AuthTokens>('/api/v1/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      }),
    me: () => this.request<AuthUserResponse['user']>('/api/v1/auth/me')
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
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';
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
    getPortfolios: () => this.request<InvestmentPortfolio[]>('/api/v1/investments/portfolios')
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

