import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Role } from '../../types';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';

interface RoleRevealProps {
    role: Role;
    avatar: string;
    teammates?: { id: string; name: string; avatar: string }[];
    onContinue: () => void;
}

// Visual identity per role. Names and descriptions come from i18n, not from here.
const ROLE_VISUALS: Record<Role, { icon: string; color: string; isWolf: boolean }> = {
    WOLF: { icon: '🐺', color: 'from-red-900 to-red-700', isWolf: true },
    SEER: { icon: '🔮', color: 'from-purple-900 to-purple-700', isWolf: false },
    WITCH: { icon: '🧙‍♀️', color: 'from-green-900 to-green-700', isWolf: false },
    HUNTER: { icon: '🏹', color: 'from-amber-900 to-amber-700', isWolf: false },
    VILLAGER: { icon: '👨‍🌾', color: 'from-blue-900 to-blue-700', isWolf: false },
};

const ROLE_DESCRIPTION_KEY: Record<Role, string> = {
    WOLF: 'wolfDescription',
    SEER: 'seerDescription',
    WITCH: 'witchDescription',
    HUNTER: 'hunterDescription',
    VILLAGER: 'villagerDescription',
};

export function RoleReveal({ role, avatar: _avatar, teammates, onContinue }: RoleRevealProps) {
    const { language } = useLanguageStore();
    const t = translations[language];
    const rr = t.roleReveal as Record<string, string>;
    const [isRevealed, setIsRevealed] = useState(false);

    const visuals = ROLE_VISUALS[role];
    const roleName = t.roles[role as keyof typeof t.roles];
    const roleDescription = rr[ROLE_DESCRIPTION_KEY[role]];
    const teamName = visuals.isWolf ? t.roleReveal.teamWerewolves : t.roleReveal.teamVillage;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <Card className="max-w-md w-full">
                <div className="text-center space-y-6">
                    {/* Title */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold mb-2">{t.roleReveal.yourRole}</h2>
                        <p className="text-sm text-gray-400">{t.roleReveal.privateInfo}</p>
                    </motion.div>

                    {/* Role Card with Flip Animation */}
                    <motion.div
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: isRevealed ? 0 : 180 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        onAnimationComplete={() => !isRevealed && setIsRevealed(true)}
                        className="relative"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <div
                            className={`relative rounded-xl p-8 bg-gradient-to-br ${visuals.color} border-2 border-white/20`}
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            {/* Avatar */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                                className="text-7xl mb-4"
                            >
                                {visuals.icon}
                            </motion.div>

                            {/* Role Name */}
                            <motion.h3
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.0 }}
                                className="text-3xl font-bold mb-2"
                            >
                                {roleName}
                            </motion.h3>

                            {/* Team Badge */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.1 }}
                                className={`inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 ${role === 'WOLF' ? 'bg-blood-red/30 text-blood-red' : 'bg-blue-500/30 text-blue-300'
                                    }`}
                            >
                                {t.roleReveal.team}: {teamName}
                            </motion.div>

                            {/* Description */}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="text-sm text-gray-200 leading-relaxed"
                            >
                                {roleDescription}
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Teammates (Werewolves only) */}
                    {teammates && teammates.length > 0 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.3 }}
                            className="p-4 bg-blood-red/10 rounded-lg border border-blood-red/20"
                        >
                            <p className="text-sm text-gray-400 mb-3">{t.roleReveal.yourPack}</p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {teammates.map(teammate => (
                                    <div
                                        key={teammate.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-blood-red/20 rounded-lg border border-blood-red/30"
                                    >
                                        <span className="text-2xl">{teammate.avatar}</span>
                                        <span className="text-sm font-medium text-blood-red" translate="no">{teammate.name}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Continue Button */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.4 }}
                    >
                        <Button
                            onClick={onContinue}
                            size="lg"
                            className="w-full"
                        >
                            {t.roleReveal.understood}
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
}
