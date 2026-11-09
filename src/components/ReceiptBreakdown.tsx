import React, { useState } from 'react';
import { Copy, Check, Share2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/currency';
import { formatBreakdownText, generateShareUrl, copyTextToClipboard } from '../utils/share';
import type { CalculationResult, LineItemBreakdown, PlatformConfig } from '../types/platform';

interface ReceiptBreakdownProps {
  platform: PlatformConfig;
  result: CalculationResult;
}

export const ReceiptBreakdown: React.FC<ReceiptBreakdownProps> = ({ platform, result }) => {
  const [copiedBreakdown, setCopiedBreakdown] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  const handleCopyBreakdown = async () => {
    const text = formatBreakdownText(platform, result);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedBreakdown(true);
      setTimeout(() => setCopiedBreakdown(false), 2000);
    }
  };

  const handleCopyShareUrl = async () => {
    const url = generateShareUrl(platform.id, result.baseAmount);
    const success = await copyTextToClipboard(url);
    if (success) {
      setCopiedShareUrl(true);
      setTimeout(() => setCopiedShareUrl(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Glow Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header & Tag */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <span>Final Cost Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{platform.name}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            +{result.effectiveFeePercentage.toFixed(1)}% total markup
          </span>
        </div>

        {/* Big Total Hero */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Payable Outflow
          </span>
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black text-emerald-400 tracking-tight tabular-nums">
            {formatCurrency(result.totalFinalPrice, platform.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Base: {formatCurrency(result.baseAmount, platform.currencySymbol)} + Fees: {formatCurrency(result.totalFinalPrice - result.baseAmount, platform.currencySymbol)}
          </div>
        </div>

        {/* Itemized Receipt Lines */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Itemized Statement
          </div>
          <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/40 border border-slate-800/80 p-3 sm:p-4">
            {result.lineItems.map((item) => (
              <ReceiptItemRow key={item.id} item={item} currencySymbol={platform.currencySymbol} />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons & Disclaimer */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyBreakdown}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs sm:text-sm font-semibold text-white border border-slate-700 transition-all cursor-pointer"
          >
            {copiedBreakdown ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedBreakdown ? 'Copied Receipt' : 'Copy Breakdown'}</span>
          </button>

          <button
            onClick={handleCopyShareUrl}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs sm:text-sm font-semibold text-white border border-slate-700 transition-all cursor-pointer"
          >
            {copiedShareUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedShareUrl ? 'Link Copied' : 'Share Link'}</span>
          </button>
        </div>

        <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{platform.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};

interface ReceiptItemRowProps {
  item: LineItemBreakdown;
  currencySymbol: string;
}

const ReceiptItemRow: React.FC<ReceiptItemRowProps> = ({ item, currencySymbol }) => {
  const isBase = item.type === 'base';
  const isTax = item.type === 'compound_tax';

  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs sm:text-sm font-medium ${isBase ? 'text-white font-semibold' : 'text-slate-300'}`}>
            {item.name}
          </span>
          {item.percentageRate && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {formatPercentage(item.percentageRate)}
            </span>
          )}
        </div>
        {item.description && !isBase && (
          <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
        )}
      </div>

      <div className="font-mono text-xs sm:text-sm font-bold tracking-tight text-right tabular-nums">
        <span className={isTax ? 'text-amber-400' : isBase ? 'text-white' : 'text-slate-200'}>
          {formatCurrency(item.amount, currencySymbol)}
        </span>
      </div>
    </div>
  );
};
