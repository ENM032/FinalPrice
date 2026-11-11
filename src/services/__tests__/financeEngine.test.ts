import { describe, it, expect } from 'vitest';
import { calculateFinance } from '../financeEngine';

describe('Finance Calculation Engine', () => {
  it('correctly calculates vehicle finance without balloon payment', () => {
    const result = calculateFinance({
      purchasePrice: 250000,
      depositAmount: 0,
      annualInterestRate: 12.0,
      loanTermMonths: 72,
      balloonPercentage: 0,
      initiationFee: 0,
      monthlyServiceFee: 0,
      capitalizeInitiationFee: false,
    });

    // Monthly installment for 250k @ 12% over 72 months is exactly 4887.55
    expect(result.monthlyInstallment).toBeCloseTo(4887.55, 1);
    expect(result.financedPrincipal).toBe(250000);
    expect(result.balloonAmount).toBe(0);
    expect(result.totalInterestPaid).toBeGreaterThan(100000);
  });

  it('correctly calculates vehicle finance with a 20% balloon payment', () => {
    const result = calculateFinance({
      purchasePrice: 250000,
      depositAmount: 0,
      annualInterestRate: 12.0,
      loanTermMonths: 72,
      balloonPercentage: 20, // R50,000 balloon
      initiationFee: 0,
      monthlyServiceFee: 0,
      capitalizeInitiationFee: false,
    });

    expect(result.balloonAmount).toBe(50000);
    // With a balloon payment, monthly installments are lower (4410.04)
    expect(result.monthlyInstallment).toBeLessThan(4887.55);
    expect(result.monthlyInstallment).toBeCloseTo(4410.04, 1);
  });

  it('correctly calculates home loan / mortgage with 10% deposit', () => {
    const result = calculateFinance({
      purchasePrice: 1500000,
      depositAmount: 150000,
      annualInterestRate: 11.75,
      loanTermMonths: 240, // 20 years
      balloonPercentage: 0,
      initiationFee: 0,
      monthlyServiceFee: 69,
      capitalizeInitiationFee: false,
    });

    expect(result.depositAmount).toBe(150000);
    expect(result.financedPrincipal).toBe(1350000);
    // R1,350,000 @ 11.75% over 20 years is exactly 14630.05 per month + R69 fee
    expect(result.monthlyInstallment).toBeCloseTo(14630.05, 1);
    expect(result.totalMonthlyPayment).toBeCloseTo(14630.05 + 69, 1);
    expect(result.yearlySchedule.length).toBe(20);
  });

  it('handles 0% interest rate without divide-by-zero errors', () => {
    const result = calculateFinance({
      purchasePrice: 12000,
      depositAmount: 0,
      annualInterestRate: 0,
      loanTermMonths: 12,
      balloonPercentage: 0,
      initiationFee: 0,
      monthlyServiceFee: 0,
      capitalizeInitiationFee: false,
    });

    expect(result.monthlyInstallment).toBe(1000);
    expect(result.totalInterestPaid).toBe(0);
    expect(result.totalOverallOutflow).toBe(12000);
  });

  it('correctly adds capitalized initiation fee into financed principal', () => {
    const result = calculateFinance({
      purchasePrice: 100000,
      depositAmount: 0,
      annualInterestRate: 10,
      loanTermMonths: 24,
      balloonPercentage: 0,
      initiationFee: 1200,
      monthlyServiceFee: 0,
      capitalizeInitiationFee: true,
    });

    expect(result.financedPrincipal).toBe(101200);
  });
});
