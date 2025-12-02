import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import { Ghost, Eye, MessageCircle } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';

export function GhostMode() {
    const { game, playerId } = useGameStore();
    const { language } = useLanguageStore();
    const t = translations[language];

    if (!game || !playerId) return null;

    const currentPlayer = game.players[playerId];
    const allPlayers = Object.values(game.players);
    const alivePlayers = allPlayers.filter(p => p.isAlive);
    const deadPlayers = allPlayers.filter(p => !p.isAlive);
    const werewolves = alivePlayers.filter(p => p.role === 'WOLF');
    const villagers = alivePlayers.filter(p => p.role !== 'WOLF');

    return (
        <div className="space-y-6 opacity-90">
            {/* Ghost Status */}
            <Card className="bg-gray-900/80 border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <Ghost className="w-8 h-8 text-gray-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-300">{t.ghostMode.title}</h2>
                        <p className="text-sm text-gray-500">{t.ghostMode.subtitle}</p>
                    </div>
                </div>

                <div className="p-4 bg-black/30 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">{t.ghostMode.yourRoleWas}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{currentPlayer.avatar}</span>
                        <span className="text-lg font-bold">{currentPlayer.role}</span>
                    </div>
                </div>
            </Card>

            {/* Game Overview with Full Visibility */}
            <Card className="bg-gray-900/80 border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold">{t.ghostMode.fullVision}</h3>
                </div>

                {/* Team Status */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-blood-red/10 border border-blood-red/20 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">{t.ghostMode.werewolves}</p>
                        <p className="text-2xl font-bold text-blood-red">{werewolves.length}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">{t.ghostMode.villagers}</p>
                        <p className="text-2xl font-bold text-blue-400">{villagers.length}</p>
                    </div>
                </div>

                {/* Living Players with Roles Revealed */}
                <div>
                    <p className="text-sm text-gray-400 mb-3">{t.ghostMode.livingPlayers}</p>
                    <div className="space-y-2">
                        {alivePlayers.map(player => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${player.role === 'WOLF'
                                    ? 'bg-blood-red/10 border-blood-red/20'
                                    : 'bg-blue-500/10 border-blue-500/20'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{player.avatar}</span>
                                    <span className="font-medium">{player.name}</span>
                                </div>
                                <span
                                    className={`text-sm font-bold px-2 py-1 rounded ${player.role === 'WOLF'
                                        ? 'bg-blood-red/30 text-blood-red'
                                        : 'bg-blue-500/30 text-blue-300'
                                        }`}
                                >
                                    {player.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Ghost Chat */}
            {deadPlayers.length > 1 && (
                <Card className="bg-gray-900/80 border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold">{t.ghostMode.ghostChat}</h3>
                    </div>

                    {/* Other Dead Players */}
                    <div className="space-y-2 mb-4">
                        {deadPlayers
                            .filter(p => p.id !== playerId)
                            .map(player => (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                                >
                                    <span className="text-xl opacity-50">{player.avatar}</span>
                                    <span className="text-sm text-gray-400">{player.name}</span>
                                    <span className="text-xs text-gray-600 ml-auto">👻</span>
                                </div>
                            ))}
                    </div>

                    <p className="text-xs text-gray-600 text-center italic">
                        {t.ghostMode.ghostChatFuture}
                    </p>
                </Card>
            )}

            {/* Prediction/Betting (Future Feature) */}
            <Card className="bg-gray-900/80 border-gray-700">
                <h3 className="text-lg font-bold mb-3">{t.ghostMode.whoWillWin}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        className="p-4 rounded-lg bg-blood-red/10 border-2 border-blood-red/20 hover:bg-blood-red/20 transition-all"
                        disabled
                    >
                        <div className="text-3xl mb-2">🐺</div>
                        <div className="text-sm font-medium">{t.ghostMode.werewolves}</div>
                    </button>
                    <button
                        className="p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/20 hover:bg-blue-500/20 transition-all"
                        disabled
                    >
                        <div className="text-3xl mb-2">👥</div>
                        <div className="text-sm font-medium">{t.ghostMode.villagers}</div>
                    </button>
                </div>
                <p className="text-xs text-gray-600 text-center mt-3 italic">
                    {t.ghostMode.bettingFuture}
                </p>
            </Card>
        </div>
    );
}
