import React from 'react';
import { Calculator, Sliders, Target, RotateCcw } from 'lucide-react';

interface NavbarProps {
  hasCustomOverrides: boolean;
  onOpenSettings: () => void;
  onOpenTargetBudget: () => void;
  onResetRates: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasCustomOverrides,
  onOpenSettings,
  onOpenTargetBudget,
  onResetRates,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Calculator className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Final<span className="text-emerald-400">Price</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Transparent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Zero hidden fees, down to the cent</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {hasCustomOverrides && (
            <button
              onClick={onResetRates}
              title="Reset fees to verified platform defaults"
              className="inline-flex items-center text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1.5 rounded-lg border border-amber-400/20 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Reset Rates</span>
            </button>
          )}

          <button
            onClick={onOpenTargetBudget}
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Target className="w-4 h-4 mr-1.5 text-teal-400" />
            <span>Target Budget</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-700 transition-all cursor-pointer relative"
          >
            <Sliders className="w-4 h-4 mr-1.5 text-emerald-400" />
            <span>Edit Rates</span>
            {hasCustomOverrides && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
