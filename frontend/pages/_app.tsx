import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import '@/styles/globals.css';

// App version for cache busting - update this when you deploy
const APP_VERSION = '1.0.2';

export default function App({ Component, pageProps }: AppProps) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    // Cache busting: Check version and clear cache if needed
    const checkAndClearCache = async () => {
      const storedVersion = localStorage.getItem('app_version');
      
      if (storedVersion !== APP_VERSION) {
        console.log('New version detected, clearing cache...');
        
        // Clear localStorage except for critical auth data
        const authData = localStorage.getItem('supabase.auth.token');
        localStorage.clear();
        if (authData) {
          localStorage.setItem('supabase.auth.token', authData);
        }
        
        // Update version
        localStorage.setItem('app_version', APP_VERSION);
        
        // Clear service worker cache if available
        if ('serviceWorker' in navigator && 'caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('Cache cleared successfully');
          } catch (error) {
            console.error('Error clearing cache:', error);
          }
        }
        
        // Force reload from server (skip cache)
        window.location.reload();
      }
    };

    checkAndClearCache();

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

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#14b8a6" />
        <meta name="description" content="Employee management portal for Anuranan - Bengali Recitation Training Institute" />
        {/* Cache Control Headers */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="manifest" href={`/manifest.json?v=${APP_VERSION}`} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
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
