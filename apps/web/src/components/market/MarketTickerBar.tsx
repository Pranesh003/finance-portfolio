import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../api';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface MarketIndexItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export const MarketTickerBar: React.FC = () => {
  const { colors } = useTheme();
  const [indices, setIndices] = useState<MarketIndexItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIndices = async () => {
    try {
      const res = await apiClient.market.getIndices();
      if (res.data && Array.isArray(res.data)) {
        setIndices(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch market indices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndices();
    const interval = setInterval(fetchIndices, 60000); // 1 minute auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && indices.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: colors.bg.surface,
        borderBottom: `1px solid ${colors.border.subtle}`,
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        gap: '20px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 6px #10B981'
          }}
        />
        <span style={{ fontWeight: 600, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Live Market
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'nowrap' }}>
        {indices.map((item) => {
          const isPositive = item.change >= 0;
          return (
            <div key={item.symbol} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontWeight: 600, color: colors.text.primary }}>{item.name}</span>
              <span style={{ fontWeight: 700, color: colors.text.primary }}>
                {item.currency === 'INR' ? '₹' : '$'}
                {item.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isPositive ? '#10B981' : '#EF4444'
                }}
              >
                {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isPositive ? '+' : ''}
                {item.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={fetchIndices}
        title="Refresh live quotes"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.text.tertiary,
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
          borderRadius: '4px'
        }}
      >
        <RefreshCw size={13} />
      </button>
    </div>
  );
};
