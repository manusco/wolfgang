import { doc, setDoc, getDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { GameState, Role } from '../types';

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
export async function createGame(hostId: string, hostName: string, hostAvatar: string): Promise<string> {
    console.log('[createGame] Starting game creation...', { hostId, hostName });
    const roomCode = generateRoomCode();
    console.log('[createGame] Generated room code:', roomCode);

    const initialGame: GameState = {
        id: roomCode,
        hostId,
        status: 'LOBBY',
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
            seerCheck: null,
        },
        dayVotes: {},
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

    // Default role configuration (adjust based on player count)
    const roleConfig = {
        wolves: Math.max(1, Math.floor(playerIds.length / 4)),
        seer: 1,
        witch: 1,
    };

    const roleAssignments = assignRoles(playerIds, roleConfig);

    // Update all players with their roles
    const updates: any = {
        status: 'NIGHT',
        phaseEndTime: Date.now() + 30000, // 30 seconds for night phase
    };

    playerIds.forEach((playerId) => {
        updates[`players.${playerId}.role`] = roleAssignments[playerId];
    });

    await updateDoc(gameRef, updates);
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
