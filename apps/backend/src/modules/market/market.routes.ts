import { Router } from 'express';
import { marketController } from './market.controller';

const router = Router();

// Market Indices
router.get('/indices', marketController.getMarketIndices.bind(marketController));

// AMFI Mutual Funds
router.get('/mutual-funds/search', marketController.searchMutualFunds.bind(marketController));
router.get('/mutual-funds/:code', marketController.getMutualFundByCode.bind(marketController));

// Stocks & Equities
router.get('/stocks/search', marketController.searchStocks.bind(marketController));
router.get('/stocks/quote/:symbol', marketController.getStockQuote.bind(marketController));

// Precious Metals (Gold / Silver in INR)
router.get('/commodities/gold-silver', marketController.getPreciousMetals.bind(marketController));

// Crypto Rates
router.get('/crypto/rates', marketController.getCryptoRates.bind(marketController));

export default router;
