import { calculateFinalPrice } from './calculationEngine';
import type { PlatformConfig } from '../types/platform';

interface ReverseBudgetOptions {
  platform: PlatformConfig;
  targetBudget: number;
  secondaryAmounts?: Record<string, number>;
  activeRuleOverrides?: Record<string, number>;
  disabledRuleIds?: string[];
}

/**
 * Universal binary search solver to calculate maximum base price for a given target budget.
 */
export function calculateMaxBidFromBudget(options: ReverseBudgetOptions): number {
  const { platform, targetBudget, secondaryAmounts, activeRuleOverrides, disabledRuleIds } = options;

  if (targetBudget <= 0) {
    return 0;
  }

  let lowBound = 0;
  let highBound = targetBudget;
  let bestBid = 0;

  // 30 iterations gives sub-cent precision for budgets up to R100,000,000
  for (let iteration = 0; iteration < 30; iteration++) {
    const midCandidate = (lowBound + highBound) / 2;
    const testResult = calculateFinalPrice({
      platform,
      baseAmount: midCandidate,
      secondaryAmounts,
      activeRuleOverrides,
      disabledRuleIds,
    });

    if (testResult.totalFinalPrice <= targetBudget) {
      bestBid = midCandidate;
      lowBound = midCandidate;
    } else {
      highBound = midCandidate;
    }
  }

  return Math.floor(bestBid * 100) / 100;
}
