import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { optionalAuthenticate } from '../../core/middleware/authenticate';

const router = Router();

// Apply optional authentication to all dashboard routes
router.use(optionalAuthenticate);

// Overview and Net Worth
router.get('/summary', (req, res, next) => dashboardController.getSummary(req, res, next));
router.get('/net-worth-history', (req, res, next) => dashboardController.getNetWorthHistory(req, res, next));

// Allocations & Breakdown
router.get('/asset-allocation', (req, res, next) => dashboardController.getAssetAllocation(req, res, next));
router.get('/liability-allocation', (req, res, next) => dashboardController.getLiabilityAllocation(req, res, next));
router.get('/cash-flow', (req, res, next) => dashboardController.getCashFlow(req, res, next));
router.get('/portfolio-summary', (req, res, next) => dashboardController.getPortfolioSummary(req, res, next));

// Accounts & Transactions
router.get('/accounts', (req, res, next) => dashboardController.getAccountsOverview(req, res, next));
router.get('/transactions', (req, res, next) => dashboardController.getRecentTransactions(req, res, next));
router.get('/spending-breakdown', (req, res, next) => dashboardController.getSpendingBreakdown(req, res, next));

// Health, Schedule & AI Insights
router.get('/financial-health', (req, res, next) => dashboardController.getFinancialHealth(req, res, next));
router.get('/upcoming-events', (req, res, next) => dashboardController.getUpcomingEvents(req, res, next));
router.get('/insights', (req, res, next) => dashboardController.getInsights(req, res, next));

// Interactive Mutations & Customization
router.post('/quick-add', (req, res, next) => dashboardController.quickAdd(req, res, next));
router.get('/preferences', (req, res, next) => dashboardController.getPreferences(req, res, next));
router.put('/preferences', (req, res, next) => dashboardController.updatePreferences(req, res, next));

// Development and Testing state toggles
router.post('/reset', (req, res, next) => dashboardController.resetData(req, res, next));
router.post('/seed', (req, res, next) => dashboardController.seedSampleData(req, res, next));

export const dashboardRouter = router;
