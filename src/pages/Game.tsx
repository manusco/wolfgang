import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { subscribeToGame, reconnectToGame } from '../lib/gameService';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { NightPhase } from '../components/game/NightPhase';
import { DayPhase } from '../components/game/DayPhase';
import { HostControls } from '../components/game/HostControls';
import { Moon, Sun, Trophy, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

export function Game() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { game, setGame, playerId, roomCode: storedRoomCode, reset } = useGameStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);

    // Try to reconnect if there's a stored session but no game loaded
    useEffect(() => {
        const attemptReconnect = async () => {
            const targetGameId = gameId || storedRoomCode;

            if (targetGameId && playerId && !game && !isReconnecting) {
                setIsReconnecting(true);
                const result = await reconnectToGame(targetGameId, playerId);

                if (result.success && result.game) {
                    setGame(result.game);

                    // If game is over or in lobby, might want to redirect
                    if (result.game.status === 'GAMEOVER') {
                        // Stay on page to show results
                    } else if (result.game.status === 'LOBBY') {
                        navigate(`/join`);
                    }
                } else {
                    // Reconnection failed, clear session and go home
                    reset();
                    navigate('/');
                }
                setIsReconnecting(false);
            }
        };

        attemptReconnect();
    }, [gameId, storedRoomCode, playerId, game, navigate, setGame, reset, isReconnecting]);

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

    // Warn before unload during active game
    useEffect(() => {
        if (game && game.status !== 'GAMEOVER') {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = '';
            };

            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [game]);

    const handleLeaveGame = () => {
        setShowLeaveDialog(true);
    };

    const confirmLeave = () => {
        reset();
        navigate('/');
    };

    if (!game) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card>
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-red mx-auto mb-4" />
                        <p className="text-gray-400">{t.game.loading}</p>
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
                        <h2 className="text-2xl font-bold mb-2">{t.game.waitingForGameStart}</h2>
                        <p className="text-gray-400">{t.game.hostWillStart}</p>
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
                            {game.winner === 'WEREWOLVES' ? t.game.wolvesWin : t.game.villagersWin}
                        </h2>
                        <p className="text-gray-400 mb-6">{t.game.gameOver}</p>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold mb-3">{t.game.rolesReveal}</h3>
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
                                        {t.roles[player.role as keyof typeof t.roles]}
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
                <h2 className="text-xl font-bold">{t.game.room}: {game.id}</h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {game.status === 'NIGHT' ? (
                            <Moon className="w-5 h-5 text-blue-400" />
                        ) : (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-mono">
                            {t.game[game.status.toLowerCase() as 'night' | 'day'] || game.status}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLeaveGame}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Role reminder */}
            {currentPlayer && (
                <Card className="bg-midnight-blue/30 border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{currentPlayer.avatar}</span>
                        <div>
                            <p className="text-sm text-gray-400">{t.game.yourRole}</p>
                            <p className="font-bold">{t.roles[currentPlayer.role as keyof typeof t.roles]}</p>
                        </div>
                        <div className="ml-auto">
                            {currentPlayer.isAlive ? (
                                <span className="text-xs text-green-400">{t.game.aliveStatus}</span>
                            ) : (
                                <span className="text-xs text-gray-500">{t.game.deadStatus}</span>
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

            <ConfirmDialog
                isOpen={showLeaveDialog}
                title={t.game.confirmLeaveGame}
                message={t.game.confirmLeaveGameMessage}
                confirmLabel={t.game.leaveGame}
                cancelLabel={t.lobby.back}
                onConfirm={confirmLeave}
                onCancel={() => setShowLeaveDialog(false)}
                variant="danger"
            />
        </div>
    );
}
