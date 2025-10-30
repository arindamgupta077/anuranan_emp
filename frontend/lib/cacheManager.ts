/**
 * Cache Management Utilities
 * Provides functions to manage browser and service worker caches
 */

export const cacheManager = {
  /**
   * Clear all caches including service worker caches
   */
  clearAllCaches: async (): Promise<void> => {
    try {
      // Clear localStorage (preserve auth)
      const authData = localStorage.getItem('supabase.auth.token');
      localStorage.clear();
      if (authData) {
        localStorage.setItem('supabase.auth.token', authData);
      }

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ Service worker caches cleared');
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
        console.log('✅ Service workers unregistered');
      }

      console.log('✅ All caches cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
      throw error;
    }
  },

  /**
   * Get current app version
   */
  getCurrentVersion: (): string | null => {
    return localStorage.getItem('app_version');
  },

  /**
   * Force reload the page from server
   */
  forceReload: (): void => {
    window.location.reload();
  },

  /**
   * Clear caches and reload
   */
  clearAndReload: async (): Promise<void> => {
    await cacheManager.clearAllCaches();
    cacheManager.forceReload();
  },

  /**
   * Check if service worker is active
   */
  isServiceWorkerActive: (): boolean => {
    return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
  },

  /**
   * Get cache storage info (if available)
   */
  getCacheInfo: async (): Promise<{ name: string; size: number }[]> => {
    if (!('caches' in window)) {
      return [];
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return {
            name,
            size: keys.length,
          };
        })
      );
      return cacheInfo;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return [];
    }
  },
};

export default cacheManager;
