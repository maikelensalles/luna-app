import type { Quote } from '../types/database';

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diffMs = date.getTime() - start.getTime();
  return Math.floor(diffMs / 86_400_000);
}

export function getQuoteOfDay(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) return null;
  return quotes[getDayOfYear(new Date()) % quotes.length];
}
