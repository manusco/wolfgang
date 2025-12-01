import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { GameState, Player } from '../types';

/**
 * Resolve night actions and determine who dies
 */
export function resolveNightActions(game: GameState): { deadPlayerIds: string[] } {
    const deadPlayerIds: string[] = [];

    // Determine wolf victim (most voted)
    const wolfVotes = game.nightActions.wolfVotes;
    if (Object.keys(wolfVotes).length > 0) {
        const voteCounts: Record<string, number> = {};
        Object.values(wolfVotes).forEach(targetId => {
            voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        });

        // Find player with most votes
        let maxVotes = 0;
        let victim: string | null = null;
        Object.entries(voteCounts).forEach(([playerId, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                victim = playerId;
            }
        });

        if (victim && !game.nightActions.witchHealUsed) {
            deadPlayerIds.push(victim);
        }
    }

    return { deadPlayerIds };
}

/**
 * Resolve day votes and determine who gets executed
 */
export function resolveDayVotes(game: GameState): { executedPlayerId: string | null } {
    const dayVotes = game.dayVotes;

    if (Object.keys(dayVotes).length === 0) {
        return { executedPlayerId: null };
    }

    // Count votes
    const voteCounts: Record<string, number> = {};
    Object.values(dayVotes).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // Find player with most votes
    let maxVotes = 0;
    let executed: string | null = null;
    Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            executed = playerId;
        }
    });

    return { executedPlayerId: executed };
}

/**
 * Check if game is over and determine winner
 */
export function checkWinCondition(players: Record<string, Player>): 'VILLAGERS' | 'WEREWOLVES' | null {
    const alivePlayers = Object.values(players).filter(p => p.isAlive);
    const aliveWolves = alivePlayers.filter(p => p.role === 'WOLF');
    const aliveVillagers = alivePlayers.filter(p => p.role !== 'WOLF');

    // Werewolves win if they equal or outnumber villagers
    if (aliveWolves.length >= aliveVillagers.length && aliveWolves.length > 0) {
        return 'WEREWOLVES';
    }

    // Villagers win if all werewolves are dead
    if (aliveWolves.length === 0) {
        return 'VILLAGERS';
    }

    return null;
}

/**
 * Transition from NIGHT to DAY phase (called by host)
 */
export async function transitionToDay(gameId: string): Promise<void> {
    const gameRef = doc(db, 'games', gameId);

    await updateDoc(gameRef, {
        status: 'DAY',
        phaseEndTime: Date.now() + 120000, // 2 minutes for discussion
        'nightActions.wolfVotes': {},
        'nightActions.seerCheck': null,
    });
}

/**
 * Transition from DAY to NIGHT phase (called by host after resolving day votes)
 */
export async function transitionToNight(gameId: string): Promise<void> {
    const gameRef = doc(db, 'games', gameId);

    await updateDoc(gameRef, {
        status: 'NIGHT',
        phaseEndTime: Date.now() + 30000, // 30 seconds for night
        dayVotes: {},
    });
}

/**
 * Mark players as dead and check win condition
 */
export async function killPlayers(
    gameId: string,
    playerIds: string[]
): Promise<void> {
    if (playerIds.length === 0) return;

    const gameRef = doc(db, 'games', gameId);
    const updates: any = {};

    playerIds.forEach(playerId => {
        updates[`players.${playerId}.isAlive`] = false;
    });

    await updateDoc(gameRef, updates);
}

/**
 * End the game with a winner
 */
export async function endGame(
    gameId: string,
    winner: 'VILLAGERS' | 'WEREWOLVES'
): Promise<void> {
    const gameRef = doc(db, 'games', gameId);

    await updateDoc(gameRef, {
        status: 'GAMEOVER',
        winner,
    });
}
