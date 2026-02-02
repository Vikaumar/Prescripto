import { useState, useEffect } from 'react';
import { isOffline, addConnectionListener } from '../services/offlineStorage';
import './OfflineIndicator.css';

/**
 * Visual indicator when the app is offline
 * Shows a banner at the top of the screen
 */
function OfflineIndicator() {
    const [offline, setOffline] = useState(isOffline());
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setOffline(false);
            // Show "back online" message briefly
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setOffline(true);
            setShowBanner(true);
        };

        const cleanup = addConnectionListener(handleOnline, handleOffline);
        return cleanup;
    }, []);

    if (!showBanner && !offline) return null;

    return (
        <div className={`offline-indicator ${offline ? 'offline' : 'online'}`}>
            <div className="offline-indicator-content">
                {offline ? (
                    <>
                        <svg className="offline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                        </svg>
                        <span>You're offline. Some features may be limited.</span>
                    </>
                ) : (
                    <>
                        <svg className="online-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                        </svg>
                        <span>Back online!</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default OfflineIndicator;
