import React from 'react';
import { sanitizeNumericInput, formatCurrency } from '../../utils/currency';
import type { FinanceCalculationInput, FinancePresetConfig } from '../../types/finance';

interface FinanceInputCardProps {
  preset: FinancePresetConfig;
  input: FinanceCalculationInput;
  onChange: (updated: Partial<FinanceCalculationInput>) => void;
}

export const FinanceInputCard: React.FC<FinanceInputCardProps> = ({ preset, input, onChange }) => {
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = sanitizeNumericInput(event.target.value);
    onChange({ purchasePrice: newPrice });
  };

  const handleDepositPercentage = (percentage: number) => {
    const calculatedDeposit = Math.round(input.purchasePrice * (percentage / 100));
    onChange({ depositAmount: calculatedDeposit });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Purchase Price Input */}
      <div>
        <label htmlFor="purchase-price" className="text-sm font-semibold text-slate-200 block mb-2">
          Purchase Price / Asset Value
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 font-mono font-bold text-xl sm:text-2xl text-emerald-400 select-none">
            R
          </span>
          <input
            id="purchase-price"
            type="text"
            inputMode="decimal"
            value={input.purchasePrice === 0 ? '' : input.purchasePrice}
            onChange={handlePriceChange}
            placeholder="e.g. 250000"
            className="w-full bg-slate-950 border-2 border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 rounded-2xl py-3.5 pl-12 pr-4 text-xl sm:text-3xl font-mono font-bold text-white tracking-tight tabular-nums focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Deposit Input & Presets */}
      <DepositSection
        purchasePrice={input.purchasePrice}
        depositAmount={input.depositAmount}
        presets={preset.depositPresets}
        onSelectPercent={handleDepositPercentage}
        onCustomDeposit={(val) => onChange({ depositAmount: val })}
      />

      {/* Loan Term & Interest Rate */}
      <TermAndRateSection
        annualRate={input.annualInterestRate}
        loanTermMonths={input.loanTermMonths}
        termPresets={preset.termPresets}
        onTermChange={(months) => onChange({ loanTermMonths: months })}
        onRateChange={(rate) => onChange({ annualInterestRate: rate })}
      />

      {/* Balloon / Residual Option */}
      {preset.balloonAllowed && preset.balloonPresets && (
        <BalloonSection
          purchasePrice={input.purchasePrice}
          balloonPercentage={input.balloonPercentage}
          balloonPresets={preset.balloonPresets}
          onSelectBalloon={(percent) => onChange({ balloonPercentage: percent })}
        />
      )}

      {/* Fees & Capitalization */}
      <FeesSection
        initiationFee={input.initiationFee}
        monthlyServiceFee={input.monthlyServiceFee}
        capitalizeInitiationFee={input.capitalizeInitiationFee}
        onToggleCapitalize={(capitalize) => onChange({ capitalizeInitiationFee: capitalize })}
        onUpdateFees={(fees) => onChange(fees)}
      />
    </div>
  );
};

interface DepositSectionProps {
  purchasePrice: number;
  depositAmount: number;
  presets: FinancePresetConfig['depositPresets'];
  onSelectPercent: (percent: number) => void;
  onCustomDeposit: (amount: number) => void;
}

const DepositSection: React.FC<DepositSectionProps> = ({
  purchasePrice,
  depositAmount,
  presets,
  onSelectPercent,
  onCustomDeposit,
}) => {
  const currentDepositPercent = purchasePrice > 0 ? (depositAmount / purchasePrice) * 100 : 0;

  return (
    <div className="pt-4 border-t border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-slate-200">Deposit / Down Payment</label>
        <span className="font-mono text-xs font-semibold text-emerald-400">
          {formatCurrency(depositAmount)} ({currentDepositPercent.toFixed(0)}%)
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => {
          const isSelected = Math.abs(currentDepositPercent - preset.percentage) < 0.5;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSelectPercent(preset.percentage)}
              className={`py-2 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={depositAmount === 0 ? '' : depositAmount}
        onChange={(e) => onCustomDeposit(sanitizeNumericInput(e.target.value))}
        placeholder="Custom deposit amount (e.g. 25000)"
        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs font-mono font-medium text-slate-200 focus:outline-none"
      />
    </div>
  );
};

interface TermAndRateSectionProps {
  annualRate: number;
  loanTermMonths: number;
  termPresets: FinancePresetConfig['termPresets'];
  onTermChange: (months: number) => void;
  onRateChange: (rate: number) => void;
}

const TermAndRateSection: React.FC<TermAndRateSectionProps> = ({
  annualRate,
  loanTermMonths,
  termPresets,
  onTermChange,
  onRateChange,
}) => {
  return (
    <div className="pt-4 border-t border-slate-800 space-y-4">
      {/* Term */}
      <div>
        <label className="text-xs sm:text-sm font-semibold text-slate-200 block mb-2">Loan Term (Period)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {termPresets.map((term) => (
            <button
              key={term.months}
              type="button"
              onClick={() => onTermChange(term.months)}
              className={`py-2.5 px-3 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                loanTermMonths === term.months
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              {term.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interest Rate */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs sm:text-sm font-semibold text-slate-200">Interest Rate (% per annum)</label>
          <span className="font-mono text-xs font-bold text-emerald-400">{annualRate.toFixed(2)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            step="0.25"
            min="0"
            max="40"
            value={annualRate}
            onChange={(e) => onRateChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-2 px-3 text-sm font-mono font-bold text-white focus:outline-none"
          />
          <span className="text-slate-400 font-mono text-sm">%</span>
        </div>
      </div>
    </div>
  );
};

interface BalloonSectionProps {
  purchasePrice: number;
  balloonPercentage: number;
  balloonPresets: NonNullable<FinancePresetConfig['balloonPresets']>;
  onSelectBalloon: (percentage: number) => void;
}

const BalloonSection: React.FC<BalloonSectionProps> = ({
  purchasePrice,
  balloonPercentage,
  balloonPresets,
  onSelectBalloon,
}) => {
  const balloonAmount = purchasePrice * (balloonPercentage / 100);

  return (
    <div className="pt-4 border-t border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs sm:text-sm font-semibold text-slate-200">Residual / Balloon Payment</label>
          <p className="text-[11px] text-slate-400">Lump sum paid at the very end of term</p>
        </div>
        <span className="font-mono text-xs font-semibold text-amber-400">
          {formatCurrency(balloonAmount)} ({balloonPercentage}%)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {balloonPresets.map((preset) => (
          <button
            key={preset.percentage}
            type="button"
            onClick={() => onSelectBalloon(preset.percentage)}
            className={`py-2 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
              balloonPercentage === preset.percentage
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface FeesSectionProps {
  initiationFee: number;
  monthlyServiceFee: number;
  capitalizeInitiationFee: boolean;
  onToggleCapitalize: (capitalize: boolean) => void;
  onUpdateFees: (fees: { initiationFee?: number; monthlyServiceFee?: number }) => void;
}

const FeesSection: React.FC<FeesSectionProps> = ({
  initiationFee,
  monthlyServiceFee,
  capitalizeInitiationFee,
  onToggleCapitalize,
}) => {
  return (
    <div className="pt-4 border-t border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-slate-200">Bank Fees & NCA Charges</label>
        <span className="text-xs text-slate-400">
          Init: {formatCurrency(initiationFee)} | Admin: {formatCurrency(monthlyServiceFee)}/mo
        </span>
      </div>

      <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
        <div>
          <span className="text-xs font-medium text-slate-200 block">Capitalize Initiation Fee into Loan</span>
          <span className="text-[11px] text-slate-400">Include initiation fee in monthly installments instead of paying upfront</span>
        </div>
        <input
          type="checkbox"
          checked={capitalizeInitiationFee}
          onChange={(e) => onToggleCapitalize(e.target.checked)}
          className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
        />
      </label>
    </div>
  );
};
