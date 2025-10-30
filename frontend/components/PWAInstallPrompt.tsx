import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    // Don't show if already installed or dismissed recently
    if (isInStandaloneMode || (dismissedTime > oneDayAgo)) {
      return;
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // 3 seconds delay
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show custom prompt after delay
    if (ios && !isInStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA install');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[100] animate-fade-in"
        onClick={handleDismiss}
      />
      
      {/* Install Prompt Dialog */}
      <div className="fixed inset-x-0 bottom-0 z-[101] animate-slide-up">
        <div className="bg-white rounded-t-2xl shadow-2xl mx-auto max-w-md">
          {/* Handle bar */}
          <div className="flex justify-center pt-3">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <div className="p-6">
            {/* App Icon & Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">A</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Install Anuranan App
                </h3>
                <p className="text-sm text-gray-600">
                  Get quick access from your home screen
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600">⚡</span>
                </div>
                <span className="text-gray-700">Instant access from home screen</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600">📱</span>
                </div>
                <span className="text-gray-700">Works like a native app</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600">🔔</span>
                </div>
                <span className="text-gray-700">Get notifications & updates</span>
              </div>
            </div>

            {/* iOS Instructions */}
            {isIOS && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  📲 To install on iOS:
                </p>
                <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                  <li>Tap the Share button <span className="inline-block">⎙</span> in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md"
                >
                  Install App
                </button>
              )}
              {isIOS && (
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md"
                >
                  Got It!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
