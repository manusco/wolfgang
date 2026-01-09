# Project Soul

## Vision
To build a high-fidelity, real-time multiplayer social deduction game ("WolfGang") that brings the tension and psychology of "Werewolf" / "Mafia" to the web. The experience should be seamless, visually immersive (dark, mysterious aesthetic), and responsive, enabling groups of friends to play effortlessly on any device.

## Principles
1.  **Immersiveness**: The UI/UX must reinforce the dark, suspenseful theme. No generic "admin panel" vibes.
2.  **Real-Time Responsiveness**: Game state updates (votes, deaths, phase changes) must be instant across all clients.
3.  **Simplicity**: Entry for new players should be frictionless (no login wall, simple room codes).
4.  **Robustness**: The game state needs to handle disconnections and race conditions gracefully.

## Tech Stack
-   **Frontend**: React (Vite), TypeScript, Tailwind CSS
-   **State Management**: Zustand (Client), Firebase Realtime Database (Server/Sync)
-   **Backend/Listen**: Firebase Cloud Functions (if applicable), Firebase Security Rules
-   **Styling**: Tailwind CSS with custom animations (Framer Motion)
-   **Assets**: Lucide React for icons

## Current Focus
-   Structuring the development environment.
-   Refining the game robustness and UI polish.
-   Ensuring all game modes (Classic, Blitz Wolf, One Shot Seer, etc.) function correctly.
