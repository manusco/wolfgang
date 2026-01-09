import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        async function checkConnection() {
            try {
                // Try to fetch a non-existent collection just to check connectivity/auth
                const q = query(collection(db, 'test_connection'), limit(1));
                await getDocs(q);
                setStatus('connected');
            } catch (err: any) {
                console.error("Firebase connection error:", err);
                setStatus('error');
                setErrorMsg(err.message);
            }
        }

        checkConnection();
    }, []);

    if (status === 'checking') return <div className="text-xs text-gray-500">Connecting to Firebase...</div>;

    if (status === 'error') {
        return (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-900/20 px-2 py-1 rounded border border-red-500/20">
                <WifiOff className="w-3 h-3" />
                <span>Connection Failed: {errorMsg}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-green-500 text-xs bg-green-900/20 px-2 py-1 rounded border border-green-500/20">
            <Wifi className="w-3 h-3" />
            <span>Firebase Connected</span>
        </div>
    );
}
