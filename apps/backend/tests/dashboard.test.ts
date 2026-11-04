import { dashboardService } from '../src/modules/dashboard/dashboard.service';
import {
  calculateNetWorth,
  calculateSavingsRate,
  calculateExpenseToIncome,
  calculateDebtToAsset,
  calculateEmergencyFundRunway,
  calculateLiquidityRatio,
  calculateDiversificationScore,
  calculateDTI
} from '@finance/utils';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`⏳ Running test: ${name}... `);
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, durationMs });
    console.log(`✅ PASSED (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, error: err.message, durationMs });
    console.log(`❌ FAILED (${durationMs}ms)`);
    console.error(`   Error: ${err.message}`);
  }
}

async function main() {
  console.log('\n============================================================');
  console.log('🧪 WealthFlow Main Financial Dashboard Verification Suite (Step 04)');
  console.log('============================================================\n');

  const testUserId = `test-user-${Date.now()}`;
  const isolatedUser2Id = `isolated-user-${Date.now()}`;

  // 1. Initial State & Net Worth Calculation Verification
  await runTest('1. Net Worth Calculation Engine: Assets - Liabilities', async () => {
    dashboardService.seedDefaultUserData(testUserId);
    const summary = await dashboardService.getSummary(testUserId, '30d', 'INR');

    const expectedNetWorth = calculateNetWorth(
      summary.metrics.totalAssets,
      summary.metrics.totalLiabilities
    );

    if (summary.netWorth.current !== expectedNetWorth) {
      throw new Error(`Net worth mismatch: got ${summary.netWorth.current}, expected ${expectedNetWorth}`);
    }

    if (summary.currency !== 'INR') {
      throw new Error(`Default currency must be INR, got ${summary.currency}`);
    }

    if (summary.metrics.totalAssets <= 0 || summary.metrics.totalLiabilities <= 0) {
      throw new Error('Default seed must contain active assets and liabilities');
    }
  });

  // 2. Double Counting Prevention: Internal Transfers
  await runTest('2. Double-Counting Prevention: Internal Transfers Preserve Net Worth', async () => {
    const summaryBefore = await dashboardService.getSummary(testUserId, '30d', 'INR');
    const netWorthBefore = summaryBefore.netWorth.current;

    // Record internal transfer between accounts
    await dashboardService.quickAdd(testUserId, {
      type: 'TRANSFER',
      title: 'Move Funds to Emergency Vault',
      amount: 75000,
      accountId: 'acc-hdfc-sal',
      toAccountId: 'acc-sbi-sav'
    });

    const summaryAfter = await dashboardService.getSummary(testUserId, '30d', 'INR');
    const netWorthAfter = summaryAfter.netWorth.current;

    // Net worth must NOT change due to internal transfers
    if (netWorthAfter !== netWorthBefore) {
      throw new Error(
        `Internal transfer changed Net Worth! Before: ${netWorthBefore}, After: ${netWorthAfter} (Diff: ${netWorthAfter - netWorthBefore})`
      );
    }
  });

  // 3. Double Counting Prevention: Investment Purchases
  await runTest('3. Double-Counting Prevention: Investment Purchases from Cash', async () => {
    const summaryBefore = await dashboardService.getSummary(testUserId, '30d', 'INR');
    const netWorthBefore = summaryBefore.netWorth.current;

    // Buy equities using bank account cash
    await dashboardService.quickAdd(testUserId, {
      type: 'INVESTMENT',
      title: 'Purchase NIFTY 50 Index ETF Units',
      amount: 50000,
      accountId: 'acc-hdfc-sal',
      assetClass: 'ETFS'
    });

    const summaryAfter = await dashboardService.getSummary(testUserId, '30d', 'INR');
    const netWorthAfter = summaryAfter.netWorth.current;

    // Asset composition shifted (less cash, more ETF), but net worth remains constant
    if (netWorthAfter !== netWorthBefore) {
      throw new Error(
        `Investment purchase corrupted Net Worth! Before: ${netWorthBefore}, After: ${netWorthAfter}`
      );
    }
  });

  // 4. Financial Health Ratios & Transparent Formulas
  await runTest('4. 7 Financial Health Ratios & Formula Calculations', async () => {
    const health = await dashboardService.getFinancialHealth(testUserId, 'INR');

    if (health.metrics.length !== 7) {
      throw new Error(`Expected exactly 7 institutional health metrics, found ${health.metrics.length}`);
    }

    const metricNames = health.metrics.map((m) => m.name);
    const expectedMetrics = [
      'Savings Rate',
      'Expense-to-Income',
      'Debt-to-Asset Ratio',
      'Emergency Fund Coverage',
      'Liquidity Ratio',
      'Investment Diversification',
      'Debt-to-Income (DTI)'
    ];

    for (const name of expectedMetrics) {
      if (!metricNames.includes(name)) {
        throw new Error(`Missing expected health metric: "${name}"`);
      }
    }

    // Verify mathematical bounds
    const savingsRate = health.metrics.find((m) => m.name === 'Savings Rate')!;
    if (savingsRate.value <= 0 || savingsRate.value > 100) {
      throw new Error(`Invalid savings rate value: ${savingsRate.value}`);
    }

    const emergencyFund = health.metrics.find((m) => m.name === 'Emergency Fund Coverage')!;
    if (emergencyFund.value <= 0) {
      throw new Error(`Invalid emergency fund runway: ${emergencyFund.value}`);
    }

    // Verify each metric has transparent formula
    for (const m of health.metrics) {
      if (!m.formula || m.formula.trim().length === 0) {
        throw new Error(`Metric "${m.name}" lacks transparent formula.`);
      }
    }
  });

  // 5. Multi-Currency Exchange Conversion
  await runTest('5. Multi-Currency Architecture: INR to USD Conversion', async () => {
    const summaryINR = await dashboardService.getSummary(testUserId, '30d', 'INR');
    const summaryUSD = await dashboardService.getSummary(testUserId, '30d', 'USD');

    if (summaryINR.currency !== 'INR' || summaryUSD.currency !== 'USD') {
      throw new Error('Currency codes must match requested parameters');
    }

    // Approx 1 INR = 0.012 USD
    const ratio = summaryUSD.netWorth.current / summaryINR.netWorth.current;
    if (Math.abs(ratio - 0.012) > 0.001) {
      throw new Error(`Exchange rate conversion anomaly: ratio was ${ratio}, expected ~0.012`);
    }
  });

  // 6. User Isolation Check
  await runTest('6. User Data Isolation: Operations are strictly user-scoped', async () => {
    dashboardService.seedDefaultUserData(isolatedUser2Id);

    // Record an expense only for testUserId
    await dashboardService.quickAdd(testUserId, {
      type: 'EXPENSE',
      title: 'Luxury Dinner at Taj',
      amount: 15000,
      accountId: 'acc-hdfc-sal'
    });

    const user1Tx = await dashboardService.getRecentTransactions(testUserId, 10, 'all');
    const user2Tx = await dashboardService.getRecentTransactions(isolatedUser2Id, 10, 'all');

    const foundInUser1 = user1Tx.some((t) => t.description.includes('Luxury Dinner at Taj'));
    const foundInUser2 = user2Tx.some((t) => t.description.includes('Luxury Dinner at Taj'));

    if (!foundInUser1) {
      throw new Error('Transaction was not saved to User 1');
    }
    if (foundInUser2) {
      throw new Error('Data breach: User 1 transaction leaked into User 2 ledger!');
    }
  });

  // 7. Empty Account / Zero State Resilience
  await runTest('7. Empty Account State: Resilient Zero Handling without crashes', async () => {
    const emptyUserId = `zero-user-${Date.now()}`;
    await dashboardService.resetToZero(emptyUserId);

    const summary = await dashboardService.getSummary(emptyUserId, '30d', 'INR');
    if (summary.netWorth.current !== 0) {
      throw new Error(`Expected zero net worth, got ${summary.netWorth.current}`);
    }
    if (summary.metrics.totalAssets !== 0 || summary.metrics.totalLiabilities !== 0) {
      throw new Error('Assets and Liabilities must be 0 in zero baseline');
    }

    // Ensure financial health does not throw division by zero errors
    const health = await dashboardService.getFinancialHealth(emptyUserId, 'INR');
    if (!health || !health.metrics) {
      throw new Error('Health engine crashed on empty account state');
    }
  });

  // 8. Dashboard Preferences Persistence
  await runTest('8. Dashboard Preferences & Customization Persistence', async () => {
    const initialPrefs = await dashboardService.getPreferences(testUserId);
    if (!initialPrefs.widgetOrder.includes('netWorth')) {
      throw new Error('Initial widget order missing netWorth');
    }

    // Toggle off upcomingEvents and reorder
    const updated = await dashboardService.updatePreferences(testUserId, {
      widgetVisibility: {
        ...initialPrefs.widgetVisibility,
        upcomingEvents: false
      },
      defaultPeriod: '1y'
    });

    if (updated.widgetVisibility.upcomingEvents !== false) {
      throw new Error('Widget visibility toggle was not persisted');
    }
    if (updated.defaultPeriod !== '1y') {
      throw new Error('Default period preference was not updated');
    }
  });

  // 9. Historical Net Worth Snapshots
  await runTest('9. Historical Net Worth Snapshots with Time Filters', async () => {
    const points30d = await dashboardService.getNetWorthHistory(testUserId, '30d', 'INR');
    const pointsAll = await dashboardService.getNetWorthHistory(testUserId, 'all', 'INR');

    if (points30d.length === 0 || pointsAll.length === 0) {
      throw new Error('History points must not be empty');
    }

    for (const p of pointsAll) {
      if (p.netWorth === undefined || p.assets === undefined || p.liabilities === undefined) {
        throw new Error(`Malformed history point: ${JSON.stringify(p)}`);
      }
    }
  });

  // Summary Report
  console.log('\n============================================================');
  console.log('📊 Verification Summary:');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed:      ${passed}`);
  console.log(`   Failed:      ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});

