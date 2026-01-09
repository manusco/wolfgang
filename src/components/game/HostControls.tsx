import { useState, useEffect, useCallback } from 'react';
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
    triggerHunterRevenge,
    handleHunterRevenge,
} from '../../lib/gameLogic';
import { ChevronRight, Skull, Crosshair } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';

export function HostControls() {
    const { game, playerId } = useGameStore();
    const { language } = useLanguageStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const t = translations[language].game;

    const handleNightToDay = useCallback(async (auto = false) => {
        if (!game) return;
        if (!auto && !window.confirm(t.toDay + '?')) return;
        setIsProcessing(true);

        try {
            // Resolve night actions
            const { deadPlayerIds, hunterDied } = resolveNightActions(game);

            // Kill players
            if (deadPlayerIds.length > 0) {
                await killPlayers(game.id, deadPlayerIds);
            }

            // Check win condition
            const updatedPlayers = { ...game.players };
            deadPlayerIds.forEach(id => {
                updatedPlayers[id] = { ...updatedPlayers[id], isAlive: false };
            });

            const winner = checkWinCondition(updatedPlayers, game.mode);
            if (winner) {
                await endGame(game.id, winner);
                return;
            }

            // Check for Hunter
            if (hunterDied) {
                const hunterId = deadPlayerIds.find(id => game.players[id].role === 'HUNTER');
                if (hunterId) {
                    await triggerHunterRevenge(game.id, hunterId);
                    return;
                }
            }

            // Transition to day
            await transitionToDay(game.id);
        } catch (error) {
            console.error('Error transitioning to day:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [game, t.toDay]);

    const handleDayToNight = useCallback(async (auto = false) => {
        if (!game) return;
        if (!auto && !window.confirm(t.toNight + '?')) return;
        setIsProcessing(true);

        try {
            // Resolve day votes
            const { executedPlayerId, hunterDied } = resolveDayVotes(game);

            // Kill executed player
            if (executedPlayerId) {
                await killPlayers(game.id, [executedPlayerId]);

                // Check win condition
                const updatedPlayers = { ...game.players };
                updatedPlayers[executedPlayerId] = { ...updatedPlayers[executedPlayerId], isAlive: false };

                const winner = checkWinCondition(updatedPlayers, game.mode);
                if (winner) {
                    await endGame(game.id, winner);
                    return;
                }

                // Check for Hunter
                if (hunterDied) {
                    await triggerHunterRevenge(game.id, executedPlayerId);
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
    }, [game, t.toNight]);

    // Auto-transition when timer expires
    useEffect(() => {
        if (!game || isProcessing) return;

        const checkTimer = () => {
            const now = Date.now();
            // Add a small buffer (1s) to ensure we don't trigger too early due to clock skew
            if (game.phaseEndTime > 0 && now > game.phaseEndTime + 1000) {
                console.log('Timer expired, auto-transitioning...');
                if (game.status === 'NIGHT') {
                    handleNightToDay(true);
                } else if (game.status === 'DAY') {
                    handleDayToNight(true);
                }
            }
        };

        const interval = setInterval(checkTimer, 1000);
        return () => clearInterval(interval);
    }, [game, isProcessing, handleNightToDay, handleDayToNight]);

    if (!game || !playerId || game.hostId !== playerId) {
        return null; // Only show to host
    }

    const handleHunterShot = async (targetId: string) => {
        if (!game || !game.hunterDeath) return;
        setIsProcessing(true);
        try {
            await handleHunterRevenge(game.id, game.hunterDeath.hunterId, targetId);

            // After shot, check win condition again
            const updatedPlayers = { ...game.players };
            updatedPlayers[targetId] = { ...updatedPlayers[targetId], isAlive: false };
            const winner = checkWinCondition(updatedPlayers, game.mode);
            if (winner) {
                await endGame(game.id, winner);
                return;
            }

            // If we came from Night (usually), go to Day. If from Day, go to Night?
            // For simplicity, let's default to Day if it was Night, or Night if it was Day.
            // But we don't track previous state easily here.
            // Let's assume Hunter shot always leads to the next natural phase or just continues the game.
            // If it was Night -> Hunter -> Day.
            // If it was Day -> Hunter -> Night.
            // We'll rely on the Host to manually transition if needed, OR we just force Day for now as a safe default
            // since Hunter usually dies at Night or Day vote.
            // Actually, `handleHunterRevenge` in logic sets status to DAY. Let's stick with that for now.

        } catch (error) {
            console.error('Error handling hunter shot:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (game.status === 'LOBBY' || game.status === 'GAMEOVER') {
        return null;
    }

    if (game.status === 'HUNTER_REVENGE') {
        return (
            <Card className="bg-red-900/20 border-red-500/30 animate-pulse">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-red-400 font-bold">
                        <Crosshair className="w-6 h-6" />
                        {t.hunterRevenge}
                    </div>
                    <p className="text-sm text-gray-300">{t.hunterShoot}</p>

                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(game.players)
                            .filter(p => p.isAlive && p.id !== game.hunterDeath?.hunterId)
                            .map(player => (
                                <Button
                                    key={player.id}
                                    onClick={() => handleHunterShot(player.id)}
                                    disabled={isProcessing}
                                    variant="secondary"
                                    className="text-xs"
                                >
                                    <span translate="no">{player.name}</span>
                                </Button>
                            ))}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-purple-900/20 border-purple-500/30">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-purple-400 font-bold mb-1">{t.hostControls}</p>
                    <p className="text-sm text-gray-400">
                        {game.status === 'NIGHT'
                            ? t.toDay
                            : t.toNight
                        }
                    </p>
                </div>

                <Button
                    onClick={() => game.status === 'NIGHT' ? handleNightToDay(false) : handleDayToNight(false)}
                    disabled={isProcessing}
                    size="sm"
                    className="flex items-center gap-2"
                >
                    {isProcessing ? (
                        t.processing
                    ) : (
                        <>
                            {game.status === 'NIGHT' ? (
                                <>
                                    <Skull className="w-4 h-4" />
                                    {t.day}
                                </>
                            ) : (
                                <>
                                    <ChevronRight className="w-4 h-4" />
                                    {t.night}
                                </>
                            )}
                        </>
                    )}
                </Button>
            </div>

            {game.status === 'DAY' && (
                <div className="mt-3 pt-3 border-t border-purple-500/20">
                    <p className="text-xs text-gray-500">
                        {t.votes}: {Object.keys(game.dayVotes).length} /{' '}
                        {Object.values(game.players).filter(p => p.isAlive).length}
                    </p>
                </div>
            )}
        </Card>
    );
}
