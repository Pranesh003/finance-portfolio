import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import {
  X,
  TrendingUp,
  PieChart,
  Coins,
  Shield,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<'STOCK' | 'MUTUAL_FUND' | 'GOLD' | 'CRYPTO'>('STOCK');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stock Form State
  const [stockSearch, setStockSearch] = useState('');
  const [stockResults, setStockResults] = useState<Array<{ symbol: string; name: string; exchange: string }>>([]);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string; exchange: string } | null>(null);
  const [stockShares, setStockShares] = useState('');
  const [stockBuyPrice, setStockBuyPrice] = useState('');
  const [isSearchingStock, setIsSearchingStock] = useState(false);

  // Mutual Fund Form State
  const [mfSearch, setMfSearch] = useState('');
  const [mfResults, setMfResults] = useState<Array<{ schemeCode: string; schemeName: string; nav: number; fundFamily?: string }>>([]);
  const [selectedMf, setSelectedMf] = useState<{ schemeCode: string; schemeName: string; nav: number; fundFamily?: string } | null>(null);
  const [mfUnits, setMfUnits] = useState('');
  const [mfBuyNav, setMfBuyNav] = useState('');
  const [isSearchingMf, setIsSearchingMf] = useState(false);

  // Gold & Silver Form State
  const [metalType, setMetalType] = useState<'GOLD' | 'SILVER'>('GOLD');
  const [metalWeightGrams, setMetalWeightGrams] = useState('');
  const [metalBuyPricePerGram, setMetalBuyPricePerGram] = useState('');
  const [liveSpotRates, setLiveSpotRates] = useState<any>(null);

  // Crypto Form State
  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');
  const [cryptoQuantity, setCryptoQuantity] = useState('');
  const [cryptoBuyPrice, setCryptoBuyPrice] = useState('');
  const [liveCryptoRates, setLiveCryptoRates] = useState<any[]>([]);

  // Search Stocks with debounce
  useEffect(() => {
    if (!stockSearch || stockSearch.trim().length < 2) {
      setStockResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingStock(true);
      try {
        const res = await apiClient.market.searchStocks(stockSearch.trim());
        setStockResults(res.data || []);
      } catch (err) {
        console.warn('Stock search error:', err);
      } finally {
        setIsSearchingStock(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [stockSearch]);

  // Search Mutual Funds with debounce
  useEffect(() => {
    if (!mfSearch || mfSearch.trim().length < 2) {
      setMfResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingMf(true);
      try {
        const res = await apiClient.market.searchMutualFunds(mfSearch.trim(), 10);
        setMfResults(res.data || []);
      } catch (err) {
        console.warn('MF search error:', err);
      } finally {
        setIsSearchingMf(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [mfSearch]);

  // Fetch precious metal rates
  useEffect(() => {
    apiClient.market.getPreciousMetals().then((res) => {
      if (res.data) {
        setLiveSpotRates(res.data);
        if (!metalBuyPricePerGram) {
          setMetalBuyPricePerGram(String(res.data.gold24kPerGram));
        }
      }
    });
    apiClient.market.getCryptoRates().then((res) => {
      if (res.data) {
        setLiveCryptoRates(res.data);
      }
    });
  }, []);

  if (!isOpen) return null;

  const handleSelectStock = async (stock: { symbol: string; name: string; exchange: string }) => {
    setSelectedStock(stock);
    setStockSearch(stock.name);
    setStockResults([]);
    try {
      const q = await apiClient.market.getStockQuote(stock.symbol);
      if (q.data?.price) {
        setStockBuyPrice(String(q.data.price));
      }
    } catch { /* ignore */ }
  };

  const handleSelectMf = (mf: { schemeCode: string; schemeName: string; nav: number; fundFamily?: string }) => {
    setSelectedMf(mf);
    setMfSearch(mf.schemeName);
    setMfResults([]);
    setMfBuyNav(String(mf.nav));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (activeTab === 'STOCK') {
        if (!selectedStock) throw new Error('Please select a stock from the search results');
        const shares = parseFloat(stockShares);
        const buyPrice = parseFloat(stockBuyPrice);
        if (isNaN(shares) || shares <= 0) throw new Error('Please enter a valid share quantity');
        if (isNaN(buyPrice) || buyPrice <= 0) throw new Error('Please enter a valid buy price');

        await apiClient.investments.addStock({
          ticker: selectedStock.symbol,
          companyName: selectedStock.name,
          exchange: selectedStock.exchange,
          shares,
          averageCostPerShare: buyPrice
        });
      } else if (activeTab === 'MUTUAL_FUND') {
        if (!selectedMf) throw new Error('Please select a mutual fund from the search results');
        const units = parseFloat(mfUnits);
        const buyNav = parseFloat(mfBuyNav);
        if (isNaN(units) || units <= 0) throw new Error('Please enter valid fund units');
        if (isNaN(buyNav) || buyNav <= 0) throw new Error('Please enter a valid purchase NAV');

        await apiClient.investments.addMutualFund({
          schemeCode: selectedMf.schemeCode,
          fundName: selectedMf.schemeName,
          fundFamily: selectedMf.fundFamily,
          units,
          averageNav: buyNav
        });
      } else if (activeTab === 'GOLD') {
        const weight = parseFloat(metalWeightGrams);
        const pricePerGram = parseFloat(metalBuyPricePerGram);
        if (isNaN(weight) || weight <= 0) throw new Error('Please enter valid weight in grams');
        if (isNaN(pricePerGram) || pricePerGram <= 0) throw new Error('Please enter valid purchase price per gram');

        await apiClient.investments.addPreciousMetal({
          metalType,
          weight,
          weightUnit: 'GRAM',
          purchaseCostPerUnit: pricePerGram
        });
      } else if (activeTab === 'CRYPTO') {
        const qty = parseFloat(cryptoQuantity);
        const buyPrice = parseFloat(cryptoBuyPrice);
        if (isNaN(qty) || qty <= 0) throw new Error('Please enter valid coin quantity');
        if (isNaN(buyPrice) || buyPrice <= 0) throw new Error('Please enter valid purchase price per coin');

        const rateObj = liveCryptoRates.find((r) => r.symbol === cryptoSymbol);

        await apiClient.investments.addCrypto({
          symbol: cryptoSymbol,
          coinName: rateObj?.name || cryptoSymbol,
          quantity: qty,
          averageCostPerCoin: buyPrice
        });
      }

      setSuccessMsg('Investment holding added successfully to your live portfolio!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to add holding');
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
        backdropFilter: 'blur(5px)',
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
          maxWidth: '580px',
          backgroundColor: colors.bg.surface,
          borderRadius: '16px',
          border: `1px solid ${colors.border.default}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.text.primary }}>
              Add Real Investment Holding
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: colors.text.secondary }}>
              Track real Indian stocks, mutual funds, gold, and crypto with live market valuations
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text.tertiary,
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Asset Category Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: colors.bg.canvas,
            borderBottom: `1px solid ${colors.border.subtle}`,
            padding: '4px'
          }}
        >
          {[
            { id: 'STOCK', label: 'Stocks & ETFs', icon: TrendingUp },
            { id: 'MUTUAL_FUND', label: 'Mutual Funds', icon: PieChart },
            { id: 'GOLD', label: 'Gold & Silver', icon: Shield },
            { id: 'CRYPTO', label: 'Crypto', icon: Coins }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? colors.bg.surface : 'transparent',
                  color: isActive ? colors.brand.primary : colors.text.secondary,
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={16} />
              {successMsg}
            </div>
          )}

          {/* TAB 1: STOCKS */}
          {activeTab === 'STOCK' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormField label="Search Stock / Company Name" required helperText="e.g. Reliance, Tata Motors, HDFC Bank, Infosys, Apple">
                <div style={{ position: 'relative' }}>
                  <Input
                    placeholder="Type ticker or company name..."
                    value={stockSearch}
                    onChange={(e) => {
                      setStockSearch(e.target.value);
                      setSelectedStock(null);
                    }}
                    leftIcon={<Search size={16} />}
                  />
                  {isSearchingStock && (
                    <div style={{ position: 'absolute', right: '12px', top: '12px' }}>
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  )}

                  {/* Dropdown results */}
                  {stockResults.length > 0 && !selectedStock && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 20,
                        backgroundColor: colors.bg.surface,
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: '8px',
                        marginTop: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                      }}
                    >
                      {stockResults.map((item) => (
                        <div
                          key={item.symbol}
                          onClick={() => handleSelectStock(item)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: `1px solid ${colors.border.subtle}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bg.canvas)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: colors.text.primary }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '11px', color: colors.text.tertiary }}>
                              {item.symbol} • {item.exchange}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: '#3B82F6',
                              fontWeight: 600
                            }}
                          >
                            Select
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>

              {selectedStock && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '13px',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>Selected: <strong>{selectedStock.name}</strong> ({selectedStock.symbol})</span>
                  <span>Live CMP Auto-Applied</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Quantity (Shares)" required>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g. 25"
                    value={stockShares}
                    onChange={(e) => setStockShares(e.target.value)}
                  />
                </FormField>
                <FormField label="Average Purchase Price (₹)" required>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1250.00"
                    value={stockBuyPrice}
                    onChange={(e) => setStockBuyPrice(e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* TAB 2: MUTUAL FUNDS */}
          {activeTab === 'MUTUAL_FUND' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormField label="Search Indian Mutual Fund" required helperText="Powered by AMFI Live Feed (10,000+ Schemes)">
                <div style={{ position: 'relative' }}>
                  <Input
                    placeholder="e.g. Parag Parikh Flexi, Quant Small Cap, SBI Bluechip..."
                    value={mfSearch}
                    onChange={(e) => {
                      setMfSearch(e.target.value);
                      setSelectedMf(null);
                    }}
                    leftIcon={<Search size={16} />}
                  />
                  {isSearchingMf && (
                    <div style={{ position: 'absolute', right: '12px', top: '12px' }}>
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  )}

                  {/* Dropdown results */}
                  {mfResults.length > 0 && !selectedMf && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 20,
                        backgroundColor: colors.bg.surface,
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: '8px',
                        marginTop: '4px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                      }}
                    >
                      {mfResults.map((item) => (
                        <div
                          key={item.schemeCode}
                          onClick={() => handleSelectMf(item)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: `1px solid ${colors.border.subtle}`
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bg.canvas)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ fontWeight: 600, fontSize: '13px', color: colors.text.primary }}>
                            {item.schemeName}
                          </div>
                          <div style={{ fontSize: '11px', color: colors.text.tertiary, marginTop: '2px' }}>
                            Code: {item.schemeCode} • Latest NAV: ₹{item.nav} • {item.fundFamily}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>

              {selectedMf && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '13px',
                    color: '#10B981'
                  }}
                >
                  Selected: <strong>{selectedMf.schemeName}</strong> (AMFI NAV: ₹{selectedMf.nav})
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Units" required>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 154.215"
                    value={mfUnits}
                    onChange={(e) => setMfUnits(e.target.value)}
                  />
                </FormField>
                <FormField label="Purchase NAV (₹)" required>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 65.50"
                    value={mfBuyNav}
                    onChange={(e) => setMfBuyNav(e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* TAB 3: GOLD & SILVER */}
          {activeTab === 'GOLD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMetalType('GOLD');
                    if (liveSpotRates) setMetalBuyPricePerGram(String(liveSpotRates.gold24kPerGram));
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${metalType === 'GOLD' ? '#F59E0B' : colors.border.default}`,
                    backgroundColor: metalType === 'GOLD' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    color: metalType === 'GOLD' ? '#F59E0B' : colors.text.secondary,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  24K Gold (₹{liveSpotRates ? liveSpotRates.gold24kPerGram : '8,150'}/g)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMetalType('SILVER');
                    if (liveSpotRates) setMetalBuyPricePerGram(String(liveSpotRates.silverPerGram));
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${metalType === 'SILVER' ? '#94A3B8' : colors.border.default}`,
                    backgroundColor: metalType === 'SILVER' ? 'rgba(148, 163, 184, 0.15)' : 'transparent',
                    color: metalType === 'SILVER' ? '#E2E8F0' : colors.text.secondary,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Fine Silver (₹{liveSpotRates ? liveSpotRates.silverPerGram : '98.5'}/g)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Weight in Grams (g)" required>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10.0"
                    value={metalWeightGrams}
                    onChange={(e) => setMetalWeightGrams(e.target.value)}
                  />
                </FormField>
                <FormField label="Purchase Price per Gram (₹)" required>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 8000"
                    value={metalBuyPricePerGram}
                    onChange={(e) => setMetalBuyPricePerGram(e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* TAB 4: CRYPTO */}
          {activeTab === 'CRYPTO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormField label="Select Cryptocurrency" required>
                <select
                  value={cryptoSymbol}
                  onChange={(e) => {
                    setCryptoSymbol(e.target.value);
                    const rate = liveCryptoRates.find((r) => r.symbol === e.target.value);
                    if (rate) setCryptoBuyPrice(String(rate.priceInr));
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: colors.bg.canvas,
                    border: `1px solid ${colors.border.default}`,
                    color: colors.text.primary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="BTC">Bitcoin (BTC) - Live ₹{liveCryptoRates.find((r) => r.symbol === 'BTC')?.priceInr.toLocaleString('en-IN') || '72,00,000'}</option>
                  <option value="ETH">Ethereum (ETH) - Live ₹{liveCryptoRates.find((r) => r.symbol === 'ETH')?.priceInr.toLocaleString('en-IN') || '2,20,000'}</option>
                  <option value="SOL">Solana (SOL) - Live ₹{liveCryptoRates.find((r) => r.symbol === 'SOL')?.priceInr.toLocaleString('en-IN') || '8,800'}</option>
                  <option value="USDT">Tether USD (USDT)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                  <option value="XRP">Ripple (XRP)</option>
                </select>
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Quantity / Tokens" required>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g. 0.05"
                    value={cryptoQuantity}
                    onChange={(e) => setCryptoQuantity(e.target.value)}
                  />
                </FormField>
                <FormField label="Purchase Price per Coin (₹)" required>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 6800000"
                    value={cryptoBuyPrice}
                    onChange={(e) => setCryptoBuyPrice(e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px'
            }}
          >
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Adding Holding...' : 'Save to Portfolio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
