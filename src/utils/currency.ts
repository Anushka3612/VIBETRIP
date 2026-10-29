import { CurrencyCode } from '../types/trip';

// Approximate baseline exchange rates from INR
export const EXCHANGE_RATES: Record<CurrencyCode, { symbol: string; rateFromINR: number; label: string }> = {
  INR: { symbol: '₹', rateFromINR: 1, label: 'INR (₹)' },
  USD: { symbol: '$', rateFromINR: 0.012, label: 'USD ($)' },
  EUR: { symbol: '€', rateFromINR: 0.011, label: 'EUR (€)' },
  GBP: { symbol: '£', rateFromINR: 0.0095, label: 'GBP (£)' },
};

export function convertFromINR(amountINR: number, currency: CurrencyCode): number {
  if (!amountINR || isNaN(amountINR)) return 0;
  const rate = EXCHANGE_RATES[currency]?.rateFromINR || 1;
  const converted = amountINR * rate;
  return currency === 'INR' ? Math.round(converted) : Math.round(converted * 10) / 10;
}

export function formatCurrency(amountINR: number, currency: CurrencyCode = 'INR'): string {
  const meta = EXCHANGE_RATES[currency] || EXCHANGE_RATES.INR;
  const val = convertFromINR(amountINR, currency);
  
  if (currency === 'INR') {
    return `${meta.symbol}${val.toLocaleString('en-IN')}`;
  }
  return `${meta.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
}
