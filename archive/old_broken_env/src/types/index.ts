export type Role = 'WOLF' | 'VILLAGER' | 'SEER' | 'WITCH' | 'HUNTER';

export type GameStatus = 'LOBBY' | 'NIGHT' | 'DAY' | 'GAMEOVER';

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  avatar: string;
}

export interface NightActions {
  wolfVotes: Record<string, string>; // voterId -> targetId
  witchHealUsed: boolean;
  witchPoisonUsed: boolean;
  seerCheck: string | null; // targetId
}

export interface GameState {
  id: string;
  hostId: string;
  status: GameStatus;
  phaseEndTime: number;
  players: Record<string, Player>;
  nightActions: NightActions;
  dayVotes: Record<string, string>; // voterId -> targetId
  winner: 'VILLAGERS' | 'WEREWOLVES' | null;
}
