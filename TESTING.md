# How to Test WolfGang with Multiple Players

## Problem
WolfGang is a multiplayer game that requires at least 2 players. Testing locally is challenging because you need multiple players joined simultaneously.

## Solutions

### Option 1: Multiple Browser Windows (Recommended for Development)

**Steps**:
1. **Start the dev server**: `npm run dev`
2. **Open the first player (Host)**:
   - Open `http://localhost:5173` in Chrome
   - Click "Rudel gründen" (Create Game)
   - Enter name: "Player 1"
   - Select avatar
   - Select game mode (e.g., Blitz Wolf)
   - Note the **room code** displayed

3. **Open second player**:
   - Open **Chrome Incognito** window (`Ctrl+Shift+N`)
   - Go to `http://localhost:5173`
   - Click "Rudel beitreten" (Join Game)
   - Enter name: "Player 2"
   - Enter the **room code** from step 2
   - Select avatar

4. **Add more players (optional)**:
   - Open more incognito windows or use different browsers
   - Firefox: `http://localhost:5173`
   - Edge: `http://localhost:5173`
   - Each browser instance = one player

5. **Start the game**:
   - In the **Host window** (Player 1), click "Spiel starten"
   - All windows will update in real-time via Firebase

### Option 2: Multiple Browser Profiles

**Chrome Profiles**:
1. Click Chrome profile icon (top right)
2. Click "+ Add" to create new profile
3. Each profile has separate session/cookies
4. Open `localhost:5173` in each profile
5. Join the same game with different names

**Benefits**: 
- Persistent profiles (don't need to recreate)
- Can have 5+ profiles for large game testing

### Option 3: Different Devices on Same Network

If you have multiple devices (phone, tablet, laptop):

1. **Find your local IP**:
   ```powershell
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```

2. **Access from other devices**:
   - On phone: Open browser → `http://192.168.1.100:5173`
   - On tablet: `http://192.168.1.100:5173`

3. **Join the same game** with different player names

**Note**: Devices must be on the same WiFi network!

---

## Testing Checklist

### Basic Flow Test (2 Players)
- [ ] Player 1 creates game
- [ ] Player 2 joins game
- [ ] Both players see each other in lobby
- [ ] Host starts game
- [ ] Role reveal shows correctly
- [ ] Night phase begins with timer
- [ ] Actions can be submitted
- [ ] Day phase begins
- [ ] Voting works
- [ ] Game over shows winner

### Mode-Specific Tests

#### Blitz Wolf (2 players minimum)
- [ ] Timers are 15s (night), 30s (day)
- [ ] Only 1 wolf, 1 villager
- [ ] No special roles appear
- [ ] Fast-paced feel

#### One Shot Seer (3 players recommended)
- [ ] 1 wolf, 1 seer, 1 villager
- [ ] Seer can check one player
- [ ] **TODO**: No night kills happen
- [ ] **TODO**: Limited to 3 day phases

####The Accused (3 players recommended)
- [ ] One villager marked as "accused"
- [ ] **TODO**: All players see accused badge
- [ ] Extra discussion time (75s)
- [ ] **TODO**: Accused can reveal role on death

---

## Development Features

### Minimum Players: 2 (Changed for Testing)
The minimum player requirement has been **lowered from 4 to 2** to enable easier testing during development.

**Before**:
```typescript
if (playerIds.length < 4) {
    throw new Error('Not enough players');
}
```

**After**:
```typescript
if (playerIds.length < 2) {
    throw new Error('Not enough players. Need at least 2 players.');
}
```

This allows you to test game flow with just 2 browser windows!

---

## Troubleshooting

### "Game not found" error
- Double-check room code (4 letters, case-sensitive)
- Ensure game was created successfully
- Check Firebase console for game data

### Players not seeing each other
- Check browser console for errors
- Verify Firebase connection
- Both players must be in same game (same room code)

### Timer not working
- Check browser console
- Verify phase transition logic
- Ensure phaseEndTime is set correctly

### Can't start game
- Host must be the one who created the game
- Need minimum 2 players
- Game status must be 'LOBBY'

---

## Quick Test Script

**1-minute smoke test**:

```bash
# Terminal 1
npm run dev

# Browser 1 (Chrome - Host)
1. Open http://localhost:5173
2. Click "Rudel gründen"
3. Name: "Alice", Avatar: 🦊
4. Select "Blitz Wolf
"
5. Note room code (e.g., "ABCD")

# Browser 2 (Chrome Incognito - Player)
1. Ctrl+Shift+N (incognito)
2. Go to http://localhost:5173
3. Click "Rudel beitreten"
4. Enter "ABCD" (room code)
5. Name: "Bob", Avatar: 🐺

# Back to Browser 1
6. Click "Spiel starten"

# Both browsers
7. Watch role reveal
8. Observe night phase (15s timer)
9. Check if wolf can vote
10. Day phase should start automatically
```

**Expected result**: Complete game cycle from lobby → night → day

---

## Next Steps for Better Testing

### Future Improvements:
1. **Test Mode Toggle**: Add dev mode that shows all players' roles
2. **Bot Players**: Simple AI players for solo testing (tutorial only)
3. **Time Multiplier**: Speed up timers for faster testing (10x speed)
4. **Auto-join**: Quick link to join with predefined players
5. **Replay System**: Save and replay game states

---

**Last Updated**: December 2, 2025  
**Dev Server**: http://localhost:5173  
**Min Players**: 2 (testing), 4+ (production)
