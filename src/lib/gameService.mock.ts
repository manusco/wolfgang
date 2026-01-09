import { GameState } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = {} as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const analytics = {} as any;

export const createGame = async (): Promise<string> => {
    console.log('Mock createGame called');
    return 'ABCD';
};

export const joinGame = async (gameId: string, playerName: string, avatar: string): Promise<string> => {
    console.log('Mock joinGame called', { gameId, playerName, avatar });
    return 'player-123';
};

export const subscribeToGame = (gameId: string, callback: (game: GameState) => void) => {
    console.log('Mock subscribeToGame called', gameId);
    // Simulate initial game state
    const mockGame: GameState = {
        id: gameId,
        hostId: 'host-123',
        status: 'LOBBY',
        mode: 'CLASSIC',
        phaseEndTime: 0,
        players: {},
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
    callback(mockGame);
    return () => { };
};

export const startGame = async (gameId: string) => {
    console.log('Mock startGame called', gameId);
};
