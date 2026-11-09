import type {
  CalculationResult,
  FeeRule,
  LineItemBreakdown,
  PlatformConfig,
} from '../types/platform';

interface CalculateOptions {
  platform: PlatformConfig;
  baseAmount: number;
  secondaryAmounts?: Record<string, number>;
  activeRuleOverrides?: Record<string, number>;
  disabledRuleIds?: string[];
}

function resolveRuleRateOrAmount(
  rule: FeeRule,
  overrides?: Record<string, number>
): { rate?: number; amount?: number } {
  const overriddenValue = overrides?.[rule.id];
  if (overriddenValue !== undefined) {
    if (rule.type === 'percentage' || rule.type === 'compound_tax') {
      return { rate: overriddenValue };
    }
    return { amount: overriddenValue };
  }
  return { rate: rule.rate, amount: rule.amount };
}

function processBaseFeeRule(
  rule: FeeRule,
  baseAmount: number,
  overrides?: Record<string, number>
): LineItemBreakdown | null {
  const { rate, amount } = resolveRuleRateOrAmount(rule, overrides);

  if (rule.type === 'percentage' && rate !== undefined) {
    const feeValue = baseAmount * rate;
    return {
      id: rule.id,
      name: rule.name,
      amount: feeValue,
      percentageRate: rate,
      type: 'percentage',
      description: rule.description,
    };
  }

  if (rule.type === 'fixed' && amount !== undefined) {
    return {
      id: rule.id,
      name: rule.name,
      amount,
      type: 'fixed',
      description: rule.description,
    };
  }

  return null;
}

function processTaxRule(
  rule: FeeRule,
  subtotal: number,
  overrides?: Record<string, number>
): LineItemBreakdown | null {
  const { rate } = resolveRuleRateOrAmount(rule, overrides);
  if (rate === undefined || rate <= 0) {
    return null;
  }

  return {
    id: rule.id,
    name: rule.name,
    amount: subtotal * rate,
    percentageRate: rate,
    type: 'compound_tax',
    description: rule.description,
  };
}

export function calculateFinalPrice(options: CalculateOptions): CalculationResult {
  const { platform, baseAmount, secondaryAmounts = {}, activeRuleOverrides = {}, disabledRuleIds = [] } = options;
  const lineItems: LineItemBreakdown[] = [];

  lineItems.push({
    id: 'base_amount',
    name: platform.primaryInput.label,
    amount: baseAmount,
    type: 'base',
  });

  const activeRules = platform.rules.filter((rule) => !disabledRuleIds.includes(rule.id));
  const baseRules = activeRules.filter((rule) => rule.target === 'base');

  for (const rule of baseRules) {
    const item = processBaseFeeRule(rule, baseAmount, activeRuleOverrides);
    if (item) {
      lineItems.push(item);
    }
  }

  // Include secondary inputs such as delivery fees
  let totalSecondary = 0;
  for (const [key, amount] of Object.entries(secondaryAmounts)) {
    if (amount > 0) {
      totalSecondary += amount;
      lineItems.push({
        id: `secondary_${key}`,
        name: platform.secondaryInputs?.find((input) => input.id === key)?.label || 'Additional Fee',
        amount,
        type: 'delivery',
      });
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  // Apply compound tax / VAT rules (e.g. Aucor 15% VAT on subtotal)
  let totalTax = 0;
  const taxRules = activeRules.filter((rule) => rule.type === 'compound_tax');
  for (const rule of taxRules) {
    const taxItem = processTaxRule(rule, subtotal, activeRuleOverrides);
    if (taxItem) {
      totalTax += taxItem.amount;
      lineItems.push(taxItem);
    }
  }

  const totalFinalPrice = subtotal + totalTax;
  const totalExtraFees = totalFinalPrice - baseAmount;
  const effectiveFeePercentage = baseAmount > 0 ? (totalExtraFees / baseAmount) * 100 : 0;

  return {
    baseAmount,
    subtotal,
    taxAmount: totalTax,
    totalFinalPrice,
    lineItems,
    effectiveFeePercentage,
  };
}
