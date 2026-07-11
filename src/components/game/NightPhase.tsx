import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { submitWolfVote, submitSeerCheck } from '../../lib/gameService';
import { Moon, Eye } from 'lucide-react';
import { VillagerMinigame } from './VillagerMinigame';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';
import { interpolate } from '../../i18n/utils';

export function NightPhase() {
    const { game, playerId } = useGameStore();
    const { language } = useLanguageStore();
    const t = translations[language];
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [hasActed, setHasActed] = useState(false);

    if (!game || !playerId) return null;

    const currentPlayer = game.players[playerId];
    const alivePlayers = Object.values(game.players).filter(p => p.isAlive && p.id !== playerId);
    const timeRemaining = Math.max(0, Math.floor((game.phaseEndTime - Date.now()) / 1000));

    const handleSubmitAction = async () => {
        if (!selectedTarget || !game) return;

        try {
            if (currentPlayer.role === 'WOLF') {
                await submitWolfVote(game.id, playerId, selectedTarget);
            } else if (currentPlayer.role === 'SEER') {
                await submitSeerCheck(game.id, selectedTarget);
            }
            setHasActed(true);
        } catch (error) {
            console.error('Error submitting night action:', error);
        }
    };

    // Werewolf view - or Survival Sprint (everyone thinks they might be the wolf)
    if (currentPlayer.role === 'WOLF' || game.mode === 'SURVIVAL_SPRINT') {
        const otherWolves = Object.values(game.players).filter(
            p => p.role === 'WOLF' && p.id !== playerId
        );

        // In Survival Sprint, hide pack info (no one knows who wolves are)
        const showPackInfo = game.mode !== 'SURVIVAL_SPRINT' && otherWolves.length > 0;
        const isSurvivalSprint = game.mode === 'SURVIVAL_SPRINT';
        const isActualWolf = currentPlayer.role === 'WOLF';
        const isOneShotSeer = game.mode === 'ONE_SHOT_SEER';

        return (
            <div className="space-y-6">
                <Card className={isSurvivalSprint ? "bg-teal-900/20 border-teal-500/30" : "bg-blood-red/10 border-blood-red/30"}>
                    <div className="flex items-center gap-3 mb-4">
                        <Moon className={`w-6 h-6 ${isSurvivalSprint ? 'text-teal-400' : 'text-blood-red'}`} />
                        <div>
                            <h2 className={`text-xl font-bold ${isSurvivalSprint ? 'text-teal-400' : 'text-blood-red'}`}>
                                {isSurvivalSprint ? `🏃‍♂️ ${t.modes.survivalSprint.name}` : t.night.title}
                            </h2>
                            <p className="text-sm text-gray-400">{t.night.time}: {timeRemaining}s</p>
                        </div>
                    </div>

                    {showPackInfo && (
                        <div className="mb-4 p-3 bg-black/20 rounded-lg">
                            <p className="text-sm text-gray-400 mb-2">{t.night.yourPack}</p>
                            <div className="flex gap-2">
                                {otherWolves.map(wolf => (
                                    <div key={wolf.id} className="flex items-center gap-1 text-blood-red">
                                        <span className="text-xl">{wolf.avatar}</span>
                                        <span className="text-sm" translate="no">{wolf.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isSurvivalSprint && (
                        <div className="mb-4 p-3 bg-teal-900/20 rounded-lg border border-teal-500/20">
                            <p className="text-sm text-teal-300">
                                {isActualWolf
                                    ? `🐺 ${t.modeInstructions.survivalSprint.wolfHint}`
                                    : `❓ ${t.modeInstructions.survivalSprint.villagerHint}`}
                            </p>
                        </div>
                    )}

                    {isOneShotSeer && (
                        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                            <p className="text-sm text-blue-300">
                                🔮 {t.night.oneShotSeerInfo}
                            </p>
                        </div>
                    )}

                    <p className="text-gray-300 mb-4">
                        {hasActed
                            ? (isSurvivalSprint ? t.modeInstructions.survivalSprint.processing : t.night.voteSubmitted)
                            : (isOneShotSeer ? t.night.cannotKill : t.night.chooseVictim)}
                    </p>
                </Card>

                {!isOneShotSeer && (
                    <Card>
                        <div className="grid grid-cols-2 gap-3">
                            {alivePlayers.map(player => (
                                <button
                                    key={player.id}
                                    onClick={() => !hasActed && setSelectedTarget(player.id)}
                                    disabled={hasActed}
                                    className={`p-4 rounded-lg border-2 transition-all ${selectedTarget === player.id
                                        ? (isSurvivalSprint
                                            ? 'border-teal-500 bg-teal-500/20'
                                            : 'border-blood-red bg-blood-red/20')
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                        } ${hasActed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-3xl mb-2">{player.avatar}</div>
                                    <div className="text-sm font-medium" translate="no">{player.name}</div>
                                    {!isSurvivalSprint && game.nightActions.wolfVotes[player.id] && (
                                        <div className="text-xs text-blood-red mt-1">
                                            {Object.values(game.nightActions.wolfVotes).filter(
                                                id => id === player.id
                                            ).length} 🐺
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {selectedTarget && !hasActed && (
                            <Button
                                onClick={handleSubmitAction}
                                className="w-full mt-4"
                                variant="danger"
                            >
                                {t.night.confirm}
                            </Button>
                        )}
                    </Card>
                )}
            </div>
        );
    }

    // Seer view
    if (currentPlayer.role === 'SEER') {
        return (
            <div className="space-y-6">
                <Card className="bg-purple-900/20 border-purple-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-purple-400" />
                        <div>
                            <h2 className="text-xl font-bold text-purple-400">{t.night.seerTitle}</h2>
                            <p className="text-sm text-gray-400">{t.night.time}: {timeRemaining}s</p>
                        </div>
                    </div>
                    <p className="text-gray-300">
                        {hasActed ? t.night.seerChecked : t.night.chooseToInspect}
                    </p>
                </Card>

                <Card>
                    <div className="grid grid-cols-2 gap-3">
                        {alivePlayers.map(player => (
                            <button
                                key={player.id}
                                onClick={() => {
                                    if (!hasActed) {
                                        setSelectedTarget(player.id);
                                        submitSeerCheck(game.id, player.id);
                                        setHasActed(true);
                                    }
                                }}
                                disabled={hasActed}
                                className={`p-4 rounded-lg border-2 transition-all ${hasActed && selectedTarget === player.id
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    } ${hasActed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="text-3xl mb-2">{player.avatar}</div>
                                <div className="text-sm font-medium" translate="no">{player.name}</div>
                                {hasActed && selectedTarget === player.id && (
                                    <div className="text-xs text-purple-400 mt-2">
                                        {t.night.roleLabel}: {player.role === 'WOLF' ? t.night.roleWolf : t.night.roleVillage}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    // Villager / Witch / Hunter view - interactive mini-game
    return (
        <div className="space-y-6">
            <Card className="bg-midnight-blue/50">
                <div className="flex items-center gap-3 mb-4">
                    <Moon className="w-6 h-6 text-blue-400" />
                    <div>
                        <h2 className="text-xl font-bold">{t.night.nightFalls}</h2>
                        <p className="text-sm text-gray-400">{t.night.time}: {timeRemaining}s</p>
                    </div>
                </div>
                <p className="text-gray-300 mb-6">
                    {currentPlayer.role === 'VILLAGER'
                        ? t.night.peacefullySleep
                        : interpolate(t.night.roleResting, { role: currentPlayer.role === 'WITCH' ? t.night.witchResting : t.night.hunterResting })}
                </p>

                {/* Interactive mini-game */}
                <VillagerMinigame timeRemaining={timeRemaining} />
            </Card>
        </div>
    );
}
