import { FinancialTransaction } from '@finance/types';

export const MOCK_DEVELOPMENT_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx_001',
    userId: '00000000-0000-0000-0000-000000000001',
    accountId: '11111111-1111-1111-1111-111111111111',
    type: 'INCOME',
    status: 'POSTED',
    amount: 5200.0,
    currency: 'USD',
    date: '2026-11-01T09:00:00Z',
    description: 'Bi-Weekly Payroll Direct Deposit (Mock)',
    merchantName: 'Acme Global Technologies Inc',
    tags: ['salary', 'income', 'primary'],
    isRecurring: true,
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'tx_002',
    userId: '00000000-0000-0000-0000-000000000001',
    accountId: '33333333-3333-3333-3333-333333333333',
    type: 'EXPENSE',
    status: 'POSTED',
    amount: 142.5,
    currency: 'USD',
    date: '2026-11-02T14:30:00Z',
    description: 'Whole Foods Market (Mock)',
    merchantName: 'Whole Foods',
    tags: ['groceries', 'food'],
    isRecurring: false,
    createdAt: '2026-11-02T14:30:00Z',
    updatedAt: '2026-11-02T14:30:00Z'
  },
  {
    id: 'tx_003',
    userId: '00000000-0000-0000-0000-000000000001',
    accountId: '11111111-1111-1111-1111-111111111111',
    type: 'TRANSFER',
    status: 'POSTED',
    amount: 1000.0,
    currency: 'USD',
    date: '2026-11-03T10:15:00Z',
    description: 'Automated Savings Transfer (Mock)',
    tags: ['savings', 'automated-transfer'],
    isRecurring: true,
    transferDestinationAccountId: '22222222-2222-2222-2222-222222222222',
    createdAt: '2026-11-03T10:15:00Z',
    updatedAt: '2026-11-03T10:15:00Z'
  }
];

export class TransactionsService {
  public async listTransactions(): Promise<FinancialTransaction[]> {
    return MOCK_DEVELOPMENT_TRANSACTIONS;
  }

  public async getExpenses(): Promise<FinancialTransaction[]> {
    return MOCK_DEVELOPMENT_TRANSACTIONS.filter((t) => t.type === 'EXPENSE');
  }

  public async getIncome(): Promise<FinancialTransaction[]> {
    return MOCK_DEVELOPMENT_TRANSACTIONS.filter((t) => t.type === 'INCOME');
  }

  public async createTransaction(data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const now = new Date().toISOString();
    const newTx: FinancialTransaction = {
      id: crypto.randomUUID(),
      userId: '00000000-0000-0000-0000-000000000001',
      accountId: data.accountId || '11111111-1111-1111-1111-111111111111',
      type: data.type || 'EXPENSE',
      status: data.status || 'POSTED',
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      date: data.date || now,
      description: data.description || 'Transaction',
      tags: data.tags || [],
      isRecurring: !!data.isRecurring,
      createdAt: now,
      updatedAt: now
    };
    MOCK_DEVELOPMENT_TRANSACTIONS.unshift(newTx);
    return newTx;
  }
}

export const transactionsService = new TransactionsService();
