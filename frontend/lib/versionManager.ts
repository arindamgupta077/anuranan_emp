import cacheManager from './cacheManager';

type VersionInfo = {
  version?: string;
  buildDate?: string;
};

type VersionCheckReason =
  | 'ssr'
  | 'unavailable'
  | 'first-run'
  | 'up-to-date'
  | 'version-changed';

type VersionCheckResult = {
  updated: boolean;
  reason: VersionCheckReason;
};

const VERSION_URL = '/version.json';
const STORAGE_KEYS = {
  version: 'app_version',
  buildDate: 'app_build_date',
  lastCheck: 'app_version_last_check',
  lastPurge: 'cache_cleared_at',
};

const FETCH_TIMEOUT_MS = 7000;

const isBrowser = () => typeof window !== 'undefined';

const isProduction = () =>
  typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';

const makeLogger = (logger?: (message: string) => void) => {
  return (message: string) => {
    if (logger) {
      logger(message);
    }
    if (typeof console !== 'undefined' && !isProduction()) {
      console.info(`[versionManager] ${message}`);
    }
  };
};

const fetchServerVersion = async (): Promise<VersionInfo | null> => {
  if (!isBrowser()) {
    return null;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : null;

  try {
    const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
  signal: controller?.signal,
    });

    if (!response.ok) {
      if (typeof console !== 'undefined' && !isProduction()) {
        console.warn(`[versionManager] Failed to fetch ${VERSION_URL}: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    return {
      version: data?.version ? String(data.version) : undefined,
      buildDate: data?.buildDate ? String(data.buildDate) : undefined,
    };
  } catch (error) {
    if (typeof console !== 'undefined' && !isProduction()) {
      console.warn('[versionManager] Version fetch failed:', error);
    }
    return null;
  } finally {
    if (timeout !== null) {
      window.clearTimeout(timeout);
    }
  }
};

const getStoredVersionInfo = (): VersionInfo | null => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const version = window.localStorage.getItem(STORAGE_KEYS.version) ?? undefined;
    const buildDate = window.localStorage.getItem(STORAGE_KEYS.buildDate) ?? undefined;

    if (!version && !buildDate) {
      return null;
    }

    return { version, buildDate };
  } catch (error) {
    if (typeof console !== 'undefined' && !isProduction()) {
      console.warn('[versionManager] Unable to read stored version:', error);
    }
    return null;
  }
};

const storeVersionInfo = (info: VersionInfo) => {
  if (!isBrowser()) {
    return;
  }

  try {
    if (info.version) {
      window.localStorage.setItem(STORAGE_KEYS.version, info.version);
    }
    if (info.buildDate) {
      window.localStorage.setItem(STORAGE_KEYS.buildDate, info.buildDate);
    }
  } catch (error) {
    if (typeof console !== 'undefined' && !isProduction()) {
      console.warn('[versionManager] Unable to persist version info:', error);
    }
  }
};

const markLastCheck = () => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.lastCheck, new Date().toISOString());
  } catch (error) {
    if (typeof console !== 'undefined' && !isProduction()) {
      console.warn('[versionManager] Unable to persist last check timestamp:', error);
    }
  }
};

const hasMeaningfulChange = (server: VersionInfo, stored: VersionInfo | null): boolean => {
  if (!stored || !stored.version) {
    return false;
  }

  if (server.version && stored.version && server.version !== stored.version) {
    return true;
  }

  if (server.buildDate && stored.buildDate && server.buildDate !== stored.buildDate) {
    return true;
  }

  return false;
};

const ensureFreshVersion = async (logger?: (message: string) => void): Promise<VersionCheckResult> => {
  if (!isBrowser()) {
    return { updated: false, reason: 'ssr' };
  }

  const log = makeLogger(logger);
  const serverInfo = await fetchServerVersion();
  markLastCheck();

  if (!serverInfo) {
    log('Version endpoint unavailable, skipping cache purge');
    return { updated: false, reason: 'unavailable' };
  }

  const storedInfo = getStoredVersionInfo();

  if (!storedInfo) {
    storeVersionInfo(serverInfo);
    log(`Stored initial version ${serverInfo.version ?? 'unknown'}`);
    return { updated: false, reason: 'first-run' };
  }

  if (hasMeaningfulChange(serverInfo, storedInfo)) {
    log('Detected new app build, clearing caches');
    await cacheManager.clearAllCaches({ logger: message => log(`cache: ${message}`) });
    storeVersionInfo(serverInfo);

    try {
      window.localStorage.setItem(STORAGE_KEYS.lastPurge, new Date().toISOString());
    } catch (error) {
      log(`Unable to persist cache purge timestamp: ${(error as Error).message}`);
    }

    log('Reloading page to load fresh assets');
    cacheManager.forceReload();
    return { updated: true, reason: 'version-changed' };
  }

  storeVersionInfo({ ...storedInfo, ...serverInfo });
  log('App version is up to date');
  return { updated: false, reason: 'up-to-date' };
};

export const versionManager = {
  ensureFreshVersion,
  fetchServerVersion,
  getStoredVersionInfo,
  storeVersionInfo,
};

export type { VersionInfo, VersionCheckResult };

export default versionManager;
