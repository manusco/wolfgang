import re

# Read the current Lobby.tsx
with open('src/pages/Lobby.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports - add GameMode, Zap, Eye, Users
content = content.replace(
    "import { GameState } from '../types';",
    "import { GameState, GameMode } from '../types';"
)
content = content.replace(
    "import { ArrowLeft, Copy, User, AlertCircle } from 'lucide-react';",
    "import { ArrowLeft, Copy, User, AlertCircle, Zap, Eye, Users } from 'lucide-react';"
)

# 2. Add selectedMode state after roomCode
content = re.sub(
    r"(const \[roomCode, setRoomCode\] = useState\(''\);)",
    r"\1\r\n    const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');",
    content
)

# 3. Update createGame call to include selectedMode
content = content.replace(
    "const code = await createGame(playerId, name, selectedAvatar);",
    "const code = await createGame(playerId, name, selectedAvatar, selectedMode);"
)

# 4. Insert mode selection UI before avatar selection
# Find the line with "div className=\"flex justify-center mb-6\"" after Card opens
mode_selection_ui = '''                    {/* Mode Selection (Host Only) */}
                    {isHost && !gameState && (
                        <div className="space-y-3 pb-4 border-b border-white/10">
                            <label className="text-sm font-medium text-gray-300">
                                {language === 'de' ? 'Spielmodus' : 'Game Mode'}
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                <button onClick={() => setSelectedMode('CLASSIC')} className={`p-3 rounded-lg border-2 transition-all text-left ${selectedMode === 'CLASSIC' ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" /><span className="font-medium">{t.modes?.classic?.name || 'Classic'}</span></div>
                                </button>
                                <button onClick={() => setSelectedMode('BLITZ_WOLF')} className={`p-3 rounded-lg border-2 transition-all text-left ${selectedMode === 'BLITZ_WOLF' ? 'border-yellow-500 bg-yellow-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /><span className="font-medium">{t.modes?.blitzWolf?.name || 'Blitz Wolf'}</span></div>
                                </button>
                                <button onClick={() => setSelectedMode('ONE_SHOT_SEER')} className={`p-3 rounded-lg border-2 transition-all text-left ${selectedMode === 'ONE_SHOT_SEER' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-2"><Eye className="w-5 h-5 text-blue-400" /><span className="font-medium">{t.modes?.oneShotSeer?.name || 'One Shot Seer'}</span></div>
                                </button>
                                <button onClick={() => setSelectedMode('THE_ACCUSED')} className={`p-3 rounded-lg border-2 transition-all text-left ${selectedMode === 'THE_ACCUSED' ? 'border-orange-500 bg-orange-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-2"><Users className="w-5 h-5 text-orange-400" /><span className="font-medium">{t.modes?.theAccused?.name || 'The Accused'}</span></div>
                                </button>
                                <button onClick={() => setSelectedMode('SURVIVAL_SPRINT')} className={`p-3 rounded-lg border-2 transition-all text-left ${selectedMode === 'SURVIVAL_SPRINT' ? 'border-teal-500 bg-teal-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-2"><User className="w-5 h-5 text-teal-400" /><span className="font-medium">{t.modes?.survivalSprint?.name || 'Survival Sprint'}</span></div>
                                </button>
                            </div>
                        </div>
                    )}

'''

# Insert before the avatar selection div
content = content.replace(
    '                <div className="space-y-4">\r\n                    <div className="flex justify-center mb-6">',
    '                <div className="space-y-4">\r\n' + mode_selection_ui + '                    <div className="flex justify-center mb-6">'
)

# Write back
with open('src/pages/Lobby.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Lobby.tsx patched successfully!")
