# Schattenrudel - Implementation Plan

## Phase 1: Foundation & Setup
- [ ] **Project Initialization**: Create React + TypeScript app with Vite.
- [ ] **Styling Setup**: Install Tailwind CSS. Configure `tailwind.config.js` with the "Gothic" color palette (#2D0A31, #0F172A, #DC2626) and fonts (Cinzel, Inter).
- [ ] **Firebase Setup**: Install `firebase`. Create `src/lib/firebase.ts` for initialization (User will need to provide keys).
- [ ] **State Management**: Install `zustand`. Create `useGameStore` to hold local state and synced game data.
- [ ] **Routing**: Install `react-router-dom` (optional, but good for Lobby -> Game flow).

## Phase 2: Core Architecture
- [ ] **Data Models**: Define TypeScript types for `Game`, `Player`, `Role`, `Phase`.
- [ ] **Firestore Service**: Implement functions for:
    - `createGame()`: Generates room code, sets initial state.
    - `joinGame()`: Adds player to `players` map.
    - `subscribeToGame()`: Real-time listener.
- [ ] **Game Logic Controller (Host)**: Create a hook `useHostLogic` that only runs for the host. It watches the game state and handles phase transitions (Lobby -> Night -> Day) and action resolution.

## Phase 3: UI - Lobby & Onboarding
- [ ] **Landing Page**: "Create Game" vs "Join Game" buttons.
- [ ] **Lobby**:
    - Host: Role selection sliders/toggles. "Start Game" button.
    - Player: Avatar selection, Name input.
- [ ] **Role Reveal**: Dramatic card flip animation showing the assigned role.

## Phase 4: The Simultaneous Night (The USP)
- [ ] **Night Orchestrator**: A component that renders the correct sub-view based on the player's role.
- [ ] **Role Views**:
    - **Werewolf**: Grid of non-wolf players. Tap to vote. Visual indicator of partner's vote.
    - **Seer**: Grid of players. Tap to reveal role (local state only).
    - **Witch**: Conditional UI. "Heal [Name]?" or "Kill someone?".
    - **Villager (Placebo)**: Simple interactive element (e.g., "Tap the fireflies").
- [ ] **Timer**: Visual countdown.
- [ ] **Submission**: Auto-submit actions when timer ends.

## Phase 5: Day & Voting
- [ ] **Morning Announcement**: "Who died?" overlay.
- [ ] **Discussion Phase**: Timer.
- [ ] **Voting Interface**: Tap a player to accuse.
- [ ] **Execution**: Result screen showing who was voted out and their role (if enabled).

## Phase 6: The Afterlife
- [ ] **Ghost Mode**: UI change for dead players (Greyscale/Ghostly).
- [ ] **Chat**: Simple Firestore-based chat collection `games/{gameId}/chat`.
- [ ] **Betting**: Simple UI to bet on the winner.

## Phase 7: Polish & Assets
- [ ] **Animations**: Use `framer-motion` for smooth transitions.
- [ ] **Haptics**: Implement `navigator.vibrate` calls for events.
- [ ] **PWA**: Configure `vite-plugin-pwa` for installability.
