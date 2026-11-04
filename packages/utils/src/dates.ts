import { BudgetPeriod } from '@finance/types';

/**
 * Returns { startDate, endDate } in ISO format for a specified budget period
 */
export function getDateRangeForPeriod(
  period: BudgetPeriod,
  refDate: Date = new Date()
): { startDate: string; endDate: string } {
  const d = new Date(refDate);

  if (period === 'WEEKLY') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  if (period === 'MONTHLY') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  if (period === 'QUARTERLY') {
    const quarter = Math.floor(d.getMonth() / 3);
    const start = new Date(d.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  // ANNUAL
  const start = new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export function isDateInFuture(dateString: string): boolean {
  return new Date(dateString).getTime() > Date.now();
}

