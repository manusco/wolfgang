import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Moon, Users } from 'lucide-react';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useLanguageStore } from '../store/languageStore';
import { useGameStore } from '../store/gameStore';
import { translations } from '../i18n/translations';
import { hasActiveSession } from '../lib/sessionStorage';
import { reconnectToGame } from '../lib/gameService';
import { HowToPlay } from '../components/ui/HowToPlay';

export function Landing() {
    const navigate = useNavigate();
    const { language } = useLanguageStore();
    const { roomCode, playerId, isHost, reset } = useGameStore();
    const t = translations[language].landing;
    const [hasSession, setHasSession] = useState(false);
    const [showNewGameDialog, setShowNewGameDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null);

    useEffect(() => {
        setHasSession(hasActiveSession());
    }, []);

    const handleRejoin = async () => {
        if (roomCode && playerId) {
            const result = await reconnectToGame(roomCode, playerId);

            if (result.success && result.game) {
                // Navigate based on game status
                if (result.game.status === 'LOBBY') {
                    navigate(isHost ? '/create' : '/join');
                } else if (result.game.status === 'GAMEOVER') {
                    navigate(`/game/${roomCode}`);
                } else {
                    navigate(`/game/${roomCode}`);
                }
            } else {
                // Reconnection failed, clear session
                reset();
                setHasSession(false);
            }
        }
    };

    const handleCreateGame = () => {
        if (hasSession) {
            setPendingAction('create');
            setShowNewGameDialog(true);
        } else {
            navigate('/create');
        }
    };

    const handleJoinGame = () => {
        if (hasSession) {
            setPendingAction('join');
            setShowNewGameDialog(true);
        } else {
            navigate('/join');
        }
    };

    const confirmNewGame = () => {
        reset();
        setHasSession(false);
        setShowNewGameDialog(false);

        if (pendingAction === 'create') {
            navigate('/create');
        } else if (pendingAction === 'join') {
            navigate('/join');
        }
        setPendingAction(null);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-in fade-in duration-700 relative">
            <LanguageToggle />

            <div className="text-center space-y-4">
                <div className="inline-block mb-4">
                    <img src="/logo.png" alt="WolfGang Logo" className="w-32 h-32 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
                </div>
                <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
                    {t.title}
                </h1>
                <p className="text-gray-400 text-lg max-w-md mx-auto font-light">
                    {t.subtitle}
                    <br />
                    {t.description}
                </p>
                <p className="text-gray-500 text-sm max-w-lg mx-auto mt-2">
                    {t.tagline}
                </p>
            </div>

            {/* How to Play - Expandable */}
            <HowToPlay />

            <div className="flex flex-col gap-4 w-full max-w-xs">
                {hasSession && (
                    <Button
                        size="lg"
                        onClick={handleRejoin}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <Users className="w-5 h-5" />
                        {t.rejoinGame}
                    </Button>
                )}

                <Button
                    size="lg"
                    onClick={handleCreateGame}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <Moon className="w-5 h-5" />
                    {t.create}
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleJoinGame}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <Users className="w-5 h-5" />
                    {t.join}
                </Button>
            </div>

            <div className="absolute bottom-6 flex flex-col items-center gap-2">
                <div className="text-xs text-gray-600 font-mono">
                    {t.version}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showNewGameDialog}
                title={t.confirmNewGame}
                message={t.confirmNewGameMessage}
                confirmLabel={pendingAction === 'create' ? t.create : t.join}
                cancelLabel="Cancel"
                onConfirm={confirmNewGame}
                onCancel={() => {
                    setShowNewGameDialog(false);
                    setPendingAction(null);
                }}
                variant="danger"
            />
        </div>
    );
}
