import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../api';
import { Button } from '../ui/Button';
import { AddInvestmentModal } from './AddInvestmentModal';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw,
  Trash2,
  Briefcase
} from 'lucide-react';

export const LivePortfolioView: React.FC = () => {
  const { colors } = useTheme();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STOCKS' | 'MUTUAL_FUNDS' | 'GOLD' | 'CRYPTO'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      const res = await apiClient.investments.getPortfolio();
      if (res.data) {
        setPortfolio(res.data);
      }
    } catch (err) {
      console.warn('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 60000); // 1 min auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (type: 'stock' | 'mutual-fund' | 'crypto' | 'metal', id: string) => {
    if (!window.confirm('Are you sure you want to delete this holding from your portfolio?')) return;
    setDeletingId(id);
    try {
      await apiClient.investments.deleteHolding(type, id);
      await fetchPortfolio();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const stocks = portfolio?.stocks || [];
  const mutualFunds = portfolio?.mutualFunds || [];
  const cryptos = portfolio?.cryptos || [];
  const metals = portfolio?.preciousMetals || [];

  const totalInvested = portfolio?.totalCostBasis || 0;
  const currentValue = portfolio?.currentValue || 0;
  const gainLoss = portfolio?.unrealizedGainLoss || 0;
  const gainLossPct = portfolio?.unrealizedGainLossPercentage || 0;
  const isPositive = gainLoss >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Portfolio Header Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div
          style={{
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <div style={{ fontSize: '13px', color: colors.text.secondary, fontWeight: 500 }}>
            Total Invested Capital
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: colors.text.primary, marginTop: '8px' }}>
            ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div
          style={{
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <div style={{ fontSize: '13px', color: colors.text.secondary, fontWeight: 500 }}>
            Current Market Value (Live CMP)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: colors.text.primary, marginTop: '8px' }}>
            ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div
          style={{
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <div style={{ fontSize: '13px', color: colors.text.secondary, fontWeight: 500 }}>
            Unrealized Returns (P&L)
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: isPositive ? '#10B981' : '#EF4444',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPositive ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            {isPositive ? '+' : ''}₹{gainLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}{gainLossPct}%)
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Add Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Holdings (${stocks.length + mutualFunds.length + cryptos.length + metals.length})` },
            { id: 'STOCKS', label: `Indian Stocks (${stocks.length})` },
            { id: 'MUTUAL_FUNDS', label: `Mutual Funds (${mutualFunds.length})` },
            { id: 'GOLD', label: `Gold & Silver (${metals.length})` },
            { id: 'CRYPTO', label: `Crypto (${cryptos.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${activeFilter === tab.id ? colors.brand.primary : colors.border.default}`,
                backgroundColor: activeFilter === tab.id ? 'rgba(99, 102, 241, 0.12)' : colors.bg.surface,
                color: activeFilter === tab.id ? colors.brand.primary : colors.text.secondary,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="ghost" onClick={fetchPortfolio} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            Add Real Investment
          </Button>
        </div>
      </div>

      {/* Holdings Table */}
      <div
        style={{
          backgroundColor: colors.bg.surface,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: colors.bg.canvas, borderBottom: `1px solid ${colors.border.default}` }}>
              <th style={{ padding: '12px 16px', color: colors.text.secondary, fontWeight: 600 }}>Holding / Asset</th>
              <th style={{ padding: '12px 16px', color: colors.text.secondary, fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 16px', color: colors.text.secondary, fontWeight: 600 }}>Qty / Units</th>
              <th style={{ padding: '12px 16px', color: colors.text.secondary, fontWeight: 600 }}>Avg Buy Price</th>
              <th style={{ padding: '12px 16px', color: colors.text.secondary, fontWeight: 600 }}>Live CMP / NAV</th>
              <th style={{ padding: '12px 16px', color: colors.text.secondary, fontWeight: 600 }}>Current Value</th>
              <th style={{ padding: '12px 16px', color: colors.text.secondary, fontWeight: 600 }}>Gain / Loss</th>
              <th style={{ padding: '12px 16px', color: colors.text.secondary, fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Stocks */}
            {(activeFilter === 'ALL' || activeFilter === 'STOCKS') &&
              stocks.map((item: any) => {
                const isGain = (item.unrealizedGainLoss || 0) >= 0;
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: colors.text.primary }}>{item.companyName}</div>
                      <div style={{ fontSize: '11px', color: colors.text.tertiary }}>{item.ticker} • {item.exchange}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', fontWeight: 600 }}>
                        Indian Stock
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: colors.text.primary, fontWeight: 500 }}>{item.shares}</td>
                    <td style={{ padding: '14px 16px', color: colors.text.primary }}>₹{item.averageCostPerShare?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: colors.text.primary }}>₹{item.currentPrice?.toLocaleString('en-IN')}</span>
                      {item.dayChangePercent !== undefined && (
                        <div style={{ fontSize: '11px', color: item.dayChangePercent >= 0 ? '#10B981' : '#EF4444' }}>
                          {item.dayChangePercent >= 0 ? '+' : ''}{item.dayChangePercent}% today
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: colors.text.primary }}>
                      ₹{item.marketValue?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: isGain ? '#10B981' : '#EF4444' }}>
                        {isGain ? '+' : ''}₹{item.unrealizedGainLoss?.toLocaleString('en-IN')} ({isGain ? '+' : ''}{item.unrealizedGainLossPercentage}%)
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete('stock', item.id)}
                        disabled={deletingId === item.id}
                        title="Delete holding"
                        style={{ background: 'none', border: 'none', color: colors.text.tertiary, cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}

            {/* Mutual Funds */}
            {(activeFilter === 'ALL' || activeFilter === 'MUTUAL_FUNDS') &&
              mutualFunds.map((item: any) => {
                const isGain = (item.unrealizedGainLoss || 0) >= 0;
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: colors.text.primary }}>{item.fundName}</div>
                      <div style={{ fontSize: '11px', color: colors.text.tertiary }}>Code: {item.schemeCode} • {item.fundFamily}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontWeight: 600 }}>
                        Mutual Fund
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: colors.text.primary, fontWeight: 500 }}>{item.units}</td>
                    <td style={{ padding: '14px 16px', color: colors.text.primary }}>₹{item.averageNav?.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: colors.text.primary }}>₹{item.currentNav?.toFixed(2)}</span>
                      {item.navDate && <div style={{ fontSize: '11px', color: colors.text.tertiary }}>AMFI: {item.navDate}</div>}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: colors.text.primary }}>
                      ₹{item.marketValue?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: isGain ? '#10B981' : '#EF4444' }}>
                        {isGain ? '+' : ''}₹{item.unrealizedGainLoss?.toLocaleString('en-IN')} ({isGain ? '+' : ''}{item.unrealizedGainLossPercentage}%)
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete('mutual-fund', item.id)}
                        disabled={deletingId === item.id}
                        title="Delete holding"
                        style={{ background: 'none', border: 'none', color: colors.text.tertiary, cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}

            {/* Precious Metals */}
            {(activeFilter === 'ALL' || activeFilter === 'GOLD') &&
              metals.map((item: any) => {
                const isGain = (item.unrealizedGainLoss || 0) >= 0;
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: colors.text.primary }}>
                        {item.metalType === 'GOLD' ? 'Physical 24K Gold' : 'Fine Silver'}
                      </div>
                      <div style={{ fontSize: '11px', color: colors.text.tertiary }}>{item.purity * 100}% Purity</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontWeight: 600 }}>
                        Precious Metal
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: colors.text.primary, fontWeight: 500 }}>{item.weight} g</td>
                    <td style={{ padding: '14px 16px', color: colors.text.primary }}>₹{Math.round(item.totalPurchaseCost / item.weight).toLocaleString('en-IN')}/g</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: colors.text.primary }}>₹{item.currentSpotPricePerUnit?.toLocaleString('en-IN')}/g</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: colors.text.primary }}>
                      ₹{item.currentValue?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: isGain ? '#10B981' : '#EF4444' }}>
                        {isGain ? '+' : ''}₹{item.unrealizedGainLoss?.toLocaleString('en-IN')} ({isGain ? '+' : ''}{item.unrealizedGainLossPercentage}%)
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete('metal', item.id)}
                        disabled={deletingId === item.id}
                        title="Delete holding"
                        style={{ background: 'none', border: 'none', color: colors.text.tertiary, cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}

            {/* Cryptos */}
            {(activeFilter === 'ALL' || activeFilter === 'CRYPTO') &&
              cryptos.map((item: any) => {
                const isGain = (item.unrealizedGainLoss || 0) >= 0;
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: colors.text.primary }}>{item.coinName}</div>
                      <div style={{ fontSize: '11px', color: colors.text.tertiary }}>{item.symbol}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', fontWeight: 600 }}>
                        Crypto Asset
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: colors.text.primary, fontWeight: 500 }}>{item.quantity}</td>
                    <td style={{ padding: '14px 16px', color: colors.text.primary }}>₹{item.averageCostPerCoin?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: colors.text.primary }}>₹{item.currentPrice?.toLocaleString('en-IN')}</span>
                      {item.dayChangePercent !== undefined && (
                        <div style={{ fontSize: '11px', color: item.dayChangePercent >= 0 ? '#10B981' : '#EF4444' }}>
                          {item.dayChangePercent >= 0 ? '+' : ''}{item.dayChangePercent}% 24h
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: colors.text.primary }}>
                      ₹{item.marketValue?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: isGain ? '#10B981' : '#EF4444' }}>
                        {isGain ? '+' : ''}₹{item.unrealizedGainLoss?.toLocaleString('en-IN')} ({isGain ? '+' : ''}{item.unrealizedGainLossPercentage}%)
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete('crypto', item.id)}
                        disabled={deletingId === item.id}
                        title="Delete holding"
                        style={{ background: 'none', border: 'none', color: colors.text.tertiary, cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}

            {/* Empty state */}
            {stocks.length === 0 && mutualFunds.length === 0 && cryptos.length === 0 && metals.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: colors.text.tertiary }}>
                  <Briefcase size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text.secondary }}>
                    No Real Investment Holdings Added Yet
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px', marginBottom: '16px' }}>
                    Add your real Indian stocks, mutual funds, gold, or crypto to start tracking live market valuations.
                  </div>
                  <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                    + Add Your First Holding
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchPortfolio}
      />
    </div>
  );
};
