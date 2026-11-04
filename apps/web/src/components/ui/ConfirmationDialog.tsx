import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  variant?: string;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  variant,
  isLoading = false
}) => {
  const { colors } = useTheme();
  const effectiveMessage = message || description || '';
  const isDanger = isDestructive || variant === 'danger';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={440}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: isDanger ? colors.financial.expenseBg : colors.financial.liabilityBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle
              size={18}
              color={isDanger ? colors.financial.expense : colors.financial.liability}
            />
          </div>
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: '14px', color: colors.text.secondary, lineHeight: 1.5 }}>
        {effectiveMessage}
      </p>
    </Modal>
  );
};

