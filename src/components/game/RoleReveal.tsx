import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Role } from '../../types';

interface RoleRevealProps {
    role: Role;
    avatar: string;
    teammates?: { id: string; name: string; avatar: string }[];
    onContinue: () => void;
}

const ROLE_INFO: Record<Role, {
    name: string;
    icon: string;
    description: string;
    color: string;
    team: string;
}> = {
    WOLF: {
        name: 'Werwolf',
        icon: '🐺',
        description: 'Du erwachst in der Nacht und wählst mit deinem Rudel ein Opfer. Töte alle Dorfbewohner, um zu gewinnen!',
        color: 'from-red-900 to-red-700',
        team: 'WERWÖLFE',
    },
    SEER: {
        name: 'Seherin',
        icon: '🔮',
        description: 'Jede Nacht kannst du einen Spieler untersuchen und seine wahre Identität erfahren. Nutze dein Wissen weise!',
        color: 'from-purple-900 to-purple-700',
        team: 'DORF',
    },
    WITCH: {
        name: 'Hexe',
        icon: '🧙‍♀️',
        description: 'Du besitzt zwei mächtige Tränke: einen zum Heilen und einen zum Vergiften. Jeder kann nur einmal eingesetzt werden.',
        color: 'from-green-900 to-green-700',
        team: 'DORF',
    },
    HUNTER: {
        name: 'Jäger',
        icon: '🏹',
        description: 'Wenn du stirbst, nimmst du einen Spieler deiner Wahl mit ins Grab. Wähle weise!',
        color: 'from-amber-900 to-amber-700',
        team: 'DORF',
    },
    VILLAGER: {
        name: 'Dorfbewohner',
        icon: '👨‍🌾',
        description: 'Du hast keine besonderen Fähigkeiten, aber deine Stimme zählt! Finde die Werwölfe durch Logik und Diskussion.',
        color: 'from-blue-900 to-blue-700',
        team: 'DORF',
    },
};

export function RoleReveal({ role, avatar: _avatar, teammates, onContinue }: RoleRevealProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const roleInfo = ROLE_INFO[role];

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
                        <h2 className="text-2xl font-bold mb-2">Deine Rolle</h2>
                        <p className="text-sm text-gray-400">Diese Information ist nur für dich sichtbar</p>
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
                            className={`relative rounded-xl p-8 bg-gradient-to-br ${roleInfo.color} border-2 border-white/20`}
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            {/* Avatar */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                                className="text-7xl mb-4"
                            >
                                {roleInfo.icon}
                            </motion.div>

                            {/* Role Name */}
                            <motion.h3
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.0 }}
                                className="text-3xl font-bold mb-2"
                            >
                                {roleInfo.name}
                            </motion.h3>

                            {/* Team Badge */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.1 }}
                                className={`inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 ${role === 'WOLF' ? 'bg-blood-red/30 text-blood-red' : 'bg-blue-500/30 text-blue-300'
                                    }`}
                            >
                                Team: {roleInfo.team}
                            </motion.div>

                            {/* Description */}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="text-sm text-gray-200 leading-relaxed"
                            >
                                {roleInfo.description}
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
                            <p className="text-sm text-gray-400 mb-3">Dein Rudel:</p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {teammates.map(teammate => (
                                    <div
                                        key={teammate.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-blood-red/20 rounded-lg border border-blood-red/30"
                                    >
                                        <span className="text-2xl">{teammate.avatar}</span>
                                        <span className="text-sm font-medium text-blood-red">{teammate.name}</span>
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
                            Verstanden, weiter
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
}
