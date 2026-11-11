import React, { useState } from 'react';
import { Copy, Check, Table, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { copyTextToClipboard } from '../../utils/share';
import type { FinanceCalculationResult, FinancePresetConfig } from '../../types/finance';

interface FinanceSummaryCardProps {
  preset: FinancePresetConfig;
  result: FinanceCalculationResult;
  onOpenSchedule: () => void;
}

function formatFinanceQuoteText(
  preset: FinancePresetConfig,
  result: FinanceCalculationResult
): string {
  const lines: string[] = [
    `🏦 ${preset.name} Quote Breakdown`,
    `----------------------------------------`,
    `Purchase Price: ${formatCurrency(result.purchasePrice)}`,
    `Deposit: ${formatCurrency(result.depositAmount)}`,
    `Principal Financed: ${formatCurrency(result.financedPrincipal)}`,
    `Monthly Installment: ${formatCurrency(result.monthlyInstallment)}`,
    `Bank Service Fee: ${formatCurrency(result.monthlyServiceFee)}/month`,
    `👉 Total Monthly Payment: ${formatCurrency(result.totalMonthlyPayment)}`,
  ];

  if (result.balloonAmount > 0) {
    lines.push(`Balloon Residual (at term end): ${formatCurrency(result.balloonAmount)}`);
  }

  lines.push(`Total Interest Paid: ${formatCurrency(result.totalInterestPaid)}`);
  lines.push(`Total Cost of Credit: ${formatCurrency(result.totalOverallOutflow)}`);
  lines.push(`----------------------------------------`);
  lines.push(`Calculated via FinalPrice: ${window.location.origin}`);

  return lines.join('\n');
}

export const FinanceSummaryCard: React.FC<FinanceSummaryCardProps> = ({
  preset,
  result,
  onOpenSchedule,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatFinanceQuoteText(preset, result);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Monthly Repayment</h2>
            <p className="text-xs text-slate-400">{preset.name}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            {result.monthlyServiceFee > 0 ? 'Incl. Bank Fees' : 'Principal & Interest'}
          </span>
        </div>

        {/* Big Hero Display */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Monthly Installment
          </span>
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black text-teal-400 tracking-tight tabular-nums">
            {formatCurrency(result.totalMonthlyPayment)}
            <span className="text-sm font-normal text-slate-400 ml-1">/mo</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Base Installment: {formatCurrency(result.monthlyInstallment)} + Bank Admin: {formatCurrency(result.monthlyServiceFee)}
          </p>
        </div>

        {/* Breakdown Summary Rows */}
        <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/40 border border-slate-800/80 p-3 sm:p-4 mb-6">
          <SummaryRow label="Purchase Price" value={formatCurrency(result.purchasePrice)} />
          <SummaryRow label="Deposit Paid Upfront" value={`- ${formatCurrency(result.depositAmount)}`} />
          <SummaryRow label="Financed Principal" value={formatCurrency(result.financedPrincipal)} isEmphasized />
          {result.balloonAmount > 0 && (
            <SummaryRow label="Residual / Balloon Amount" value={formatCurrency(result.balloonAmount)} isWarning />
          )}
          <SummaryRow label="Total Interest over Term" value={formatCurrency(result.totalInterestPaid)} isAmber />
          <SummaryRow label="Total Overall Cost of Credit" value={formatCurrency(result.totalOverallOutflow)} isTotal />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenSchedule}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs sm:text-sm font-semibold text-white border border-slate-700 transition-all cursor-pointer"
          >
            <Table className="w-4 h-4 text-teal-400" />
            <span>Schedule</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs sm:text-sm font-semibold text-white border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Quote'}</span>
          </button>
        </div>

        <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{preset.description}</span>
        </div>
      </div>
    </div>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
  isEmphasized?: boolean;
  isAmber?: boolean;
  isWarning?: boolean;
  isTotal?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  isEmphasized,
  isAmber,
  isWarning,
  isTotal,
}) => {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <span className={`text-xs sm:text-sm ${isTotal ? 'font-bold text-white' : 'text-slate-400'}`}>
        {label}
      </span>
      <span
        className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${
          isTotal
            ? 'text-teal-400 text-sm sm:text-base font-extrabold'
            : isAmber
            ? 'text-amber-400'
            : isWarning
            ? 'text-rose-400'
            : isEmphasized
            ? 'text-white'
            : 'text-slate-300'
        }`}
      >
        {value}
      </span>
    </div>
  );
};
