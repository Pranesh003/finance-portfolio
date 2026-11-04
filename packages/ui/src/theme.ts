import { darkThemeColors, lightThemeColors, ThemeMode } from './tokens';

export function getThemeTokens(mode: ThemeMode) {
  return mode === 'dark' ? darkThemeColors : lightThemeColors;
}

export function generateCSSVariables(mode: ThemeMode): Record<string, string> {
  const colors = getThemeTokens(mode);

  return {
    '--color-bg-canvas': colors.bg.canvas,
    '--color-bg-surface': colors.bg.surface,
    '--color-bg-surface-elevated': colors.bg.surfaceElevated,
    '--color-bg-surface-hover': colors.bg.surfaceHover,
    '--color-bg-surface-active': colors.bg.surfaceActive,
    '--color-bg-surface-subtle': colors.bg.surfaceSubtle,

    '--color-border-subtle': colors.border.subtle,
    '--color-border-default': colors.border.default,
    '--color-border-strong': colors.border.strong,
    '--color-border-focus': colors.border.focus,

    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-tertiary': colors.text.tertiary,
    '--color-text-muted': colors.text.muted,
    '--color-text-inverse': colors.text.inverse,

    '--color-brand-primary': colors.brand.primary,
    '--color-brand-primary-hover': colors.brand.primaryHover,
    '--color-brand-primary-light': colors.brand.primaryLight,
    '--color-brand-primary-muted': colors.brand.primaryMuted,
    '--color-brand-accent': colors.brand.accent,
    '--color-brand-glow': colors.brand.glow,

    '--color-income': colors.financial.income,
    '--color-income-hover': colors.financial.incomeHover,
    '--color-income-bg': colors.financial.incomeBg,
    '--color-income-border': colors.financial.incomeBorder,
    '--color-income-text': colors.financial.incomeText,

    '--color-expense': colors.financial.expense,
    '--color-expense-hover': colors.financial.expenseHover,
    '--color-expense-bg': colors.financial.expenseBg,
    '--color-expense-border': colors.financial.expenseBorder,
    '--color-expense-text': colors.financial.expenseText,

    '--color-asset': colors.financial.asset,
    '--color-asset-bg': colors.financial.assetBg,
    '--color-asset-border': colors.financial.assetBorder,
    '--color-asset-text': colors.financial.assetText,

    '--color-liability': colors.financial.liability,
    '--color-liability-bg': colors.financial.liabilityBg,
    '--color-liability-border': colors.financial.liabilityBorder,
    '--color-liability-text': colors.financial.liabilityText
  };
}

