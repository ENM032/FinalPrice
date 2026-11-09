import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { formatCurrency, sanitizeNumericInput } from '../utils/currency';
import type { PlatformConfig, PresetOption } from '../types/platform';

interface CalculatorInputCardProps {
  platform: PlatformConfig;
  baseAmount: number;
  secondaryAmounts: Record<string, number>;
  disabledRuleIds: string[];
  onBaseAmountChange: (value: number) => void;
  onSecondaryAmountChange: (key: string, value: number) => void;
  onToggleRule: (ruleId: string) => void;
}

export const CalculatorInputCard: React.FC<CalculatorInputCardProps> = ({
  platform,
  baseAmount,
  secondaryAmounts,
  disabledRuleIds,
  onBaseAmountChange,
  onSecondaryAmountChange,
  onToggleRule,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onBaseAmountChange(sanitizeNumericInput(event.target.value));
  };

  const handleIncrement = (increment: number) => {
    onBaseAmountChange(baseAmount + increment);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Primary Input Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="primary-input" className="text-sm font-semibold text-slate-200">
            {platform.primaryInput.label}
          </label>
          {baseAmount > 0 && (
            <button
              onClick={() => onBaseAmountChange(0)}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Big Number Input Field */}
        <div className="relative flex items-center">
          <span className="absolute left-4 font-mono font-bold text-xl sm:text-2xl text-emerald-400 select-none">
            {platform.currencySymbol}
          </span>
          <input
            id="primary-input"
            type="text"
            inputMode="decimal"
            value={baseAmount === 0 ? '' : baseAmount}
            onChange={handleInputChange}
            placeholder={platform.primaryInput.placeholder}
            className="w-full bg-slate-950 border-2 border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 rounded-2xl py-3.5 pl-12 pr-4 text-xl sm:text-3xl font-mono font-bold text-white tracking-tight tabular-nums focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Quick Increment Chips */}
        {platform.primaryInput.quickIncrements && (
          <div className="flex flex-wrap gap-2 mt-3">
            {platform.primaryInput.quickIncrements.map((increment) => (
              <button
                key={increment}
                type="button"
                onClick={() => handleIncrement(increment)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>{formatCurrency(increment, platform.currencySymbol, 0)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Secondary Inputs (e.g. Delivery for Yaga) */}
      {platform.secondaryInputs?.map((secondaryInput) => (
        <SecondaryInputSection
          key={secondaryInput.id}
          currencySymbol={platform.currencySymbol}
          field={secondaryInput}
          currentValue={secondaryAmounts[secondaryInput.id] ?? secondaryInput.defaultValue}
          onChange={(value) => onSecondaryAmountChange(secondaryInput.id, value)}
        />
      ))}

      {/* Active Rules & Toggles */}
      <div className="pt-2 border-t border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Applied Platform Fees
        </h3>
        <div className="space-y-2.5">
          {platform.rules.map((rule) => {
            const isEnabled = !disabledRuleIds.includes(rule.id);
            return (
              <label
                key={rule.id}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-medium text-slate-200">{rule.name}</span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {rule.type === 'percentage' || rule.type === 'compound_tax'
                        ? `${(rule.rate! * 100).toFixed(1)}%`
                        : formatCurrency(rule.amount!, platform.currencySymbol)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => onToggleRule(rule.id)}
                  className="mt-1 w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface SecondaryInputSectionProps {
  field: PlatformConfig['primaryInput'];
  currentValue: number;
  currencySymbol: string;
  onChange: (value: number) => void;
}

const SecondaryInputSection: React.FC<SecondaryInputSectionProps> = ({
  field,
  currentValue,
  currencySymbol,
  onChange,
}) => {
  return (
    <div className="pt-4 border-t border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-slate-200">{field.label}</label>
        <span className="font-mono text-xs font-semibold text-emerald-400">
          {formatCurrency(currentValue, currencySymbol)}
        </span>
      </div>

      {field.presets && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {field.presets.map((preset: PresetOption) => {
            const isSelected = currentValue === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.value)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-slate-200">{preset.label}</div>
                <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(preset.value, currencySymbol)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
