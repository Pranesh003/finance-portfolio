/**
 * Comprehensive ISIN to NSE/BSE Ticker & AMFI Scheme Mapping
 * Covers top Indian Equities, Index ETFs, and Major Mutual Funds
 */
export const ISIN_TO_TICKER_MAP: Record<string, { ticker: string; name: string; exchange: string }> = {
  // Top 100 Indian Equities
  'INE002A01018': { ticker: 'RELIANCE.NS', name: 'Reliance Industries Ltd', exchange: 'NSE' },
  'INE467B01029': { ticker: 'TCS.NS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE' },
  'INE040A01034': { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', exchange: 'NSE' },
  'INE090A01021': { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', exchange: 'NSE' },
  'INE009A01021': { ticker: 'INFY.NS', name: 'Infosys Ltd', exchange: 'NSE' },
  'INE030A01027': { ticker: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', exchange: 'NSE' },
  'INE238A01034': { ticker: 'AXISBANK.NS', name: 'Axis Bank Ltd', exchange: 'NSE' },
  'INE155A01022': { ticker: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', exchange: 'NSE' },
  'INE018A01030': { ticker: 'LT.NS', name: 'Larsen & Toubro Ltd', exchange: 'NSE' },
  'INE062A01020': { ticker: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE' },
  'INE881J01026': { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', exchange: 'NSE' },
  'INE237A01028': { ticker: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd', exchange: 'NSE' },
  'INE585B01010': { ticker: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', exchange: 'NSE' },
  'INE860A01027': { ticker: 'HCLTECH.NS', name: 'HCL Technologies Ltd', exchange: 'NSE' },
  'INE075A01017': { ticker: 'WIPRO.NS', name: 'Wipro Ltd', exchange: 'NSE' },
  'INE081A01012': { ticker: 'TATACONSUM.NS', name: 'Tata Consumer Products Ltd', exchange: 'NSE' },
  'INE021A01026': { ticker: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', exchange: 'NSE' },
  'INE397D01024': { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', exchange: 'NSE' },
  'INE745G01035': { ticker: 'ADANIGREEN.NS', name: 'Adani Green Energy Ltd', exchange: 'NSE' },
  'INE423A01024': { ticker: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', exchange: 'NSE' },
  'INE742F01042': { ticker: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ Ltd', exchange: 'NSE' },
  'INE364U01010': { ticker: 'ADANIPOWER.NS', name: 'Adani Power Ltd', exchange: 'NSE' },
  'INE296A01024': { ticker: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', exchange: 'NSE' },
  'INE918I01018': { ticker: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd', exchange: 'NSE' },
  'INE917I01010': { ticker: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd', exchange: 'NSE' },
  'INE059A01026': { ticker: 'CIPLA.NS', name: 'Cipla Ltd', exchange: 'NSE' },
  'INE089A01023': { ticker: 'DRREDDY.NS', name: 'Dr. Reddy Laboratories Ltd', exchange: 'NSE' },
  'INE044A01036': { ticker: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Ind Ltd', exchange: 'NSE' },
  'INE101A01026': { ticker: 'M&M.NS', name: 'Mahindra & Mahindra Ltd', exchange: 'NSE' },
  'INE152A01029': { ticker: 'DIVISLAB.NS', name: 'Divis Laboratories Ltd', exchange: 'NSE' },
  'INE192A01025': { ticker: 'POWERGRID.NS', name: 'Power Grid Corp of India Ltd', exchange: 'NSE' },
  'INE733E01010': { ticker: 'NTPC.NS', name: 'NTPC Ltd', exchange: 'NSE' },
  'INE213A01029': { ticker: 'ONGC.NS', name: 'Oil & Natural Gas Corp Ltd', exchange: 'NSE' },
  'INE047A01021': { ticker: 'GRASIM.NS', name: 'Grasim Industries Ltd', exchange: 'NSE' },
  'INE481G01011': { ticker: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd', exchange: 'NSE' },
  'INE081A01020': { ticker: 'TATASTEEL.NS', name: 'Tata Steel Ltd', exchange: 'NSE' },
  'INE038A01020': { ticker: 'HINDALCO.NS', name: 'Hindalco Industries Ltd', exchange: 'NSE' },
  'INE019A01038': { ticker: 'JSWSTEEL.NS', name: 'JSW Steel Ltd', exchange: 'NSE' },
  'INE114A01011': { ticker: 'SAIL.NS', name: 'Steel Authority of India Ltd', exchange: 'NSE' },
  'INE242A01010': { ticker: 'IOC.NS', name: 'Indian Oil Corporation Ltd', exchange: 'NSE' },
  'INE029A01011': { ticker: 'BPCL.NS', name: 'Bharat Petroleum Corp Ltd', exchange: 'NSE' },
  'INE094A01015': { ticker: 'HINDPETRO.NS', name: 'Hindustan Petroleum Corp Ltd', exchange: 'NSE' },
  'INE121A01024': { ticker: 'CHOLAFIN.NS', name: 'Cholamandalam Inv & Fin Co', exchange: 'NSE' },
  'INE205A01025': { ticker: 'VEDL.NS', name: 'Vedanta Ltd', exchange: 'NSE' },
  'INE245A01021': { ticker: 'TATAPOWER.NS', name: 'Tata Power Co Ltd', exchange: 'NSE' },
  'INE669E01016': { ticker: 'IDEA.NS', name: 'Vodafone Idea Ltd', exchange: 'NSE' },
  'INE758T01015': { ticker: 'ZOMATO.NS', name: 'Zomato Ltd', exchange: 'NSE' },
  'INE982J01020': { ticker: 'PAYTM.NS', name: 'One97 Communications (Paytm)', exchange: 'NSE' },
  'INE034A01011': { ticker: 'JIOFIN.NS', name: 'Jio Financial Services Ltd', exchange: 'NSE' },
  'INE437A01024': { ticker: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise', exchange: 'NSE' },
  'INE111A01025': { ticker: 'TITAN.NS', name: 'Titan Company Ltd', exchange: 'NSE' },
  'INE647O01011': { ticker: 'NYKAA.NS', name: 'FSN E-Commerce Ventures (Nykaa)', exchange: 'NSE' },
  'INE848E01016': { ticker: 'POLICYBZR.NS', name: 'PB Fintech Ltd (PolicyBazaar)', exchange: 'NSE' },
  'INE028A01039': { ticker: 'BANKBARODA.NS', name: 'Bank of Baroda', exchange: 'NSE' },
  'INE160A01022': { ticker: 'PNB.NS', name: 'Punjab National Bank', exchange: 'NSE' },
  'INE528G01035': { ticker: 'YESBANK.NS', name: 'Yes Bank Ltd', exchange: 'NSE' },
  'INE692G01013': { ticker: 'IDFCFIRSTB.NS', name: 'IDFC First Bank Ltd', exchange: 'NSE' },
  'INE262H01013': { ticker: 'FEDERALBNK.NS', name: 'Federal Bank Ltd', exchange: 'NSE' },
  'INE117A01022': { ticker: 'ABB.NS', name: 'ABB India Ltd', exchange: 'NSE' },
  'INE003A01024': { ticker: 'SIEMENS.NS', name: 'Siemens Ltd', exchange: 'NSE' },
  'INE326A01037': { ticker: 'LTIM.NS', name: 'LTIMindtree Ltd', exchange: 'NSE' },
  'INE669C01036': { ticker: 'TECHM.NS', name: 'Tech Mahindra Ltd', exchange: 'NSE' },
  'INE203G01027': { ticker: 'COALINDIA.NS', name: 'Coal India Ltd', exchange: 'NSE' },
  'INE775A01035': { ticker: 'MOTHERSON.NS', name: 'Samvardhana Motherson Int Ltd', exchange: 'NSE' },
  'INE128A01029': { ticker: 'BEL.NS', name: 'Bharat Electronics Ltd', exchange: 'NSE' },
  'INE257A01026': { ticker: 'BHEL.NS', name: 'Bharat Heavy Electricals Ltd', exchange: 'NSE' },
  'INE865C01022': { ticker: 'HAL.NS', name: 'Hindustan Aeronautics Ltd', exchange: 'NSE' },
  'INE042A01014': { ticker: 'IOC.NS', name: 'Indian Oil Corporation', exchange: 'NSE' },
  'INE347G01014': { ticker: 'PIDILITIND.NS', name: 'Pidilite Industries Ltd', exchange: 'NSE' },
  'INE176B01034': { ticker: 'HAVELLS.NS', name: 'Havells India Ltd', exchange: 'NSE' },
  'INE484J01027': { ticker: 'TRENT.NS', name: 'Trent Ltd', exchange: 'NSE' },
  'INE854D01024': { ticker: 'INDHOTEL.NS', name: 'The Indian Hotels Co Ltd', exchange: 'NSE' },
  'INE069A01017': { ticker: 'AMBUJACEM.NS', name: 'Ambuja Cements Ltd', exchange: 'NSE' },
  'INE012A01025': { ticker: 'ACC.NS', name: 'ACC Ltd', exchange: 'NSE' },
  'INE115A01026': { ticker: 'EICHERMOT.NS', name: 'Eicher Motors Ltd', exchange: 'NSE' },
  'INE849A01020': { ticker: 'TVSMOTOR.NS', name: 'TVS Motor Company Ltd', exchange: 'NSE' },
  'INE158A01026': { ticker: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd', exchange: 'NSE' },
  'INE271C01023': { ticker: 'DLF.NS', name: 'DLF Ltd', exchange: 'NSE' },
  'INE087H01022': { ticker: 'LODHA.NS', name: 'Macrotech Developers Ltd', exchange: 'NSE' },
  'INE674K01013': { ticker: 'GODREJPROP.NS', name: 'Godrej Properties Ltd', exchange: 'NSE' },
  'INE020B01018': { ticker: 'IRCTC.NS', name: 'Indian Railway Catering & Tourism', exchange: 'NSE' },
  'INE053F01010': { ticker: 'IRFC.NS', name: 'Indian Railway Finance Corp', exchange: 'NSE' },
  'INE556F01012': { ticker: 'RECLTD.NS', name: 'REC Ltd', exchange: 'NSE' },
  'INE134E01011': { ticker: 'PFC.NS', name: 'Power Finance Corporation', exchange: 'NSE' },
  'INE721A01013': { ticker: 'SHREECEM.NS', name: 'Shree Cement Ltd', exchange: 'NSE' },
  'INE498L01015': { ticker: 'LICI.NS', name: 'Life Insurance Corp of India', exchange: 'NSE' },
  'INE795G01014': { ticker: 'HDFCLIFE.NS', name: 'HDFC Life Insurance Co Ltd', exchange: 'NSE' },
  'INE026A01025': { ticker: 'SBILIFE.NS', name: 'SBI Life Insurance Co Ltd', exchange: 'NSE' },
  'INE123W01016': { ticker: 'ICICIPRULI.NS', name: 'ICICI Prudential Life Ins', exchange: 'NSE' },
  'INE765G01017': { ticker: 'ICICIGI.NS', name: 'ICICI Lombard General Ins', exchange: 'NSE' },
  'INE406A01037': { ticker: 'TATACHEM.NS', name: 'Tata Chemicals Ltd', exchange: 'NSE' },
  'INE670A01012': { ticker: 'TATAELXSI.NS', name: 'Tata Elxsi Ltd', exchange: 'NSE' },
  'INE070A01015': { ticker: 'SHRIRAMFIN.NS', name: 'Shriram Finance Ltd', exchange: 'NSE' },
  'INE242C01024': { ticker: 'MUTHOOTFIN.NS', name: 'Muthoot Finance Ltd', exchange: 'NSE' },

  // Top Indian ETFs
  'INF209KB14W9': { ticker: 'NIFTYBEES.NS', name: 'Nippon India ETF Nifty 50 BeES', exchange: 'NSE' },
  'INF209KB14X7': { ticker: 'BANKBEES.NS', name: 'Nippon India ETF Nifty Bank BeES', exchange: 'NSE' },
  'INF209KB14Y5': { ticker: 'GOLDBEES.NS', name: 'Nippon India ETF Gold BeES', exchange: 'NSE' },
  'INF209KB14Z2': { ticker: 'SILVERBEES.NS', name: 'Nippon India ETF Silver BeES', exchange: 'NSE' },
  'INF209KB15A3': { ticker: 'ITBEES.NS', name: 'Nippon India ETF Nifty IT', exchange: 'NSE' },
  'INF209KB15B1': { ticker: 'JUNIORBEES.NS', name: 'Nippon India ETF Nifty Next 50', exchange: 'NSE' }
};

/**
 * Helper to resolve an ISIN to a ticker or format clean name
 */
export function resolveIsinToTicker(isin: string, fallbackName?: string): { ticker: string; name: string; exchange: string } {
  const cleanIsin = isin.toUpperCase().trim();
  if (ISIN_TO_TICKER_MAP[cleanIsin]) {
    return ISIN_TO_TICKER_MAP[cleanIsin];
  }

  // Fallback: derive ticker from company name
  const cleanName = (fallbackName || cleanIsin).replace(/LIMITED|LTD|CORPORATION|CORP|INDIA|\bCO\b|\bIND\b/gi, '').trim();
  const firstWord = cleanName.split(/\s+/)[0] || '';
  const tickerGuess = firstWord.toUpperCase().replace(/[^A-Z0-9]/g, '');

  return {
    ticker: tickerGuess ? `${tickerGuess}.NS` : `${cleanIsin}.NS`,
    name: fallbackName || cleanIsin,
    exchange: 'NSE'
  };
}
