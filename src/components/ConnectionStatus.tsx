import { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

// If the connectivity probe does not resolve within this window we treat the
// connection as failed instead of spinning forever.
const CHECK_TIMEOUT_MS = 10000;

export function ConnectionStatus() {
    const { language } = useLanguageStore();
    const t = translations[language].connection;
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [visible, setVisible] = useState(true);

    const checkConnection = useCallback(async () => {
        setStatus('checking');
        setVisible(true);
        try {
            // Reading a game-code doc works under both the open dev rules and the
            // scoped production rules (a non-existent room simply returns empty).
            const probe = getDoc(doc(db, 'games', 'ZZZZ'));
            const timeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Connection timed out')), CHECK_TIMEOUT_MS)
            );
            await Promise.race([probe, timeout]);
            setStatus('connected');
        } catch (err: unknown) {
            console.error('Firebase connection error:', err);
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    // The green "connected" badge is confirmation, not a permanent fixture:
    // fade it out shortly after a successful check so it stops covering the UI.
    useEffect(() => {
        if (status === 'connected') {
            const id = setTimeout(() => setVisible(false), 2500);
            return () => clearTimeout(id);
        }
    }, [status]);

    if (!visible) return null;

    return (
        <div
            className="fixed bottom-3 left-3 z-40"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {status === 'checking' && (
                <div className="flex items-center gap-2 text-gray-300 text-xs bg-black/40 px-2.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{t.connecting}</span>
                </div>
            )}
            {status === 'connected' && (
                <div className="flex items-center gap-2 text-green-400 text-xs bg-green-900/30 px-2.5 py-1.5 rounded-full border border-green-500/20 backdrop-blur-sm">
                    <Wifi className="w-3 h-3" />
                    <span>{t.connected}</span>
                </div>
            )}
            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-300 text-xs bg-red-900/40 px-2.5 py-1.5 rounded-full border border-red-500/30 backdrop-blur-sm">
                    <WifiOff className="w-3 h-3" />
                    <span>{t.failed}</span>
                    <button
                        onClick={checkConnection}
                        className="ml-1 underline hover:text-red-100 font-medium"
                    >
                        {t.retry}
                    </button>
                </div>
            )}
        </div>
    );
}
