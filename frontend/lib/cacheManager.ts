/**
 * Cache Management Utilities
 * Provides functions to manage browser and service worker caches
 */

type Logger = (message: string) => void;

interface ClearOptions {
  preserveAuth?: boolean;
  authPrefixes?: string[];
  logger?: Logger;
}

interface ClearResult {
  preservedAuthKeys: string[];
  removedCaches: string[];
  unregisteredWorkers: string[];
}

type AuthSnapshot = Record<string, string>;

const DEFAULT_AUTH_PREFIXES = ['supabase.auth', 'sb-'];

const isBrowser = () => typeof window !== 'undefined';

const makeLogger = (external?: Logger): Logger => {
  return (message: string) => {
    if (external) {
      external(message);
    }
    // Logging helps when debugging cache issues in the browser console
    if (typeof console !== 'undefined') {
      console.log(`[cacheManager] ${message}`);
    }
  };
};

const captureAuthSnapshot = (prefixes: string[], log: Logger): AuthSnapshot => {
  const snapshot: AuthSnapshot = {};

  if (!isBrowser()) {
    return snapshot;
  }

  try {
    const storage = window.localStorage;
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key) {
        continue;
      }
      if (prefixes.some(prefix => key.startsWith(prefix))) {
        const value = storage.getItem(key);
        if (value !== null) {
          snapshot[key] = value;
        }
      }
    }
    if (Object.keys(snapshot).length > 0) {
      log(`Captured ${Object.keys(snapshot).length} auth key(s)`);
    }
  } catch (error) {
    log(`Unable to capture auth snapshot: ${(error as Error).message}`);
  }

  return snapshot;
};

const restoreAuthSnapshot = (snapshot: AuthSnapshot, log: Logger) => {
  if (!isBrowser() || Object.keys(snapshot).length === 0) {
    return;
  }

  try {
    Object.entries(snapshot).forEach(([key, value]) => {
      window.localStorage.setItem(key, value);
    });
    log(`Restored ${Object.keys(snapshot).length} auth key(s)`);
  } catch (error) {
    log(`Unable to restore auth snapshot: ${(error as Error).message}`);
  }
};

const clearLocalStorage = (snapshot: AuthSnapshot, log: Logger) => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.clear();
    log('localStorage cleared');
  } catch (error) {
    log(`Unable to clear localStorage: ${(error as Error).message}`);
  }

  restoreAuthSnapshot(snapshot, log);
};

const clearSessionStorage = (log: Logger) => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.clear();
    log('sessionStorage cleared');
  } catch (error) {
    log(`Unable to clear sessionStorage: ${(error as Error).message}`);
  }
};

const clearCacheStorage = async (log: Logger): Promise<string[]> => {
  if (!isBrowser() || !('caches' in window)) {
    log('Cache API not available, skipping');
    return [];
  }

  try {
    const cacheNames = await window.caches.keys();
    if (cacheNames.length === 0) {
      log('No caches to delete');
      return [];
    }

    log(`Deleting ${cacheNames.length} cache(s)`);
    await Promise.all(cacheNames.map(name => window.caches.delete(name)));
    log('Cache storage cleared');
    return cacheNames;
  } catch (error) {
    log(`Unable to clear Cache Storage: ${(error as Error).message}`);
    return [];
  }
};

const unregisterServiceWorkers = async (log: Logger): Promise<string[]> => {
  if (!isBrowser() || !('serviceWorker' in navigator)) {
    log('Service workers not supported, skipping');
    return [];
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) {
      log('No active service workers found');
      return [];
    }

    log(`Unregistering ${registrations.length} service worker(s)`);
    await Promise.all(registrations.map(reg => reg.unregister()));
    log('Service workers unregistered');
    return registrations.map(reg => reg.scope);
  } catch (error) {
    log(`Unable to unregister service workers: ${(error as Error).message}`);
    return [];
  }
};

export const cacheManager = {
  /**
   * Clear browser caches and service workers, preserving auth tokens by default
   */
  clearAllCaches: async (options: ClearOptions = {}): Promise<ClearResult> => {
    const {
      preserveAuth = true,
      authPrefixes = DEFAULT_AUTH_PREFIXES,
      logger: externalLogger,
    } = options;

    const log = makeLogger(externalLogger);
    const authSnapshot = preserveAuth ? captureAuthSnapshot(authPrefixes, log) : {};

    clearLocalStorage(authSnapshot, log);
    clearSessionStorage(log);

    const removedCaches = await clearCacheStorage(log);
    const unregisteredWorkers = await unregisterServiceWorkers(log);

    return {
      preservedAuthKeys: Object.keys(authSnapshot),
      removedCaches,
      unregisteredWorkers,
    };
  },

  /**
   * Get current app version stored locally
   */
  getCurrentVersion: (): string | null => {
    if (!isBrowser()) {
      return null;
    }
    return window.localStorage.getItem('app_version');
  },

  /**
   * Force reload the page from server
   */
  forceReload: (): void => {
    if (!isBrowser()) {
      return;
    }
    window.location.reload();
  },

  /**
   * Clear caches and immediately reload
   */
  clearAndReload: async (options?: ClearOptions): Promise<void> => {
    await cacheManager.clearAllCaches(options);
    cacheManager.forceReload();
  },

  /**
   * Check if a service worker currently controls the page
   */
  isServiceWorkerActive: (): boolean => {
    if (!isBrowser() || !('serviceWorker' in navigator)) {
      return false;
    }
    return navigator.serviceWorker.controller !== null;
  },

  /**
   * Collect cache names and entry counts for diagnostics
   */
  getCacheInfo: async (): Promise<{ name: string; size: number }[]> => {
    if (!isBrowser() || !('caches' in window)) {
      return [];
    }

    try {
      const cacheNames = await window.caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await window.caches.open(name);
          const keys = await cache.keys();
          return { name, size: keys.length };
        })
      );
      return cacheInfo;
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('Error getting cache info:', error);
      }
      return [];
    }
  },
};

export default cacheManager;
