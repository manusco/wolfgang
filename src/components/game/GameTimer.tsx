import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
    phaseEndTime: number;
    onExpire?: () => void;
    className?: string;
}

export function GameTimer({ phaseEndTime, onExpire, className = '' }: GameTimerProps) {
    const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((phaseEndTime - Date.now()) / 1000)));

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((phaseEndTime - now) / 1000));

            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                if (onExpire) {
                    onExpire();
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [phaseEndTime, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'} ${className}`}>
            <Clock className="w-5 h-5" />
            <span>
                {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
}
