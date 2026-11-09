import React, { useState, useMemo } from 'react';
import { X, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency, sanitizeNumericInput } from '../utils/currency';
import { calculateMaxBidFromBudget } from '../services/reverseCalculator';
import { calculateFinalPrice } from '../services/calculationEngine';
import type { PlatformConfig } from '../types/platform';

interface ReverseBudgetModalProps {
  isOpen: boolean;
  platform: PlatformConfig;
  secondaryAmounts: Record<string, number>;
  activeRuleOverrides: Record<string, number>;
  disabledRuleIds: string[];
  onClose: () => void;
  onApplyBid: (maxBid: number) => void;
}

export const ReverseBudgetModal: React.FC<ReverseBudgetModalProps> = ({
  isOpen,
  platform,
  secondaryAmounts,
  activeRuleOverrides,
  disabledRuleIds,
  onClose,
  onApplyBid,
}) => {
  const [totalBudget, setTotalBudget] = useState<number>(100000);

  const maxBid = useMemo(() => {
    return calculateMaxBidFromBudget({
      platform,
      targetBudget: totalBudget,
      secondaryAmounts,
      activeRuleOverrides,
      disabledRuleIds,
    });
  }, [platform, totalBudget, secondaryAmounts, activeRuleOverrides, disabledRuleIds]);

  const verifiedBreakdown = useMemo(() => {
    return calculateFinalPrice({
      platform,
      baseAmount: maxBid,
      secondaryAmounts,
      activeRuleOverrides,
      disabledRuleIds,
    });
  }, [platform, maxBid, secondaryAmounts, activeRuleOverrides, disabledRuleIds]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyBid(maxBid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Target Budget Solver</h2>
              <p className="text-xs text-slate-400">{platform.name} Reverse Calculator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Enter Your Maximum All-Inclusive Budget
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 font-mono font-bold text-lg text-teal-400">
              {platform.currencySymbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={totalBudget === 0 ? '' : totalBudget}
              onChange={(e) => setTotalBudget(sanitizeNumericInput(e.target.value))}
              placeholder="e.g. 100000"
              className="w-full bg-slate-950 border border-slate-700 focus:border-teal-500 rounded-2xl py-3 pl-10 pr-4 text-xl font-mono font-bold text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Computed Result Box */}
        <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-center space-y-1">
          <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
            Maximum Winning Bid You Can Place
          </span>
          <div className="text-3xl font-mono font-extrabold text-teal-400 tabular-nums">
            {formatCurrency(maxBid, platform.currencySymbol)}
          </div>
          <p className="text-xs text-slate-400">
            Total out-of-pocket with all fees & VAT: {formatCurrency(verifiedBreakdown.totalFinalPrice, platform.currencySymbol)}
          </p>
        </div>

        <div className="text-xs text-slate-400 space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guaranteed not to exceed {formatCurrency(totalBudget, platform.currencySymbol)}</span>
          </div>
          <p>Accounts for all applicable buyer premiums, doc fees, delivery, and statutory VAT.</p>
        </div>

        <div className="pt-2 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleApply}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
          >
            <span>Set as Calculator Bid</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
