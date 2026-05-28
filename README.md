# The Wedding Planner — Digital Prototype

Browser-based digital prototype of The Wedding Planner board game (2–5 players). Built for remote playtesting.

## Dev Setup

```bash
npm install          # installs server deps + triggers client install via postinstall
npm run dev          # starts server (port 3001) + Vite client (port 5173) concurrently
```

Open http://localhost:5173 in your browser.

To test multiplayer locally, open the same URL in multiple browser tabs or windows.

## Production / Railway

Railway runs `npm install && npm run build` then `npm start`.

- `npm run build` — builds the React client into `client/dist/`
- `npm start` — runs `node server/index.js`, which serves the built client statically

Set `NODE_ENV=production` on Railway (or it will auto-set it).

## Project Structure

```
server/
  index.js          — Express + Socket.IO server, room management
  game/engine.js    — Full game engine (all rules, depth-first booking stack)
  data/cards.js     — Stub card data (replace with real data once digitized)
client/
  src/
    App.jsx                     — Root component
    context/GameContext.jsx     — Socket state management
    components/
      Lobby.jsx                 — Create/join game
      Game.jsx                  — Main game layout + task/log tabs
      PlayerBoard.jsx           — Your grid, trackers, helpers, theme
      VendorGrid.jsx            — 3x3 grid display
      SharedBoard.jsx           — FVR, moments, awards, help decks
      ActionPanel.jsx           — All pending action UIs
      OtherPlayers.jsx          — Other players' public state
      CheckIn.jsx               — Theme choice + goal setting
      Scoring.jsx               — End-of-game breakdown
```

## Card Data

All card data is in `server/data/cards.js` as stubs. The shape is authoritative — the engine depends on it. When real card data is ready, populate the arrays in that file. The engine will pick it up without any other changes.

Key things per card type:
- Vendor: `{ id, type:'vendor', category, name, cost, excitement, elements, wild, whenBooked, weatherSensitive }`
- Venue: `{ id, type:'venue', name, cost, excitement, elements, wild:1, whenBooked, weatherSensitive }`
- Theme: `{ id, type:'theme', name, elements:[el1, el2] }`
- Help: `{ id, type:'help', helpType, name, hasChoice, effect OR choiceA+choiceB }`
