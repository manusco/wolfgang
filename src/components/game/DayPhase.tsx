import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { submitDayVote } from '../../lib/gameService';
import { Sun, Vote } from 'lucide-react';

export function DayPhase() {
    const { game, playerId } = useGameStore();
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    if (!game || !playerId) return null;

    const currentPlayer = game.players[playerId];
    const alivePlayers = Object.values(game.players).filter(p => p.isAlive && p.id !== playerId);
    const timeRemaining = Math.max(0, Math.floor((game.phaseEndTime - Date.now()) / 1000));

    const handleVote = async () => {
        if (!selectedTarget || !game) return;

        try {
            await submitDayVote(game.id, playerId, selectedTarget);
            setHasVoted(true);
        } catch (error) {
            console.error('Error submitting vote:', error);
        }
    };

    // Dead players see the voting but can't participate
    if (!currentPlayer.isAlive) {
        return (
            <div className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">👻</span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-400">Geistermodus</h2>
                            <p className="text-sm text-gray-500">Du beobachtest das Spiel...</p>
                        </div>
                    </div>
                    <p className="text-gray-400">
                        Du kannst das Geschehen verfolgen, aber nicht mehr abstimmen.
                    </p>
                </Card>

                <Card>
                    <h3 className="text-lg font-bold mb-4">Lebende Spieler:</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.values(game.players)
                            .filter(p => p.isAlive)
                            .map(player => (
                                <div
                                    key={player.id}
                                    className="p-4 rounded-lg bg-white/5 border border-white/10 opacity-50"
                                >
                                    <div className="text-3xl mb-2">{player.avatar}</div>
                                    <div className="text-sm font-medium" translate="no">{player.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{player.role}</div>
                                </div>
                            ))}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="bg-yellow-900/10 border-yellow-600/30">
                <div className="flex items-center gap-3 mb-4">
                    <Sun className="w-6 h-6 text-yellow-500" />
                    <div>
                        <h2 className="text-xl font-bold text-yellow-500">Tagphase</h2>
                        <p className="text-sm text-gray-400">Diskussionszeit: {timeRemaining}s</p>
                    </div>
                </div>
                <p className="text-gray-300">
                    {hasVoted
                        ? 'Deine Stimme wurde abgegeben. Warte auf die anderen Spieler...'
                        : 'Diskutiert und stimmt ab, wen ihr verdächtigt!'}
                </p>
            </Card>

            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Vote className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold">Wen verdächtigst du?</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {alivePlayers.map(player => (
                        <button
                            key={player.id}
                            onClick={() => !hasVoted && setSelectedTarget(player.id)}
                            disabled={hasVoted}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedTarget === player.id
                                ? 'border-yellow-500 bg-yellow-500/20'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                } ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="text-3xl mb-2">{player.avatar}</div>
                            <div className="text-sm font-medium" translate="no">{player.name}</div>
                            {hasVoted && game.dayVotes[playerId] === player.id && (
                                <div className="text-xs text-yellow-500 mt-1">✓ Gewählt</div>
                            )}
                        </button>
                    ))}
                </div>

                {selectedTarget && !hasVoted && (
                    <Button onClick={handleVote} className="w-full mt-4">
                        Stimme abgeben
                    </Button>
                )}

                {hasVoted && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
                        <p className="text-sm text-green-400">
                            ✓ Du hast für <span translate="no">{game.players[selectedTarget!]?.name}</span> gestimmt
                        </p>
                    </div>
                )}
            </Card>

            {/* Vote count display (visible to all) */}
            {Object.keys(game.dayVotes).length > 0 && (
                <Card>
                    <h3 className="text-sm font-bold text-gray-400 mb-3">
                        Stimmen abgegeben: {Object.keys(game.dayVotes).length} /{' '}
                        {Object.values(game.players).filter(p => p.isAlive).length}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                        {Object.values(game.players)
                            .filter(p => p.isAlive)
                            .map(player => (
                                <div
                                    key={player.id}
                                    className={`px-3 py-1 rounded-full text-xs ${game.dayVotes[player.id]
                                        ? 'bg-green-900/30 text-green-400'
                                        : 'bg-gray-800/30 text-gray-500'
                                        }`}
                                >
                                    {player.avatar} {game.dayVotes[player.id] ? '✓' : '○'}
                                </div>
                            ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
