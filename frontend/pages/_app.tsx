import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  const [isCheckingVersion, setIsCheckingVersion] = useState(true);

  useEffect(() => {
    // Aggressive cache busting and version checking
    const checkAndUpdateVersion = async () => {
      try {
        // Fetch version.json with cache-busting query parameter
        const timestamp = new Date().getTime();
        const response = await fetch(`/version.json?t=${timestamp}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const serverVersion = await response.json();
          const storedVersion = localStorage.getItem('app_version');
          const storedBuildDate = localStorage.getItem('app_build_date');
          
          console.log('Version check:', {
            server: serverVersion.version,
            stored: storedVersion,
            serverBuildDate: serverVersion.buildDate,
            storedBuildDate: storedBuildDate
          });
          
          // Check if version changed or build date is newer
          if (!storedVersion || 
              storedVersion !== serverVersion.version || 
              storedBuildDate !== serverVersion.buildDate) {
            
            console.log('🔄 New version detected! Clearing cache...');
            
            // Save Supabase auth data before clearing
            const authKeys = Object.keys(localStorage).filter(key => 
              key.startsWith('supabase.auth') || key.startsWith('sb-')
            );
            const authData: Record<string, string> = {};
            authKeys.forEach(key => {
              const value = localStorage.getItem(key);
              if (value) authData[key] = value;
            });
            
            // Clear all localStorage
            localStorage.clear();
            
            // Restore auth data
            Object.entries(authData).forEach(([key, value]) => {
              localStorage.setItem(key, value);
            });
            
            // Store new version info
            localStorage.setItem('app_version', serverVersion.version);
            localStorage.setItem('app_build_date', serverVersion.buildDate);
            localStorage.setItem('cache_cleared_at', new Date().toISOString());
            
            // Clear all service worker caches
            if ('serviceWorker' in navigator) {
              // Unregister service workers
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const registration of registrations) {
                await registration.unregister();
              }
              
              // Clear all caches
              if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                  cacheNames.map(cacheName => {
                    console.log('Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                  })
                );
              }
            }
            
            console.log('✅ Cache cleared! Reloading...');
            
            // Hard reload from server (bypasses all caches)
            window.location.reload();
            return;
          }
        }
      } catch (error) {
        console.error('Error checking version:', error);
      } finally {
        setIsCheckingVersion(false);
      }
    };

    checkAndUpdateVersion();

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

  // Show loading screen while checking version
  if (isCheckingVersion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Checking for updates...</p>
        </div>
      </div>
    );
  }

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
