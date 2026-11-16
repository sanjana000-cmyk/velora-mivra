export type CurrencyCode = 'USD' | 'INR';

export const USD_TO_INR_RATE = 80;

export function formatPrice(amountInUsd: number, currency: CurrencyCode = 'USD'): string {
  if (amountInUsd === 0) return 'Free';
  if (currency === 'INR') {
    return `₹${Math.round(amountInUsd * USD_TO_INR_RATE).toLocaleString('en-IN')}`;
  }
  return `$${Math.round(amountInUsd * 100) / 100}`;
}

export function formatAlternatePrice(
  amountInUsd: number,
  activeCurrency: CurrencyCode = 'USD'
): string {
  if (amountInUsd === 0) return '';
  const altCurrency: CurrencyCode = activeCurrency === 'USD' ? 'INR' : 'USD';
  return formatPrice(amountInUsd, altCurrency);
}

export function fromBaseUsd(amountInUsd: number, currency: CurrencyCode): number {
  if (currency === 'INR') {
    return Math.round(amountInUsd * USD_TO_INR_RATE);
  }
  return amountInUsd;
}

export function toBaseUsd(displayAmount: number, currency: CurrencyCode): number {
  if (currency === 'INR') {
    return Math.round((displayAmount / USD_TO_INR_RATE) * 100) / 100;
  }
  return displayAmount;
}
