import React from 'react';
import { Calculator, Sliders, Target, RotateCcw, Landmark, Receipt } from 'lucide-react';

export type AppMode = 'platform_fees' | 'finance';

interface NavbarProps {
  appMode: AppMode;
  hasCustomOverrides: boolean;
  onToggleAppMode: (mode: AppMode) => void;
  onOpenSettings: () => void;
  onOpenTargetBudget: () => void;
  onResetRates: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appMode,
  hasCustomOverrides,
  onToggleAppMode,
  onOpenSettings,
  onOpenTargetBudget,
  onResetRates,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Calculator className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Final<span className="text-emerald-400">Price</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Vehicle, property & marketplace calculators</p>
          </div>
        </div>

        {/* Center / Navigation Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => onToggleAppMode('platform_fees')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              appMode === 'platform_fees'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Platform Fees</span>
          </button>
          <button
            onClick={() => onToggleAppMode('finance')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              appMode === 'finance'
                ? 'bg-slate-800 text-teal-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Finance Loan</span>
          </button>
        </div>

        {/* Right Tools (Only active in Platform Fees mode, or adjusted) */}
        <div className="flex items-center space-x-2">
          {appMode === 'platform_fees' && hasCustomOverrides && (
            <button
              onClick={onResetRates}
              title="Reset fees to verified platform defaults"
              className="inline-flex items-center text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1.5 rounded-lg border border-amber-400/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {appMode === 'platform_fees' && (
            <>
              <button
                onClick={onOpenTargetBudget}
                className="inline-flex items-center text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 sm:mr-1.5 text-teal-400" />
                <span className="hidden sm:inline">Target Budget</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="inline-flex items-center text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer relative"
              >
                <Sliders className="w-3.5 h-3.5 sm:mr-1.5 text-emerald-400" />
                <span className="hidden sm:inline">Edit Rates</span>
                {hasCustomOverrides && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
