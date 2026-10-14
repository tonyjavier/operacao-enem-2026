import { useEffect, useState } from 'react';
import { Check, Download } from 'lucide-react';
import { Button } from './UI';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) {
      setShowHelp((current) => !current);
      return;
    }
    setShowHelp(false);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
    } catch {
      setShowHelp(true);
    } finally {
      setInstallPrompt(null);
    }
  }

  return (
    <div className="install-app-wrap">
      <Button
        type="button"
        variant="secondary"
        className="install-app-button"
        onClick={() => void install()}
        disabled={installed}
        aria-expanded={showHelp}
        aria-controls="install-app-help"
      >
        {installed ? <Check size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
        {installed ? 'App instalado' : 'Instalar app'}
      </Button>
      <div className="install-app-help" id="install-app-help" role="status" hidden={!showHelp || installed}>
        <p>iPhone/iPad: Compartilhar → Adicionar à Tela de Início.</p>
        <p>Android/desktop: menu do navegador → Instalar app.</p>
      </div>
    </div>
  );
}
