import React from 'react';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-10 mt-16 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-800/60 pb-8">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Zero Latency & Client-Side</h4>
              <p className="mt-1 text-slate-400">
                All fee calculations and reverse budgets compute 100% on your device in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Private & Secure</h4>
              <p className="mt-1 text-slate-400">
                Zero data tracking or cookies. Your financial bids and quotes never leave your browser.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Adaptable Fee Engine</h4>
              <p className="mt-1 text-slate-400">
                Easily modify rates when platforms update their fee schedules without code changes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 gap-3">
          <p>© {new Date().getFullYear()} FinalPrice. All platform names and trademarks belong to their respective owners.</p>
          <p className="text-slate-400">Designed for Aucor, Yaga, Bob Shop & custom quotation workflows.</p>
        </div>
      </div>
    </footer>
  );
};
