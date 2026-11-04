import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyText?: string;
  onRowClick?: (item: T) => void;
}

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortOrder,
  onSort,
  isLoading = false,
  emptyMessage,
  emptyText,
  onRowClick
}: TableProps<T>) => {
  const { colors } = useTheme();
  const effectiveEmptyMessage = emptyText || emptyMessage || 'No financial records available';

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: '10px',
        border: `1px solid ${colors.border.subtle}`
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '13px',
          fontFamily: 'inherit'
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: colors.bg.surfaceElevated,
              borderBottom: `1px solid ${colors.border.default}`
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 16px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  textAlign: col.align || 'left',
                  width: col.width,
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => col.sortable && onSort && onSort(col.key)}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent:
                      col.align === 'right'
                        ? 'flex-end'
                        : col.align === 'center'
                        ? 'center'
                        : 'flex-start'
                  }}
                >
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span style={{ color: colors.text.muted }}>
                      {sortKey === col.key ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp size={13} color={colors.brand.primaryLight} />
                        ) : (
                          <ArrowDown size={13} color={colors.brand.primaryLight} />
                        )
                      ) : (
                        <ArrowUpDown size={13} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, rIdx) => (
              <tr
                key={rIdx}
                style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
              >
                {columns.map((_col, cIdx) => (
                  <td key={cIdx} style={{ padding: '14px 16px' }}>
                    <div
                      style={{
                        height: '14px',
                        backgroundColor: colors.bg.surfaceHover,
                        borderRadius: '4px',
                        width: cIdx === 0 ? '70%' : '50%'
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  color: colors.text.muted
                }}
              >
                {effectiveEmptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={keyExtractor(item, idx)}
                onClick={() => onRowClick && onRowClick(item)}
                style={{
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  backgroundColor: colors.bg.surface,
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg.surface;
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '14px 16px',
                      color: colors.text.primary,
                      textAlign: col.align || 'left',
                      fontVariantNumeric: col.align === 'right' ? 'tabular-nums' : 'normal',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {col.render ? col.render(item, idx) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
