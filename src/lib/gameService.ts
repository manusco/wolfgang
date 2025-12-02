import { doc, setDoc, getDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { GameState, Role, GameMode, GameStatus } from '../types';

/**
 * Generates a random 4-letter room code
 */
export function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O to avoid confusion
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Assign roles to players
 */
function assignRoles(playerIds: string[], roleConfig: { wolves: number; seer: number; witch: number }): Record<string, Role> {
    const roles: Role[] = [];

    // Add werewolves
    for (let i = 0; i < roleConfig.wolves; i++) {
        roles.push('WOLF');
    }

    // Add seer
    if (roleConfig.seer > 0) roles.push('SEER');

    // Add witch
    if (roleConfig.witch > 0) roles.push('WITCH');

    // Fill remaining with villagers
    while (roles.length < playerIds.length) {
        roles.push('VILLAGER');
    }

    // Shuffle and assign
    const shuffledRoles = shuffle(roles);
    const assignment: Record<string, Role> = {};

    playerIds.forEach((playerId, index) => {
        assignment[playerId] = shuffledRoles[index];
    });

    return assignment;
}

/**
 * Create a new game
 */
export async function createGame(hostId: string, hostName: string, hostAvatar: string, mode: GameMode = 'CLASSIC'): Promise<string> {
    console.log('[createGame] Starting game creation...', { hostId, hostName });
    const roomCode = generateRoomCode();
    console.log('[createGame] Generated room code:', roomCode);

    const initialGame: GameState = {
        id: roomCode,
        hostId,
        status: 'LOBBY',
        mode,
        phaseEndTime: 0,
        players: {
            [hostId]: {
                id: hostId,
                name: hostName,
                role: 'VILLAGER', // Will be assigned when game starts
                isAlive: true,
                avatar: hostAvatar,
            },
        },
        nightActions: {
            wolfVotes: {},
            witchHealUsed: false,
            witchPoisonUsed: false,
            witchSaved: false,
            witchPoisoned: null,
            seerCheck: null,
        },
        dayVotes: {},
        hunterDeath: null,
        winner: null,
    };

    console.log('[createGame] Writing to Firestore...', initialGame);

    try {
        await setDoc(doc(db, 'games', roomCode), initialGame);
        console.log('[createGame] Successfully created game!');
        return roomCode;
    } catch (error) {
        console.error('[createGame] Error writing to Firestore:', error);
        throw error;
    }
}

/**
 * Join an existing game
 */
export async function joinGame(
    roomCode: string,
    playerId: string,
    playerName: string,
    playerAvatar: string
): Promise<boolean> {
    const gameRef = doc(db, 'games', roomCode);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
        throw new Error('Game not found');
    }

    const game = gameSnap.data() as GameState;

    if (game.status !== 'LOBBY') {
        throw new Error('Game already started');
    }

    // Add player
    await updateDoc(gameRef, {
        [`players.${playerId}`]: {
            id: playerId,
            name: playerName,
            role: 'VILLAGER',
            isAlive: true,
            avatar: playerAvatar,
        },
    });

    return true;
}

/**
 * Start the game (Host only)
 */
export async function startGame(roomCode: string): Promise<void> {
    const gameRef = doc(db, 'games', roomCode);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) throw new Error('Game not found');

    const game = gameSnap.data() as GameState;
    const playerIds = Object.keys(game.players);

    if (playerIds.length < 2) {
        throw new Error('Not enough players. Need at least 2 players.');
    }

    // Default role configuration
    let roleConfig = {
        wolves: Math.max(1, Math.floor(playerIds.length / 4)),
        seer: 1,
        witch: 1,
    };

    // Mode-specific role configuration
    if (game.mode === 'BLITZ_WOLF') {
        roleConfig = { wolves: 1, seer: 0, witch: 0 };
    } else if (game.mode === 'ONE_SHOT_SEER') {
        roleConfig = { wolves: 1, seer: 1, witch: 0 };
    } else if (game.mode === 'THE_ACCUSED') {
        roleConfig = { wolves: 1, seer: 0, witch: 0 };
    } else if (game.mode === 'SURVIVAL_SPRINT') {
        roleConfig = { wolves: 1, seer: 0, witch: 0 };
    }

    const roleAssignments = assignRoles(playerIds, roleConfig);

    // Determine initial phase
    // Survival Sprint always starts at Day to give villagers a chance
    // Small games (< 4 players) also start at Day to prevent instant loss (Night Kill -> 1v1 -> Wolf Wins)
    const initialPhase = (game.mode === 'SURVIVAL_SPRINT' || playerIds.length < 4) ? 'DAY' : 'NIGHT';

    // Update all players with their roles
    const updates: any = {
        status: initialPhase,
        phaseEndTime: Date.now() + getPhaseTimer(game.mode, initialPhase),
    };

    playerIds.forEach((playerId) => {
        updates[`players.${playerId}.role`] = roleAssignments[playerId];
    });

    // For THE_ACCUSED mode: Mark one random villager as accused
    if (game.mode === 'THE_ACCUSED') {
        const villagers = playerIds.filter(id => roleAssignments[id] === 'VILLAGER');
        if (villagers.length > 0) {
            const accusedId = villagers[Math.floor(Math.random() * villagers.length)];
            updates['accusedPlayerId'] = accusedId;
        }
    }

    await updateDoc(gameRef, updates);
}

/**
 * Get phase timer based on game mode
 */
function getPhaseTimer(mode: GameMode, phase: GameStatus): number {
    if (mode === 'BLITZ_WOLF') {
        // Blitz Wolf: Ultra-fast timers
        if (phase === 'NIGHT') return 15000; // 15s
        if (phase === 'DAY') return 30000; // 30s discussion
        return 15000; // 15s voting
    }

    if (mode === 'ONE_SHOT_SEER') {
        // One Shot Seer: Longer discussion, no night kills
        if (phase === 'NIGHT') return 20000; // 20s (seer checks only)
        if (phase === 'DAY') return 60000; // 60s discussion (more time for deduction)
        return 30000; // 30s voting
    }

    if (mode === 'THE_ACCUSED') {
        // The Accused: Standard timers with emphasis on discussion
        if (phase === 'NIGHT') return 25000; // 25s
        if (phase === 'DAY') return 75000; // 75s discussion (time for accused to defend)
        return 30000; // 30s voting
    }

    if (mode === 'SURVIVAL_SPRINT') {
        // Survival Sprint: Balance between paranoia and decision-making
        if (phase === 'NIGHT') return 30000; // 30s (everyone votes to eliminate)
        if (phase === 'DAY') return 45000; // 45s (quick defense time)
        return 20000; // 20s voting
    }

    // Classic mode: Standard timers
    if (phase === 'NIGHT') return 30000; // 30s
    if (phase === 'DAY') return 90000; // 90s discussion
    return 30000; // 30s voting
}

/**
 * Subscribe to game updates
 */
export function subscribeToGame(roomCode: string, callback: (game: GameState) => void): Unsubscribe {
    const gameRef = doc(db, 'games', roomCode);

    return onSnapshot(gameRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as GameState);
        }
    });
}

/**
 * Submit a wolf vote
 */
export async function submitWolfVote(roomCode: string, wolfId: string, targetId: string): Promise<void> {
    const gameRef = doc(db, 'games', roomCode);
    await updateDoc(gameRef, {
        [`nightActions.wolfVotes.${wolfId}`]: targetId,
    });
}

/**
 * Submit seer check
 */
export async function submitSeerCheck(roomCode: string, targetId: string): Promise<void> {
    const gameRef = doc(db, 'games', roomCode);
    await updateDoc(gameRef, {
        'nightActions.seerCheck': targetId,
    });
}

/**
 * Submit day vote
 */
export async function submitDayVote(roomCode: string, voterId: string, targetId: string): Promise<void> {
    const gameRef = doc(db, 'games', roomCode);
    await updateDoc(gameRef, {
        [`dayVotes.${voterId}`]: targetId,
    });
}

/**
 * Check if a game exists and get its current state
 */
export async function checkGameExists(roomCode: string): Promise<GameState | null> {
    try {
        const gameRef = doc(db, 'games', roomCode);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
            return null;
        }

        return gameSnap.data() as GameState;
    } catch (error) {
        console.error('[checkGameExists] Error:', error);
        return null;
    }
}

/**
 * Check if a player can rejoin a game
 */
export async function canRejoinGame(roomCode: string, playerId: string): Promise<boolean> {
    const game = await checkGameExists(roomCode);

    if (!game) return false;

    // Check if player is in the game
    return playerId in game.players;
}

/**
 * Reconnect to an existing game
 * Validates that the game exists and the player is part of it
 */
export async function reconnectToGame(
    roomCode: string,
    playerId: string
): Promise<{ success: boolean; game?: GameState; error?: string }> {
    try {
        const game = await checkGameExists(roomCode);

        if (!game) {
            return { success: false, error: 'Game not found' };
        }

        if (!(playerId in game.players)) {
            return { success: false, error: 'Player not in game' };
        }

        // Successfully reconnected
        return { success: true, game };
    } catch (error) {
        console.error('[reconnectToGame] Error:', error);
        return { success: false, error: 'Failed to reconnect' };
    }
}

