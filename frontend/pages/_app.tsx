import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const syncSession = async (session: Session | null, { showLoader = true }: { showLoader?: boolean } = {}) => {
      console.log('[AUTH SYNC] Starting session sync', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        showLoader,
        timestamp: new Date().toISOString()
      });

      if (!session?.user) {
        console.log('[AUTH SYNC] No session/user, clearing auth');
        clearAuth();
        if (showLoader) {
          setLoading(false);
        }
        return;
      }

      if (showLoader) {
        console.log('[AUTH SYNC] Setting loading state to true');
        setLoading(true);
      }
      
      try {
        console.log('[AUTH SYNC] Fetching employee data from Supabase...');
        const startTime = Date.now();
        
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

        const duration = Date.now() - startTime;
        console.log('[AUTH SYNC] Supabase query completed', {
          duration: `${duration}ms`,
          hasEmployee: !!employee,
          hasError: !!error,
          errorDetails: error,
          employeeId: employee?.id,
          employeeName: employee?.full_name,
          roleName: employee?.roles?.name
        });

        if (employee && !error) {
          console.log('[AUTH SYNC] ✅ Setting auth with employee data');
          setAuth(session.user, employee);
        } else {
          console.error('[AUTH SYNC] ❌ Failed to get employee, clearing auth', {
            error,
            employee
          });
          clearAuth();
        }
      } catch (error) {
        console.error('[AUTH SYNC] ❌ Exception during session sync:', error);
        clearAuth();
      } finally {
        if (showLoader) {
          console.log('[AUTH SYNC] Setting loading state to false');
          setLoading(false);
        }
        console.log('[AUTH SYNC] Sync completed');
      }
    };

    console.log('[APP INIT] Starting app initialization', {
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      isNetlify: shouldApplyNetlifyFix()
    });

    // Run version check in background without blocking the UI
    versionManager.ensureFreshVersion().catch((error) => {
      console.warn('[VERSION] Background version check failed:', error);
    });

    const initialiseAuth = async () => {
      try {
        console.log('[APP INIT] Getting initial session from Supabase...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('[APP INIT] Session retrieved', {
          hasSession: !!session,
          hasError: !!error,
          errorDetails: error
        });

        await syncSession(session);
      } catch (error) {
        console.error('[APP INIT] ❌ Initial session check error:', error);
        clearAuth();
        setLoading(false);
      }
    };

    initialiseAuth();

    console.log('[APP INIT] Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH EVENT]', {
          event,
          hasSession: !!session,
          timestamp: new Date().toISOString()
        });

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          await syncSession(session, { showLoader: true });
        } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await syncSession(session, { showLoader: false });
        } else if (event === 'SIGNED_OUT') {
          console.log('[AUTH EVENT] User signed out, clearing auth');
          clearAuth();
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, setLoading]);

  // Show debug panel on Netlify after 5 seconds of loading
  useEffect(() => {
    if (!shouldApplyNetlifyFix()) return;
    
    const timer = setTimeout(() => {
      const authState = useAuthStore.getState();
      if (authState.isLoading) {
        console.warn('[DEBUG] Still loading after 5 seconds!', authState);
        setShowDebug(true);
        setDebugInfo([
          `Loading stuck at: ${new Date().toISOString()}`,
          `Auth state: ${JSON.stringify(authState, null, 2)}`,
          `Window URL: ${window.location.href}`,
          `Service Workers: ${navigator.serviceWorker ? 'Supported' : 'Not supported'}`
        ]);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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

      {/* Debug Panel for Netlify Issues */}
      {showDebug && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#ff4444',
          color: 'white',
          padding: '20px',
          zIndex: 99999,
          fontSize: '12px',
          fontFamily: 'monospace',
          maxHeight: '50vh',
          overflow: 'auto'
        }}>
          <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
            ⚠️ Loading Stuck - Debug Info
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Check browser console for detailed logs</strong>
          </div>
          {debugInfo.map((info, i) => (
            <div key={i} style={{ marginBottom: '5px', whiteSpace: 'pre-wrap' }}>{info}</div>
          ))}
          <button
            onClick={() => {
              console.log('[DEBUG] Force clearing cache and reloading...');
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              background: 'white',
              color: '#ff4444',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Clear Cache & Reload
          </button>
        </div>
      )}

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
