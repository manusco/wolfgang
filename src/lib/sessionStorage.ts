/**
 * Session storage utilities for game persistence
 * Uses localStorage to maintain game state across page reloads
 */

export interface GameSession {
    roomCode: string;
    playerId: string;
    playerName: string;
    playerAvatar: string;
    isHost: boolean;
    timestamp: number;
}

const SESSION_KEY = 'wolfgang_game_session';
const SESSION_TIMEOUT = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Save current game session to localStorage
 */
export function saveSession(session: Omit<GameSession, 'timestamp'>): void {
    try {
        const sessionData: GameSession = {
            ...session,
            timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
        console.error('[SessionStorage] Failed to save session:', error);
    }
}

/**
 * Load existing game session from localStorage
 * Returns null if no valid session exists
 */
export function loadSession(): GameSession | null {
    try {
        const sessionStr = localStorage.getItem(SESSION_KEY);
        if (!sessionStr) return null;

        const session: GameSession = JSON.parse(sessionStr);

        // Check if session is expired
        const age = Date.now() - session.timestamp;
        if (age > SESSION_TIMEOUT) {
            clearSession();
            return null;
        }

        return session;
    } catch (error) {
        console.error('[SessionStorage] Failed to load session:', error);
        return null;
    }
}

/**
 * Clear game session from localStorage
 */
export function clearSession(): void {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error('[SessionStorage] Failed to clear session:', error);
    }
}

/**
 * Check if a valid session exists
 */
export function hasActiveSession(): boolean {
    return loadSession() !== null;
}
