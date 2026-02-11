import { useState, useEffect } from 'react';
import './InstallPrompt.css';

/**
 * PWA Install Prompt Component
 * Shows a custom "Add to Home Screen" prompt + permanent install button
 */
function InstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showFloatingBtn, setShowFloatingBtn] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if already dismissed popup
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedAt = dismissed ? new Date(dismissed) : null;
        const daysSinceDismissed = dismissedAt
            ? (new Date() - dismissedAt) / (1000 * 60 * 60 * 24)
            : null;

        // Listen for beforeinstallprompt event
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            setShowFloatingBtn(true); // Always show floating button

            // Show popup only if not dismissed recently
            if (!dismissedAt || daysSinceDismissed >= 7) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setShowFloatingBtn(false);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;

        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setShowFloatingBtn(false);
        } else {
            console.log('User dismissed the install prompt');
        }

        setInstallPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    };

    // Don't render anything if installed
    if (isInstalled) return null;

    return (
        <>
            {/* Floating Install Button - Only when popup is NOT showing */}
            {showFloatingBtn && installPrompt && !showPrompt && (
                <button
                    className="install-floating-btn"
                    onClick={handleInstall}
                    title="Install Prescripto App"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Install App</span>
                </button>
            )}

            {/* Popup Prompt - Shows once, can be dismissed */}
            {showPrompt && (
                <div className="install-prompt">
                    <div className="install-prompt-content">
                        <div className="install-prompt-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </div>
                        <div className="install-prompt-text">
                            <h4>Install Prescripto</h4>
                            <p>Add to your home screen for quick access and offline use</p>
                        </div>
                        <div className="install-prompt-actions">
                            <button className="install-btn" onClick={handleInstall}>
                                Install
                            </button>
                            <button className="dismiss-btn" onClick={handleDismiss}>
                                Not now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default InstallPrompt;

