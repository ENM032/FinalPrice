/**
 * Safely parses string or number input to a non-negative float.
 */
export function sanitizeNumericInput(rawValue: string | number): number {
  if (typeof rawValue === 'number') {
    if (Number.isNaN(rawValue) || rawValue < 0) {
      return 0;
    }
    return rawValue;
  }

  const cleanedString = rawValue.replace(/[^0-9.-]+/g, '');
  const parsedFloat = parseFloat(cleanedString);

  if (Number.isNaN(parsedFloat) || parsedFloat < 0) {
    return 0;
  }

  return parsedFloat;
}

/**
 * Formats a number as a localized currency string (default South African Rand).
 */
export function formatCurrency(
  amount: number,
  currencySymbol = 'R',
  maximumFractionDigits = 2
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formattedNumber = safeAmount.toLocaleString('en-ZA', {
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits,
  });

  return `${currencySymbol} ${formattedNumber}`;
}

/**
 * Formats a decimal fraction to a percentage string (e.g. 0.06 -> 6%).
 */
export function formatPercentage(rate: number): string {
  const percentage = rate * 100;
  const hasDecimals = percentage % 1 !== 0;
  return `${percentage.toFixed(hasDecimals ? 1 : 0)}%`;
}
