import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Copy, User, AlertCircle } from 'lucide-react';
import { createGame, joinGame, subscribeToGame, startGame } from '../lib/gameService';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { GameState } from '../types';

interface LobbyProps {
    isHost: boolean;
}

const AVATARS = ['🐺', '🔮', '🧙‍♀️', '🏹', '👨‍🌾', '🧛‍♂️', '🧟', '👻'];

export function Lobby({ isHost }: LobbyProps) {
    const navigate = useNavigate();
    const { playerId, setPlayerId, setGame } = useGameStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [roomCode, setRoomCode] = useState('');
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Generate a simple player ID if not exists
    useEffect(() => {
        if (!playerId) {
            const newId = 'player_' + Math.random().toString(36).substr(2, 9);
            setPlayerId(newId);
        }
    }, [playerId, setPlayerId]);

    // Subscribe to game updates
    useEffect(() => {
        if (gameState) {
            const unsubscribe = subscribeToGame(gameState.id, (updatedGame) => {
                setGameState(updatedGame);
                setGame(updatedGame);

                // Navigate to game when it starts
                if (updatedGame.status !== 'LOBBY') {
                    navigate(`/game/${updatedGame.id}`);
                }
            });

            return () => unsubscribe();
        }
    }, [gameState?.id, setGame, navigate]);

    const handleCreate = async () => {
        if (!name || !playerId) return;

        setIsLoading(true);
        setError('');

        try {
            const code = await createGame(playerId, name, selectedAvatar);
            setRoomCode(code);

            // Subscribe to the newly created game
            subscribeToGame(code, (game) => {
                setGameState(game);
                setGame(game);
            });
        } catch (err: any) {
            setError(err.message || 'Failed to create game');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!name || !roomCode || !playerId) return;

        setIsLoading(true);
        setError('');

        try {
            await joinGame(roomCode.toUpperCase(), playerId, name, selectedAvatar);

            // Subscribe to the game
            subscribeToGame(roomCode.toUpperCase(), (game) => {
                setGameState(game);
                setGame(game);
            });
        } catch (err: any) {
            setError(err.message || 'Failed to join game');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = async () => {
        if (!gameState) return;

        setIsLoading(true);
        try {
            await startGame(gameState.id);
        } catch (err: any) {
            setError(err.message || 'Failed to start game');
        } finally {
            setIsLoading(false);
        }
    };

    const copyRoomCode = () => {
        if (roomCode || gameState?.id) {
            navigator.clipboard.writeText(roomCode || gameState?.id || '');
        }
    };

    const players = gameState ? Object.values(gameState.players) : [];

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="px-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl font-bold">{isHost ? t.lobby.createGame : t.lobby.joinGame}</h2>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-200">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            <Card className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl border-2 border-blood-red/50">
                                {selectedAvatar}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-midnight-blue rounded-full p-1 border border-white/10">
                                <User className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {AVATARS.map((avatar) => (
                            <button
                                key={avatar}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`p-2 rounded-lg text-xl transition-all ${selectedAvatar === avatar
                                    ? 'bg-blood-red/20 border border-blood-red'
                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                    }`}
                            >
                                {avatar}
                            </button>
                        ))}
                    </div>

                    <Input
                        label={t.lobby.enterName}
                        placeholder={t.lobby.namePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {!isHost && (
                        <Input
                            label={t.lobby.roomCode}
                            placeholder={t.lobby.codePlaceholder}
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            maxLength={4}
                        />
                    )}

                    {isHost && gameState && (
                        <div className="p-4 bg-black/30 rounded-lg border border-white/5 text-center space-y-2">
                            <div className="text-sm text-gray-400">{t.lobby.roomCode}</div>
                            <div className="text-3xl font-mono font-bold tracking-widest text-blood-red">
                                {gameState.id}
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs w-full" onClick={copyRoomCode}>
                                <Copy className="w-3 h-3 mr-2" />{t.lobby.copyCode}
                            </Button>
                        </div>
                    )}
                </div>

                {!gameState && (
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={isHost ? handleCreate : handleJoin}
                        disabled={!name || (!isHost && !roomCode) || isLoading}
                    >
                        {isLoading ? t.lobby.loading : (isHost ? t.lobby.openLobby : t.lobby.join)}
                    </Button>
                )}
            </Card>

            {gameState && isHost && (
                <Card>
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                        <span>{t.lobby.players}</span>
                        <span className="text-sm font-normal text-gray-400">{players.length} / 20</span>
                    </h3>
                    <div className="space-y-2">
                        {players.map((player) => (
                            <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-2xl">{player.avatar}</span>
                                <span className="font-medium">{player.name}</span>
                                {player.id === gameState.hostId && (
                                    <span className="ml-auto text-xs bg-blood-red/20 text-blood-red px-2 py-1 rounded">
                                        HOST
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={players.length < 4 || isLoading}
                            onClick={handleStart}
                        >
                            {isLoading ? t.lobby.starting : t.lobby.startGame}
                        </Button>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            {t.lobby.minPlayersRequired}
                        </p>
                    </div>
                </Card>
            )}

            {gameState && !isHost && (
                <Card>
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                        <span>{t.lobby.players}</span>
                        <span className="text-sm font-normal text-gray-400">{players.length} / 20</span>
                    </h3>
                    <div className="space-y-2">
                        {players.map((player) => (
                            <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-2xl">{player.avatar}</span>
                                <span className="font-medium">{player.name}</span>
                                {player.id === gameState.hostId && (
                                    <span className="ml-auto text-xs bg-blood-red/20 text-blood-red px-2 py-1 rounded">
                                        HOST
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-4">
                        {t.lobby.waitingForHost}
                    </p>
                </Card>
            )}
        </div>
    );
}
