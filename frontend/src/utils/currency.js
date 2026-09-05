export const CURRENCY_SYMBOL = 'Rs.';

export function formatLKR(n) {
  const val = Number(n || 0);
  return `${CURRENCY_SYMBOL} ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatLKRFixed(n) {
  const val = Number(n || 0);
  return `${CURRENCY_SYMBOL} ${val.toLocaleString('en-IN')}`;
}
