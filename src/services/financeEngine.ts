import type {
  AmortizationYearPoint,
  FinanceCalculationInput,
  FinanceCalculationResult,
} from '../types/finance';

function calculateMonthlyInstallment(
  principalAmount: number,
  monthlyRate: number,
  loanTermMonths: number,
  balloonAmount: number
): number {
  if (loanTermMonths <= 0) return 0;
  if (principalAmount <= 0) return 0;

  if (monthlyRate === 0) {
    return Math.max(0, (principalAmount - balloonAmount) / loanTermMonths);
  }

  const discountFactor = Math.pow(1 + monthlyRate, -loanTermMonths);
  const presentValueOfBalloon = balloonAmount * discountFactor;
  const netFinancedAmount = principalAmount - presentValueOfBalloon;
  const annuityFactor = (1 - discountFactor) / monthlyRate;

  return netFinancedAmount / annuityFactor;
}

function computeYearlySchedule(
  financedPrincipal: number,
  monthlyRate: number,
  loanTermMonths: number,
  monthlyInstallment: number
): AmortizationYearPoint[] {
  const yearlySchedule: AmortizationYearPoint[] = [];
  let currentBalance = financedPrincipal;
  let accumulatedYearPrincipal = 0;
  let accumulatedYearInterest = 0;
  let yearStartingBalance = currentBalance;

  for (let month = 1; month <= loanTermMonths; month++) {
    const monthlyInterestCharge = currentBalance * monthlyRate;
    const monthlyPrincipalPayment = Math.min(
      currentBalance,
      monthlyInstallment - monthlyInterestCharge
    );

    accumulatedYearInterest += monthlyInterestCharge;
    accumulatedYearPrincipal += monthlyPrincipalPayment;
    currentBalance = Math.max(0, currentBalance - monthlyPrincipalPayment);

    const isYearEnd = month % 12 === 0 || month === loanTermMonths;
    if (isYearEnd) {
      yearlySchedule.push({
        year: Math.ceil(month / 12),
        startingBalance: yearStartingBalance,
        principalPaid: accumulatedYearPrincipal,
        interestPaid: accumulatedYearInterest,
        endingBalance: currentBalance,
      });

      yearStartingBalance = currentBalance;
      accumulatedYearPrincipal = 0;
      accumulatedYearInterest = 0;
    }
  }

  return yearlySchedule;
}

export function calculateFinance(input: FinanceCalculationInput): FinanceCalculationResult {
  const {
    purchasePrice,
    depositAmount,
    annualInterestRate,
    loanTermMonths,
    balloonPercentage,
    initiationFee,
    monthlyServiceFee,
    capitalizeInitiationFee,
  } = input;

  const validDeposit = Math.min(purchasePrice, Math.max(0, depositAmount));
  const baseFinanced = Math.max(0, purchasePrice - validDeposit);
  const financedPrincipal = capitalizeInitiationFee ? baseFinanced + initiationFee : baseFinanced;
  const balloonAmount = purchasePrice * (Math.max(0, balloonPercentage) / 100);

  const monthlyRate = annualInterestRate > 0 ? annualInterestRate / 100 / 12 : 0;
  const monthlyInstallment = calculateMonthlyInstallment(
    financedPrincipal,
    monthlyRate,
    loanTermMonths,
    balloonAmount
  );

  const totalMonthlyPayment = monthlyInstallment + monthlyServiceFee;
  const totalInstallmentsPaid = monthlyInstallment * loanTermMonths;
  const totalInterestPaid = Math.max(0, totalInstallmentsPaid + balloonAmount - financedPrincipal);
  const upfrontInitiationPaid = capitalizeInitiationFee ? 0 : initiationFee;
  const totalServiceFeesPaid = monthlyServiceFee * loanTermMonths;

  const totalLoanCost = totalInstallmentsPaid + balloonAmount + totalServiceFeesPaid + upfrontInitiationPaid;
  const totalOverallOutflow = validDeposit + totalLoanCost;

  const yearlySchedule = computeYearlySchedule(
    financedPrincipal,
    monthlyRate,
    loanTermMonths,
    monthlyInstallment
  );

  return {
    purchasePrice,
    depositAmount: validDeposit,
    financedPrincipal,
    monthlyInstallment,
    monthlyServiceFee,
    totalMonthlyPayment,
    balloonAmount,
    totalInterestPaid,
    totalLoanCost,
    totalOverallOutflow,
    yearlySchedule,
  };
}
