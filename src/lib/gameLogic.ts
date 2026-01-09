import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { GameState, Player } from '../types';

/**
 * Resolve night actions and determine who dies
 */
export function resolveNightActions(game: GameState): { deadPlayerIds: string[]; hunterDied: boolean } {
    const deadPlayerIds: string[] = [];
    let hunterDied = false;

    // 1. Determine wolf victim (most voted)
    const wolfVotes = game.nightActions.wolfVotes;
    let victim: string | null = null;

    // BLITZ_WOLF: If no votes, random kill
    if (game.mode === 'BLITZ_WOLF' && Object.keys(wolfVotes).length === 0) {
        const villagers = Object.values(game.players).filter(p => p.role !== 'WOLF' && p.isAlive);
        if (villagers.length > 0) {
            victim = villagers[Math.floor(Math.random() * villagers.length)].id;
        }
    } else if (Object.keys(wolfVotes).length > 0) {
        // Only count votes from ALIVE werewolves
        const relevantVotes: Record<string, string> = {};
        Object.entries(wolfVotes).forEach(([voterId, targetId]) => {
            const voter = game.players[voterId];
            if (voter && voter.isAlive && voter.role === 'WOLF') {
                relevantVotes[voterId] = targetId;
            }
        });

        const voteCounts: Record<string, number> = {};
        Object.values(relevantVotes).forEach(targetId => {
            voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        });

        // Find player with most votes
        let maxVotes = 0;
        let potentialVictims: string[] = [];

        Object.entries(voteCounts).forEach(([playerId, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                potentialVictims = [playerId];
            } else if (count === maxVotes) {
                potentialVictims.push(playerId);
            }
        });

        // Tie-breaking: If there's a tie, NO ONE dies from wolves (Standard)
        if (potentialVictims.length === 1) {
            const potentialVictimId = potentialVictims[0];
            // Only allow killing players that actually exist in the game
            if (game.players[potentialVictimId]) {
                victim = potentialVictimId;
            }
        }
    }

    // ONE_SHOT_SEER: No night kills from wolves
    if (game.mode === 'ONE_SHOT_SEER') {
        victim = null;
    }

    // 2. Apply Witch Logic
    // If witch saved the victim, they don't die
    if (victim && !game.nightActions.witchSaved) {
        deadPlayerIds.push(victim);
    }

    // If witch poisoned someone, they die
    if (game.nightActions.witchPoisoned) {
        const poisonTargetId = game.nightActions.witchPoisoned;
        // Verify target exists and is not already dead for another reason
        if (game.players[poisonTargetId] && !deadPlayerIds.includes(poisonTargetId)) {
            deadPlayerIds.push(poisonTargetId);
        }
    }

    // 3. Check for Hunter Death
    deadPlayerIds.forEach(id => {
        const player = game.players[id];
        if (player && player.role === 'HUNTER') {
            hunterDied = true;
        }
    });

    return { deadPlayerIds, hunterDied };
}

/**
 * Resolve day votes and determine who gets executed
 */
export function resolveDayVotes(game: GameState): { executedPlayerId: string | null; hunterDied: boolean } {
    const dayVotes = game.dayVotes;
    let hunterDied = false;

    if (Object.keys(dayVotes).length === 0) {
        return { executedPlayerId: null, hunterDied: false };
    }

    // Count votes from ALIVE players
    const voteCounts: Record<string, number> = {};
    Object.entries(dayVotes).forEach(([voterId, targetId]) => {
        const voter = game.players[voterId];
        const target = game.players[targetId];
        if (voter && voter.isAlive && target) {
            voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        }
    });

    // Find player with most votes
    let maxVotes = 0;
    let potentialVictims: string[] = [];

    Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            potentialVictims = [playerId];
        } else if (count === maxVotes) {
            potentialVictims.push(playerId);
        }
    });

    // Tie-breaking: If there's a tie, NO ONE gets executed
    let executed: string | null = null;
    if (potentialVictims.length === 1) {
        executed = potentialVictims[0];
    }

    if (executed && game.players[executed] && game.players[executed].role === 'HUNTER') {
        hunterDied = true;
    }

    return { executedPlayerId: executed, hunterDied };
}

/**
 * Check if game is over and determine winner
 * For SURVIVAL_SPRINT mode: Wolf wins if alive at Final 2, villagers win if wolf is eliminated
 */
export function checkWinCondition(
    players: Record<string, Player>,
    mode?: string,
    dayCount: number = 0
): 'VILLAGERS' | 'WEREWOLVES' | null {
    const alivePlayers = Object.values(players).filter(p => p.isAlive);
    const aliveWolves = alivePlayers.filter(p => p.role === 'WOLF');
    const aliveVillagers = alivePlayers.filter(p => p.role !== 'WOLF');

    // Edge case: Everyone dead (Mutual destruction) -> Draw? Or Wolves win? 
    // Usually, if wolves die last, Villagers win. But if simultaneous... 
    // Let's say if NO wolves are alive, Villagers win (even if 0 villagers).
    if (aliveWolves.length === 0) {
        return 'VILLAGERS';
    }

    // SURVIVAL_SPRINT mode: Wolf wins if alive at Final 2
    if (mode === 'SURVIVAL_SPRINT') {
        if (alivePlayers.length <= 2 && aliveWolves.length > 0) {
            return 'WEREWOLVES';
        }
        return null;
    }

    // ONE_SHOT_SEER mode: Wolf wins if they survive 3 days (Day Count >= 3)
    if (mode === 'ONE_SHOT_SEER') {
        // If wolf is still alive after Day 3 (meaning we are entering Night 4 or Day 4), Wolf wins.
        // Let's say win at start of Day 4? Or end of Day 3?
        // Let's check dayCount. If dayCount >= 3, Wolf wins.
        if (dayCount >= 3) {
            return 'WEREWOLVES';
        }
        // Villagers win if they kill the wolf (handled by aliveWolves.length === 0 check above)
        return null;
    }

    // Standard mode: Werewolves win if they equal or outnumber villagers
    if (aliveWolves.length >= aliveVillagers.length) {
        return 'WEREWOLVES';
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
        phaseEndTime: Date.now() + 120000, // 2 minutes for discussion (will be overridden by gameService logic usually, but this is fallback)
        'nightActions.wolfVotes': {},
        'nightActions.seerCheck': null,
        'nightActions.witchSaved': false,
        'nightActions.witchPoisoned': null,
        dayCount: (await import('firebase/firestore')).increment(1),
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
    const updates: Record<string, unknown> = {};

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

/**
 * Handle Hunter's revenge shot
 */
export async function handleHunterRevenge(
    gameId: string,
    _hunterId: string, // Unused but kept for signature consistency if needed, or just remove. Let's prefix with _
    targetId: string
): Promise<void> {
    const gameRef = doc(db, 'games', gameId);

    // Kill the target
    await updateDoc(gameRef, {
        [`players.${targetId}.isAlive`]: false,
        [`hunterDeath.targetId`]: targetId, // Record who was shot
        status: 'DAY', // Return to day (or whatever phase is appropriate, usually Day starts after Hunter dies at night)
        // Note: If Hunter died during Day, we might want to go to Night? 
        // For simplicity, let's assume Hunter shot happens, then we proceed.
        // If it was Night -> Day transition, we go to Day.
        // If it was Day -> Night transition, we go to Night.
        // This state management is tricky. 
        // Better approach: Host manually transitions after Hunter shot.
        // So here we just kill and maybe set status back to previous or next?
        // Let's just kill and let Host decide next phase or auto-check win.
    });
}

/**
 * Trigger Hunter Revenge Phase
 */
export async function triggerHunterRevenge(gameId: string, hunterId: string): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
        status: 'HUNTER_REVENGE',
        hunterDeath: { hunterId, targetId: null }
    });
}
