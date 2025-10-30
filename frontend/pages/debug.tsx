import { useEffect, useState } from 'react';
import Head from 'next/head';
import cacheManager from '@/lib/cacheManager';
import versionManager from '@/lib/versionManager';

export default function Debug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [versionInfo, setVersionInfo] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      addLog('=== Starting Diagnostics ===');
      
      // Check version info
      try {
        addLog('Fetching server version...');
        const serverVersion = await versionManager.fetchServerVersion();
        const storedVersion = versionManager.getStoredVersionInfo();
        
        setVersionInfo({ server: serverVersion, stored: storedVersion });
        addLog(`Server version: ${JSON.stringify(serverVersion)}`);
        addLog(`Stored version: ${JSON.stringify(storedVersion)}`);
      } catch (error) {
        addLog(`Error fetching version: ${error}`);
      }

      // Check cache info
      try {
        addLog('Checking caches...');
        const caches = await cacheManager.getCacheInfo();
        addLog(`Found ${caches.length} cache(s):`);
        caches.forEach(cache => {
          addLog(`  - ${cache.name}: ${cache.size} entries`);
        });
      } catch (error) {
        addLog(`Error checking caches: ${error}`);
      }

      // Check service worker
      addLog(`Service worker active: ${cacheManager.isServiceWorkerActive()}`);
      
      // Check localStorage
      try {
        const storage: any = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('app_') || key?.startsWith('supabase') || key?.startsWith('sb-')) {
            storage[key] = localStorage.getItem(key);
          }
        }
        setStorageInfo(storage);
        addLog(`LocalStorage keys: ${Object.keys(storage).join(', ')}`);
      } catch (error) {
        addLog(`Error checking localStorage: ${error}`);
      }

      addLog('=== Diagnostics Complete ===');
    };

    runDiagnostics();
  }, []);

  const testVersionCheck = async () => {
    addLog('=== Testing Version Check ===');
    try {
      const result = await versionManager.ensureFreshVersion((msg) => addLog(`[versionManager] ${msg}`));
      addLog(`Version check result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Version check error: ${error}`);
    }
  };

  return (
    <>
      <Head>
        <title>Debug - Anuranan Employee Portal</title>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Debug Information</h1>
          
          <div className="mb-6 space-x-2">
            <button
              onClick={testVersionCheck}
              className="btn btn-primary"
            >
              Test Version Check
            </button>
            <a
              href="/clear-cache?auto=true"
              className="btn btn-secondary inline-block"
            >
              Auto Clear Cache
            </a>
            <a
              href="/dashboard"
              className="btn btn-secondary inline-block"
            >
              Go to Dashboard
            </a>
          </div>

          {versionInfo && (
            <div className="bg-white p-6 rounded-lg shadow mb-4">
              <h2 className="text-xl font-semibold mb-3">Version Info</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Server:</strong> {versionInfo.server?.version || 'N/A'} 
                  ({versionInfo.server?.buildDate || 'N/A'})
                </div>
                <div>
                  <strong>Stored:</strong> {versionInfo.stored?.version || 'N/A'} 
                  ({versionInfo.stored?.buildDate || 'N/A'})
                </div>
              </div>
            </div>
          )}

          {storageInfo && (
            <div className="bg-white p-6 rounded-lg shadow mb-4">
              <h2 className="text-xl font-semibold mb-3">LocalStorage</h2>
              <pre className="text-xs overflow-auto bg-gray-100 p-3 rounded">
                {JSON.stringify(storageInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-gray-900 text-green-400 p-6 rounded-lg shadow font-mono text-sm">
            <h2 className="text-lg font-semibold mb-3 text-white">Logs</h2>
            <div className="max-h-96 overflow-y-auto space-y-1">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
