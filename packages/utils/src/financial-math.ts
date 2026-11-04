/**
 * Financial Calculation Engine
 * Pure, tested mathematical utilities for personal finance and wealth management.
 */

export interface CompoundInterestResult {
  futureValue: number;
  totalPrincipal: number;
  totalInterestEarned: number;
  breakdownByYear: {
    year: number;
    principalContributed: number;
    interestEarned: number;
    endingBalance: number;
  }[];
}

/**
 * Calculates compound interest with optional periodic contributions.
 *
 * @param principal Initial balance
 * @param annualRateDecimal Annual interest rate expressed as decimal (e.g. 0.07 for 7%)
 * @param years Total years
 * @param compoundingPerYear Number of times interest is compounded per year (default 12 = monthly)
 * @param annualContribution Additional contribution per year
 */
export function calculateCompoundInterest(
  principal: number,
  annualRateDecimal: number,
  years: number,
  compoundingPerYear = 12,
  annualContribution = 0
): CompoundInterestResult {
  if (years <= 0) {
    return {
      futureValue: principal,
      totalPrincipal: principal,
      totalInterestEarned: 0,
      breakdownByYear: []
    };
  }

  let currentBalance = principal;
  let accumulatedContributions = principal;
  const breakdown: CompoundInterestResult['breakdownByYear'] = [];
  const periodicRate = annualRateDecimal / compoundingPerYear;
  const contributionPerPeriod = annualContribution / compoundingPerYear;

  for (let year = 1; year <= years; year++) {
    for (let period = 0; period < compoundingPerYear; period++) {
      currentBalance = currentBalance * (1 + periodicRate) + contributionPerPeriod;
      accumulatedContributions += contributionPerPeriod;
    }

    const interestEarnedSoFar = Math.max(0, currentBalance - accumulatedContributions);

    breakdown.push({
      year,
      principalContributed: Math.round(accumulatedContributions * 100) / 100,
      interestEarned: Math.round(interestEarnedSoFar * 100) / 100,
      endingBalance: Math.round(currentBalance * 100) / 100
    });
  }

  const futureValue = Math.round(currentBalance * 100) / 100;
  const totalPrincipal = Math.round(accumulatedContributions * 100) / 100;
  const totalInterestEarned = Math.round((futureValue - totalPrincipal) * 100) / 100;

  return {
    futureValue,
    totalPrincipal,
    totalInterestEarned,
    breakdownByYear: breakdown
  };
}

/**
 * Calculate Equated Monthly Installment (EMI) for loans/mortgages.
 * Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateLoanEMI(
  principal: number,
  annualInterestRateDecimal: number,
  tenureMonths: number
): {
  monthlyEMI: number;
  totalPayment: number;
  totalInterest: number;
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEMI: 0, totalPayment: 0, totalInterest: 0 };
  }

  if (annualInterestRateDecimal === 0) {
    const monthlyEMI = Math.round((principal / tenureMonths) * 100) / 100;
    return {
      monthlyEMI,
      totalPayment: principal,
      totalInterest: 0
    };
  }

  const monthlyRate = annualInterestRateDecimal / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  const monthlyEMI = Math.round((numerator / denominator) * 100) / 100;
  const totalPayment = Math.round(monthlyEMI * tenureMonths * 100) / 100;
  const totalInterest = Math.round((totalPayment - principal) * 100) / 100;

  return { monthlyEMI, totalPayment, totalInterest };
}

export interface AmortizationRow {
  month: number;
  startingBalance: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

/**
 * Generate full monthly loan amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualInterestRateDecimal: number,
  tenureMonths: number
): AmortizationRow[] {
  const { monthlyEMI } = calculateLoanEMI(principal, annualInterestRateDecimal, tenureMonths);
  const monthlyRate = annualInterestRateDecimal / 12;
  let remainingBalance = principal;
  const schedule: AmortizationRow[] = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = Math.round(remainingBalance * monthlyRate * 100) / 100;
    let principalPaid = Math.round((monthlyEMI - interestPaid) * 100) / 100;

    if (month === tenureMonths || principalPaid > remainingBalance) {
      principalPaid = remainingBalance;
    }

    const endingBalance = Math.max(0, Math.round((remainingBalance - principalPaid) * 100) / 100);

    schedule.push({
      month,
      startingBalance: Math.round(remainingBalance * 100) / 100,
      principalPaid,
      interestPaid,
      endingBalance
    });

    remainingBalance = endingBalance;
    if (remainingBalance <= 0) break;
  }

  return schedule;
}

/**
 * Calculate Net Worth = Sum(Assets) - Sum(Liabilities)
 */
export function calculateNetWorth(assetsSum: number, liabilitiesSum: number): number {
  return Math.round((assetsSum - liabilitiesSum) * 100) / 100;
}

/**
 * Compound Annual Growth Rate (CAGR)
 * Formula: ((finalValue / initialValue) ^ (1 / years)) - 1
 */
export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) {
    return 0;
  }
  const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1;
  return Math.round(cagr * 10000) / 10000;
}

/**
 * Debt-to-Income (DTI) ratio percentage
 */
export function calculateDTI(totalMonthlyDebtPayments: number, grossMonthlyIncome: number): number {
  if (grossMonthlyIncome <= 0) return 0;
  return Math.round((totalMonthlyDebtPayments / grossMonthlyIncome) * 10000) / 100;
}

/**
 * Savings Rate Percentage
 * Formula: (Total Savings or Investments / Gross Income) * 100
 */
export function calculateSavingsRate(savingsOrInvestment: number, grossIncome: number): number {
  if (grossIncome <= 0) return 0;
  return Math.round((savingsOrInvestment / grossIncome) * 10000) / 100;
}

/**
 * Emergency fund runway in months
 */
export function calculateEmergencyFundRunway(
  liquidCash: number,
  averageMonthlyExpenses: number
): number {
  if (averageMonthlyExpenses <= 0) return 0;
  return Math.round((liquidCash / averageMonthlyExpenses) * 10) / 10;
}

/**
 * Expense-to-Income ratio percentage
 */
export function calculateExpenseToIncome(monthlyExpenses: number, monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 0;
  return Math.round((monthlyExpenses / monthlyIncome) * 10000) / 100;
}

/**
 * Debt-to-Asset ratio percentage
 */
export function calculateDebtToAsset(totalLiabilities: number, totalAssets: number): number {
  if (totalAssets <= 0) return 0;
  return Math.round((totalLiabilities / totalAssets) * 10000) / 100;
}

/**
 * Liquidity ratio (Liquid Assets / Monthly Expenses)
 */
export function calculateLiquidityRatio(liquidAssets: number, monthlyExpenses: number): number {
  if (monthlyExpenses <= 0) return 0;
  return Math.round((liquidAssets / monthlyExpenses) * 100) / 100;
}

/**
 * Investment Diversification Score (0 to 100)
 * Uses normalized inverse Herfindahl-Hirschman concentration across asset classes
 */
export function calculateDiversificationScore(assetWeightsPercentage: number[]): number {
  if (!assetWeightsPercentage || assetWeightsPercentage.length === 0) return 0;
  const filtered = assetWeightsPercentage.filter((w) => w > 0);
  if (filtered.length <= 1) return filtered.length === 1 ? 25 : 0;

  // Sum of squared weights (HHI scale 0 to 10000)
  const hhi = filtered.reduce((acc, w) => acc + Math.pow(w, 2), 0);
  // Ideal even spread for N classes would be 10000 / N
  // Invert HHI: lower concentration = higher diversification score
  const rawScore = 100 - (hhi / 100);
  return Math.max(10, Math.min(100, Math.round(rawScore)));
}

