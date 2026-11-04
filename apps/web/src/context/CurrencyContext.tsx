import React, { createContext, useContext, useState } from 'react';
import { CurrencyCode } from '@finance/types';
import { formatCurrency as formatCurrencyUtil } from '@finance/utils';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatMoney: (amount: number, overrideCurrency?: CurrencyCode) => string;
  currencies: { code: CurrencyCode; label: string; symbol: string }[];
}

const SUPPORTED_CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'INR', label: 'INR (₹)', symbol: '₹' },
  { code: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { code: 'CAD', label: 'CAD (CA$)', symbol: 'CA$' },
  { code: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { code: 'CHF', label: 'CHF (CHF)', symbol: 'CHF' }
];

// Simple relative exchange multipliers relative to USD for realistic prototype demo
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84.5,
  JPY: 152.0,
  CAD: 1.38,
  AUD: 1.51,
  CHF: 0.88,
  SGD: 1.32
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('wealthflow_currency') as CurrencyCode) || 'USD';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('wealthflow_currency', c);
  };

  const formatMoney = (amountUSD: number, overrideCurrency?: CurrencyCode) => {
    const targetCurrency = overrideCurrency || currency;
    const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
    const convertedAmount = amountUSD * rate;
    return formatCurrencyUtil(convertedAmount, targetCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatMoney,
        currencies: SUPPORTED_CURRENCIES
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

