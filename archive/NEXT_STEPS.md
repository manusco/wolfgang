# Next Steps for Schattenrudel

## Current Status
- **Foundation**: React + Vite + Tailwind CSS setup complete.
- **Styling**: Gothic theme (Deep Purple, Midnight Blue, Blood Red) implemented.
- **Components**: Basic UI components (Button, Input, Card) created.
- **Pages**: Landing, Lobby, and Game pages implemented with basic routing.
- **State**: Zustand store set up.
- **Types**: Game data models defined.

## Immediate Next Steps

### 1. Firebase Integration
- [ ] Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
- [ ] Enable **Firestore Database** and **Authentication** (Anonymous).
- [ ] Copy the Firebase config keys.
- [ ] Update `src/lib/firebase.ts` with the actual keys.

### 2. Game Logic Implementation
- [ ] Implement `createGame` in `src/lib/gameService.ts` (to be created).
- [ ] Implement `joinGame` in `src/lib/gameService.ts`.
- [ ] Implement `subscribeToGame` for real-time updates.

### 3. The "Simultaneous Night"
- [ ] Create the `NightPhase` component in `src/components/game/NightPhase.ts`.
- [ ] Implement the role-specific views:
    - `WolfView`: Select a victim.
    - `SeerView`: Reveal a role.
    - `WitchView`: Heal or Poison.
    - `VillagerView`: Mini-game (e.g., tap fireflies).

### 4. Testing
- [ ] Run `npm run dev` to start the local server.
- [ ] Open multiple browser tabs to simulate different players.
