import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { FormValidationMessage } from '../ui/FormValidationMessage';
import { PasswordStrengthMeter, evaluatePasswordStrength } from '../auth/PasswordStrengthMeter';
import {
  KeyRound,
  Laptop,
  Smartphone,
  LogOut,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { SessionDetail, AuditLogEntry } from '@finance/types';

export const AccountSecurityView: React.FC = () => {
  const { colors } = useTheme();
  const {
    changePassword,
    getActiveSessions,
    revokeSession,
    revokeAllOtherSessions,
    deactivateAccount,
    requestAccountDeletion,
    getAuditLogs
  } = useAuth();
  const { toast } = useToast();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sessions & Audit logs state
  const [sessions, setSessions] = useState<SessionDetail[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Confirmation dialogs
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchSecurityData = async () => {
    setLoadingSessions(true);
    try {
      const [sessList, logList] = await Promise.all([
        getActiveSessions(),
        getAuditLogs()
      ]);
      setSessions(sessList);
      setAuditLogs(logList);
    } catch {
      // Ignore
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both current and new passwords');
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (strength.score < 2) {
      setPasswordError('New password does not satisfy minimum complexity criteria');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword, confirmNewPassword);
      toast.success('Password Changed', 'Your master password has been successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      fetchSecurityData();
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRevokeSingle = async () => {
    if (!sessionToRevoke) return;
    try {
      await revokeSession(sessionToRevoke);
      toast.success('Session Terminated', 'Selected device has been logged out.');
      setSessionToRevoke(null);
      fetchSecurityData();
    } catch {
      toast.error('Error', 'Failed to terminate session.');
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      await revokeAllOtherSessions();
      toast.success('Sessions Terminated', 'All other active devices have been logged out.');
      setShowRevokeAllModal(false);
      fetchSecurityData();
    } catch {
      toast.error('Error', 'Failed to terminate other sessions.');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateAccount();
      toast.info('Account Deactivated', 'Your account has been deactivated. You have been logged out.');
      setShowDeactivateModal(false);
    } catch {
      toast.error('Error', 'Failed to deactivate account.');
    }
  };

  const handleDeleteRequest = async () => {
    try {
      await requestAccountDeletion();
      toast.info('Deletion Requested', 'Account deletion request received. Confirmation link dispatched.');
      setShowDeleteModal(false);
    } catch {
      toast.error('Error', 'Failed to submit deletion request.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '880px' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: colors.text.primary }}>
          Account Security & Active Sessions
        </h1>
        <p style={{ margin: '4px 0 0 0', color: colors.text.secondary, fontSize: '13px' }}>
          Manage your master password, inspect device login history, and control session revocations.
        </p>
      </div>

      {/* 1. Change Master Password Card */}
      <Card title="Update Master Password" subtitle="Ensure your account uses an 8+ character password with numbers and symbols">
        {passwordError && (
          <div style={{ marginBottom: '16px' }}>
            <FormValidationMessage message={passwordError} type="error" />
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
          <FormField label="Current Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              required
            />
          </FormField>

          <FormField label="New Master Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<KeyRound size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: colors.text.muted,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              required
            />
            <PasswordStrengthMeter password={newPassword} />
          </FormField>

          <FormField label="Confirm New Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<KeyRound size={15} />}
              required
            />
          </FormField>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={passwordLoading}
              style={{ fontWeight: 600 }}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Active Sessions Management */}
      <Card
        title="Active Devices & Sessions"
        subtitle="Manage browsers and mobile apps currently authorized with active access tokens"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRevokeAllModal(true)}
            leftIcon={<LogOut size={14} />}
          >
            Log Out Other Devices
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.map((sess) => (
            <div
              key={sess.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: colors.bg.surfaceElevated,
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: colors.bg.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.brand.primaryLight
                  }}
                >
                  {sess.deviceType === 'Mobile' ? <Smartphone size={20} /> : <Laptop size={20} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>
                      {sess.deviceName}
                    </span>
                    {sess.isCurrent && (
                      <Badge variant="income" size="sm">
                        This Device
                      </Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                    IP: {sess.ipAddress} • Last active: {new Date(sess.lastActiveAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSessionToRevoke(sess.id)}
                  style={{ color: colors.financial.expenseText, borderColor: colors.financial.expenseBorder }}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Security Audit Log */}
      <Card title="Security Event Audit Log" subtitle="Cryptographically logged security actions recorded on this account">
        <Table
          columns={[
            {
              key: 'action',
              header: 'Event Action',
              render: (log: AuditLogEntry) => (
                <span style={{ fontWeight: 600, fontSize: '13px', color: colors.text.primary }}>
                  {log.action}
                </span>
              )
            },
            {
              key: 'status',
              header: 'Status',
              render: (log: AuditLogEntry) => (
                <Badge variant={log.status === 'SUCCESS' ? 'income' : 'expense'} size="sm">
                  {log.status}
                </Badge>
              )
            },
            {
              key: 'ipAddress',
              header: 'IP Address',
              render: (log: AuditLogEntry) => (
                <span style={{ color: colors.text.secondary, fontSize: '12px' }}>
                  {log.ipAddress || 'Internal/Local'}
                </span>
              )
            },
            {
              key: 'createdAt',
              header: 'Timestamp',
              align: 'right',
              render: (log: AuditLogEntry) => (
                <span style={{ color: colors.text.muted, fontSize: '12px' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              )
            }
          ]}
          data={auditLogs}
          keyExtractor={(item) => item.id}
          isLoading={loadingSessions}
          emptyText="No recent security alerts recorded"
        />
      </Card>

      {/* 4. Danger Zone (Deactivation & Deletion) */}
      <Card
        title="Danger Zone"
        subtitle="Irreversible actions regarding account ownership and permanent cryptographic ledger deletion"
        style={{ borderColor: colors.financial.expenseBorder }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: `1px solid ${colors.border.subtle}` }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: colors.text.primary }}>
                Deactivate Account
              </div>
              <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                Temporarily freeze your account, disable API access, and log out of all active devices.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeactivateModal(true)}
              style={{ color: colors.financial.liability, borderColor: colors.financial.liabilityBorder }}
            >
              Deactivate
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: colors.financial.expenseText }}>
                Request Permanent Account Deletion
              </div>
              <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                Permanently purge all user profiles, linked depository snapshots, and vaulted documents.
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              Request Deletion
            </Button>
          </div>
        </div>
      </Card>

      {/* Revoke Single Session Confirmation */}
      <ConfirmationDialog
        isOpen={!!sessionToRevoke}
        onClose={() => setSessionToRevoke(null)}
        onConfirm={handleRevokeSingle}
        title="Revoke Device Authorization?"
        description="This will immediately revoke the refresh token and terminate the active session on this device."
        confirmLabel="Revoke Session"
        variant="danger"
      />

      {/* Revoke All Other Sessions Confirmation */}
      <ConfirmationDialog
        isOpen={showRevokeAllModal}
        onClose={() => setShowRevokeAllModal(false)}
        onConfirm={handleRevokeAllOther}
        title="Log Out All Other Devices?"
        description="All active browser tabs, mobile apps, and saved device logins other than this one will be signed out."
        confirmLabel="Log Out Other Devices"
        variant="warning"
      />

      {/* Deactivate Account Confirmation */}
      <ConfirmationDialog
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Your Account?"
        description="You will be signed out immediately and public portfolio links will be paused until reactivated."
        confirmLabel="Confirm Deactivation"
        variant="warning"
      />

      {/* Delete Account Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRequest}
        title="Permanently Delete Account?"
        description="This action cannot be undone. A confirmation email will be dispatched to finalize permanent cryptographic purging of your records."
        confirmLabel="Proceed with Deletion Request"
        variant="danger"
      />
    </div>
  );
};

