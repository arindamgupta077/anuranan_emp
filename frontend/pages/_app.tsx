import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import versionManager from '@/lib/versionManager';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import '@/styles/globals.css';
import type { Session } from '@supabase/supabase-js';

const shouldApplyNetlifyFix = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname;
  return host.endsWith('.netlify.app') || host.includes('-netlify.app');
};

export default function App({ Component, pageProps }: AppProps) {
  const { setAuth, clearAuth, setLoading, setSessionReady } = useAuthStore();

  useEffect(() => {
    const syncSession = async (
      session: Session | null,
      {
        showLoader = true,
        markReady = false,
      }: { showLoader?: boolean; markReady?: boolean } = {}
    ) => {
      if (markReady) {
        setSessionReady(false);
      }

      if (!session?.user) {
        clearAuth();
        if (showLoader) {
          setLoading(false);
        }
        if (markReady) {
          setSessionReady(true);
        }
        return;
      }

      const { user: cachedUser, employee: cachedEmployee } = useAuthStore.getState();
      const hasCachedProfile = cachedUser?.id === session.user.id && !!cachedEmployee;
      const shouldShowLoader = showLoader && !hasCachedProfile;

      if (hasCachedProfile) {
        setAuth(session.user, cachedEmployee);
      }

      if (shouldShowLoader) {
        setLoading(true);
      }
      try {
        const { data: employee, error } = await supabase
          .from('employees')
          .select(`
            *,
            roles (
              id,
              name
            )
          `)
          .eq('auth_user_id', session.user.id)
          .eq('active', true)
          .single();

        if (employee && !error) {
          setAuth(session.user, employee);
        } else {
          if (!hasCachedProfile) {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Session sync error:', error);
        if (!hasCachedProfile) {
          clearAuth();
        }
      } finally {
        if (shouldShowLoader) {
          setLoading(false);
        }
        if (markReady) {
          setSessionReady(true);
        }
      }
    };

    // Run version check in background without blocking the UI
    versionManager.ensureFreshVersion().catch((error) => {
      console.warn('Background version check failed:', error);
    });

    const initialiseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await syncSession(session, { markReady: true });
      } catch (error) {
        console.error('Initial session check error:', error);
        clearAuth();
        setLoading(false);
        setSessionReady(true);
      }
    };

    initialiseAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          // Already handled by initialiseAuth
          return;
        }

        if (event === 'SIGNED_IN') {
          await syncSession(session, { showLoader: true, markReady: true });
        } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await syncSession(session, { showLoader: false });
        } else if (event === 'SIGNED_OUT') {
          clearAuth();
          setLoading(false);
          setSessionReady(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, setLoading, setSessionReady]);

  useEffect(() => {
    if (!shouldApplyNetlifyFix()) {
      return;
    }

    const flagKey = 'netlify-sw-cleaned';
    try {
      const alreadyHandled = sessionStorage.getItem(flagKey);
      if (alreadyHandled === 'yes') {
        return;
      }
    } catch (error) {
      // Ignore sessionStorage issues
    }

    const cleanServiceWorkers = async () => {
      try {
        let didCleanup = false;
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const results = await Promise.all(registrations.map(reg => reg.unregister()));
          if (results.some(result => result)) {
            didCleanup = true;
          }
        }

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          if (cacheNames.length > 0) {
            didCleanup = true;
          }
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        if ('sessionStorage' in window) {
          sessionStorage.setItem(flagKey, 'yes');
        }

        if (didCleanup) {
          window.location.replace(window.location.href);
        }
      } catch (error) {
        console.warn('Netlify cache cleanup failed:', error);
      }
    };

    void cleanServiceWorkers();
  }, []);

  // No loading screen - render immediately
  // Version check happens in background and won't block the UI
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#14b8a6" />
        <meta name="description" content="Employee management portal for Anuranan - Bengali Recitation Training Institute" />
        {/* Cache Control Headers - Prevent browser caching */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <Component {...pageProps} />
      <PWAInstallPrompt />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            maxWidth: '90vw',
          },
          success: {
            iconTheme: {
              primary: '#14b8a6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}
