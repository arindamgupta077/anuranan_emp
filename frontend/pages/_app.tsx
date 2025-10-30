import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import versionManager from '@/lib/versionManager';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {

    // Run version check in background without blocking the UI
    versionManager.ensureFreshVersion().catch((error) => {
      console.warn('Background version check failed:', error);
    });

    const cleanupLegacyPWA = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const cleanupKey = 'legacy_pwa_cleanup_v1';
        if (window.localStorage.getItem(cleanupKey) === 'done') {
          return;
        }

        let changesMade = false;

        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          if (registrations.length > 0) {
            await Promise.all(registrations.map((registration) => registration.unregister()));
            changesMade = true;
          }
        }

        if ('caches' in window) {
          const cacheNames = await window.caches.keys();
          if (cacheNames.length > 0) {
            await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
            changesMade = true;
          }
        }

        if (changesMade) {
          window.localStorage.setItem(cleanupKey, 'done');
          console.info('[app] Removed legacy PWA caches and service workers');
        }
      } catch (error) {
        console.warn('Legacy PWA cleanup failed:', error);
      }
    };

    cleanupLegacyPWA();

    // Check active session
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch employee data
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
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Session check error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: employee } = await supabase
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

          if (employee) {
            setAuth(session.user, employee);
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, setLoading]);

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
