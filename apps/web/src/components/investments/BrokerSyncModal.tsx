import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import {
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface BrokerSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BrokerSyncModal: React.FC<BrokerSyncModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { colors } = useTheme();

  const [activeBroker, setActiveBroker] = useState<'IND_MONEY' | 'ANGEL_ONE' | 'ZERODHA' | 'MF_CENTRAL'>('IND_MONEY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // INDmoney Form
  const [indMoneyText, setIndMoneyText] = useState('');

  // Angel One Form
  const [angelClientCode, setAngelClientCode] = useState('');
  const [angelApiKey, setAngelApiKey] = useState('');
  const [angelMpin, setAngelMpin] = useState('');
  const [angelTotp, setAngelTotp] = useState('');

  // Zerodha Form
  const [kiteApiKey, setKiteApiKey] = useState('');
  const [kiteAccessToken, setKiteAccessToken] = useState('');

  // MFCentral Form
  const [pan, setPan] = useState('');
  const [mobile, setMobile] = useState('');
  const [mfJson, setMfJson] = useState('');

  if (!isOpen) return null;

  const handleSync = async (isDemo = false) => {
    setError(null);
    setLoading(true);
    setSuccessResult(null);

    try {
      let res: any;

      if (activeBroker === 'IND_MONEY') {
        res = await apiClient.investments.syncIndMoney({
          rawText: indMoneyText,
          jsonPayload: indMoneyText.trim().startsWith('{') || indMoneyText.trim().startsWith('[') ? indMoneyText : undefined,
          isDemo
        });
      } else if (activeBroker === 'ANGEL_ONE') {
        if (!isDemo && (!angelClientCode || !angelApiKey)) {
          throw new Error('Please enter your Angel One Client Code & SmartAPI Key (or click 1-Click Test Demo)');
        }
        res = await apiClient.investments.syncAngelOne({
          clientCode: angelClientCode,
          apiKey: angelApiKey,
          passwordOrMpin: angelMpin,
          totp: angelTotp,
          isDemo
        });
      } else if (activeBroker === 'ZERODHA') {
        if (!isDemo && (!kiteApiKey || !kiteAccessToken)) {
          throw new Error('Please enter your Zerodha Kite API Key & Access Token (or click 1-Click Test Demo)');
        }
        res = await apiClient.investments.syncZerodha({
          apiKey: kiteApiKey,
          accessToken: kiteAccessToken,
          isDemo
        });
      } else if (activeBroker === 'MF_CENTRAL') {
        res = await apiClient.investments.syncMfCentral({
          pan,
          mobile,
          casDataJson: mfJson,
          isDemo
        });
      }

      if (res && res.data) {
        setSuccessResult(res.data);
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Broker sync failed');
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: '720px',
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
              <Zap size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.text.primary }}>
                Direct Broker & MFCentral Auto-Sync
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: colors.text.secondary }}>
                Direct API connector for Angel One, Zerodha, and MFCentral Mutual Funds
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

        {/* Broker Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '16px 24px 0 24px',
            backgroundColor: colors.bg.surfaceElevated,
            borderBottom: `1px solid ${colors.border.subtle}`
          }}
        >
          {[
            { id: 'IND_MONEY', label: 'INDmoney (Net Worth Sync)', color: '#10B981' },
            { id: 'ANGEL_ONE', label: 'Angel One (SmartAPI)', color: '#3B82F6' },
            { id: 'ZERODHA', label: 'Zerodha (Kite)', color: '#F97316' },
            { id: 'MF_CENTRAL', label: 'MFCentral (Mutual Funds)', color: '#8B5CF6' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveBroker(tab.id as any);
                setError(null);
                setSuccessResult(null);
              }}
              style={{
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: `3px solid ${activeBroker === tab.id ? tab.color : 'transparent'}`,
                backgroundColor: activeBroker === tab.id ? colors.bg.surface : 'transparent',
                color: activeBroker === tab.id ? colors.text.primary : colors.text.secondary,
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
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

          {successResult && (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                color: colors.financial.income,
                marginBottom: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                <CheckCircle2 size={18} />
                Successfully Synced {successResult.broker} Holdings!
              </div>
              <div style={{ fontSize: '13px', marginTop: '6px', color: colors.text.primary }}>
                Imported <b>{successResult.stocksImported + successResult.mutualFundsImported} holdings</b> with total valuation of{' '}
                <b>₹{Number(successResult.totalSyncedValue).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</b>.
              </div>
            </div>
          )}

          {/* INDMONEY TAB */}
          {activeBroker === 'IND_MONEY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                    Sync Net Worth & Portfolios via INDmoney
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                    Imports all Indian stocks (Angel One + Zerodha) and mutual funds already tracked in your INDmoney
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSync(true)}
                  isLoading={loading}
                  style={{ fontWeight: 700, backgroundColor: '#10B981', color: '#FFFFFF', whiteSpace: 'nowrap' }}
                >
                  <Sparkles size={14} style={{ marginRight: '6px' }} />
                  1-Click Test Demo
                </Button>
              </div>

              {/* Step by step guide card */}
              <div
                style={{
                  backgroundColor: colors.bg.surfaceElevated,
                  borderRadius: '10px',
                  padding: '14px 18px',
                  border: `1px solid ${colors.border.subtle}`,
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 700, color: colors.text.primary, marginBottom: '6px' }}>
                  📌 Simple 3-Step Process:
                </div>
                <ol style={{ margin: 0, paddingLeft: '18px', color: colors.text.secondary, lineHeight: 1.6 }}>
                  <li>Open the <b>INDmoney app</b> on your mobile phone or browser.</li>
                  <li>Go to <b>Net Worth</b> / <b>Investments</b> → tap <b>"Download Statement"</b> or copy your holdings text.</li>
                  <li>Paste the text or MCP JSON below and click <b>Sync</b> (or click <b>"1-Click Test Demo"</b> above).</li>
                </ol>
              </div>

              <FormField
                label="Paste INDmoney Text, Holdings CSV, or MCP Output"
                helperText="Paste your exported text or JSON from INDmoney / MCP"
              >
                <textarea
                  rows={6}
                  value={indMoneyText}
                  onChange={(e) => setIndMoneyText(e.target.value)}
                  placeholder="Paste your INDmoney holdings, statement text, or MCP JSON here..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: colors.bg.surfaceElevated,
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '8px',
                    color: colors.text.primary,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </FormField>
            </div>
          )}

          {/* ANGEL ONE TAB */}
          {activeBroker === 'ANGEL_ONE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6' }}>
                    Angel One SmartAPI is 100% Free
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                    Generate your free API Key in 30 seconds from smartapi.angelbroking.com
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(true)}
                  isLoading={loading}
                  style={{ fontWeight: 600, borderColor: '#3B82F6', color: '#3B82F6' }}
                >
                  <Sparkles size={14} style={{ marginRight: '4px' }} />
                  1-Click Test Demo
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormField label="Client Code *" helperText="e.g. A1234567">
                  <Input
                    value={angelClientCode}
                    onChange={(e) => setAngelClientCode(e.target.value.toUpperCase())}
                    placeholder="Enter Angel One Client ID"
                  />
                </FormField>

                <FormField label="SmartAPI Key *" helperText="From Angel One developer portal">
                  <Input
                    value={angelApiKey}
                    onChange={(e) => setAngelApiKey(e.target.value)}
                    placeholder="e.g. jdu981hsk..."
                  />
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormField label="MPIN / Password (Optional)" helperText="Used to generate live session">
                  <Input
                    type="password"
                    value={angelMpin}
                    onChange={(e) => setAngelMpin(e.target.value)}
                    placeholder="••••"
                  />
                </FormField>

                <FormField label="TOTP / Authenticator Code" helperText="From Google/Microsoft Authenticator">
                  <Input
                    value={angelTotp}
                    onChange={(e) => setAngelTotp(e.target.value)}
                    placeholder="6-digit TOTP"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* ZERODHA TAB */}
          {activeBroker === 'ZERODHA' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'rgba(249, 115, 22, 0.08)',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F97316' }}>
                    Zerodha Kite Connect Integration
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                    Fetches live equity holdings, T1 trades, and P&L directly from Kite
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(true)}
                  isLoading={loading}
                  style={{ fontWeight: 600, borderColor: '#F97316', color: '#F97316' }}
                >
                  <Sparkles size={14} style={{ marginRight: '4px' }} />
                  1-Click Test Demo
                </Button>
              </div>

              <FormField label="Kite API Key *" helperText="From kite.trade developer apps">
                <Input
                  value={kiteApiKey}
                  onChange={(e) => setKiteApiKey(e.target.value)}
                  placeholder="e.g. your_kite_api_key"
                />
              </FormField>

              <FormField label="Kite Access Token *" helperText="Generated after daily Kite login">
                <Input
                  type="password"
                  value={kiteAccessToken}
                  onChange={(e) => setKiteAccessToken(e.target.value)}
                  placeholder="e.g. 32-character session access token"
                />
              </FormField>
            </div>
          )}

          {/* MFCENTRAL TAB */}
          {activeBroker === 'MF_CENTRAL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                    MFCentral (Official CAMS + KFintech Hub)
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '2px' }}>
                    Covers 100% of all Indian Mutual Funds across all 44 fund houses
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(true)}
                  isLoading={loading}
                  style={{ fontWeight: 600, borderColor: '#10B981', color: '#10B981' }}
                >
                  <Sparkles size={14} style={{ marginRight: '4px' }} />
                  1-Click Test Demo
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormField label="Permanent Account Number (PAN)" helperText="Linked to your mutual fund folios">
                  <Input
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCPK1234F"
                  />
                </FormField>

                <FormField label="Registered Mobile Number" helperText="10-digit mobile number">
                  <Input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </FormField>
              </div>

              <FormField
                label="Or Paste MFCentral CAS Folio JSON"
                helperText="Direct export from mfcentral.com or CAMS portal"
              >
                <textarea
                  rows={4}
                  value={mfJson}
                  onChange={(e) => setMfJson(e.target.value)}
                  placeholder='{"folios": [{"scheme": "Parag Parikh Flexi Cap", "units": 210.45, "nav": 75.8}]}'
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: colors.bg.surfaceElevated,
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '8px',
                    color: colors.text.primary,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </FormField>
            </div>
          )}

          <div
            style={{
              marginTop: '18px',
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
              Read-Only Portfolio Sync • WealthFlow cannot execute trades or debit funds.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.bg.surfaceElevated
          }}
        >
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Close
          </Button>

          <Button
            variant="primary"
            onClick={() => handleSync(false)}
            isLoading={loading}
            style={{ fontWeight: 700 }}
          >
            Sync Live {activeBroker === 'IND_MONEY' ? 'INDmoney' : activeBroker === 'ANGEL_ONE' ? 'Angel One' : activeBroker === 'ZERODHA' ? 'Zerodha' : 'MFCentral'} Holdings &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
};
