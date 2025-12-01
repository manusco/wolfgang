import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Copy, User } from 'lucide-react';

interface LobbyProps {
    isHost: boolean;
}

const AVATARS = ['🐺', '🔮', '🧙‍♀️', '🏹', '👨‍🌾', '🧛‍♂️', '🧟', '👻'];

export function Lobby({ isHost }: LobbyProps) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [roomCode, setRoomCode] = useState(isHost ? '' : ''); // Host generates, Player inputs

    // Mock data for UI dev
    const players = [
        { id: '1', name: 'Lukas', avatar: '🐺', isHost: true },
        { id: '2', name: 'Sarah', avatar: '🔮', isHost: false },
        { id: '3', name: 'Tom', avatar: '👨‍🌾', isHost: false },
    ];

    const handleJoin = () => {
        // TODO: Implement join logic
        console.log('Joining...', { name, selectedAvatar, roomCode });
    };

    const handleCreate = () => {
        // TODO: Implement create logic
        console.log('Creating...', { name, selectedAvatar });
    };

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="px-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl font-bold">{isHost ? 'Spiel erstellen' : 'Spiel beitreten'}</h2>
            </div>

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
                        label="Dein Name"
                        placeholder="z.B. Schattenläufer"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {!isHost && (
                        <Input
                            label="Raum Code"
                            placeholder="z.B. WOLF"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            maxLength={4}
                        />
                    )}

                    {isHost && (
                        <div className="p-4 bg-black/30 rounded-lg border border-white/5 text-center space-y-2">
                            <div className="text-sm text-gray-400">Raum Code</div>
                            <div className="text-3xl font-mono font-bold tracking-widest text-blood-red">
                                WOLF
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs w-full">
                                <Copy className="w-3 h-3 mr-2" /> Code kopieren
                            </Button>
                        </div>
                    )}
                </div>

                <Button
                    className="w-full"
                    size="lg"
                    onClick={isHost ? handleCreate : handleJoin}
                    disabled={!name || (!isHost && !roomCode)}
                >
                    {isHost ? 'Lobby öffnen' : 'Beitreten'}
                </Button>
            </Card>

            {isHost && (
                <Card>
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                        <span>Spieler</span>
                        <span className="text-sm font-normal text-gray-400">{players.length} / 20</span>
                    </h3>
                    <div className="space-y-2">
                        {players.map((player) => (
                            <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-2xl">{player.avatar}</span>
                                <span className="font-medium">{player.name}</span>
                                {player.isHost && (
                                    <span className="ml-auto text-xs bg-blood-red/20 text-blood-red px-2 py-1 rounded">
                                        HOST
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <Button className="w-full" size="lg" disabled={players.length < 4}>
                            Spiel starten
                        </Button>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            Mindestens 4 Spieler benötigt
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
