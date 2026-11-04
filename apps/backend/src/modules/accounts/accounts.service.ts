import { FinancialAccount } from '@finance/types';

// Clearly marked development placeholder data
export const MOCK_DEVELOPMENT_ACCOUNTS: FinancialAccount[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Primary Checking (Development Mock)',
    accountType: 'CHECKING',
    category: 'DEPOSITORY',
    currency: 'USD',
    currentBalance: 8450.25,
    availableBalance: 8450.25,
    institutionName: 'Chase Bank (Mock)',
    accountNumberMasked: '...4821',
    status: 'ACTIVE',
    isManual: false,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'High Yield Savings (Development Mock)',
    accountType: 'SAVINGS',
    category: 'DEPOSITORY',
    currency: 'USD',
    currentBalance: 35200.8,
    availableBalance: 35200.8,
    interestRate: 4.85,
    institutionName: 'Marcus by Goldman Sachs (Mock)',
    accountNumberMasked: '...9014',
    status: 'ACTIVE',
    isManual: false,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Sapphire Preferred Credit (Development Mock)',
    accountType: 'CREDIT_CARD',
    category: 'CREDIT',
    currency: 'USD',
    currentBalance: 1240.5,
    creditLimit: 15000.0,
    institutionName: 'Chase Card Services (Mock)',
    accountNumberMasked: '...3389',
    status: 'ACTIVE',
    isManual: false,
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

export class AccountsService {
  public async listAccounts(): Promise<FinancialAccount[]> {
    return MOCK_DEVELOPMENT_ACCOUNTS;
  }

  public async getAccountById(id: string): Promise<FinancialAccount | null> {
    return MOCK_DEVELOPMENT_ACCOUNTS.find((a) => a.id === id) || null;
  }

  public async createAccount(data: Partial<FinancialAccount>): Promise<FinancialAccount> {
    const newAccount: FinancialAccount = {
      id: crypto.randomUUID(),
      userId: '00000000-0000-0000-0000-000000000001',
      name: data.name || 'New Account',
      accountType: data.accountType || 'CHECKING',
      category: data.category || 'DEPOSITORY',
      currency: data.currency || 'USD',
      currentBalance: data.currentBalance || 0,
      institutionName: data.institutionName || 'Manual Account',
      status: 'ACTIVE',
      isManual: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    MOCK_DEVELOPMENT_ACCOUNTS.push(newAccount);
    return newAccount;
  }
}

export const accountsService = new AccountsService();

