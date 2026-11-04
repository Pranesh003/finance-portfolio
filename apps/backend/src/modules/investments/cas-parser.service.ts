import { logger } from '../../core/logger/logger';
import { prisma } from '../../core/database/prisma';
import { CasImportResult, CasParsedItem } from '@finance/types';
import { resolveIsinToTicker } from './isin-map';
import { investmentsService } from './investments.service';
import { marketDataService } from '../market/market.service';

export class CasParserService {
  /**
   * Parse a PDF buffer (supports password protection for PAN/DOB)
   */
  public async parsePdf(buffer: Buffer, password?: string): Promise<string> {
    try {
      // Dynamic import pdfjs-dist legacy build for Node.js
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        password: password ? password.trim() : undefined,
        useSystemFonts: true,
        disableFontFace: true
      });

      const doc = await loadingTask.promise;
      const numPages = doc.numPages;
      const textParts: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        textParts.push(pageText);
      }

      return textParts.join('\n');
    } catch (err: any) {
      if (err?.name === 'PasswordException' || err?.message?.toLowerCase().includes('password')) {
        throw new Error('Password required or incorrect. Please enter your PAN (e.g. ABCDE1234F) or Date of Birth (DDMMYYYY).');
      }
      logger.error('[CAS PARSER] Failed to parse PDF buffer:', err);
      throw new Error(`Unable to read statement PDF: ${err?.message || 'Unsupported format'}`);
    }
  }

  /**
   * Extract Holdings from text (CDSL, NSDL, CAMS, KFintech)
   */
  public parseStatementText(fullText: string): CasImportResult {
    const isCdsl = /CDSL|Central Depository Services/i.test(fullText);
    const isNsdl = /NSDL|National Securities Depository/i.test(fullText);
    const isCams = /CAMS|Computer Age Management|KFintech/i.test(fullText);

    let depository: CasImportResult['depository'] = 'GENERIC';
    if (isCdsl) depository = 'CDSL';
    else if (isNsdl) depository = 'NSDL';
    else if (isCams) depository = 'CAMS_KFINTECH';

    // Extract Investor Name if possible
    let investorName: string | undefined;
    const nameMatch = fullText.match(/(?:Name of Holder|Holder Name|Dear\s+Mr\.\/Ms\.|Investor Name)[:\s]+([A-Z\s]{3,35})/i);
    if (nameMatch && nameMatch[1]) {
      investorName = nameMatch[1].trim();
    }

    // Extract PAN
    let panMasked: string | undefined;
    const panMatch = fullText.match(/\b([A-Z]{3}[PCHFATBLJG][A-Z]\d{4}[A-Z]|[A-Z*]{5}\d{3,4}[A-Z*])\b/i);
    if (panMatch && panMatch[1]) {
      panMasked = panMatch[1].toUpperCase();
    }

    // Extract statement date
    let statementDate: string | undefined;
    const dateMatch = fullText.match(/Statement (?:Period|as on|as of)[:\s]+([0-9A-Za-z\s,-]{8,25})/i);
    if (dateMatch && dateMatch[1]) {
      statementDate = dateMatch[1].trim();
    }

    const items: CasParsedItem[] = [];
    const seenIsins = new Set<string>();

    // 1. Regex to find Indian ISINs
    // Equities start with INE, Mutual Funds start with INF
    const isinRegex = /\b(IN[EF][0-9A-Z]{9})\b/g;
    let match: RegExpExecArray | null;

    while ((match = isinRegex.exec(fullText)) !== null) {
      const isin = (match[1] || '').toUpperCase();
      if (!isin || seenIsins.has(isin)) continue;
      seenIsins.add(isin);

      const startIndex = Math.max(0, match.index - 80);
      const endIndex = Math.min(fullText.length, match.index + 160);
      const snippet = fullText.substring(startIndex, endIndex);

      const isEquity = isin.startsWith('INE');

      // 1. Try explicit keyword matches in snippet
      const balMatch = snippet.match(/(?:Balance|Current Balance|Units|Qty|Quantity|Free Balance)[:\s]+(\d+(?:\.\d+)?)/i);
      const rateMatch = snippet.match(/(?:Rate|NAV|Price|Closing Price|Mkt Price)[:\s]+(\d+(?:\.\d+)?)/i);
      const valMatch = snippet.match(/(?:Value|Total Value|Amount|Valuation)[:\s]+(\d+(?:\.\d+)?)/i);

      let quantity = balMatch && balMatch[1] ? parseFloat(balMatch[1]) : 0;
      let navOrPrice = rateMatch && rateMatch[1] ? parseFloat(rateMatch[1]) : 0;
      let currentValue = valMatch && valMatch[1] ? parseFloat(valMatch[1]) : 0;

      // 2. Fallback to positional parsing if keyword match missing
      if (!quantity || !navOrPrice) {
        const numbersInSnippet = snippet
          .match(/\b\d+(?:\.\d{1,4})?\b/g)
          ?.map((n) => parseFloat(n))
          .filter((n) => !isNaN(n) && n > 0 && n !== 10 && n !== 1 && n !== 2) || [];

        if (numbersInSnippet.length >= 3) {
          const sorted = [...numbersInSnippet].sort((a, b) => b - a);
          currentValue = currentValue || (sorted[0] ?? 0);
          navOrPrice = navOrPrice || (sorted[1] ?? 0);
          quantity = quantity || (sorted[2] ?? 0);
        } else if (numbersInSnippet.length === 2) {
          const sorted = [...numbersInSnippet].sort((a, b) => b - a);
          currentValue = currentValue || (sorted[0] ?? 0);
          quantity = quantity || (sorted[1] ?? 0);
          navOrPrice = navOrPrice || (quantity > 0 ? Number((currentValue / quantity).toFixed(2)) : 0);
        } else if (numbersInSnippet.length === 1) {
          quantity = quantity || (numbersInSnippet[0] ?? 0);
        }
      }

      if (quantity > 0 && currentValue > 0 && !navOrPrice) {
        navOrPrice = Number((currentValue / quantity).toFixed(2));
      } else if (quantity > 0 && navOrPrice > 0 && !currentValue) {
        currentValue = Number((quantity * navOrPrice).toFixed(2));
      }

      if (!quantity || quantity <= 0) quantity = 1;

      const resolved = resolveIsinToTicker(isin);

      items.push({
        type: isEquity ? 'EQUITY' : 'MUTUAL_FUND',
        isin,
        name: resolved.name,
        quantity,
        navOrPrice: navOrPrice > 0 ? navOrPrice : undefined,
        currentValue: currentValue > 0 ? currentValue : undefined,
        resolvedTicker: isEquity ? resolved.ticker : undefined,
        exchange: resolved.exchange,
        selected: true
      });
    }

    // Calculate totals
    const stocksCount = items.filter((i) => i.type === 'EQUITY').length;
    const mutualFundsCount = items.filter((i) => i.type === 'MUTUAL_FUND').length;
    const totalImportedValue = items.reduce((acc, curr) => acc + (curr.currentValue || 0), 0);

    return {
      depository,
      statementDate: statementDate || new Date().toISOString().split('T')[0],
      investorName: investorName || 'Valued Investor',
      panMasked,
      totalParsedHoldings: items.length,
      stocksCount,
      mutualFundsCount,
      totalImportedValue,
      items
    };
  }

  /**
   * Persist parsed holdings directly into the user's Neon PostgreSQL portfolio
   */
  public async commitHoldingsToDatabase(userId: string, items: CasParsedItem[]): Promise<CasImportResult> {
    const portfolioId = await investmentsService.getOrCreateUserPortfolio(userId);
    const importedStockIds: string[] = [];
    const importedMutualFundIds: string[] = [];

    // Preload AMFI data for any mutual funds
    await marketDataService.loadAmfiNavData();

    for (const item of items) {
      if (!item.selected && item.selected !== undefined) continue;

      if (item.type === 'EQUITY') {
        const quote = item.resolvedTicker ? await marketDataService.getStockQuote(item.resolvedTicker) : null;
        const livePrice = quote?.price || item.navOrPrice || 100;
        const buyPrice = item.navOrPrice && item.navOrPrice > 0 ? item.navOrPrice : livePrice;

        const record = await prisma.stockHolding.create({
          data: {
            portfolioId,
            ticker: item.resolvedTicker || `${item.isin}.NS`,
            companyName: quote?.name || item.name,
            exchange: item.exchange || 'NSE',
            shares: item.quantity,
            averageCostPerShare: buyPrice,
            currentPrice: livePrice,
            currency: 'INR'
          }
        });
        importedStockIds.push(record.id);
      } else if (item.type === 'MUTUAL_FUND') {
        const amfi = await marketDataService.getMutualFundByCode(item.isin);
        const liveNav = amfi?.nav || item.navOrPrice || 100;
        const buyNav = item.navOrPrice && item.navOrPrice > 0 ? item.navOrPrice : liveNav;

        const record = await prisma.mutualFundHolding.create({
          data: {
            portfolioId,
            schemeCode: item.isin,
            fundName: amfi?.schemeName || item.name,
            fundFamily: amfi?.fundFamily || 'Mutual Fund',
            fundType: 'Equity',
            units: item.quantity,
            averageNav: buyNav,
            currentNav: liveNav,
            currency: 'INR'
          }
        });
        importedMutualFundIds.push(record.id);
      }
    }

    return {
      totalParsedHoldings: items.length,
      stocksCount: importedStockIds.length,
      mutualFundsCount: importedMutualFundIds.length,
      totalImportedValue: items.reduce((acc, curr) => acc + (curr.currentValue || 0), 0),
      items,
      importedStockIds,
      importedMutualFundIds
    };
  }

  /**
   * Generates a sample CDSL / NSDL CAS text for quick demonstration
   */
  public getSampleCdslStatementText(): string {
    return `
CENTRAL DEPOSITORY SERVICES (INDIA) LIMITED - CDSL
CONSOLIDATED ACCOUNT STATEMENT (CAS)
Statement as on 31-Oct-2026
Dear Investor: PRANESH K
PAN: ABCPK****F
Demat Account / BO ID: 1208160012345678
Depository Participant: ZERODHA BROKING LIMITED

EQUITY SHARES / DEMAT HOLDINGS:
ISIN: INE002A01018 - RELIANCE INDUSTRIES LTD - Current Balance: 25.000 - Rate: 1311.00 - Value: 32775.00
ISIN: INE009A01021 - INFOSYS LIMITED - Current Balance: 40.000 - Rate: 1620.50 - Value: 64820.00
ISIN: INE040A01034 - HDFC BANK LIMITED - Current Balance: 50.000 - Rate: 1740.00 - Value: 87000.00
ISIN: INE155A01022 - TATA MOTORS LIMITED - Current Balance: 60.000 - Rate: 780.20 - Value: 46812.00
ISIN: INE467B01029 - TATA CONSULTANCY SERVICES LTD - Current Balance: 15.000 - Rate: 3950.00 - Value: 59250.00
ISIN: INE062A01020 - STATE BANK OF INDIA - Current Balance: 80.000 - Rate: 810.00 - Value: 64800.00

MUTUAL FUND FOLIO HOLDINGS (CAMS / KFINTECH):
ISIN: INF209KB14W9 - NIPPON INDIA ETF NIFTY BEES - Units: 150.000 - NAV: 260.50 - Value: 39075.00
ISIN: INF209KB14Y5 - NIPPON INDIA ETF GOLD BEES - Units: 200.000 - NAV: 65.20 - Value: 13040.00
ISIN: INF109K012R6 - ICICI PRUDENTIAL BLUECHIP FUND - Units: 350.500 - NAV: 98.40 - Value: 34489.20
    `.trim();
  }
}

export const casParserService = new CasParserService();
