import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize
}) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        fontSize: '13px',
        color: colors.text.secondary
      }}
    >
      <div>
        {totalItems !== undefined && pageSize !== undefined && (
          <span>
            Showing <b>{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</b> to{' '}
            <b>{Math.min(currentPage * pageSize, totalItems)}</b> of <b>{totalItems}</b> items
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft size={14} />}
        >
          Previous
        </Button>
        <span style={{ fontSize: '12px', padding: '0 4px', fontWeight: 500 }}>
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight size={14} />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

