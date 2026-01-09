import { describe, it, expect } from 'vitest';
import { resolveNightActions, resolveDayVotes, checkWinCondition } from './gameLogic';
import { GameState, Player, Role, GameMode } from '../types';

// Helper to create a mock player
const createPlayer = (id: string, role: Role, isAlive: boolean = true): Player => ({
    id,
    name: `Player ${id}`,
    role,
    isAlive,
    avatar: '🦊'
});

// Helper to create a mock game state
const createMockGame = (
    mode: GameMode = 'CLASSIC',
    players: Player[] = [],
    dayCount: number = 0
): GameState => {
    const playersMap: Record<string, Player> = {};
    players.forEach(p => {
        playersMap[p.id] = p;
    });

    return {
        id: 'TEST',
        hostId: players[0]?.id || 'host',
        status: 'NIGHT',
        mode,
        phaseEndTime: Date.now() + 30000,
        players: playersMap,
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
        dayCount
    };
};

describe('gameLogic - resolveNightActions', () => {
    it('should resolve a single wolf victim in CLASSIC mode', () => {
        const players = [
            createPlayer('1', 'WOLF'),
            createPlayer('2', 'VILLAGER'),
            createPlayer('3', 'VILLAGER')
        ];
        const game = createMockGame('CLASSIC', players);
        game.nightActions.wolfVotes = { '1': '2' };

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds).toContain('2');
        expect(result.deadPlayerIds.length).toBe(1);
    });

    it('should NOT result in death during a tie in CLASSIC mode', () => {
        const players = [
            createPlayer('1', 'WOLF'),
            createPlayer('2', 'WOLF'),
            createPlayer('3', 'VILLAGER'),
            createPlayer('4', 'VILLAGER')
        ];
        const game = createMockGame('CLASSIC', players);
        game.nightActions.wolfVotes = { '1': '3', '2': '4' };

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds.length).toBe(0);
    });

    it('should allow Witch to save the wolf victim', () => {
        const players = [
            createPlayer('1', 'WOLF'),
            createPlayer('2', 'VILLAGER'),
            createPlayer('3', 'WITCH')
        ];
        const game = createMockGame('CLASSIC', players);
        game.nightActions.wolfVotes = { '1': '2' };
        game.nightActions.witchSaved = true;

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds).not.toContain('2');
        expect(result.deadPlayerIds.length).toBe(0);
    });

    it('should allow Witch to poison a player', () => {
        const players = [
            createPlayer('1', 'WOLF'),
            createPlayer('2', 'VILLAGER'),
            createPlayer('3', 'WITCH')
        ];
        const game = createMockGame('CLASSIC', players);
        game.nightActions.witchPoisoned = '1';

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds).toContain('1');
    });

    it('should handle Hunter death during the night', () => {
        const players = [
            createPlayer('1', 'WOLF'),
            createPlayer('2', 'HUNTER')
        ];
        const game = createMockGame('CLASSIC', players);
        game.nightActions.wolfVotes = { '1': '2' };

        const result = resolveNightActions(game);
        expect(result.hunterDied).toBe(true);
    });

    it('should pick a random victim in BLITZ_WOLF if no votes were cast', () => {
        const players = [
            createPlayer('1', 'WOLF'),
            createPlayer('2', 'VILLAGER'),
            createPlayer('3', 'VILLAGER')
        ];
        const game = createMockGame('BLITZ_WOLF', players);
        game.nightActions.wolfVotes = {};

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds.length).toBe(1);
        expect(['2', '3']).toContain(result.deadPlayerIds[0]);
    });

    it('should ignore non-wolf votes in SURVIVAL_SPRINT mode', () => {
        const players = [
            createPlayer('1', 'WOLF'),
            createPlayer('2', 'VILLAGER'),
            createPlayer('3', 'VILLAGER')
        ];
        const game = createMockGame('SURVIVAL_SPRINT', players);
        // Villager 2 votes for Villager 3
        // Wolf 1 votes for Villager 2
        game.nightActions.wolfVotes = { '2': '3', '1': '2' };

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds).toContain('2'); // Only Wolf 1's vote should count
        expect(result.deadPlayerIds).not.toContain('3');
    });

    it('should have NO night kills in ONE_SHOT_SEER mode', () => {
        const players = [
            createPlayer('1', 'WOLF'),
            createPlayer('2', 'VILLAGER')
        ];
        const game = createMockGame('ONE_SHOT_SEER', players);
        game.nightActions.wolfVotes = { '1': '2' };

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds.length).toBe(0);
    });

    it('should ignore votes from DEAD players (Ghost Voting)', () => {
        const players = [
            createPlayer('1', 'WOLF', false), // Dead wolf
            createPlayer('2', 'WOLF', true),  // Alive wolf
            createPlayer('3', 'VILLAGER', true)
        ];
        const game = createMockGame('CLASSIC', players);
        // Dead wolf 1 votes for 3, alive wolf 2 votes for 1
        game.nightActions.wolfVotes = { '1': '3', '2': '1' };

        const result = resolveNightActions(game);
        // Only vote from 2 should count, so 1 should be the victim
        expect(result.deadPlayerIds).toContain('1');
        expect(result.deadPlayerIds).not.toContain('3');
    });
});

describe('gameLogic - resolveDayVotes', () => {
    it('should execute the player with the majority of votes', () => {
        const players = [createPlayer('1', 'VILLAGER'), createPlayer('2', 'VILLAGER')];
        const game = createMockGame('CLASSIC', players);
        game.dayVotes = { '1': '2' };

        const result = resolveDayVotes(game);
        expect(result.executedPlayerId).toBe('2');
    });

    it('should NOT execute anyone on a tie', () => {
        const players = [
            createPlayer('1', 'VILLAGER'),
            createPlayer('2', 'VILLAGER'),
            createPlayer('3', 'VILLAGER')
        ];
        const game = createMockGame('CLASSIC', players);
        game.dayVotes = { '1': '2', '2': '1' };

        const result = resolveDayVotes(game);
        expect(result.executedPlayerId).toBeNull();
    });

    it('should handle no votes cast', () => {
        const game = createMockGame('CLASSIC', [createPlayer('1', 'VILLAGER')]);
        game.dayVotes = {};

        const result = resolveDayVotes(game);
        expect(result.executedPlayerId).toBeNull();
    });

    it('should ignore votes from DEAD players during the day', () => {
        const players = [
            createPlayer('1', 'VILLAGER', false), // Dead
            createPlayer('2', 'VILLAGER', true),  // Alive
            createPlayer('3', 'WOLF', true)
        ];
        const game = createMockGame('CLASSIC', players);
        // Dead 1 votes for 2, Alive 2 votes for 3
        game.dayVotes = { '1': '2', '2': '3' };

        const result = resolveDayVotes(game);
        // Only vote from 2 for 3 should count. Vote from 1 for 2 is ignored.
        expect(result.executedPlayerId).toBe('3');
    });
});

describe('gameLogic - checkWinCondition', () => {
    it('should declare VILLAGERS winner if all wolves are dead', () => {
        const players: Record<string, Player> = {
            '1': createPlayer('1', 'VILLAGER', true),
            '2': createPlayer('2', 'WOLF', false)
        };
        expect(checkWinCondition(players)).toBe('VILLAGERS');
    });

    it('should declare WEREWOLVES winner if wolves >= villagers (Standard)', () => {
        const players: Record<string, Player> = {
            '1': createPlayer('1', 'VILLAGER', true),
            '2': createPlayer('2', 'WOLF', true)
        };
        expect(checkWinCondition(players)).toBe('WEREWOLVES');
    });

    it('should continue game if both sides have members and wolves < villagers', () => {
        const players: Record<string, Player> = {
            '1': createPlayer('1', 'VILLAGER', true),
            '2': createPlayer('2', 'VILLAGER', true),
            '3': createPlayer('3', 'WOLF', true)
        };
        expect(checkWinCondition(players)).toBeNull();
    });

    it('should declare WEREWOLVES winner at Final 2 in SURVIVAL_SPRINT', () => {
        const players: Record<string, Player> = {
            '1': createPlayer('1', 'VILLAGER', true),
            '2': createPlayer('2', 'WOLF', true)
        };
        expect(checkWinCondition(players, 'SURVIVAL_SPRINT')).toBe('WEREWOLVES');
    });

    it('should declare WEREWOLVES winner after Day 3 in ONE_SHOT_SEER', () => {
        const players: Record<string, Player> = {
            '1': createPlayer('1', 'VILLAGER', true),
            '2': createPlayer('2', 'WOLF', true)
        };
        expect(checkWinCondition(players, 'ONE_SHOT_SEER', 3)).toBe('WEREWOLVES');
    });

    it('should NOT declare ONE_SHOT_SEER winner before Day 3', () => {
        const players: Record<string, Player> = {
            '1': createPlayer('1', 'VILLAGER', true),
            '2': createPlayer('2', 'WOLF', true)
        };
        expect(checkWinCondition(players, 'ONE_SHOT_SEER', 2)).toBeNull();
    });
});

describe('gameLogic - Adversarial/QA Scenarios', () => {
    it('should ignore votes for players who NO LONGER EXIST in the game state', () => {
        const players = [createPlayer('1', 'WOLF')];
        const game = createMockGame('CLASSIC', players);
        game.nightActions.wolfVotes = { '1': '999' }; // 999 doesn't exist

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds.length).toBe(0);
    });

    it('should handle multiple poison and heal attempts safely (Invariants)', () => {
        const players = [createPlayer('1', 'VILLAGER')];
        const game = createMockGame('CLASSIC', players);
        game.nightActions.wolfVotes = { '2': '1' };
        game.nightActions.witchSaved = true;
        game.nightActions.witchPoisoned = '1';

        const result = resolveNightActions(game);
        expect(result.deadPlayerIds).toContain('1');
        expect(result.deadPlayerIds.length).toBe(1);
    });

    it('should NOT crash on a completely empty game state (Destructive Testing)', () => {
        const game = createMockGame('CLASSIC', []);
        game.nightActions.wolfVotes = { '99': '100' };

        expect(() => resolveNightActions(game)).not.toThrow();
        expect(() => resolveDayVotes(game)).not.toThrow();
        expect(checkWinCondition({})).toBe('VILLAGERS'); // 0 wolves -> Villagers win
    });
});

describe('gameLogic - Fuzzing & Property-Based Testing', () => {
    const ITERATIONS = 200;

    const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const generateRandomVotes = (voters: string[], targets: string[]): Record<string, string> => {
        const votes: Record<string, string> = {};
        voters.forEach(voterId => {
            // 80% chance to vote, 10% chance to vote invalid, 10% skip
            const rand = Math.random();
            if (rand < 0.8) {
                votes[voterId] = getRandomElement(targets);
            } else if (rand < 0.9) {
                votes[voterId] = 'non-existent-player';
            }
        });
        return votes;
    };

    it(`should maintain invariants during randomized NIGHT voting (${ITERATIONS} iterations)`, () => {
        for (let i = 0; i < ITERATIONS; i++) {
            const playerCount = Math.floor(Math.random() * 8) + 3; // 3-10 players
            const playersList: Player[] = [];
            for (let j = 0; j < playerCount; j++) {
                const isWolf = Math.random() < 0.3; // ~30% wolves
                playersList.push(createPlayer(`p${j}`, isWolf ? 'WOLF' : 'VILLAGER', Math.random() > 0.1));
            }

            const game = createMockGame('CLASSIC', playersList);
            const allPlayerIds = playersList.map(p => p.id);

            game.nightActions.wolfVotes = generateRandomVotes(allPlayerIds, allPlayerIds);

            // Run resolution
            const result = resolveNightActions(game);

            // Invariants
            result.deadPlayerIds.forEach(id => {
                const exists = playersList.some(p => p.id === id);
                expect(exists, `Victim ${id} should exist in game`).toBe(true);
            });

            // Uniqueness
            const uniqueDead = new Set(result.deadPlayerIds);
            expect(uniqueDead.size).toBe(result.deadPlayerIds.length);
        }
    });

    it(`should maintain invariants during randomized DAY voting (${ITERATIONS} iterations)`, () => {
        for (let i = 0; i < ITERATIONS; i++) {
            const playerCount = Math.floor(Math.random() * 8) + 3;
            const playersList: Player[] = [];
            for (let j = 0; j < playerCount; j++) {
                playersList.push(createPlayer(`p${j}`, 'VILLAGER', Math.random() > 0.1));
            }

            const game = createMockGame('CLASSIC', playersList);
            const allPlayerIds = playersList.map(p => p.id);

            game.dayVotes = generateRandomVotes(allPlayerIds, allPlayerIds);

            // Resolution
            const result = resolveDayVotes(game);

            // Invariants
            if (result.executedPlayerId) {
                const victim = playersList.find(p => p.id === result.executedPlayerId);
                expect(victim, "Executed player must exist").toBeDefined();
            }
        }
    });
});
