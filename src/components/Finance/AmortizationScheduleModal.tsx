import React from 'react';
import { X, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { AmortizationYearPoint, FinancePresetConfig } from '../../types/finance';

interface AmortizationScheduleModalProps {
  isOpen: boolean;
  preset: FinancePresetConfig;
  schedule: AmortizationYearPoint[];
  onClose: () => void;
}

export const AmortizationScheduleModal: React.FC<AmortizationScheduleModalProps> = ({
  isOpen,
  preset,
  schedule,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Amortization Schedule</h2>
              <p className="text-xs text-slate-400">{preset.name} Annual Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-400 uppercase font-mono">
              <tr>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Start Balance</th>
                <th className="py-2.5 px-3 text-emerald-400">Principal Paid</th>
                <th className="py-2.5 px-3 text-amber-400">Interest Paid</th>
                <th className="py-2.5 px-3 text-right">End Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {schedule.map((point) => (
                <tr key={point.year} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-200">Yr {point.year}</td>
                  <td className="py-2.5 px-3 text-slate-400">{formatCurrency(point.startingBalance)}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">{formatCurrency(point.principalPaid)}</td>
                  <td className="py-2.5 px-3 text-amber-400">{formatCurrency(point.interestPaid)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-bold">{formatCurrency(point.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
