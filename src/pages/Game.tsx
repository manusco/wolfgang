import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { subscribeToGame } from '../lib/gameService';
import { Card } from '../components/ui/Card';
import { NightPhase } from '../components/game/NightPhase';
import { DayPhase } from '../components/game/DayPhase';
import { HostControls } from '../components/game/HostControls';
import { Moon, Sun, Trophy } from 'lucide-react';

export function Game() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { game, setGame, playerId } = useGameStore();

    // Subscribe to game updates
    useEffect(() => {
        if (!gameId) {
            navigate('/');
            return;
        }

        const unsubscribe = subscribeToGame(gameId, (updatedGame) => {
            setGame(updatedGame);
        });

        return () => unsubscribe();
    }, [gameId, setGame, navigate]);

    if (!game) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card>
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-red mx-auto mb-4" />
                        <p className="text-gray-400">Lade Spiel...</p>
                    </div>
                </Card>
            </div>
        );
    }

    const currentPlayer = playerId ? game.players[playerId] : null;

    // Render based on game status
    if (game.status === 'LOBBY') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card>
                    <div className="text-center py-8">
                        <Moon className="w-12 h-12 text-blood-red mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Warte auf Spielstart...</h2>
                        <p className="text-gray-400">Der Host startet das Spiel gleich.</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (game.status === 'GAMEOVER') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md mx-auto">
                    <div className="text-center py-8">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">
                            {game.winner === 'WEREWOLVES' ? '🐺 Werwölfe gewinnen!' : '👥 Dorf gewinnt!'}
                        </h2>
                        <p className="text-gray-400 mb-6">Das Spiel ist vorbei.</p>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold mb-3">Rollen-Enthüllung:</h3>
                            {Object.values(game.players).map(player => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{player.avatar}</span>
                                        <span>{player.name}</span>
                                    </div>
                                    <span className={`text-sm ${player.role === 'WOLF' ? 'text-blood-red' : 'text-blue-400'}`}>
                                        {player.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full p-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Raum: {game.id}</h2>
                <div className="flex items-center gap-2">
                    {game.status === 'NIGHT' ? (
                        <Moon className="w-5 h-5 text-blue-400" />
                    ) : (
                        <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-mono">
                        {game.status}
                    </span>
                </div>
            </div>

            {/* Role reminder */}
            {currentPlayer && (
                <Card className="bg-midnight-blue/30 border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{currentPlayer.avatar}</span>
                        <div>
                            <p className="text-sm text-gray-400">Deine Rolle:</p>
                            <p className="font-bold">{currentPlayer.role}</p>
                        </div>
                        <div className="ml-auto">
                            {currentPlayer.isAlive ? (
                                <span className="text-xs text-green-400">💚 Lebendig</span>
                            ) : (
                                <span className="text-xs text-gray-500">👻 Tot</span>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Host controls for phase transitions */}
            <HostControls />

            {/* Phase content */}
            {game.status === 'NIGHT' && <NightPhase />}
            {game.status === 'DAY' && <DayPhase />}
        </div>
    );
}
