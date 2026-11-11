import React, { useState, useEffect, useMemo } from 'react';
import { PLATFORMS_CONFIG } from './config/platforms';
import { FINANCE_PRESETS } from './config/financePresets';
import { calculateFinalPrice } from './services/calculationEngine';
import { calculateFinance } from './services/financeEngine';
import {
  loadFeeOverrides,
  saveFeeOverrides,
  clearPlatformFeeOverrides,
  loadSavedPlatformId,
  saveActivePlatformId,
} from './utils/storage';
import { parseSharedUrlParams } from './utils/share';
import { Navbar, type AppMode } from './components/Navbar';
import { PlatformSelector } from './components/PlatformSelector';
import { CalculatorInputCard } from './components/CalculatorInputCard';
import { ReceiptBreakdown } from './components/ReceiptBreakdown';
import { RateCustomizerModal } from './components/RateCustomizerModal';
import { ReverseBudgetModal } from './components/ReverseBudgetModal';
import { FinanceAssetSelector } from './components/Finance/FinanceAssetSelector';
import { FinanceInputCard } from './components/Finance/FinanceInputCard';
import { FinanceSummaryCard } from './components/Finance/FinanceSummaryCard';
import { AmortizationScheduleModal } from './components/Finance/AmortizationScheduleModal';
import { Footer } from './components/Footer';
import type { PlatformConfig } from './types/platform';
import type { FinanceAssetCategory, FinanceCalculationInput, FinancePresetConfig } from './types/finance';

function createInitialFinanceInput(preset: FinancePresetConfig, initialPrice?: number): FinanceCalculationInput {
  const price = initialPrice ?? preset.defaultPrice;
  return {
    purchasePrice: price,
    depositAmount: 0,
    annualInterestRate: preset.defaultRate,
    loanTermMonths: preset.defaultMonths,
    balloonPercentage: 0,
    initiationFee: preset.defaultInitiationFee,
    monthlyServiceFee: preset.defaultMonthlyServiceFee,
    capitalizeInitiationFee: false,
  };
}

export const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const urlParams = parseSharedUrlParams();
    return urlParams.mode || 'platform_fees';
  });

  // Platform Fees State
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

  // Finance Calculator State
  const [financeCategory, setFinanceCategory] = useState<FinanceAssetCategory>('vehicle');
  const activeFinancePreset = useMemo(() => {
    return FINANCE_PRESETS.find((p) => p.id === financeCategory) || FINANCE_PRESETS[0];
  }, [financeCategory]);

  const [financeInput, setFinanceInput] = useState<FinanceCalculationInput>(() =>
    createInitialFinanceInput(activeFinancePreset)
  );
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

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

  const handleFinanceCategoryChange = (newCategory: FinanceAssetCategory) => {
    const targetPreset = FINANCE_PRESETS.find((p) => p.id === newCategory) || FINANCE_PRESETS[0];
    setFinanceCategory(newCategory);
    setFinanceInput(createInitialFinanceInput(targetPreset));
  };

  const handleFinanceAmount = (amountToFinance: number) => {
    const targetCategory: FinanceAssetCategory = activePlatform.id === 'aucor' ? 'vehicle' : 'item';
    const targetPreset = FINANCE_PRESETS.find((p) => p.id === targetCategory) || FINANCE_PRESETS[0];
    setFinanceCategory(targetCategory);
    setFinanceInput(createInitialFinanceInput(targetPreset, amountToFinance));
    setAppMode('finance');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const financeResult = useMemo(() => {
    return calculateFinance(financeInput);
  }, [financeInput]);

  useEffect(() => {
    if (appMode !== 'platform_fees') return;
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('platform', platformId);
      currentUrl.searchParams.set('amount', baseAmount.toString());
      window.history.replaceState({}, '', currentUrl.toString());
    } catch {
      // Graceful fallback
    }
  }, [appMode, platformId, baseAmount]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        <Navbar
          appMode={appMode}
          hasCustomOverrides={hasCustomOverrides}
          onToggleAppMode={setAppMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTargetBudget={() => setIsBudgetOpen(true)}
          onResetRates={() => {
            clearPlatformFeeOverrides(activePlatform.id);
            const updated = { ...allOverrides };
            delete updated[activePlatform.id];
            setAllOverrides(updated);
          }}
        />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 space-y-6 sm:space-y-8">
          {appMode === 'platform_fees' ? (
            <PlatformFeesSection
              platforms={PLATFORMS_CONFIG}
              activePlatform={activePlatform}
              baseAmount={baseAmount}
              secondaryAmounts={secondaryAmounts}
              disabledRuleIds={disabledRuleIds}
              calculationResult={calculationResult}
              onPlatformChange={handlePlatformChange}
              onBaseAmountChange={setBaseAmount}
              onSecondaryAmountChange={(key, val) => setSecondaryAmounts((prev) => ({ ...prev, [key]: val }))}
              onToggleRule={(ruleId) =>
                setDisabledRuleIds((prev) =>
                  prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
                )
              }
              onFinanceAmount={handleFinanceAmount}
            />
          ) : (
            <FinanceViewSection
              preset={activeFinancePreset}
              financeInput={financeInput}
              financeResult={financeResult}
              onSelectCategory={handleFinanceCategoryChange}
              onInputChange={(updated) => setFinanceInput((prev) => ({ ...prev, ...updated }))}
              onOpenSchedule={() => setIsScheduleOpen(true)}
            />
          )}
        </main>
      </div>

      <Footer />

      {/* Slide-over / Modals */}
      <RateCustomizerModal
        isOpen={isSettingsOpen}
        platform={activePlatform}
        currentOverrides={currentPlatformOverrides}
        onClose={() => setIsSettingsOpen(false)}
        onSaveOverrides={(newOverrides) => {
          const updated = { ...allOverrides, [activePlatform.id]: newOverrides };
          setAllOverrides(updated);
          saveFeeOverrides(updated);
        }}
        onResetPlatformDefaults={() => {
          clearPlatformFeeOverrides(activePlatform.id);
          const updated = { ...allOverrides };
          delete updated[activePlatform.id];
          setAllOverrides(updated);
        }}
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

      <AmortizationScheduleModal
        isOpen={isScheduleOpen}
        preset={activeFinancePreset}
        schedule={financeResult.yearlySchedule}
        onClose={() => setIsScheduleOpen(false)}
      />
    </div>
  );
};

interface PlatformFeesSectionProps {
  platforms: PlatformConfig[];
  activePlatform: PlatformConfig;
  baseAmount: number;
  secondaryAmounts: Record<string, number>;
  disabledRuleIds: string[];
  calculationResult: ReturnType<typeof calculateFinalPrice>;
  onPlatformChange: (id: string) => void;
  onBaseAmountChange: (amount: number) => void;
  onSecondaryAmountChange: (key: string, val: number) => void;
  onToggleRule: (ruleId: string) => void;
  onFinanceAmount: (amount: number) => void;
}

const PlatformFeesSection: React.FC<PlatformFeesSectionProps> = ({
  platforms,
  activePlatform,
  baseAmount,
  secondaryAmounts,
  disabledRuleIds,
  calculationResult,
  onPlatformChange,
  onBaseAmountChange,
  onSecondaryAmountChange,
  onToggleRule,
  onFinanceAmount,
}) => {
  return (
    <>
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Calculate the <span className="text-emerald-400">Actual Price</span> You Pay
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Deconstruct buyer premiums, documentation charges, delivery logistics, and compound VAT with full transparency.
        </p>
      </div>

      <PlatformSelector
        platforms={platforms}
        activePlatformId={activePlatform.id}
        onSelectPlatform={onPlatformChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <CalculatorInputCard
            platform={activePlatform}
            baseAmount={baseAmount}
            secondaryAmounts={secondaryAmounts}
            disabledRuleIds={disabledRuleIds}
            onBaseAmountChange={onBaseAmountChange}
            onSecondaryAmountChange={onSecondaryAmountChange}
            onToggleRule={onToggleRule}
          />
        </div>

        <div className="lg:col-span-5 sticky top-20">
          <ReceiptBreakdown
            platform={activePlatform}
            result={calculationResult}
            onFinanceAmount={onFinanceAmount}
          />
        </div>
      </div>
    </>
  );
};

interface FinanceViewSectionProps {
  preset: FinancePresetConfig;
  financeInput: FinanceCalculationInput;
  financeResult: ReturnType<typeof calculateFinance>;
  onSelectCategory: (cat: FinanceAssetCategory) => void;
  onInputChange: (updated: Partial<FinanceCalculationInput>) => void;
  onOpenSchedule: () => void;
}

const FinanceViewSection: React.FC<FinanceViewSectionProps> = ({
  preset,
  financeInput,
  financeResult,
  onSelectCategory,
  onInputChange,
  onOpenSchedule,
}) => {
  return (
    <>
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Calculate Monthly <span className="text-teal-400">Finance Installments</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Accurate monthly repayments, deposits, interest rates, NCA bank fees, and optional residual balloons.
        </p>
      </div>

      <FinanceAssetSelector activeCategory={preset.id} onSelectCategory={onSelectCategory} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <FinanceInputCard preset={preset} input={financeInput} onChange={onInputChange} />
        </div>

        <div className="lg:col-span-5 sticky top-20">
          <FinanceSummaryCard
            preset={preset}
            result={financeResult}
            onOpenSchedule={onOpenSchedule}
          />
        </div>
      </div>
    </>
  );
};

export default App;
