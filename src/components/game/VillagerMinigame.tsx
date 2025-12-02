import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';

interface Firefly {
    id: number;
    x: number;
    y: number;
    caught: boolean;
}

interface VillagerMinigameProps {
    timeRemaining: number;
}

export function VillagerMinigame({ timeRemaining }: VillagerMinigameProps) {
    const { language } = useLanguageStore();
    const t = translations[language];
    const [fireflies, setFireflies] = useState<Firefly[]>([]);
    const [score, setScore] = useState(0);
    const [nextId, setNextId] = useState(0);

    // Spawn fireflies periodically
    useEffect(() => {
        const spawnInterval = setInterval(() => {
            if (timeRemaining > 0) {
                const newFirefly: Firefly = {
                    id: nextId,
                    x: Math.random() * 80 + 10, // Keep fireflies within 10-90% of container
                    y: Math.random() * 80 + 10,
                    caught: false,
                };
                setFireflies(prev => [...prev.filter(f => !f.caught), newFirefly].slice(-8)); // Max 8 fireflies
                setNextId(prev => prev + 1);
            }
        }, 1500);

        return () => clearInterval(spawnInterval);
    }, [nextId, timeRemaining]);

    // Remove fireflies after some time
    useEffect(() => {
        const removeInterval = setInterval(() => {
            setFireflies(prev => prev.filter((_, index) => index < 5 || Math.random() > 0.3));
        }, 3000);

        return () => clearInterval(removeInterval);
    }, []);

    const catchFirefly = (id: number) => {
        setFireflies(prev =>
            prev.map(f => (f.id === id ? { ...f, caught: true } : f))
        );
        setScore(prev => prev + 1);

        // Remove caught firefly after animation
        setTimeout(() => {
            setFireflies(prev => prev.filter(f => f.id !== id));
        }, 500);
    };

    return (
        <div className="relative">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-blue-300 mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {t.minigame.catchFireflies}
                </h3>
                <p className="text-sm text-gray-400">
                    {t.minigame.caught}: <span className="text-blue-400 font-bold">{score}</span>
                </p>
            </div>

            <div className="relative bg-gradient-to-b from-midnight-blue to-deep-purple rounded-lg overflow-hidden border border-blue-500/20"
                style={{ height: '320px' }}>

                {/* Ambient background effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

                {/* Fireflies */}
                <AnimatePresence>
                    {fireflies.map(firefly => (
                        <motion.button
                            key={firefly.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: firefly.caught ? 0 : 1,
                                opacity: firefly.caught ? 0 : 1,
                                x: [0, Math.random() * 20 - 10, 0],
                                y: [0, Math.random() * 20 - 10, 0],
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                scale: { duration: 0.3 },
                                opacity: { duration: 0.3 },
                                x: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                                y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            onClick={() => !firefly.caught && catchFirefly(firefly.id)}
                            className="absolute cursor-pointer"
                            style={{
                                left: `${firefly.x}%`,
                                top: `${firefly.y}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <div className="relative">
                                <Sparkles className="w-8 h-8 text-yellow-300" />
                                <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-md animate-pulse" />
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {/* Instructions */}
                {fireflies.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">{t.minigame.waitingForFireflies}</p>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
                {t.minigame.tapToPlay}
            </p>
        </div>
    );
}
