import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  disabled = false,
  style
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse currently selected date or today
  const selectedDate = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange?.(formatted);
    setIsOpen(false);
  };

  const formattedDisplay = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px', ...style }} ref={containerRef}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: 600, color: colors.text.secondary }}>
          {label}
        </label>
      )}

      {/* Input Display Button */}
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
          color: formattedDisplay ? colors.text.primary : colors.text.muted,
          fontSize: '13px',
          transition: 'border-color 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={15} color={colors.text.muted} />
          <span>{formattedDisplay || placeholder}</span>
        </div>
        {value && !disabled && (
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
      </div>

      {/* Calendar Popup Dialog */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            backgroundColor: colors.bg.surfaceElevated,
            border: `1px solid ${colors.border.strong}`,
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            width: '260px'
          }}
        >
          {/* Calendar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'none',
                border: 'none',
                color: colors.text.secondary,
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'none',
                border: 'none',
                color: colors.text.secondary,
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '6px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} style={{ fontSize: '11px', fontWeight: 600, color: colors.text.muted }}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === year &&
                selectedDate.getMonth() === month &&
                selectedDate.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: '28px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? colors.brand.primary : 'transparent',
                    color: isSelected ? '#FFFFFF' : colors.text.primary,
                    fontWeight: isSelected ? 700 : 400,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div style={{ marginTop: '12px', borderTop: `1px solid ${colors.border.subtle}`, paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                onChange?.(formatted);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: colors.brand.primaryLight,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

