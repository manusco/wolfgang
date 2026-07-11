# Project Soul

## Vision / What it really is
WolfGang is a real-time multiplayer social deduction game (Werewolf and Mafia) for groups of friends on their phones in the same room. No login, simple room codes, a dark immersive theme, and several game modes. One phone per player, Firebase Firestore keeps them in sync.

## Goal
A party game people actually pull out when friends are in the same room. Low friction to start, fun enough to grow by word of mouth.

## Persona
Groups of friends who want a quick social deduction game on their phones, together, in person.

## Language
German and English.

## Principles
1. **In the room, together.** This is for a group in one place, not strangers online.
2. **Frictionless start.** No login wall. Simple room codes. Four players and you go.
3. **Real-time and correct.** Votes, deaths, and phase changes land instantly on every phone. State handles disconnects.
4. **Immersive theme.** Dark and suspenseful. No admin-panel look.
5. **Bilingual done right.** German and English all the way through the night and day loop, not just the menus.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS.
- **State**: Zustand on the client, Firebase Firestore for sync.
- **Security**: Firestore security rules, versioned in the repo (`firestore.rules`), deployed via the Firebase CLI.
- **Icons**: Lucide React.

## Current Focus
- Keep the bilingual experience correct across every phase.
- Confirm the production deploy and the live URL.
- Polish the game modes.
