import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { submitWolfVote, submitSeerCheck } from '../../lib/gameService';
import { Moon, Eye } from 'lucide-react';
import { VillagerMinigame } from './VillagerMinigame';

export function NightPhase() {
    const { game, playerId } = useGameStore();
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [hasActed, setHasActed] = useState(false);

    if (!game || !playerId) return null;

    const currentPlayer = game.players[playerId];
    const alivePlayers = Object.values(game.players).filter(p => p.isAlive && p.id !== playerId);
    const timeRemaining = Math.max(0, Math.floor((game.phaseEndTime - Date.now()) / 1000));

    const handleSubmitAction = async () => {
        if (!selectedTarget || !game) return;

        try {
            if (currentPlayer.role === 'WOLF') {
                await submitWolfVote(game.id, playerId, selectedTarget);
            } else if (currentPlayer.role === 'SEER') {
                await submitSeerCheck(game.id, selectedTarget);
            }
            setHasActed(true);
        } catch (error) {
            console.error('Error submitting night action:', error);
        }
    };

    // Werewolf view
    if (currentPlayer.role === 'WOLF') {
        const otherWolves = Object.values(game.players).filter(
            p => p.role === 'WOLF' && p.id !== playerId
        );

        return (
            <div className="space-y-6">
                <Card className="bg-blood-red/10 border-blood-red/30">
                    <div className="flex items-center gap-3 mb-4">
                        <Moon className="w-6 h-6 text-blood-red" />
                        <div>
                            <h2 className="text-xl font-bold text-blood-red">Nachtphase</h2>
                            <p className="text-sm text-gray-400">Zeit: {timeRemaining}s</p>
                        </div>
                    </div>

                    {otherWolves.length > 0 && (
                        <div className="mb-4 p-3 bg-black/20 rounded-lg">
                            <p className="text-sm text-gray-400 mb-2">Dein Rudel:</p>
                            <div className="flex gap-2">
                                {otherWolves.map(wolf => (
                                    <div key={wolf.id} className="flex items-center gap-1 text-blood-red">
                                        <span className="text-xl">{wolf.avatar}</span>
                                        <span className="text-sm">{wolf.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-gray-300 mb-4">
                        {hasActed ? 'Deine Stimme wurde abgegeben.' : 'Wähle ein Opfer:'}
                    </p>
                </Card>

                <Card>
                    <div className="grid grid-cols-2 gap-3">
                        {alivePlayers.map(player => (
                            <button
                                key={player.id}
                                onClick={() => !hasActed && setSelectedTarget(player.id)}
                                disabled={hasActed}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedTarget === player.id
                                    ? 'border-blood-red bg-blood-red/20'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    } ${hasActed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="text-3xl mb-2">{player.avatar}</div>
                                <div className="text-sm font-medium">{player.name}</div>
                                {game.nightActions.wolfVotes[player.id] && (
                                    <div className="text-xs text-blood-red mt-1">
                                        {Object.values(game.nightActions.wolfVotes).filter(
                                            id => id === player.id
                                        ).length} 🐺
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {selectedTarget && !hasActed && (
                        <Button
                            onClick={handleSubmitAction}
                            className="w-full mt-4"
                            variant="danger"
                        >
                            Bestätigen
                        </Button>
                    )}
                </Card>
            </div>
        );
    }

    // Seer view
    if (currentPlayer.role === 'SEER') {
        return (
            <div className="space-y-6">
                <Card className="bg-purple-900/20 border-purple-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-purple-400" />
                        <div>
                            <h2 className="text-xl font-bold text-purple-400">Seherin</h2>
                            <p className="text-sm text-gray-400">Zeit: {timeRemaining}s</p>
                        </div>
                    </div>
                    <p className="text-gray-300">
                        {hasActed ? 'Du hast nachgesehen.' : 'Wähle einen Spieler zum Untersuchen:'}
                    </p>
                </Card>

                <Card>
                    <div className="grid grid-cols-2 gap-3">
                        {alivePlayers.map(player => (
                            <button
                                key={player.id}
                                onClick={() => {
                                    if (!hasActed) {
                                        setSelectedTarget(player.id);
                                        submitSeerCheck(game.id, player.id);
                                        setHasActed(true);
                                    }
                                }}
                                disabled={hasActed}
                                className={`p-4 rounded-lg border-2 transition-all ${hasActed && selectedTarget === player.id
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    } ${hasActed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="text-3xl mb-2">{player.avatar}</div>
                                <div className="text-sm font-medium">{player.name}</div>
                                {hasActed && selectedTarget === player.id && (
                                    <div className="text-xs text-purple-400 mt-2">
                                        Rolle: {player.role === 'WOLF' ? '🐺 WOLF' : '👤 DORF'}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    // Villager / Witch / Hunter view - interactive mini-game
    return (
        <div className="space-y-6">
            <Card className="bg-midnight-blue/50">
                <div className="flex items-center gap-3 mb-4">
                    <Moon className="w-6 h-6 text-blue-400" />
                    <div>
                        <h2 className="text-xl font-bold">Die Nacht bricht herein...</h2>
                        <p className="text-sm text-gray-400">Zeit: {timeRemaining}s</p>
                    </div>
                </div>
                <p className="text-gray-300 mb-6">
                    {currentPlayer.role === 'VILLAGER'
                        ? 'Du schläfst friedlich...'
                        : `Du bist ${currentPlayer.role === 'WITCH' ? 'eine Hexe' : 'ein Jäger'} und ruhst dich aus...`}
                </p>

                {/* Interactive mini-game */}
                <VillagerMinigame timeRemaining={timeRemaining} />
            </Card>
        </div>
    );
}
