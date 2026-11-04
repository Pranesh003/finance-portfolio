/**
 * Shared Design Tokens & Theme Palettes for Finance & Wealth Management Platform
 */

export const financeColors = {
  // Brand
  brand: {
    primary: '#4F46E5', // Indigo 600
    primaryHover: '#4338CA',
    primaryLight: '#EEF2FF',
    accent: '#06B6D4', // Cyan 500
    dark: '#0F172A' // Slate 900
  },
  // Financial Semantics
  financial: {
    income: '#10B981', // Emerald 500
    incomeBg: '#ECFDF5',
    incomeBorder: '#A7F3D0',
    expense: '#EF4444', // Red 500
    expenseBg: '#FEF2F2',
    expenseBorder: '#FECACA',
    asset: '#3B82F6', // Blue 500
    assetBg: '#EFF6FF',
    liability: '#F59E0B', // Amber 500
    liabilityBg: '#FFFBEB',
    neutral: '#64748B' // Slate 500
  },
  // Asset Class Colors
  assetClasses: {
    equity: '#3B82F6',
    crypto: '#8B5CF6',
    preciousMetals: '#F59E0B',
    realEstate: '#10B981',
    fixedIncome: '#06B6D4',
    cash: '#6B7280'
  },
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  }
} as const;

export const typography = {
  fontFamilies: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  }
} as const;

