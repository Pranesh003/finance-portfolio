import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { CasImportResult, CasParsedItem } from '@finance/types';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface CasImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CasImportModal: React.FC<CasImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'SAMPLE' | 'PASTE'>('UPLOAD');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rawText, setRawText] = useState('');

  const [parsing, setParsing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<CasImportResult | null>(null);
  const [items, setItems] = useState<CasParsedItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleParse = async () => {
    setError(null);
    setParsing(true);

    try {
      let payload: { fileBase64?: string; fileName?: string; password?: string; rawText?: string } = {};

      if (activeTab === 'UPLOAD') {
        if (!selectedFile) {
          throw new Error('Please select a CDSL or NSDL CAS statement file (.pdf, .csv, .txt)');
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        payload = {
          fileBase64: base64,
          fileName: selectedFile.name,
          password: password ? password.trim() : undefined
        };
      } else if (activeTab === 'SAMPLE') {
        const res = await apiClient.investments.getCasSample();
        if (res.data) {
          setParseResult(res.data);
          setItems(res.data.items.map((i) => ({ ...i, selected: true })));
          return;
        }
      } else if (activeTab === 'PASTE') {
        if (!rawText.trim()) {
          throw new Error('Please paste your CAS statement text or holdings table');
        }
        payload = { rawText };
      }

      const res = await apiClient.investments.parseCas(payload);
      if (res.data) {
        setParseResult(res.data);
        setItems(res.data.items.map((i) => ({ ...i, selected: true })));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to parse CAS statement');
    } finally {
      setParsing(false);
    }
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const handleToggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleCommit = async () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      setError('Please select at least one holding to import');
      return;
    }

    setCommitting(true);
    setError(null);

    try {
      const res = await apiClient.investments.commitCas(selectedItems);
      setSuccessMessage(
        res.message || `Successfully synced ${res.data?.stocksCount || 0} stocks and ${res.data?.mutualFundsCount || 0} mutual funds!`
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to save imported holdings to your portfolio');
    } finally {
      setCommitting(false);
    }
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const totalSelectedValue = items
    .filter((i) => i.selected)
    .reduce((acc, curr) => acc + (curr.currentValue || 0), 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: parseResult ? '820px' : '640px',
          maxHeight: '90vh',
          backgroundColor: colors.bg.surface,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bg.surfaceElevated
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: colors.brand.primaryLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.text.primary }}>
                  CDSL / NSDL Demat Statement Import
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: colors.financial.income,
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  All Brokers
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: colors.text.secondary }}>
                Directly sync holdings from Zerodha, Groww, Angel One, Upstox, and ICICI Direct
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text.muted,
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: colors.financial.expense,
                fontSize: '13px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: colors.financial.income,
                fontSize: '13px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </div>
          )}

          {!parseResult ? (
            <div>
              {/* Tab Selector */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '20px',
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  paddingBottom: '12px'
                }}
              >
                <button
                  onClick={() => setActiveTab('UPLOAD')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: activeTab === 'UPLOAD' ? colors.brand.primary : 'transparent',
                    color: activeTab === 'UPLOAD' ? '#FFFFFF' : colors.text.secondary,
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Upload CAS File (.pdf / .csv)
                </button>

                <button
                  onClick={() => setActiveTab('SAMPLE')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: activeTab === 'SAMPLE' ? colors.brand.primary : 'transparent',
                    color: activeTab === 'SAMPLE' ? '#FFFFFF' : colors.text.secondary,
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} />
                  1-Click Sample CDSL Demo
                </button>

                <button
                  onClick={() => setActiveTab('PASTE')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: activeTab === 'PASTE' ? colors.brand.primary : 'transparent',
                    color: activeTab === 'PASTE' ? '#FFFFFF' : colors.text.secondary,
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Paste Statement Text
                </button>
              </div>

              {activeTab === 'UPLOAD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* File Dropzone */}
                  <div
                    style={{
                      border: `2px dashed ${selectedFile ? colors.brand.primary : colors.border.default}`,
                      borderRadius: '12px',
                      padding: '30px 20px',
                      textAlign: 'center',
                      backgroundColor: colors.bg.surfaceElevated,
                      cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById('cas-file-input')?.click()}
                  >
                    <input
                      id="cas-file-input"
                      type="file"
                      accept=".pdf,.csv,.txt"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <UploadCloud size={36} color={colors.brand.primaryLight} style={{ margin: '0 auto 10px auto' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                      {selectedFile ? selectedFile.name : 'Click to upload or drag & drop your CAS statement'}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.text.secondary }}>
                      Supports CDSL e-CAS, NSDL e-CAS, or CAMS/KFintech statements (.pdf, .csv)
                    </p>
                  </div>

                  {/* Password Protection Field */}
                  <FormField
                    label="Statement Password (if encrypted)"
                    helperText="Default password is your PAN in uppercase (e.g. ABCDE1234F) or Date of Birth (DDMMYYYY)"
                  >
                    <div style={{ position: 'relative' }}>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. ABCDE1234F"
                        leftIcon={<Lock size={16} />}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: colors.text.muted,
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormField>

                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: colors.bg.surfaceElevated,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <ShieldCheck size={18} color={colors.financial.income} />
                    <span style={{ fontSize: '12px', color: colors.text.secondary }}>
                      Zero Credentials Shared • Statements are parsed in-memory with bank-grade encryption.
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'SAMPLE' && (
                <div
                  style={{
                    backgroundColor: colors.bg.surfaceElevated,
                    borderRadius: '12px',
                    padding: '24px',
                    border: `1px solid ${colors.border.subtle}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Sparkles size={20} color={colors.brand.primaryLight} />
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: colors.text.primary }}>
                      Instant CDSL Test Statement
                    </h4>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: colors.text.secondary, lineHeight: 1.5 }}>
                    Test the direct demat sync immediately without downloading your monthly PDF. This pre-loads real Indian holdings:
                  </p>
                  <ul style={{ margin: '0 0 20px 20px', padding: 0, fontSize: '13px', color: colors.text.secondary }}>
                    <li><b>Reliance Industries</b> (25 shares)</li>
                    <li><b>Infosys</b> (25 shares)</li>
                    <li><b>HDFC Bank</b> (40 shares)</li>
                    <li><b>Tata Motors & TCS</b></li>
                    <li><b>Nifty BeES & Gold BeES ETFs</b></li>
                  </ul>
                  <Button
                    variant="primary"
                    onClick={handleParse}
                    isLoading={parsing}
                    style={{ fontWeight: 600 }}
                  >
                    Load & Preview Sample CDSL Statement &rarr;
                  </Button>
                </div>
              )}

              {activeTab === 'PASTE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <FormField
                    label="Paste CAS Plain Text or CSV"
                    helperText="Copy the holdings section from your statement email or Demat portal"
                  >
                    <textarea
                      rows={8}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="e.g. INE002A01018 RELIANCE INDUSTRIES LTD 25.000 Rate: 1311.00..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: colors.bg.surfaceElevated,
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: '8px',
                        color: colors.text.primary,
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                    />
                  </FormField>
                </div>
              )}
            </div>
          ) : (
            /* Parsed Holdings Preview View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Summary Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: colors.bg.surfaceElevated,
                    borderRadius: '10px',
                    border: `1px solid ${colors.border.subtle}`
                  }}
                >
                  <div style={{ fontSize: '11px', color: colors.text.secondary, fontWeight: 600 }}>DEPOSITORY</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: colors.text.primary, marginTop: '4px' }}>
                    {parseResult.depository}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: colors.bg.surfaceElevated,
                    borderRadius: '10px',
                    border: `1px solid ${colors.border.subtle}`
                  }}
                >
                  <div style={{ fontSize: '11px', color: colors.text.secondary, fontWeight: 600 }}>INVESTOR</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: colors.text.primary, marginTop: '4px' }}>
                    {parseResult.investorName}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: colors.bg.surfaceElevated,
                    borderRadius: '10px',
                    border: `1px solid ${colors.border.subtle}`
                  }}
                >
                  <div style={{ fontSize: '11px', color: colors.text.secondary, fontWeight: 600 }}>HOLDINGS DETECTED</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: colors.brand.primaryLight, marginTop: '4px' }}>
                    {items.length} Assets
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: colors.bg.surfaceElevated,
                    borderRadius: '10px',
                    border: `1px solid ${colors.border.subtle}`
                  }}
                >
                  <div style={{ fontSize: '11px', color: colors.text.secondary, fontWeight: 600 }}>SELECTED VALUE</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: colors.financial.income, marginTop: '4px' }}>
                    ₹{totalSelectedValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Table of Holdings */}
              <div
                style={{
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    backgroundColor: colors.bg.surfaceElevated,
                    borderBottom: `1px solid ${colors.border.subtle}`
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: colors.text.primary, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={items.length > 0 && items.every((i) => i.selected)}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    />
                    Select All ({selectedCount} of {items.length} selected)
                  </label>
                  <button
                    onClick={() => {
                      setParseResult(null);
                      setItems([]);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.brand.primaryLight,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Change Statement
                  </button>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${colors.border.subtle}`, color: colors.text.muted, textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', width: '30px' }}></th>
                        <th style={{ padding: '8px 12px' }}>Holding / Company</th>
                        <th style={{ padding: '8px 12px' }}>ISIN / Ticker</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Qty / Units</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Price (₹)</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Value (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: `1px solid ${colors.border.subtle}`,
                            backgroundColor: item.selected ? 'transparent' : 'rgba(0,0,0,0.15)'
                          }}
                        >
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              type="checkbox"
                              checked={!!item.selected}
                              onChange={() => handleToggleItem(idx)}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: colors.text.primary }}>
                            {item.name}
                          </td>
                          <td style={{ padding: '8px 12px', color: colors.text.secondary, fontFamily: 'monospace' }}>
                            {item.resolvedTicker || item.isin}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: colors.text.primary }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: colors.text.secondary }}>
                            ₹{item.navOrPrice ? item.navOrPrice.toLocaleString('en-IN') : '--'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: colors.financial.income }}>
                            ₹{item.currentValue ? item.currentValue.toLocaleString('en-IN') : '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: colors.bg.surfaceElevated
          }}
        >
          <Button variant="ghost" onClick={onClose} disabled={committing || parsing}>
            Cancel
          </Button>

          {!parseResult ? (
            <Button
              variant="primary"
              onClick={handleParse}
              isLoading={parsing}
              style={{ fontWeight: 600 }}
            >
              Parse & Review Holdings &rarr;
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCommit}
              isLoading={committing}
              disabled={selectedCount === 0}
              style={{ fontWeight: 700, backgroundColor: colors.financial.income, color: '#FFFFFF' }}
            >
              Sync {selectedCount} Holdings to Portfolio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
