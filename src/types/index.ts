export type Role = 'WOLF' | 'VILLAGER' | 'SEER' | 'WITCH' | 'HUNTER';

export type GameStatus = 'LOBBY' | 'NIGHT' | 'DAY' | 'HUNTER_REVENGE' | 'GAMEOVER';

export type Player = {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  avatar: string;
};

export type NightActions = {
  wolfVotes: Record<string, string>; // voterId -> targetId
  witchHealUsed: boolean;
  witchPoisonUsed: boolean;
  witchSaved: boolean; // Did the witch save the victim tonight?
  witchPoisoned: string | null; // Did the witch poison someone tonight?
  seerCheck: string | null; // targetId
};

export type GameState = {
  id: string;
  hostId: string;
  status: GameStatus;
  phaseEndTime: number;
  players: Record<string, Player>;
  nightActions: NightActions;
  dayVotes: Record<string, string>; // voterId -> targetId
  hunterDeath: { hunterId: string; targetId: string | null } | null; // Track hunter death for revenge phase
  winner: 'VILLAGERS' | 'WEREWOLVES' | null;
};
