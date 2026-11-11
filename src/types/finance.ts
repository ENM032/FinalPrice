export type FinanceAssetCategory = 'vehicle' | 'home' | 'item';

export interface FinanceTermPreset {
  label: string;
  months: number;
}

export interface DepositPreset {
  label: string;
  percentage: number;
}

export interface BalloonPreset {
  label: string;
  percentage: number;
}

export interface FinancePresetConfig {
  id: FinanceAssetCategory;
  name: string;
  tagline: string;
  iconName: string;
  defaultPrice: number;
  defaultRate: number; // Annual % e.g. 11.75
  defaultMonths: number;
  termPresets: FinanceTermPreset[];
  depositPresets: DepositPreset[];
  balloonAllowed: boolean;
  balloonPresets?: BalloonPreset[];
  defaultInitiationFee: number;
  defaultMonthlyServiceFee: number;
  description: string;
}

export interface FinanceCalculationInput {
  purchasePrice: number;
  depositAmount: number;
  annualInterestRate: number;
  loanTermMonths: number;
  balloonPercentage: number;
  initiationFee: number;
  monthlyServiceFee: number;
  capitalizeInitiationFee: boolean;
}

export interface AmortizationYearPoint {
  year: number;
  startingBalance: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface FinanceCalculationResult {
  purchasePrice: number;
  depositAmount: number;
  financedPrincipal: number;
  monthlyInstallment: number;
  monthlyServiceFee: number;
  totalMonthlyPayment: number;
  balloonAmount: number;
  totalInterestPaid: number;
  totalLoanCost: number;
  totalOverallOutflow: number;
  yearlySchedule: AmortizationYearPoint[];
}
