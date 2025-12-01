import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Game() {
    const { gameId } = useParams();
    const { game, setGame } = useGameStore();

    // Mock game state for development
    useEffect(() => {
        if (!game) {
            setGame({
                id: gameId || 'test',
                hostId: '1',
                status: 'LOBBY',
                phaseEndTime: Date.now() + 10000,
                players: {
                    '1': { id: '1', name: 'Lukas', role: 'WOLF', isAlive: true, avatar: '🐺' },
                    '2': { id: '2', name: 'Sarah', role: 'SEER', isAlive: true, avatar: '🔮' },
                },
                nightActions: {
                    wolfVotes: {},
                    witchHealUsed: false,
                    witchPoisonUsed: false,
                    seerCheck: null,
                },
                dayVotes: {},
                winner: null,
            });
        }
    }, [gameId, game, setGame]);

    if (!game) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Raum: {game.id}</h2>
                <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-mono">
                    {game.status}
                </span>
            </div>

            <Card>
                <div className="text-center space-y-4">
                    <h3 className="text-2xl font-cinzel text-blood-red">
                        {game.status === 'NIGHT' ? 'Die Nacht bricht herein...' : 'Der Tag erwacht'}
                    </h3>
                    <p className="text-gray-400">
                        {game.status === 'NIGHT'
                            ? 'Alle schlafen. Nur die Wölfe sind wach.'
                            : 'Diskutiert! Wer ist der Werwolf?'}
                    </p>

                    <div className="py-8">
                        {/* Placeholder for Phase UI */}
                        <div className="text-6xl animate-pulse">
                            {game.status === 'NIGHT' ? '🌙' : '☀️'}
                        </div>
                    </div>

                    <Button
                        onClick={() => setGame({
                            ...game,
                            status: game.status === 'NIGHT' ? 'DAY' : 'NIGHT'
                        })}
                    >
                        Phase wechseln (Debug)
                    </Button>
                </div>
            </Card>
        </div>
    );
}
