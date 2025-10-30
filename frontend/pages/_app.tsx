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
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const syncSession = async (session: Session | null, { showLoader = true }: { showLoader?: boolean } = {}) => {
      if (!session?.user) {
        clearAuth();
        if (showLoader) {
          setLoading(false);
        }
        return;
      }

      if (showLoader) {
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
          clearAuth();
        }
      } catch (error) {
        console.error('Session sync error:', error);
        clearAuth();
      } finally {
        if (showLoader) {
          setLoading(false);
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
        await syncSession(session);
      } catch (error) {
        console.error('Initial session check error:', error);
        clearAuth();
        setLoading(false);
      }
    };

    initialiseAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          await syncSession(session, { showLoader: true });
        } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await syncSession(session, { showLoader: false });
        } else if (event === 'SIGNED_OUT') {
          clearAuth();
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, setLoading]);

  // Netlify-specific cleanup disabled - was causing reload loops
  // Service worker and cache issues should be handled by proper Next.js PWA configuration
  // Users can manually clear cache via browser if needed

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
