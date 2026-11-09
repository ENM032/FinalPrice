import { formatCurrency, formatPercentage } from './currency';
import type { CalculationResult, PlatformConfig } from '../types/platform';

export function generateShareUrl(platformId: string, baseAmount: number): string {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('platform', platformId);
  currentUrl.searchParams.set('amount', baseAmount.toString());
  return currentUrl.toString();
}

export function parseSharedUrlParams(): { platformId?: string; amount?: number } {
  try {
    const params = new URLSearchParams(window.location.search);
    const platformId = params.get('platform') || undefined;
    const amountStr = params.get('amount');
    const amount = amountStr ? parseFloat(amountStr) : undefined;
    return { platformId, amount: amount && !Number.isNaN(amount) ? amount : undefined };
  } catch {
    return {};
  }
}

export function formatBreakdownText(
  platform: PlatformConfig,
  result: CalculationResult
): string {
  const lines: string[] = [
    `🧾 FinalPrice Breakdown for ${platform.name}`,
    `----------------------------------------`,
    `${platform.primaryInput.label}: ${formatCurrency(result.baseAmount, platform.currencySymbol)}`,
  ];

  for (const item of result.lineItems) {
    if (item.type === 'base') continue;
    const rateNote = item.percentageRate ? ` (${formatPercentage(item.percentageRate)})` : '';
    lines.push(`+ ${item.name}${rateNote}: ${formatCurrency(item.amount, platform.currencySymbol)}`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`🎯 Final Total Price: ${formatCurrency(result.totalFinalPrice, platform.currencySymbol)}`);
  lines.push(`Effective platform fee: +${result.effectiveFeePercentage.toFixed(1)}%`);
  lines.push(`Calculated via FinalPrice: ${window.location.origin}`);

  return lines.join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
