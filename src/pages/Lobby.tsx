import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Copy, User, AlertCircle, Zap, Eye, Users } from 'lucide-react';
import { createGame, joinGame, subscribeToGame, startGame } from '../lib/gameService';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { interpolate } from '../i18n/utils';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { GameState, GameMode } from '../types';


interface LobbyProps {
    isHost: boolean;
}

const AVATARS = ['🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'];

// Avatar descriptions in both languages
export function Lobby({ isHost }: LobbyProps) {
    const navigate = useNavigate();
    const { playerId, setPlayerId, setGame } = useGameStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [roomCode, setRoomCode] = useState('');
    const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');
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
            const code = await createGame(playerId, name, selectedAvatar, selectedMode);
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

                    <div className="text-center mb-2">
                        <label className="text-sm font-medium text-gray-300">
                            {t.lobby.selectAvatar}
                        </label>
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

                    {/* Mode Selection (Host Only) */}
                    {isHost && !gameState && (
                        <div className="space-y-4 pb-6 border-b border-white/10">
                            <label className="text-sm font-medium text-gray-300 uppercase tracking-wider pl-1">
                                {language === 'de' ? 'Spielmodus' : 'Game Mode'}
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {/* CLASSIC MODE */}
                                <button
                                    onClick={() => setSelectedMode('CLASSIC')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left relative group overflow-hidden ${selectedMode === 'CLASSIC'
                                        ? 'border-purple-500 bg-gradient-to-r from-purple-900/80 to-purple-800/60 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.02]'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 hover:scale-[1.01]'
                                        }`}
                                >
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className={`p-3 rounded-xl shadow-lg ${selectedMode === 'CLASSIC' ? 'bg-purple-500 text-white shadow-purple-500/40' : 'bg-black/40 text-gray-400'}`}>
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-black text-lg tracking-wide ${selectedMode === 'CLASSIC' ? 'text-white' : 'text-gray-300'}`}>
                                                    {t.modes?.classic?.name || 'Classic'}
                                                </span>
                                                <InfoTooltip content={`${t.modes?.classic?.fullDescription || ''}\n\n${(t.modes?.classic as any)?.recommendation || ''}`} />
                                            </div>
                                            <p className={`text-sm font-medium leading-relaxed ${selectedMode === 'CLASSIC' ? 'text-purple-200' : 'text-gray-500'}`}>
                                                {t.modes?.classic?.shortDesc}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMode === 'CLASSIC' && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent opacity-50" />
                                    )}
                                </button>

                                {/* BLITZ WOLF */}
                                <button
                                    onClick={() => setSelectedMode('BLITZ_WOLF')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left relative group overflow-hidden ${selectedMode === 'BLITZ_WOLF'
                                        ? 'border-yellow-500 bg-gradient-to-r from-yellow-900/80 to-yellow-800/60 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-[1.02]'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-yellow-500/50 hover:scale-[1.01]'
                                        }`}
                                >
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className={`p-3 rounded-xl shadow-lg ${selectedMode === 'BLITZ_WOLF' ? 'bg-yellow-500 text-black shadow-yellow-500/40' : 'bg-black/40 text-gray-400'}`}>
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-black text-lg tracking-wide ${selectedMode === 'BLITZ_WOLF' ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                    {t.modes?.blitzWolf?.name || 'Blitz Wolf'}
                                                </span>
                                                <InfoTooltip content={`${t.modes?.blitzWolf?.fullDescription || ''}\n\n${(t.modes?.blitzWolf as any)?.recommendation || ''}`} />
                                            </div>
                                            <p className={`text-sm font-medium leading-relaxed ${selectedMode === 'BLITZ_WOLF' ? 'text-yellow-200' : 'text-gray-500'}`}>
                                                {t.modes?.blitzWolf?.shortDesc}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMode === 'BLITZ_WOLF' && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-transparent opacity-50" />
                                    )}
                                </button>

                                {/* ONE SHOT SEER */}
                                <button
                                    onClick={() => setSelectedMode('ONE_SHOT_SEER')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left relative group overflow-hidden ${selectedMode === 'ONE_SHOT_SEER'
                                        ? 'border-blue-500 bg-gradient-to-r from-blue-900/80 to-blue-800/60 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 hover:scale-[1.01]'
                                        }`}
                                >
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className={`p-3 rounded-xl shadow-lg ${selectedMode === 'ONE_SHOT_SEER' ? 'bg-blue-500 text-white shadow-blue-500/40' : 'bg-black/40 text-gray-400'}`}>
                                            <Eye className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-black text-lg tracking-wide ${selectedMode === 'ONE_SHOT_SEER' ? 'text-blue-400' : 'text-gray-300'}`}>
                                                    {t.modes?.oneShotSeer?.name || 'One Shot Seer'}
                                                </span>
                                                <InfoTooltip content={`${t.modes?.oneShotSeer?.fullDescription || ''}\n\n${(t.modes?.oneShotSeer as any)?.recommendation || ''}`} />
                                            </div>
                                            <p className={`text-sm font-medium leading-relaxed ${selectedMode === 'ONE_SHOT_SEER' ? 'text-blue-200' : 'text-gray-500'}`}>
                                                {t.modes?.oneShotSeer?.shortDesc}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMode === 'ONE_SHOT_SEER' && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-50" />
                                    )}
                                </button>

                                {/* THE ACCUSED */}
                                <button
                                    onClick={() => setSelectedMode('THE_ACCUSED')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left relative group overflow-hidden ${selectedMode === 'THE_ACCUSED'
                                        ? 'border-orange-500 bg-gradient-to-r from-orange-900/80 to-orange-800/60 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-[1.02]'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-orange-500/50 hover:scale-[1.01]'
                                        }`}
                                >
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className={`p-3 rounded-xl shadow-lg ${selectedMode === 'THE_ACCUSED' ? 'bg-orange-500 text-white shadow-orange-500/40' : 'bg-black/40 text-gray-400'}`}>
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-black text-lg tracking-wide ${selectedMode === 'THE_ACCUSED' ? 'text-orange-400' : 'text-gray-300'}`}>
                                                    {t.modes?.theAccused?.name || 'The Accused'}
                                                </span>
                                                <InfoTooltip content={`${t.modes?.theAccused?.fullDescription || ''}\n\n${(t.modes?.theAccused as any)?.recommendation || ''}`} />
                                            </div>
                                            <p className={`text-sm font-medium leading-relaxed ${selectedMode === 'THE_ACCUSED' ? 'text-orange-200' : 'text-gray-500'}`}>
                                                {t.modes?.theAccused?.shortDesc}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMode === 'THE_ACCUSED' && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-transparent opacity-50" />
                                    )}
                                </button>

                                {/* SURVIVAL SPRINT */}
                                <button
                                    onClick={() => setSelectedMode('SURVIVAL_SPRINT')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left relative group overflow-hidden ${selectedMode === 'SURVIVAL_SPRINT'
                                        ? 'border-teal-500 bg-gradient-to-r from-teal-900/80 to-teal-800/60 shadow-[0_0_20px_rgba(20,184,166,0.3)] scale-[1.02]'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-teal-500/50 hover:scale-[1.01]'
                                        }`}
                                >
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className={`p-3 rounded-xl shadow-lg ${selectedMode === 'SURVIVAL_SPRINT' ? 'bg-teal-500 text-white shadow-teal-500/40' : 'bg-black/40 text-gray-400'}`}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-black text-lg tracking-wide ${selectedMode === 'SURVIVAL_SPRINT' ? 'text-teal-400' : 'text-gray-300'}`}>
                                                    {t.modes?.survivalSprint?.name || 'Survival Sprint'}
                                                </span>
                                                <InfoTooltip content={`${t.modes?.survivalSprint?.fullDescription || ''}\n\n${(t.modes?.survivalSprint as any)?.recommendation || ''}`} />
                                            </div>
                                            <p className={`text-sm font-medium leading-relaxed ${selectedMode === 'SURVIVAL_SPRINT' ? 'text-teal-200' : 'text-gray-500'}`}>
                                                {t.modes?.survivalSprint?.shortDesc}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMode === 'SURVIVAL_SPRINT' && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent opacity-50" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

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
                        <span className="text-sm font-normal text-gray-400">
                            {interpolate(t.lobby.playerCount, { count: players.length })}
                        </span>
                    </h3>
                    <div className="space-y-2">
                        {players.map((player) => (
                            <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-2xl">{player.avatar}</span>
                                <span className="font-medium" translate="no">{player.name}</span>
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
                            disabled={players.length < 2 || isLoading}
                            onClick={handleStart}
                        >
                            {isLoading ? t.lobby.starting : t.lobby.startGame}
                        </Button>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            {t.lobby.minPlayersRequired}
                        </p>
                    </div>
                </Card>
            )
            }

            {
                gameState && !isHost && (
                    <Card>
                        <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                            <span>{t.lobby.players}</span>
                            <span className="text-sm font-normal text-gray-400">
                                {interpolate(t.lobby.playerCount, { count: players.length })}
                            </span>
                        </h3>
                        <div className="space-y-2">
                            {players.map((player) => (
                                <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-2xl">{player.avatar}</span>
                                    <span className="font-medium" translate="no">{player.name}</span>
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
                )
            }
        </div >
    );
}
