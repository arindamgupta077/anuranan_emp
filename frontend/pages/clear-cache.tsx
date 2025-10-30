import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import cacheManager from '../lib/cacheManager';

export default function ClearCache() {
  const router = useRouter();
  const [status, setStatus] = useState('Clearing cache and service workers...');
  const [logs, setLogs] = useState<string[]>([]);
  const [cacheInfo, setCacheInfo] = useState<{ name: string; size: number }[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  useEffect(() => {
    // Get cache info first
    const getCacheInfoFirst = async () => {
      const info = await cacheManager.getCacheInfo();
      setCacheInfo(info);
      addLog(`Current app version: ${cacheManager.getCurrentVersion() || 'Not set'}`);
      addLog(`Service worker active: ${cacheManager.isServiceWorkerActive() ? 'Yes' : 'No'}`);
      addLog(`Found ${info.length} cache(s)`);
      info.forEach(cache => {
        addLog(`  - ${cache.name}: ${cache.size} items`);
      });
      addLog('---');
    };

    getCacheInfoFirst();
  }, []);

  const clearEverything = async () => {
    try {
      setLogs([]);
      setStatus('Clearing cache and service workers...');

      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        addLog('Finding service workers...');
        const registrations = await navigator.serviceWorker.getRegistrations();
        addLog(`Found ${registrations.length} service worker(s)`);
        
        for (const registration of registrations) {
          addLog(`Unregistering service worker: ${registration.scope}`);
          await registration.unregister();
        }
        addLog('All service workers unregistered');
      }

      // Clear all caches
      if ('caches' in window) {
        addLog('Finding caches...');
        const cacheNames = await caches.keys();
        addLog(`Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`);
        
        for (const cacheName of cacheNames) {
          addLog(`Deleting cache: ${cacheName}`);
          await caches.delete(cacheName);
        }
        addLog('All caches cleared');
      }

      // Clear local storage (preserve auth)
      addLog('Clearing localStorage (preserving auth)...');
      const authData = localStorage.getItem('supabase.auth.token');
      localStorage.clear();
      if (authData) {
        localStorage.setItem('supabase.auth.token', authData);
        addLog('Auth data preserved');
      }
      addLog('localStorage cleared');

      // Clear session storage
      addLog('Clearing sessionStorage...');
      sessionStorage.clear();
      addLog('sessionStorage cleared');

      setStatus('✅ Successfully cleared all cache and service workers!');
      addLog('');
      addLog('✅ All cleared! Redirecting to home page in 3 seconds...');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      setStatus('❌ Error clearing cache');
      addLog(`Error: ${error}`);
    }
  };

  return (
    <>
      <Head>
        <title>Clear Cache - Anuranan Employee Portal</title>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Cache Cleaner</h1>
          <p className="text-lg mb-4 font-semibold">{status}</p>
          
          {cacheInfo.length > 0 && (
            <div className="mb-4">
              <button
                onClick={clearEverything}
                className="btn btn-primary w-full"
              >
                🗑️ Clear All Caches Now
              </button>
            </div>
          )}
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-semibold text-blue-900 mb-2">Manual Steps (if needed):</h2>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Press <kbd className="px-2 py-1 bg-blue-200 rounded">F12</kbd> to open Developer Tools</li>
            <li>Go to the <strong>Application</strong> tab</li>
            <li>Click <strong>Clear storage</strong> in the left sidebar</li>
            <li>Check all boxes and click <strong>Clear site data</strong></li>
            <li>Close and reopen your browser</li>
          </ol>
        </div>
      </div>
    </div>
    </>
  );
}
