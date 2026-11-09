import React from 'react';
import { Car, ShoppingBag, Store, SlidersHorizontal } from 'lucide-react';
import type { PlatformConfig } from '../types/platform';

interface PlatformSelectorProps {
  platforms: PlatformConfig[];
  activePlatformId: string;
  onSelectPlatform: (id: string) => void;
}

function renderPlatformIcon(iconName: string): React.ReactNode {
  switch (iconName) {
    case 'Car':
      return <Car className="w-4 h-4 sm:w-5 sm:h-5" />;
    case 'ShoppingBag':
      return <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />;
    case 'Store':
      return <Store className="w-4 h-4 sm:w-5 sm:h-5" />;
    default:
      return <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  platforms,
  activePlatformId,
  onSelectPlatform,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-max p-1 bg-slate-900/60 rounded-2xl border border-slate-800">
        {platforms.map((platform) => {
          const isActive = platform.id === activePlatformId;
          return (
            <button
              key={platform.id}
              onClick={() => onSelectPlatform(platform.id)}
              className={`flex items-center space-x-2.5 px-3.5 sm:px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                {renderPlatformIcon(platform.iconName)}
              </span>
              <span>{platform.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
