import type { FinancePresetConfig } from '../types/finance';

export const FINANCE_PRESETS: FinancePresetConfig[] = [
  {
    id: 'vehicle',
    name: 'Vehicle Finance',
    tagline: 'Cars, bakkies, motorbikes & commercial vehicles',
    iconName: 'Car',
    defaultPrice: 250000,
    defaultRate: 12.5,
    defaultMonths: 72,
    defaultInitiationFee: 1207.50,
    defaultMonthlyServiceFee: 69.00,
    description: 'Standard South African vehicle installment sale agreement with optional residual balloon.',
    termPresets: [
      { label: '36 mo (3 yrs)', months: 36 },
      { label: '48 mo (4 yrs)', months: 48 },
      { label: '60 mo (5 yrs)', months: 60 },
      { label: '72 mo (6 yrs)', months: 72 },
    ],
    depositPresets: [
      { label: '0%', percentage: 0 },
      { label: '10%', percentage: 10 },
      { label: '20%', percentage: 20 },
      { label: '30%', percentage: 30 },
    ],
    balloonAllowed: true,
    balloonPresets: [
      { label: 'No Balloon', percentage: 0 },
      { label: '15% Balloon', percentage: 15 },
      { label: '25% Balloon', percentage: 25 },
      { label: '35% Balloon', percentage: 35 },
    ],
  },
  {
    id: 'home',
    name: 'Home Loan / Bond',
    tagline: 'Residential properties, houses, apartments & land',
    iconName: 'Home',
    defaultPrice: 1500000,
    defaultRate: 11.75, // SA prime
    defaultMonths: 240, // 20 years
    defaultInitiationFee: 6037.50, // NCA home loan initiation fee cap
    defaultMonthlyServiceFee: 69.00,
    description: 'Mortgage bond amortization over long-term residential property horizons.',
    termPresets: [
      { label: '10 yrs', months: 120 },
      { label: '15 yrs', months: 180 },
      { label: '20 yrs', months: 240 },
      { label: '25 yrs', months: 300 },
      { label: '30 yrs', months: 360 },
    ],
    depositPresets: [
      { label: '0%', percentage: 0 },
      { label: '5%', percentage: 5 },
      { label: '10%', percentage: 10 },
      { label: '15%', percentage: 15 },
      { label: '20%', percentage: 20 },
    ],
    balloonAllowed: false,
  },
  {
    id: 'item',
    name: 'General Items & Assets',
    tagline: 'Equipment, electronics, furniture & retail goods',
    iconName: 'Package',
    defaultPrice: 35000,
    defaultRate: 15.0,
    defaultMonths: 24,
    defaultInitiationFee: 500.00,
    defaultMonthlyServiceFee: 45.00,
    description: 'Asset finance, revolving credit, or term loan for equipment and valuable retail purchases.',
    termPresets: [
      { label: '6 mo', months: 6 },
      { label: '12 mo', months: 12 },
      { label: '24 mo', months: 24 },
      { label: '36 mo', months: 36 },
      { label: '48 mo', months: 48 },
    ],
    depositPresets: [
      { label: '0%', percentage: 0 },
      { label: '10%', percentage: 10 },
      { label: '25%', percentage: 25 },
      { label: '50%', percentage: 50 },
    ],
    balloonAllowed: false,
  },
];
