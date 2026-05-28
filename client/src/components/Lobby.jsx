import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import '../styles.css';

const MODULE_OPTIONS = [
  { key: 'personalities',   label: 'Personalities',    desc: 'Asymmetric player powers' },
  { key: 'weddingPlanners', label: 'Wedding Planners',  desc: 'Per-player contracts & exclusive venues' },
  { key: 'specialGuests',   label: 'Special Guests',    desc: 'Drawn at Check-In 2 (content TBD)' },
  { key: 'checkin3Event',   label: 'Check-In 3 Event',  desc: 'Table-wide Q4 bonus' },
  { key: 'weatherDie',      label: 'Weather Die',       desc: 'Variance for weather-sensitive cards' },
];

export default function Lobby() {
  const { gameCode, gameState, playerId, isMyTurn, createGame, joinGame, startGame,
          error, clearError, pendingRequest, connected } = useGame();

  const [tab, setTab]           = useState('create');
  const [name, setName]         = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [modules, setModules]   = useState({});

  const inLobby = gameCode && gameState?.phase === 'lobby';
  const players = gameState ? Object.values(gameState.players) : [];
  const canStart = players.length >= 2;

  const isHost = players[0]?.id === playerId;

  function toggleModule(key) {
    setModules(m => ({ ...m, [key]: !m[key] }));
  }

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    createGame(name.trim(), modules);
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!name.trim() || !joinCode.trim()) return;
    joinGame(joinCode.toUpperCase().trim(), name.trim());
  }

  if (inLobby) {
    return (
      <div style={styles.page}>
        <div style={styles.lobbyBox}>
          <h1 style={styles.title}>The Wedding Planner</h1>
          <div style={styles.codeRow}>
            <span style={styles.codeLabel}>Room Code</span>
            <span style={styles.code}>{gameCode}</span>
            <button className="btn btn-ghost" style={{ fontSize: 12 }}
              onClick={() => navigator.clipboard.writeText(gameCode)}>
              Copy
            </button>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="section-label">Players ({players.length}/5)</div>
            {players.map((p, i) => (
              <div key={p.id} style={styles.playerRow}>
                <span style={styles.playerNum}>{i + 1}</span>
                <span style={{ flex: 1 }}>{p.name}</span>
                {i === 0 && <span className="badge" style={{ background: '#e9456020', color: '#e94560' }}>Host</span>}
                {p.id === playerId && <span className="badge" style={{ background: '#4caf5020', color: '#4caf50' }}>You</span>}
              </div>
            ))}
          </div>

          {error && (
            <div className="error-banner" style={{ marginTop: 12 }}>
              {error}
              <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '2px 8px' }} onClick={clearError}>✕</button>
            </div>
          )}

          {isHost && (
            <div style={{ marginTop: 20 }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={!canStart || pendingRequest}
                onClick={startGame}
              >
                {canStart ? 'Start Game' : `Waiting for more players (${2 - players.length} needed)`}
              </button>
            </div>
          )}

          {!isHost && (
            <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
              Waiting for the host to start the game…
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.lobbyBox}>
        <h1 style={styles.title}>The Wedding Planner</h1>
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
          A competitive euro game for 2–5 players
        </p>

        {!connected && (
          <div style={{ textAlign: 'center', color: 'var(--warn)', marginBottom: 16, fontSize: 13 }}>
            Connecting to server…
          </div>
        )}

        <div style={styles.tabs}>
          <button className={`btn ${tab === 'create' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }} onClick={() => setTab('create')}>
            New Game
          </button>
          <button className={`btn ${tab === 'join' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }} onClick={() => setTab('join')}>
            Join Game
          </button>
        </div>

        {error && (
          <div className="error-banner" style={{ marginTop: 12 }}>
            {error}
            <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '2px 8px' }} onClick={clearError}>✕</button>
          </div>
        )}

        {tab === 'create' && (
          <form onSubmit={handleCreate} style={styles.form}>
            <div>
              <div className="section-label">Your Name</div>
              <input className="input" value={name} onChange={e => setName(e.target.value)}
                placeholder="Enter your name" maxLength={30} />
            </div>

            <div>
              <div className="section-label">Optional Modules</div>
              {MODULE_OPTIONS.map(m => (
                <label key={m.key} style={styles.moduleRow}>
                  <input type="checkbox" checked={!!modules[m.key]}
                    onChange={() => toggleModule(m.key)} style={{ marginRight: 8 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%' }} disabled={!name.trim() || pendingRequest}>
              Create Game
            </button>
          </form>
        )}

        {tab === 'join' && (
          <form onSubmit={handleJoin} style={styles.form}>
            <div>
              <div className="section-label">Your Name</div>
              <input className="input" value={name} onChange={e => setName(e.target.value)}
                placeholder="Enter your name" maxLength={30} />
            </div>
            <div>
              <div className="section-label">Game Code</div>
              <input className="input" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="6-character code" maxLength={6}
                style={{ fontFamily: 'monospace', letterSpacing: 4, fontSize: 18, textAlign: 'center' }} />
            </div>
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!name.trim() || joinCode.length < 6 || pendingRequest}>
              Join Game
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'var(--bg)',
  },
  lobbyBox: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 32,
    width: '100%',
    maxWidth: 480,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--accent)',
    marginBottom: 8,
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: 4,
  },
  moduleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '8px 0',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border)',
  },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    background: 'var(--surface2)',
    borderRadius: 8,
    padding: '12px 16px',
    marginBottom: 4,
  },
  codeLabel: { color: 'var(--text-dim)', fontSize: 12 },
  code: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 4,
    color: 'var(--accent2)',
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 4px',
    borderBottom: '1px solid var(--border)',
  },
  playerNum: {
    width: 22, height: 22,
    borderRadius: '50%',
    background: 'var(--surface2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700,
  },
};
