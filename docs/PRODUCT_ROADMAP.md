# Wolfgang - Product Roadmap

> **Living Document**: This roadmap is regularly updated to reflect current priorities and progress. Last updated: December 1, 2025

## Table of Contents
- [Vision & Strategy](#vision--strategy)
- [Current Status](#current-status)
- [Initial Feature Set (v0.1 - MVP)](#initial-feature-set-v01---mvp)
- [Short-term Roadmap (v0.2-0.5)](#short-term-roadmap-v02-05)
- [Medium-term Vision (v1.0)](#medium-term-vision-v10)
- [Long-term Vision (v2.0+)](#long-term-vision-v20)
- [Development Milestones](#development-milestones)

---

## Vision & Strategy

### Product Vision
**Wolfgang will become the go-to digital werewolf game** that groups choose for gatherings, replacing traditional card-based versions due to superior user experience and innovative mechanics.

### Success Metrics
- **Player Engagement**: Average session length > 90 minutes
- **Retention**: 60%+ of players return for a second game
- **Viral Growth**: 40%+ of new players join via friend invitations
- **Technical Performance**: <2 second load time, <100ms UI response

### Strategic Pillars
1. **Simplicity First**: Anyone can host or join in <60 seconds
2. **Social at Core**: Enhance, never replace, face-to-face interaction
3. **Fairness Always**: Zero tolerance for cheating or imbalance
4. **Continuous Innovation**: Regular small improvements > major overhauls

---

## Current Status

### ✅ Completed
- [x] Project foundation (React + TypeScript + Vite)
- [x] Core UI components (Button, Input, Card)
- [x] Gothic visual theme implementation
- [x] Basic routing structure (Landing, Lobby, Game)
- [x] Zustand state management setup
- [x] TypeScript data models
- [x] Game service architecture
- [x] Firebase integration skeleton

### 🚧 In Progress
- [ ] Firebase project configuration (waiting on keys)
- [ ] Game creation and joining logic testing
- [ ] Real-time synchronization testing

### ⏳ Blocked
- Firebase setup (requires user to create project and provide credentials)

---

## Initial Feature Set (v0.1 - MVP)

**Goal**: Playable end-to-end werewolf game with core mechanics

### Core Gameplay
- [x] Game creation with room codes
- [x] Player joining with avatar and name selection
- [ ] Role assignment (Werewolf, Villager, Seer, Witch)
- [ ] Night phase with simultaneous role actions
- [ ] Morning reveal of deaths
- [ ] Day phase discussion timer
- [ ] Voting and elimination
- [ ] Win condition detection
- [ ] Ghost mode for eliminated players

### UI/UX
- [x] Landing page (Create/Join)
- [x] Lobby with player list
- [ ] Role reveal animation
- [ ] Night phase interface (role-specific)
- [ ] Day phase interface
- [ ] Victory/defeat screen
- [ ] Basic responsive design (mobile-first)

### Technical
- [x] Firebase Firestore integration
- [ ] Real-time listener implementation
- [ ] Anonymous authentication
- [ ] Error handling and user feedback
- [ ] Basic loading states

### Out of Scope for MVP
- ❌ Chat functionality
- ❌ Role customization
- ❌ Game statistics
- ❌ PWA installation
- ❌ Sound effects
- ❌ Advanced animations

**Target Release**: January 2026  
**Success Criteria**: 10+ games played by test users without critical bugs

---

## Short-term Roadmap (v0.2-0.5)

### v0.2 - Polish & Stability (February 2026)
**Focus**: Production-ready quality

#### Features
- [ ] Comprehensive error handling
- [ ] Loading states and optimistic UI
- [ ] Reconnection support
- [ ] Player disconnection handling
- [ ] Game state persistence (localStorage)
- [ ] Improved animations (Framer Motion)
- [ ] Haptic feedback (vibrations)

#### Technical
- [ ] Firestore security rules
- [ ] Input validation and sanitization
- [ ] Performance monitoring
- [ ] Basic analytics (game completion rate)

### v0.3 - Enhanced Experience (March 2026)
**Focus**: Player engagement and retention

#### Features
- [ ] Hunter role implementation
- [ ] Witch potion UI improvements
- [ ] Ghost chat for eliminated players
- [ ] Ghost betting on winners
- [ ] Game history (last 10 games)
- [ ] Player nickname persistence
- [ ] Quick rematch functionality

#### UX Improvements
- [ ] Tutorial overlays for first-time players
- [ ] Role ability tooltips
- [ ] Animated phase transitions
- [ ] Improved mobile responsiveness

### v0.4 - Social Features (April 2026)
**Focus**: Viral growth and community

#### Features
- [ ] Share room code via native share API
- [ ] In-game text chat (living players)
- [ ] Post-game summary screen
- [ ] Player statistics (games played, win rate by role)
- [ ] Leaderboard (optional, per friend group)

#### Technical
- [ ] PWA configuration (installability)
- [ ] Offline support for asset caching
- [ ] Push notifications for turn reminders (opt-in)

### v0.5 - Customization (May 2026)
**Focus**: Host flexibility and replayability

#### Features
- [ ] Custom role configuration UI
- [ ] Phase timer customization
- [ ] Role reveal toggle (show/hide executed player roles)
- [ ] Tie-breaking rules selection
- [ ] Player kick/ban functionality (host only)
- [ ] Spectator mode for non-players

---

## Medium-term Vision (v1.0)

**Target**: Summer 2026  
**Theme**: Feature-complete, polished product

### Major Features

#### 1. Advanced Roles
- [ ] Cupid (creates lovers)
- [ ] Guardian (protects players)
- [ ] Jester (wins if voted out)
- [ ] Tanner (villager who wants to lose)

#### 2. Game Modes
- [ ] Quick Play (randomized roles, 10 min games)
- [ ] Classic Mode (current implementation)
- [ ] Custom Mode (full role control)
- [ ] Tournament Mode (bracket system)

#### 3. Rich Content
- [ ] Sound effects and ambient music
- [ ] Multiple theme packs (Gothic, Cosmic, Medieval)
- [ ] Animated role cards
- [ ] Victory celebrations

#### 4. Community
- [ ] Friend system
- [ ] Game invitations
- [ ] Post-game chat
- [ ] Replay highlights (key moments)

#### 5. Internationalization
- [ ] English language support
- [ ] German language support
- [ ] Dynamic text switching (no reload)
- [ ] Localized game terms

### Technical Milestones
- [ ] <1s initial load time
- [ ] <50ms UI interaction latency
- [ ] 99.9% uptime
- [ ] Support for 100+ concurrent games
- [ ] Automated testing coverage >80%

---

## Long-term Vision (v2.0+)

**Target**: 2027 and beyond  
**Theme**: Platform and ecosystem

### Platform Features
- [ ] Custom game creation toolkit
- [ ] User-generated roles and abilities
- [ ] Community role marketplace
- [ ] Tournament hosting tools
- [ ] Streaming integration (Twitch, YouTube)

### Advanced Technology
- [ ] AI-powered game balancing
- [ ] Voice chat integration
- [ ] AR elements (optional camera overlay)
- [ ] Cross-platform play (web, iOS, Android native apps)

### Monetization (Optional)
- [ ] Premium themes and cosmetics
- [ ] Ad-free experience (one-time purchase)
- [ ] Custom branding for events
- [ ] Tournament organization tools (B2B)

### Analytics & Insights
- [ ] Advanced player behavior analysis
- [ ] Role balance dashboards
- [ ] A/B testing framework
- [ ] ML-driven recommendations ("Try Seer next!")

---

## Development Milestones

### Phase 1: Foundation (Completed ✅)
**Duration**: November-December 2025

- [x] Technology stack selection
- [x] Project setup and configuration
- [x] Core UI component library
- [x] Design system implementation
- [x] Data model definition
- [x] Firebase architecture design

### Phase 2: Core Game Loop (Current 🚧)
**Duration**: December 2025 - January 2026

- [ ] Complete Firebase integration
- [ ] Implement night phase mechanics
- [ ] Implement day phase mechanics
- [ ] Build role-specific interfaces
- [ ] Test full game loop
- [ ] Fix critical bugs
- [ ] Internal alpha testing

**Deliverable**: Playable MVP

### Phase 3: Public Alpha
**Duration**: January-February 2026

- [ ] Recruit 20+ alpha testers
- [ ] Gather feedback on core mechanics
- [ ] Identify and fix stability issues
- [ ] Performance optimization
- [ ] UX refinement based on feedback

**Deliverable**: Stable alpha build

### Phase 4: Beta Launch
**Duration**: March-April 2026

- [ ] Public beta announcement
- [ ] Social features implementation
- [ ] 100+ active testers
- [ ] Community building (Discord/Reddit)
- [ ] Marketing materials creation

**Deliverable**: Feature-complete beta

### Phase 5: V1.0 Launch
**Duration**: Summer 2026

- [ ] Final polish and QA
- [ ] Launch marketing campaign
- [ ] Press outreach
- [ ] Product Hunt launch
- [ ] Community events

**Deliverable**: Public v1.0 release

---

## Feature Prioritization Framework

### Must Have (P0)
Critical for core experience and MVP
- Game creation and joining
- Role assignment and night phase
- Voting and win conditions
- Real-time synchronization

### Should Have (P1)
Important for quality but not blocking launch
- Reconnection support
- Animations and polish
- Error handling
- Ghost mode

### Nice to Have (P2)
Enhances experience, can be post-launch
- Statistics and history
- Custom role configuration
- Multiple themes
- Advanced roles

### Won't Have (P3)
Out of scope for foreseeable future
- Native mobile apps (web-first)
- Video chat integration
- Blockchain/NFT features
- Single-player AI mode

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Firebase scaling issues | Low | High | Monitor quotas, upgrade plan if needed |
| Host disconnection breaking games | Medium | High | Implement host migration in v0.2 |
| Real-time sync lag | Low | Medium | Optimize Firestore queries, add retries |
| Browser compatibility | Low | Low | Test on major browsers, polyfills |

### Product Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low user adoption | Medium | High | Focus on viral mechanics, user testing |
| Existing competitors | High | Medium | Differentiate on simultaneous gameplay |
| Requires critical mass | High | Medium | Design for small groups (4-8 players) |
| Monetization unclear | High | Low | Keep free, explore options post-traction |

---

## Success Metrics by Phase

### MVP (v0.1)
- 10+ completed games
- 0 critical bugs
- Average game completed without crashes

### Alpha (v0.2-0.3)
- 100+ games played
- 50+ unique players
- 40% return rate for second game
- <2% crash rate

### Beta (v0.4-0.5)
- 1,000+ games played
- 500+ unique players
- 60% return rate
- 4.0+ average rating (if collecting feedback)

### V1.0
- 10,000+ games played
- 5,000+ unique players
- 70% retention (1 week)
- 20%+ viral coefficient (invites per player)

---

## Competitive Analysis

### Direct Competitors
- **Werewolf Online** (mobile app): Turn-based, slower pace
- **One Night Ultimate Werewolf** (digital): Single round, different format
- **Town of Salem** (browser): Text-based, no mobile optimization

### Wolfgang's Advantages
1. ✅ Simultaneous gameplay (unique)
2. ✅ Mobile-first design
3. ✅ No account required
4. ✅ Modern, premium UI
5. ✅ Real-time synchronization

### Areas to Learn From
- **Among Us**: Simplicity, visual clarity, viral mechanics
- **Jackbox Games**: Party game accessibility, humor
- **Codenames**: Quick rounds, high replayability

---

## Open Questions & Decisions Needed

### Product
- [ ] Should we support remote play (video chat integration) or focus on in-person?
- [ ] How do we handle host migration if host leaves?
- [ ] Should eliminated players stay in the same room or have option to leave?
- [ ] What's the ideal default game length?

### Technical
- [ ] When do we need dedicated backend vs Firebase only?
- [ ] How to handle cheating attempts (inspecting network traffic)?
- [ ] Should we implement game replays/recordings?

### Business
- [ ] Free forever or eventual monetization?
- [ ] Open source vs proprietary?
- [ ] Community-driven development?

---

**Document Version**: 1.0  
**Last Updated**: December 1, 2025  
**Maintained by**: Product Team  
**Review Cycle**: Monthly sprint planning
