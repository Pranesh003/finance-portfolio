import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  label?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  style?: React.CSSProperties;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  searchPlaceholder = 'Type to search...',
  disabled = false,
  clearable = true,
  style
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.subLabel && o.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px', ...style }} ref={containerRef}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: 600, color: colors.text.secondary }}>
          {label}
        </label>
      )}

      {/* Select Box Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          height: '38px',
          boxSizing: 'border-box',
          backgroundColor: colors.bg.surfaceElevated,
          border: `1px solid ${isOpen ? colors.brand.primary : colors.border.default}`,
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          color: selectedOption ? colors.text.primary : colors.text.muted,
          fontSize: '13px',
          transition: 'border-color 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {selectedOption?.icon}
          <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.subLabel && (
            <span style={{ fontSize: '11px', color: colors.text.muted }}>
              ({selectedOption.subLabel})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.('');
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: colors.text.muted,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown size={14} color={colors.text.muted} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </div>
      </div>

      {/* Options Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 110,
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.border.strong}`,
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Search Field */}
          <div style={{ padding: '8px', borderBottom: `1px solid ${colors.border.subtle}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={14} color={colors.text.muted} />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: colors.text.primary,
                fontSize: '12px',
                width: '100%'
              }}
            />
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', padding: '4px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: colors.text.muted }}>
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange?.(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: isSelected ? colors.brand.primaryLight : colors.text.primary,
                      backgroundColor: isSelected ? colors.brand.primaryMuted : 'transparent',
                      transition: 'background-color 0.12s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {opt.icon}
                      <div>
                        <div style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.label}</div>
                        {opt.subLabel && (
                          <div style={{ fontSize: '11px', color: colors.text.muted }}>{opt.subLabel}</div>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={14} color={colors.brand.primaryLight} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

