import { describe, it, expect } from 'vitest';
import { calculateFinalPrice } from '../calculationEngine';
import { calculateMaxBidFromBudget } from '../reverseCalculator';
import { PLATFORMS_CONFIG } from '../../config/platforms';

describe('FinalPrice Calculation Engine', () => {
  const aucorPlatform = PLATFORMS_CONFIG.find((p) => p.id === 'aucor')!;
  const yagaPlatform = PLATFORMS_CONFIG.find((p) => p.id === 'yaga')!;

  it('correctly calculates Aucor vehicle final price including 6% BP, R2600 doc fee, and 15% VAT', () => {
    // (100,000 + 6,000 + 2,600) * 1.15 = 108,600 * 1.15 = 124,890
    const result = calculateFinalPrice({
      platform: aucorPlatform,
      baseAmount: 100000,
    });

    expect(result.baseAmount).toBe(100000);
    expect(result.subtotal).toBe(108600);
    expect(result.taxAmount).toBe(16290);
    expect(result.totalFinalPrice).toBe(124890);
  });

  it('correctly calculates Yaga checkout with 6.5% protection, R19.90 fixed fee, and delivery', () => {
    // 450 + (450 * 0.065 = 29.25) + 19.90 + 60 = 559.15
    const result = calculateFinalPrice({
      platform: yagaPlatform,
      baseAmount: 450,
      secondaryAmounts: { deliveryFee: 60 },
    });

    expect(result.baseAmount).toBe(450);
    expect(result.totalFinalPrice).toBeCloseTo(559.15, 2);
  });

  it('supports dynamic rate overrides for Aucor if fee schedules change', () => {
    // Overriding BP to 8% and Doc fee to R3000
    // (100,000 + 8,000 + 3,000) * 1.15 = 111,000 * 1.15 = 127,650
    const result = calculateFinalPrice({
      platform: aucorPlatform,
      baseAmount: 100000,
      activeRuleOverrides: {
        buyers_premium: 0.08,
        doc_fee: 3000,
      },
    });

    expect(result.totalFinalPrice).toBe(127650);
  });

  it('correctly solves the reverse budget problem for Aucor bids', () => {
    // Given a total budget of R124,890, the maximum bid should be exactly R100,000
    const maxBid = calculateMaxBidFromBudget({
      platform: aucorPlatform,
      targetBudget: 124890,
    });

    expect(maxBid).toBeCloseTo(100000, 0);

    const verifiedResult = calculateFinalPrice({
      platform: aucorPlatform,
      baseAmount: maxBid,
    });
    expect(verifiedResult.totalFinalPrice).toBeLessThanOrEqual(124890);
  });

  it('gracefully handles 0 base amount without NaN or negative values', () => {
    const result = calculateFinalPrice({
      platform: aucorPlatform,
      baseAmount: 0,
    });

    expect(Number.isNaN(result.totalFinalPrice)).toBe(false);
    expect(result.totalFinalPrice).toBeGreaterThanOrEqual(0);
  });
});
