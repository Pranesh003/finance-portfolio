import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown } from 'lucide-react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (val: T) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Select = <T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  style
}: SelectProps<T>) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        backgroundColor: colors.bg.surfaceElevated,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '8px',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          width: '100%',
          height: '40px',
          appearance: 'none',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          paddingLeft: '14px',
          paddingRight: '36px',
          fontFamily: 'inherit',
          fontSize: '14px',
          color: colors.text.primary,
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxSizing: 'border-box'
        }}
      >
        {options.map((opt) => (
          <option
            key={String(opt.value)}
            value={opt.value}
            style={{
              backgroundColor: colors.bg.surfaceElevated,
              color: colors.text.primary
            }}
          >
            {opt.label}
          </option>
        ))}
      </select>

      <div
        style={{
          position: 'absolute',
          right: '12px',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          color: colors.text.muted
        }}
      >
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

