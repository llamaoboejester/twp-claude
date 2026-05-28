const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { GameEngine } = require('./game/engine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Serve React build in production
if (IS_PROD) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// ─── In-memory game store ────────────────────────────────────────────────────

const games = new Map();   // gameCode → GameEngine
const players = new Map(); // socketId → { gameCode, playerId, playerName }

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function uniqueCode() {
  let code;
  do { code = generateCode(); } while (games.has(code));
  return code;
}

function broadcastState(gameCode) {
  const engine = games.get(gameCode);
  if (!engine) return;

  const room = io.sockets.adapter.rooms.get(gameCode);
  if (!room) return;

  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId);
    const playerInfo = players.get(socketId);
    if (socket && playerInfo) {
      socket.emit('game_state', engine.getStateForPlayer(playerInfo.playerId));
    }
  }
}

// ─── Socket events ────────────────────────────────────────────────────────────

io.on('connection', socket => {
  console.log(`Socket connected: ${socket.id}`);

  // ── Create game ──────────────────────────────────────────────────────────

  socket.on('create_game', ({ playerName, modules = {} }, cb) => {
    if (!playerName?.trim()) return cb({ success: false, error: 'Name required' });

    const code = uniqueCode();
    const playerId = `player_${socket.id}`;
    const engine = new GameEngine(code, modules);
    const result = engine.addPlayer(playerId, playerName.trim(), socket.id);

    if (!result.success) return cb(result);

    games.set(code, engine);
    players.set(socket.id, { gameCode: code, playerId, playerName: playerName.trim() });

    socket.join(code);
    cb({ success: true, gameCode: code, playerId });
    broadcastState(code);
  });

  // ── Join game ─────────────────────────────────────────────────────────────

  socket.on('join_game', ({ gameCode, playerName }, cb) => {
    if (!playerName?.trim()) return cb({ success: false, error: 'Name required' });
    const code = gameCode?.toUpperCase().trim();
    if (!code) return cb({ success: false, error: 'Game code required' });

    const engine = games.get(code);
    if (!engine) return cb({ success: false, error: 'Game not found' });

    const state = engine.getState();
    if (state.phase !== 'lobby') return cb({ success: false, error: 'Game already started' });

    const playerId = `player_${socket.id}`;
    const result = engine.addPlayer(playerId, playerName.trim(), socket.id);
    if (!result.success) return cb(result);

    players.set(socket.id, { gameCode: code, playerId, playerName: playerName.trim() });
    socket.join(code);
    cb({ success: true, gameCode: code, playerId });
    broadcastState(code);
  });

  // ── Start game ────────────────────────────────────────────────────────────

  socket.on('start_game', (_, cb) => {
    const info = players.get(socket.id);
    if (!info) return cb({ success: false, error: 'Not in a game' });

    const engine = games.get(info.gameCode);
    if (!engine) return cb({ success: false, error: 'Game not found' });

    const result = engine.startGame();
    if (!result.success) return cb(result);

    cb({ success: true });
    broadcastState(info.gameCode);
  });

  // ── Game action ───────────────────────────────────────────────────────────

  socket.on('game_action', (action, cb) => {
    const info = players.get(socket.id);
    if (!info) return cb?.({ success: false, error: 'Not in a game' });

    const engine = games.get(info.gameCode);
    if (!engine) return cb?.({ success: false, error: 'Game not found' });

    const result = engine.handleAction(info.playerId, action);
    if (cb) cb(result);

    broadcastState(info.gameCode);
  });

  // ── Reconnect ──────────────────────────────────────────────────────────────

  socket.on('reconnect_game', ({ gameCode, playerId }, cb) => {
    const code = gameCode?.toUpperCase().trim();
    const engine = games.get(code);
    if (!engine) return cb({ success: false, error: 'Game not found' });

    const state = engine.getState();
    if (!state.players[playerId]) return cb({ success: false, error: 'Player not found' });

    engine.updateSocketId(playerId, socket.id);
    players.set(socket.id, {
      gameCode: code,
      playerId,
      playerName: state.players[playerId].name,
    });

    socket.join(code);
    cb({ success: true, gameCode: code, playerId });
    socket.emit('game_state', engine.getStateForPlayer(playerId));
  });

  // ── Disconnect ────────────────────────────────────────────────────────────

  socket.on('disconnect', () => {
    const info = players.get(socket.id);
    if (info) {
      const engine = games.get(info.gameCode);
      if (engine) {
        const state = engine.getState();
        if (state.phase === 'lobby') {
          engine.removePlayer(info.playerId);
          broadcastState(info.gameCode);
        }
        // In playing phase: keep player in game for reconnection
      }
      players.delete(socket.id);
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`The Wedding Planner server running on port ${PORT}`);
});
