const STORAGE_KEY_OVERRIDES = 'finalprice_fee_overrides_v1';
const STORAGE_KEY_LAST_PLATFORM = 'finalprice_active_platform_v1';

export function loadFeeOverrides(): Record<string, Record<string, number>> {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    if (!rawData) {
      return {};
    }
    return JSON.parse(rawData);
  } catch {
    return {};
  }
}

export function saveFeeOverrides(overrides: Record<string, Record<string, number>>): void {
  try {
    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
  } catch {
    // Fail silently if localStorage quota is exceeded or storage is disabled
  }
}

export function clearPlatformFeeOverrides(platformId: string): void {
  try {
    const currentOverrides = loadFeeOverrides();
    delete currentOverrides[platformId];
    saveFeeOverrides(currentOverrides);
  } catch {
    // Graceful error handling
  }
}

export function loadSavedPlatformId(defaultPlatformId: string): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAST_PLATFORM);
    return saved || defaultPlatformId;
  } catch {
    return defaultPlatformId;
  }
}

export function saveActivePlatformId(platformId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_PLATFORM, platformId);
  } catch {
    // Fail silently
  }
}
