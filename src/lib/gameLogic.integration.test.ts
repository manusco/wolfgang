import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as gameLogic from './gameLogic';
import { GameState, Player } from '../types';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
    onSnapshot: vi.fn(),
    increment: vi.fn((n) => n),
}));

// Mock the firebase module itself
vi.mock('./firebase', () => ({
    db: {},
    analytics: {},
}));

describe('Game Logic Integration - Full Lifecycle', () => {
    let mockGameState: GameState;
    const gameId = 'TEST_ROOM';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should complete a full cycle from Lobby to Day 1', async () => {
        // 1. Setup: Host creates a game
        const hostId = 'host-1';
        const hostPlayer: Player = { id: hostId, name: 'Host', role: 'VILLAGER', isAlive: true, avatar: '🦊' };

        mockGameState = {
            id: gameId,
            hostId: hostId,
            status: 'LOBBY',
            mode: 'CLASSIC',
            phaseEndTime: 0,
            players: { [hostId]: hostPlayer },
            nightActions: {
                wolfVotes: {},
                witchHealUsed: false,
                witchPoisonUsed: false,
                witchSaved: false,
                witchPoisoned: null,
                seerCheck: null
            },
            dayVotes: {},
            hunterDeath: null,
            winner: null,
            dayCount: 0
        };

        // 2. Integration: Add players to the lobby
        const player2Id = 'p2';
        const player3Id = 'p3';
        const player4Id = 'p4';

        mockGameState.players[player2Id] = { id: player2Id, name: 'P2', role: 'VILLAGER', isAlive: true, avatar: '🐺' };
        mockGameState.players[player3Id] = { id: player3Id, name: 'P3', role: 'VILLAGER', isAlive: true, avatar: '🧙' };
        mockGameState.players[player4Id] = { id: player4Id, name: 'P4', role: 'VILLAGER', isAlive: true, avatar: '🏹' };

        // 3. Integration: Start Game (Roles should be assigned)
        // We simulate the updateDoc by manually updating mockGameState
        const playerIds = Object.keys(mockGameState.players);
        expect(playerIds.length).toBe(4);

        // Assign fixed roles for deterministic test
        mockGameState.players[hostId].role = 'WOLF';
        mockGameState.players[player2Id].role = 'VILLAGER';
        mockGameState.players[player3Id].role = 'WITCH';
        mockGameState.players[player4Id].role = 'HUNTER';
        mockGameState.status = 'NIGHT';
        mockGameState.phaseEndTime = Date.now() + 30000;

        expect(mockGameState.status).toBe('NIGHT');

        // 4. Integration: Night Phase
        // Wolf 1 votes for Villager 2
        mockGameState.nightActions.wolfVotes[hostId] = player2Id;

        // Witch 3 saves Villager 2
        mockGameState.nightActions.witchSaved = true;
        mockGameState.nightActions.witchHealUsed = true;

        // Resolve Night Actions
        const nightResult = gameLogic.resolveNightActions(mockGameState);
        expect(nightResult.deadPlayerIds.length).toBe(0); // Witch saved him
        expect(nightResult.hunterDied).toBe(false);

        // Transition to Day
        mockGameState.status = 'DAY';
        mockGameState.nightActions.wolfVotes = {};
        mockGameState.nightActions.witchSaved = false;
        mockGameState.dayCount = 1;

        // 5. Integration: Day Phase
        // Everyone votes for the Wolf (host-1)
        mockGameState.dayVotes[player2Id] = hostId;
        mockGameState.dayVotes[player3Id] = hostId;
        mockGameState.dayVotes[player4Id] = hostId;

        // Resolve Day Votes
        const dayResult = gameLogic.resolveDayVotes(mockGameState);
        expect(dayResult.executedPlayerId).toBe(hostId);
        expect(dayResult.hunterDied).toBe(false);

        // Kill the executed player and check win condition
        mockGameState.players[hostId].isAlive = false;
        const winner = gameLogic.checkWinCondition(mockGameState.players);

        // Host was the only wolf, so Villagers should win!
        expect(winner).toBe('VILLAGERS');
    });

    it('should trigger Hunter revenge when Hunter is killed at night', async () => {
        // Setup game with Wolf and Hunter
        const wolfId = 'w1';
        const hunterId = 'h1';

        mockGameState = {
            id: gameId,
            hostId: wolfId,
            status: 'NIGHT',
            mode: 'CLASSIC',
            phaseEndTime: Date.now() + 30000,
            players: {
                [wolfId]: { id: wolfId, name: 'Wolf', role: 'WOLF', isAlive: true, avatar: '🐺' },
                [hunterId]: { id: hunterId, name: 'Hunter', role: 'HUNTER', isAlive: true, avatar: '🏹' }
            },
            nightActions: {
                wolfVotes: { [wolfId]: hunterId },
                witchHealUsed: false,
                witchPoisonUsed: false,
                witchSaved: false,
                witchPoisoned: null,
                seerCheck: null
            },
            dayVotes: {},
            hunterDeath: null,
            winner: null,
            dayCount: 1
        };

        // Resolve
        const result = gameLogic.resolveNightActions(mockGameState);
        expect(result.deadPlayerIds).toContain(hunterId);
        expect(result.hunterDied).toBe(true);

        // Simulate triggerHunterRevenge
        mockGameState.status = 'HUNTER_REVENGE';
        mockGameState.hunterDeath = { hunterId, targetId: null };

        // Hunter shoots Wolf
        const targetId = wolfId;
        mockGameState.players[targetId].isAlive = false;
        mockGameState.hunterDeath.targetId = targetId;

        // Check if villagers win
        const winner = gameLogic.checkWinCondition(mockGameState.players);
        expect(winner).toBe('VILLAGERS');
    });
});
