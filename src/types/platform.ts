export type FeeCalculationType = 'percentage' | 'fixed' | 'compound_tax';

export interface FeeRule {
  id: string;
  name: string;
  type: FeeCalculationType;
  rate?: number; // e.g. 0.06 for 6%
  amount?: number; // e.g. 2600 for R2600
  target: 'base' | 'subtotal';
  editable: boolean;
  description: string;
  enabledByDefault: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export interface PresetOption {
  label: string;
  value: number;
  description?: string;
}

export interface PlatformInputField {
  id: string;
  label: string;
  placeholder: string;
  defaultValue: number;
  min?: number;
  step?: number;
  quickIncrements?: number[];
  presets?: PresetOption[];
}

export interface PlatformConfig {
  id: string;
  name: string;
  category: 'auction' | 'marketplace' | 'custom';
  tagline: string;
  iconName: string;
  accentColor: string;
  currencySymbol: string;
  currencyCode: string;
  primaryInput: PlatformInputField;
  secondaryInputs?: PlatformInputField[];
  vatApplicable: boolean;
  defaultVatRate: number; // 0.15 for 15%
  rules: FeeRule[];
  disclaimer: string;
}

export interface LineItemBreakdown {
  id: string;
  name: string;
  amount: number;
  percentageRate?: number;
  type: FeeCalculationType | 'base' | 'delivery' | 'tax';
  description?: string;
}

export interface CalculationResult {
  baseAmount: number;
  subtotal: number;
  taxAmount: number;
  totalFinalPrice: number;
  lineItems: LineItemBreakdown[];
  effectiveFeePercentage: number;
}

export type PlatformOverrides = Record<string, Partial<FeeRule>>;
export type AllOverrides = Record<string, PlatformOverrides>;
