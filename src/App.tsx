import React, { useState, useEffect, useMemo } from 'react';
import { PLATFORMS_CONFIG } from './config/platforms';
import { calculateFinalPrice } from './services/calculationEngine';
import {
  loadFeeOverrides,
  saveFeeOverrides,
  clearPlatformFeeOverrides,
  loadSavedPlatformId,
  saveActivePlatformId,
} from './utils/storage';
import { parseSharedUrlParams } from './utils/share';
import { Navbar } from './components/Navbar';
import { PlatformSelector } from './components/PlatformSelector';
import { CalculatorInputCard } from './components/CalculatorInputCard';
import { ReceiptBreakdown } from './components/ReceiptBreakdown';
import { RateCustomizerModal } from './components/RateCustomizerModal';
import { ReverseBudgetModal } from './components/ReverseBudgetModal';
import { Footer } from './components/Footer';
import type { PlatformConfig } from './types/platform';

export const App: React.FC = () => {
  const [platformId, setPlatformId] = useState<string>(() => {
    const urlParams = parseSharedUrlParams();
    if (urlParams.platformId && PLATFORMS_CONFIG.some((p) => p.id === urlParams.platformId)) {
      return urlParams.platformId;
    }
    return loadSavedPlatformId('aucor');
  });

  const activePlatform: PlatformConfig = useMemo(() => {
    return PLATFORMS_CONFIG.find((p) => p.id === platformId) || PLATFORMS_CONFIG[0];
  }, [platformId]);

  const [baseAmount, setBaseAmount] = useState<number>(() => {
    const urlParams = parseSharedUrlParams();
    if (urlParams.amount !== undefined && urlParams.amount >= 0) {
      return urlParams.amount;
    }
    return activePlatform.primaryInput.defaultValue;
  });

  const [secondaryAmounts, setSecondaryAmounts] = useState<Record<string, number>>(() => {
    const initialSecondary: Record<string, number> = {};
    activePlatform.secondaryInputs?.forEach((input) => {
      initialSecondary[input.id] = input.defaultValue;
    });
    return initialSecondary;
  });

  const [allOverrides, setAllOverrides] = useState<Record<string, Record<string, number>>>(loadFeeOverrides);
  const [disabledRuleIds, setDisabledRuleIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState<boolean>(false);

  const currentPlatformOverrides = useMemo(() => {
    return allOverrides[activePlatform.id] || {};
  }, [allOverrides, activePlatform.id]);

  const hasCustomOverrides = useMemo(() => {
    return Object.keys(currentPlatformOverrides).length > 0;
  }, [currentPlatformOverrides]);

  const handlePlatformChange = (newPlatformId: string) => {
    const targetPlatform = PLATFORMS_CONFIG.find((p) => p.id === newPlatformId);
    if (!targetPlatform) return;

    setPlatformId(newPlatformId);
    setBaseAmount(targetPlatform.primaryInput.defaultValue);
    const newSecondary: Record<string, number> = {};
    targetPlatform.secondaryInputs?.forEach((input) => {
      newSecondary[input.id] = input.defaultValue;
    });
    setSecondaryAmounts(newSecondary);
    setDisabledRuleIds([]);
    saveActivePlatformId(newPlatformId);
  };

  const handleSecondaryAmountChange = (key: string, value: number) => {
    setSecondaryAmounts((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleRule = (ruleId: string) => {
    setDisabledRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const handleSaveOverrides = (newOverrides: Record<string, number>) => {
    const updated = { ...allOverrides, [activePlatform.id]: newOverrides };
    setAllOverrides(updated);
    saveFeeOverrides(updated);
  };

  const handleResetOverrides = () => {
    clearPlatformFeeOverrides(activePlatform.id);
    const updated = { ...allOverrides };
    delete updated[activePlatform.id];
    setAllOverrides(updated);
  };

  const calculationResult = useMemo(() => {
    return calculateFinalPrice({
      platform: activePlatform,
      baseAmount,
      secondaryAmounts,
      activeRuleOverrides: currentPlatformOverrides,
      disabledRuleIds,
    });
  }, [activePlatform, baseAmount, secondaryAmounts, currentPlatformOverrides, disabledRuleIds]);

  useEffect(() => {
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('platform', platformId);
      currentUrl.searchParams.set('amount', baseAmount.toString());
      window.history.replaceState({}, '', currentUrl.toString());
    } catch {
      // Graceful fallback
    }
  }, [platformId, baseAmount]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        <Navbar
          hasCustomOverrides={hasCustomOverrides}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTargetBudget={() => setIsBudgetOpen(true)}
          onResetRates={handleResetOverrides}
        />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 space-y-6 sm:space-y-8">
          {/* Header intro */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Calculate the <span className="text-emerald-400">Actual Price</span> You Pay
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Deconstruct buyer premiums, documentation charges, delivery logistics, and compound VAT with full transparency.
            </p>
          </div>

          {/* Platform Tabs */}
          <PlatformSelector
            platforms={PLATFORMS_CONFIG}
            activePlatformId={activePlatform.id}
            onSelectPlatform={handlePlatformChange}
          />

          {/* Main 2-column calculation grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <CalculatorInputCard
                platform={activePlatform}
                baseAmount={baseAmount}
                secondaryAmounts={secondaryAmounts}
                disabledRuleIds={disabledRuleIds}
                onBaseAmountChange={setBaseAmount}
                onSecondaryAmountChange={handleSecondaryAmountChange}
                onToggleRule={handleToggleRule}
              />
            </div>

            <div className="lg:col-span-5 sticky top-20">
              <ReceiptBreakdown platform={activePlatform} result={calculationResult} />
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Slide-over / Modals */}
      <RateCustomizerModal
        isOpen={isSettingsOpen}
        platform={activePlatform}
        currentOverrides={currentPlatformOverrides}
        onClose={() => setIsSettingsOpen(false)}
        onSaveOverrides={handleSaveOverrides}
        onResetPlatformDefaults={handleResetOverrides}
      />

      <ReverseBudgetModal
        isOpen={isBudgetOpen}
        platform={activePlatform}
        secondaryAmounts={secondaryAmounts}
        activeRuleOverrides={currentPlatformOverrides}
        disabledRuleIds={disabledRuleIds}
        onClose={() => setIsBudgetOpen(false)}
        onApplyBid={setBaseAmount}
      />
    </div>
  );
};

export default App;
