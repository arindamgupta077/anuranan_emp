import { useEffect, useState } from 'react';
import Head from 'next/head';
import cacheManager from '@/lib/cacheManager';

export default function ClearCache() {
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
      
      // Auto-clear if URL has ?auto=true parameter
      const params = new URLSearchParams(window.location.search);
      if (params.get('auto') === 'true') {
        addLog('Auto-clear mode detected, clearing in 2 seconds...');
        setTimeout(() => {
          clearEverything();
        }, 2000);
      }
    };

    getCacheInfoFirst();
  }, []);

  const clearEverything = async () => {
    try {
      setLogs([]);
      setStatus('Clearing cache and service workers...');
      const result = await cacheManager.clearAllCaches({ logger: addLog });

      if (result.preservedAuthKeys.length === 0) {
        addLog('No auth keys detected for preservation');
      } else {
        addLog(`Preserved auth keys: ${result.preservedAuthKeys.join(', ')}`);
      }

      if (result.removedCaches.length === 0) {
        addLog('No caches were registered');
      } else {
        addLog(`Removed caches: ${result.removedCaches.join(', ')}`);
      }

      if (result.unregisteredWorkers.length === 0) {
        addLog('No active service workers found');
      } else {
        addLog(`Unregistered service workers: ${result.unregisteredWorkers.join(', ')}`);
      }

      setCacheInfo([]);

      setStatus('✅ Successfully cleared all cache and service workers!');
      addLog('');
      addLog('✅ All cleared! Redirecting to home page in 3 seconds...');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      setStatus('❌ Error clearing cache');
      const message = error instanceof Error ? error.message : String(error);
      addLog(`Error: ${message}`);
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
