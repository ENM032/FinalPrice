import React from 'react';
import { Car, Home, Package } from 'lucide-react';
import { FINANCE_PRESETS } from '../../config/financePresets';
import type { FinanceAssetCategory } from '../../types/finance';

interface FinanceAssetSelectorProps {
  activeCategory: FinanceAssetCategory;
  onSelectCategory: (category: FinanceAssetCategory) => void;
}

function renderCategoryIcon(category: FinanceAssetCategory): React.ReactNode {
  switch (category) {
    case 'vehicle':
      return <Car className="w-4 h-4 sm:w-5 sm:h-5" />;
    case 'home':
      return <Home className="w-4 h-4 sm:w-5 sm:h-5" />;
    case 'item':
      return <Package className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
}

export const FinanceAssetSelector: React.FC<FinanceAssetSelectorProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-max p-1 bg-slate-900/60 rounded-2xl border border-slate-800">
        {FINANCE_PRESETS.map((preset) => {
          const isActive = preset.id === activeCategory;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectCategory(preset.id)}
              className={`flex items-center space-x-2.5 px-4 sm:px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                {renderCategoryIcon(preset.id)}
              </span>
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
