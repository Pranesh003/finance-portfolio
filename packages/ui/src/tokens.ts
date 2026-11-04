/**
 * Premium Fintech Design Tokens
 * WealthFlow Design System
 */

export type ThemeMode = 'dark' | 'light';

export const darkThemeColors = {
  bg: {
    canvas: '#0A0D14', // Deep luxury navy-black canvas
    surface: '#101522', // Primary surface for cards and sidebars
    surfaceElevated: '#161D2E', // Modals, popovers, dropdowns
    surfaceHover: '#1D273D', // Hover state
    surfaceActive: '#23304B', // Active/selected state
    surfaceSubtle: 'rgba(255, 255, 255, 0.03)'
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.18)',
    focus: '#6366F1'
  },
  text: {
    primary: '#F8FAFC', // High contrast white
    secondary: '#94A3B8', // Slate 400
    tertiary: '#64748B', // Slate 500
    muted: '#475569', // Slate 600
    inverse: '#090D16'
  },
  brand: {
    primary: '#4F46E5', // Indigo 600
    primaryHover: '#4338CA',
    primaryLight: '#818CF8',
    primaryMuted: 'rgba(79, 70, 229, 0.15)',
    accent: '#06B6D4', // Cyan 500
    accentMuted: 'rgba(6, 182, 212, 0.15)',
    glow: 'rgba(99, 102, 241, 0.25)'
  },
  financial: {
    // Accessible emerald (never reliance on green alone)
    income: '#10B981',
    incomeHover: '#059669',
    incomeBg: 'rgba(16, 185, 129, 0.12)',
    incomeBorder: 'rgba(16, 185, 129, 0.30)',
    incomeText: '#34D399',

    // Accessible rose/crimson (never reliance on red alone)
    expense: '#F43F5E',
    expenseHover: '#E11D48',
    expenseBg: 'rgba(244, 63, 94, 0.12)',
    expenseBorder: 'rgba(244, 63, 94, 0.30)',
    expenseText: '#FB7185',

    // Asset Blue
    asset: '#38BDF8',
    assetBg: 'rgba(56, 189, 248, 0.12)',
    assetBorder: 'rgba(56, 189, 248, 0.30)',
    assetText: '#7DD3FC',

    // Liability Amber
    liability: '#FBBF24',
    liabilityBg: 'rgba(251, 191, 36, 0.12)',
    liabilityBorder: 'rgba(251, 191, 36, 0.30)',
    liabilityText: '#FDE68A',

    neutral: '#94A3B8',
    neutralBg: 'rgba(148, 163, 184, 0.10)',
    neutralBorder: 'rgba(148, 163, 184, 0.20)'
  },
  assetClasses: {
    equity: '#38BDF8', // Cyan/Sky
    mutualFunds: '#818CF8', // Indigo
    etfs: '#A78BFA', // Purple
    fixedIncome: '#34D399', // Emerald
    crypto: '#C084FC', // Violet
    preciousMetals: '#FBBF24', // Amber/Gold
    realEstate: '#F472B6', // Rose Pink
    cash: '#94A3B8' // Slate
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  }
} as const;

export const lightThemeColors = {
  bg: {
    canvas: '#F8FAFC', // Clean slate 50
    surface: '#FFFFFF', // Pure white
    surfaceElevated: '#FFFFFF',
    surfaceHover: '#F1F5F9', // Slate 100
    surfaceActive: '#E2E8F0', // Slate 200
    surfaceSubtle: 'rgba(0, 0, 0, 0.02)'
  },
  border: {
    subtle: 'rgba(0, 0, 0, 0.05)',
    default: '#E2E8F0', // Slate 200
    strong: '#CBD5E1', // Slate 300
    focus: '#4F46E5'
  },
  text: {
    primary: '#0F172A', // Slate 900
    secondary: '#475569', // Slate 600
    tertiary: '#64748B', // Slate 500
    muted: '#94A3B8', // Slate 400
    inverse: '#F8FAFC'
  },
  brand: {
    primary: '#4F46E5', // Indigo 600
    primaryHover: '#4338CA',
    primaryLight: '#3730A3',
    primaryMuted: 'rgba(79, 70, 229, 0.08)',
    accent: '#0891B2', // Cyan 600
    accentMuted: 'rgba(8, 145, 178, 0.08)',
    glow: 'rgba(79, 70, 229, 0.15)'
  },
  financial: {
    income: '#059669', // Emerald 600
    incomeHover: '#047857',
    incomeBg: '#ECFDF5',
    incomeBorder: '#A7F3D0',
    incomeText: '#047857',

    expense: '#E11D48', // Rose 600
    expenseHover: '#BE123C',
    expenseBg: '#FFF1F2',
    expenseBorder: '#FECDD3',
    expenseText: '#BE123C',

    asset: '#0284C7', // Sky 600
    assetBg: '#F0F9FF',
    assetBorder: '#BAE6FD',
    assetText: '#0369A1',

    liability: '#D97706', // Amber 600
    liabilityBg: '#FFFBEB',
    liabilityBorder: '#FDE68A',
    liabilityText: '#B45309',

    neutral: '#64748B',
    neutralBg: '#F8FAFC',
    neutralBorder: '#E2E8F0'
  },
  assetClasses: {
    equity: '#0284C7',
    mutualFunds: '#4F46E5',
    etfs: '#7C3AED',
    fixedIncome: '#059669',
    crypto: '#9333EA',
    preciousMetals: '#D97706',
    realEstate: '#DB2777',
    cash: '#475569'
  },
  status: {
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB'
  }
} as const;

export const spacing = {
  '3xs': '2px',
  '2xs': '4px',
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px'
} as const;

export const radius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '14px',
  '2xl': '18px',
  full: '9999px'
} as const;

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
  md: '0 4px 8px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.18), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
  cardDark: '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
  glowIndigo: '0 0 20px -2px rgba(99, 102, 241, 0.35)'
} as const;

export const typography = {
  fontFamilies: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'GeistMono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  },
  fontSizes: {
    '2xs': '0.6875rem', // 11px
    xs: '0.75rem', // 12px
    sm: '0.8125rem', // 13px
    base: '0.875rem', // 14px (standard compact fintech body)
    md: '0.9375rem', // 15px
    lg: '1rem', // 16px
    xl: '1.125rem', // 18px
    '2xl': '1.375rem', // 22px
    '3xl': '1.625rem', // 26px
    '4xl': '2rem', // 32px
    '5xl': '2.5rem' // 40px
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  lineHeights: {
    tight: '1.2',
    snug: '1.35',
    normal: '1.5',
    relaxed: '1.65'
  }
} as const;

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
  wide: '1536px'
} as const;

// Backward-compatible alias for existing imports
export const financeColors = darkThemeColors;
