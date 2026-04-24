import React, { useState, useEffect } from 'react';
import { WifiOff, Download, Bell, X, Check, CloudOff, RefreshCw } from 'lucide-react';

export function PWABanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
        setIsOffline(false);
        setSyncing(true);
        // Simulate sync delay
        setTimeout(() => setSyncing(false), 2000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Install Prompt Handling (A2HS)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if we have a prompt
      if (!localStorage.getItem('alaias_install_dismissed')) {
          setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Push Notifications
    if ('Notification' in window && Notification.permission === 'default') {
        if (!localStorage.getItem('alaias_push_dismissed')) {
            setShowPushBanner(true);
        }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleDismissInstall = () => {
      localStorage.setItem('alaias_install_dismissed', 'true');
      setShowInstallBanner(false);
  };

  const handleEnablePush = async () => {
      if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
              console.log('Push notifications enabled');
              new Notification('Alaias', {
                  body: 'Notificações ativadas com sucesso!',
                  icon: '/pwa-192x192.png'
              });
          }
      }
      setShowPushBanner(false);
  };

  const handleDismissPush = () => {
      localStorage.setItem('alaias_push_dismissed', 'true');
      setShowPushBanner(false);
  };

  return (
    <>
      {/* Offline/Sync Indicator (Top Fixed) */}
      {(isOffline || syncing) && (
        <div className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest ${isOffline ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
             {isOffline ? (
                 <>
                    <CloudOff className="w-4 h-4" />
                    <span>Modo Offline (Salvo Localmente)</span>
                 </>
             ) : (
                 <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sincronizando...</span>
                 </>
             )}
        </div>
      )}

      {/* Install Banner (Bottom Floating) */}
      {showInstallBanner && (
          <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-[#1C1C24] border border-primary-500/30 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10">
              <div className="flex items-start gap-3">
                  <div className="bg-primary-500/20 p-2 rounded-xl text-primary-400">
                      <Download className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-1">Instalar Aplicativo</h4>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3">Adicione o Alaias à tela inicial para acesso rápido offline.</p>
                      <div className="flex gap-2">
                          <button onClick={handleInstallClick} className="flex-1 bg-primary-400 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-xl hover:bg-primary-500">Instalar</button>
                      </div>
                  </div>
                  <button onClick={handleDismissInstall} className="text-gray-500 hover:text-white p-1">
                      <X className="w-4 h-4" />
                  </button>
              </div>
          </div>
      )}

      {/* Push Banner (Bottom Floating) */}
      {showPushBanner && !showInstallBanner && (
          <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-[#1C1C24] border border-violet-500/30 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10">
              <div className="flex items-start gap-3">
                  <div className="bg-violet-500/20 p-2 rounded-xl text-violet-400">
                      <Bell className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-1">Notificações</h4>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3">Receba lembretes de hábitos, metas e financeiro.</p>
                      <div className="flex gap-2">
                          <button onClick={handleEnablePush} className="flex-1 bg-violet-500 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-xl hover:bg-violet-600">Ativar</button>
                      </div>
                  </div>
                  <button onClick={handleDismissPush} className="text-gray-500 hover:text-white p-1">
                      <X className="w-4 h-4" />
                  </button>
              </div>
          </div>
      )}
    </>
  );
}
