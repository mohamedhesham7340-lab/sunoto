export type CurrencyCode = 'EGP' | 'USD' | 'SAR' | 'AED';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EGP: 'ج.م',
  USD: '$',
  SAR: 'ر.س',
  AED: 'د.إ'
};

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  EGP: 'جنيه مصري (EGP)',
  USD: 'دولار أمريكي (USD)',
  SAR: 'ريال سعودي (SAR)',
  AED: 'درهم إماراتي (AED)'
};

export function formatPrice(
  amountInEgp: number,
  targetCurrency: CurrencyCode = 'EGP',
  exchangeRates: Record<string, number> = { EGP: 1, USD: 0.02, SAR: 0.076, AED: 0.074 }
): string {
  const rate = exchangeRates[targetCurrency] || 1;
  const converted = amountInEgp * rate;
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || 'ج.م';
  
  return `${new Intl.NumberFormat('ar-EG', {
    maximumFractionDigits: targetCurrency === 'EGP' ? 0 : 2,
    minimumFractionDigits: targetCurrency === 'EGP' ? 0 : 2
  }).format(converted)} ${symbol}`;
}

export function convertAmount(
  amountInEgp: number,
  targetCurrency: CurrencyCode = 'EGP',
  exchangeRates: Record<string, number> = { EGP: 1, USD: 0.02, SAR: 0.076, AED: 0.074 }
): number {
  const rate = exchangeRates[targetCurrency] || 1;
  return amountInEgp * rate;
}
