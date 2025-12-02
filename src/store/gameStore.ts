import { create } from 'zustand';
import { GameState } from '../types';
import { saveSession, loadSession, clearSession } from '../lib/sessionStorage';

interface GameStore {
    game: GameState | null;
    playerId: string | null;
    roomCode: string | null;
    playerName: string | null;
    playerAvatar: string | null;
    isHost: boolean;
    setGame: (game: GameState) => void;
    setPlayerId: (id: string) => void;
    setSessionData: (data: {
        roomCode: string;
        playerName: string;
        playerAvatar: string;
        isHost: boolean;
    }) => void;
    saveGameSession: () => void;
    loadGameSession: () => boolean;
    reset: () => void;
}

// Load initial session data
const initialSession = loadSession();

export const useGameStore = create<GameStore>((set, get) => ({
    game: null,
    playerId: localStorage.getItem('playerId') || initialSession?.playerId || null,
    roomCode: initialSession?.roomCode || null,
    playerName: initialSession?.playerName || null,
    playerAvatar: initialSession?.playerAvatar || null,
    isHost: initialSession?.isHost || false,

    setGame: (game) => {
        set({ game, roomCode: game.id });
        // Auto-save session when game updates
        setTimeout(() => get().saveGameSession(), 0);
    },

    setPlayerId: (id) => {
        localStorage.setItem('playerId', id);
        set({ playerId: id });
    },

    setSessionData: (data) => {
        set({
            roomCode: data.roomCode,
            playerName: data.playerName,
            playerAvatar: data.playerAvatar,
            isHost: data.isHost,
        });
    },

    saveGameSession: () => {
        const state = get();
        if (state.playerId && state.roomCode && state.playerName && state.playerAvatar) {
            saveSession({
                roomCode: state.roomCode,
                playerId: state.playerId,
                playerName: state.playerName,
                playerAvatar: state.playerAvatar,
                isHost: state.isHost,
            });
        }
    },

    loadGameSession: () => {
        const session = loadSession();
        if (session) {
            set({
                playerId: session.playerId,
                roomCode: session.roomCode,
                playerName: session.playerName,
                playerAvatar: session.playerAvatar,
                isHost: session.isHost,
            });
            // Ensure playerId is also in localStorage
            localStorage.setItem('playerId', session.playerId);
            return true;
        }
        return false;
    },

    reset: () => {
        clearSession();
        set({
            game: null,
            roomCode: null,
            playerName: null,
            playerAvatar: null,
            isHost: false,
        });
    },
}));
