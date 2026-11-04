import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Check, X } from 'lucide-react';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let label: PasswordStrengthResult['label'] = 'Weak';
  if (score === 2) label = 'Fair';
  else if (score === 3) label = 'Good';
  else if (score >= 4) label = 'Strong';

  return {
    score,
    label,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial
  };
}

export const PasswordStrengthMeter: React.FC<{ password: string; showRequirements?: boolean }> = ({
  password,
  showRequirements = true
}) => {
  const { colors } = useTheme();

  if (!password) return null;

  const res = evaluatePasswordStrength(password);

  const getBarColor = (index: number) => {
    if (index > res.score) return colors.bg.surfaceSubtle;
    if (res.score <= 1) return colors.financial.expense;
    if (res.score === 2) return colors.financial.liability;
    if (res.score === 3) return colors.brand.primary;
    return colors.financial.income;
  };

  const getTextColor = () => {
    if (res.score <= 1) return colors.financial.expenseText;
    if (res.score === 2) return colors.financial.liability;
    if (res.score === 3) return colors.brand.primaryLight;
    return colors.financial.incomeText;
  };

  const requirements = [
    { label: 'At least 8 characters', met: res.hasMinLength },
    { label: 'Uppercase & lowercase letters', met: res.hasUpper && res.hasLower },
    { label: 'At least 1 number', met: res.hasNumber },
    { label: 'At least 1 special character', met: res.hasSpecial }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
      {/* 4 Segmented Strength Bars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: getBarColor(idx),
              transition: 'background-color 0.2s ease'
            }}
          />
        ))}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: getTextColor(),
            minWidth: '46px',
            textAlign: 'right'
          }}
        >
          {res.label}
        </span>
      </div>

      {/* Requirement Checkpoints */}
      {showRequirements && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '4px', marginTop: '4px' }}>
          {requirements.map((req, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: req.met ? colors.financial.incomeText : colors.text.muted
              }}
            >
              {req.met ? <Check size={12} strokeWidth={2.5} /> : <X size={12} strokeWidth={2} />}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

