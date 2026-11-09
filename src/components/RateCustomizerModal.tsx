import React, { useState } from 'react';
import { X, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import type { PlatformConfig } from '../types/platform';

interface RateCustomizerModalProps {
  isOpen: boolean;
  platform: PlatformConfig;
  currentOverrides: Record<string, number>;
  onClose: () => void;
  onSaveOverrides: (overrides: Record<string, number>) => void;
  onResetPlatformDefaults: () => void;
}

export const RateCustomizerModal: React.FC<RateCustomizerModalProps> = ({
  isOpen,
  platform,
  currentOverrides,
  onClose,
  onSaveOverrides,
  onResetPlatformDefaults,
}) => {
  const [draftValues, setDraftValues] = useState<Record<string, number>>(() => ({ ...currentOverrides }));

  if (!isOpen) return null;

  const handleValueChange = (ruleId: string, rawValue: string, isPercentage: boolean) => {
    const parsed = parseFloat(rawValue);
    if (Number.isNaN(parsed)) return;
    const finalValue = isPercentage ? parsed / 100 : parsed;
    setDraftValues((prev) => ({ ...prev, [ruleId]: finalValue }));
  };

  const handleSave = () => {
    onSaveOverrides(draftValues);
    onClose();
  };

  const handleReset = () => {
    setDraftValues({});
    onResetPlatformDefaults();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Customize Fee Schedule</h2>
            <p className="text-xs text-slate-400">Override default rates for {platform.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {platform.rules.map((rule) => {
            const isPercentage = rule.type === 'percentage' || rule.type === 'compound_tax';
            const currentValue = draftValues[rule.id] !== undefined
              ? (isPercentage ? draftValues[rule.id] * 100 : draftValues[rule.id])
              : (isPercentage ? (rule.rate ?? 0) * 100 : (rule.amount ?? 0));

            return (
              <div key={rule.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-200">{rule.name}</span>
                  <span className="text-xs text-slate-400">{isPercentage ? 'Percentage (%)' : `Fixed (${platform.currencySymbol})`}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step={isPercentage ? '0.1' : '10'}
                    value={currentValue}
                    onChange={(e) => handleValueChange(rule.id, e.target.value, isPercentage)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm font-mono font-bold text-white focus:outline-none"
                  />
                  <span className="text-sm font-bold text-slate-400 font-mono">
                    {isPercentage ? '%' : platform.currencySymbol}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{rule.description}</p>
              </div>
            );
          })}

          <div className="flex items-center space-x-2 text-xs text-amber-400/90 bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Custom rates will be saved to your device and applied automatically.</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
