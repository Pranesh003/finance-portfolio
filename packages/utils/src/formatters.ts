import { CurrencyCode } from '@finance/types';

const CURRENCY_LOCALE_MAP: Record<CurrencyCode, { locale: string; symbol: string }> = {
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
  INR: { locale: 'en-IN', symbol: '₹' },
  JPY: { locale: 'ja-JP', symbol: '¥' },
  CAD: { locale: 'en-CA', symbol: 'CA$' },
  AUD: { locale: 'en-AU', symbol: 'A$' },
  CHF: { locale: 'de-CH', symbol: 'CHF' },
  SGD: { locale: 'en-SG', symbol: 'S$' }
};

/**
 * Format a number into localized currency display
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  overrideLocale?: string
): string {
  const config = CURRENCY_LOCALE_MAP[currency] || { locale: 'en-US', symbol: currency };
  const locale = overrideLocale || config.locale;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format a decimal or fractional percentage into human-readable string (e.g. 0.0845 => "+8.45%")
 */
export function formatPercentage(
  rateValue: number,
  options: { isDecimal?: boolean; includeSign?: boolean; decimals?: number } = {}
): string {
  const { isDecimal = false, includeSign = false, decimals = 2 } = options;
  const percentage = isDecimal ? rateValue * 100 : rateValue;
  const formatted = percentage.toFixed(decimals);
  const sign = includeSign && percentage > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Format large numbers compactly (e.g. 1500000 => "$1.5M")
 */
export function formatCompactNumber(amount: number, currency?: CurrencyCode): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  let formatted = '';

  if (abs >= 1_000_000_000) {
    formatted = `${(abs / 1_000_000_000).toFixed(1)}B`;
  } else if (abs >= 1_000_000) {
    formatted = `${(abs / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    formatted = `${(abs / 1_000).toFixed(1)}K`;
  } else {
    formatted = abs.toFixed(0);
  }

  if (currency) {
    const symbol = CURRENCY_LOCALE_MAP[currency]?.symbol || currency;
    return `${sign}${symbol}${formatted}`;
  }

  return `${sign}${formatted}`;
}

/**
 * Parse an arbitrary currency input string into clean float
 */
export function parseFinancialAmount(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

