# PowerShell script to patch Lobby.tsx

$file = "src\pages\Lobby.tsx"
$content = Get-Content $file -Raw

# 1. Update imports
$content = $content -replace "import { GameState } from '../types';", "import { GameState, GameMode } from '../types';"
$content = $content -replace "import { Arrow Left, Copy, User, AlertCircle } from 'lucide-react';", "import { ArrowLeft, Copy, User, AlertCircle, Zap, Eye, Users } from 'lucide-react';"

# 2. Add selectedMode state 
$content = $content -replace "(\s+const \[roomCode, setRoomCode\] = useState\(''\);)", "`$1`r`n    const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');"

# 3. Update createGame call
$content = $content -replace "const code = await createGame\(playerId, name, selectedAvatar\);", "const code = await createGame(playerId, name, selectedAvatar, selectedMode);"

# 4. Comment out AVATAR_NAMES
$content = $content -replace "(?s)(//  Avatar descriptions.*?\r\n)(const AVATAR_NAMES.*?};)", "`$1// `$2"

# Write back
$content | Set-Content $file -NoNewline

Write-Host "✅ Lobby.tsx basic patches applied!"
