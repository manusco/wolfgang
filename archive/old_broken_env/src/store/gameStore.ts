import { create } from 'zustand';
import { GameState, Player } from '../types';

interface GameStore {
    game: GameState | null;
    playerId: string | null;
    setGame: (game: GameState) => void;
    setPlayerId: (id: string) => void;
    reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
    game: null,
    playerId: localStorage.getItem('playerId'),
    setGame: (game) => set({ game }),
    setPlayerId: (id) => {
        localStorage.setItem('playerId', id);
        set({ playerId: id });
    },
    reset: () => set({ game: null }),
}));
