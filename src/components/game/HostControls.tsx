import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    resolveNightActions,
    resolveDayVotes,
    checkWinCondition,
    transitionToDay,
    transitionToNight,
    killPlayers,
    endGame,
} from '../../lib/gameLogic';
import { ChevronRight, Skull } from 'lucide-react';

export function HostControls() {
    const { game, playerId } = useGameStore();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!game || !playerId || game.hostId !== playerId) {
        return null; // Only show to host
    }

    const handleNightToDay = async () => {
        if (!game) return;
        setIsProcessing(true);

        try {
            // Resolve night actions
            const { deadPlayerIds } = resolveNightActions(game);

            // Kill players
            if (deadPlayerIds.length > 0) {
                await killPlayers(game.id, deadPlayerIds);
            }

            // Check win condition
            const updatedPlayers = { ...game.players };
            deadPlayerIds.forEach(id => {
                updatedPlayers[id].isAlive = false;
            });

            const winner = checkWinCondition(updatedPlayers);
            if (winner) {
                await endGame(game.id, winner);
                return;
            }

            // Transition to day
            await transitionToDay(game.id);
        } catch (error) {
            console.error('Error transitioning to day:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDayToNight = async () => {
        if (!game) return;
        setIsProcessing(true);

        try {
            // Resolve day votes
            const { executedPlayerId } = resolveDayVotes(game);

            // Kill executed player
            if (executedPlayerId) {
                await killPlayers(game.id, [executedPlayerId]);

                // Check win condition
                const updatedPlayers = { ...game.players };
                updatedPlayers[executedPlayerId].isAlive = false;

                const winner = checkWinCondition(updatedPlayers);
                if (winner) {
                    await endGame(game.id, winner);
                    return;
                }
            }

            // Transition to night
            await transitionToNight(game.id);
        } catch (error) {
            console.error('Error transitioning to night:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (game.status === 'LOBBY' || game.status === 'GAMEOVER') {
        return null;
    }

    return (
        <Card className="bg-purple-900/20 border-purple-500/30">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-purple-400 font-bold mb-1">HOST STEUERUNG</p>
                    <p className="text-sm text-gray-400">
                        {game.status === 'NIGHT'
                            ? 'Nacht beenden und zum Tag wechseln'
                            : 'Tag beenden und zur Nacht wechseln'
                        }
                    </p>
                </div>

                <Button
                    onClick={game.status === 'NIGHT' ? handleNightToDay : handleDayToNight}
                    disabled={isProcessing}
                    size="sm"
                    className="flex items-center gap-2"
                >
                    {isProcessing ? (
                        'Verarbeite...'
                    ) : (
                        <>
                            {game.status === 'NIGHT' ? (
                                <>
                                    <Skull className="w-4 h-4" />
                                    Zum Tag
                                </>
                            ) : (
                                <>
                                    <ChevronRight className="w-4 h-4" />
                                    Zur Nacht
                                </>
                            )}
                        </>
                    )}
                </Button>
            </div>

            {game.status === 'DAY' && (
                <div className="mt-3 pt-3 border-t border-purple-500/20">
                    <p className="text-xs text-gray-500">
                        Abstimmungen: {Object.keys(game.dayVotes).length} /{' '}
                        {Object.values(game.players).filter(p => p.isAlive).length}
                    </p>
                </div>
            )}
        </Card>
    );
}
