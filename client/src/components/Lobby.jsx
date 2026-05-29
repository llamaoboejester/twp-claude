import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Meeple } from './Icons';
import '../styles.css';

const MODULE_OPTIONS = [
  { key: 'personalities',   label: 'Personalities',    desc: 'Asymmetric player powers' },
  { key: 'weddingPlanners', label: 'Wedding Planners',  desc: 'Per-player contracts & exclusive venues' },
  { key: 'specialGuests',   label: 'Special Guests',    desc: 'Drawn at Check-In 2' },
  { key: 'checkin3Event',   label: 'Check-In 3 Event',  desc: 'Table-wide Q4 bonus' },
  { key: 'weatherDie',      label: 'Weather Die',       desc: 'Variance for weather-sensitive cards' },
];

const PLAYER_COLORS = ['var(--accent)', 'var(--el-edge)', 'var(--el-nature)', 'var(--el-tradition)', 'var(--el-elegance)'];

export default function Lobby() {
  const { gameCode, gameState, playerId, createGame, joinGame, startGame,
          error, clearError, pendingRequest, connected } = useGame();

  const [tab, setTab]           = useState('create');
  const [name, setName]         = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [modules, setModules]   = useState({});

  const inLobby = gameCode && gameState?.phase === 'lobby';
  const players = gameState ? Object.values(gameState.players) : [];
  const canStart = players.length >= 2;
  const isHost = players[0]?.id === playerId;

  function toggleModule(key) { setModules(m => ({ ...m, [key]: !m[key] })); }
  function handleCreate(e) { e.preventDefault(); if (!name.trim()) return; createGame(name.trim(), modules); }
  function handleJoin(e) { e.preventDefault(); if (!name.trim() || !joinCode.trim()) return; joinGame(joinCode.toUpperCase().trim(), name.trim()); }

  if (inLobby) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
        <LobbyHeader />
        <div style={{ padding: '48px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
          {/* Left: title block */}
          <div>
            <div className="t-eyebrow t-eyebrow-accent">New Game · invite code: {gameCode}</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 88, lineHeight: 0.9, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '16px 0 24px', color: 'var(--ink)' }}>
              The<br/>Wedding<br/><span style={{ color: 'var(--accent)' }}>Planner.</span>
            </h1>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.35, color: 'var(--ink-2)', maxWidth: 420, margin: 0 }}>
              Twelve months. Four actions. One ring. Plan a better wedding than your friends.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, letterSpacing: 4, color: 'var(--accent)', background: 'var(--paper-soft)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)' }}>
                {gameCode}
              </div>
              <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(gameCode)}>
                Copy Code
              </button>
            </div>
          </div>

          {/* Right: players + start */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 12 }}>Players · {players.length} of 5</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {players.map((p, i) => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center', padding: '12px 16px', background: 'var(--paper-soft)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)' }}>
                    <Meeple size={26} color={PLAYER_COLORS[i] || 'var(--ink)'} outline="var(--ink)" />
                    <div>
                      <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Player {i + 1}{i === 0 ? ' · first' : ''}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)', lineHeight: 1 }}>{p.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.id === playerId && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', border: '1.5px solid var(--accent)', padding: '3px 8px' }}>You</span>}
                      {i === 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--positive)', border: '1.5px solid var(--positive)', padding: '3px 8px' }}>Host</span>}
                    </div>
                  </div>
                ))}
                <div style={{ padding: '14px 16px', border: '2px dashed var(--ink-line-2)', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center' }}>
                  Up to {5 - players.length} more players can join.
                </div>
              </div>
            </div>

            {error && (
              <div className="error-banner">{error}
                <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '2px 8px' }} onClick={clearError}>✕</button>
              </div>
            )}

            {isHost ? (
              <button
                style={{ padding: '18px 32px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--coin)', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--accent)', cursor: canStart ? 'pointer' : 'not-allowed', opacity: canStart ? 1 : 0.5 }}
                disabled={!canStart || pendingRequest}
                onClick={startGame}
              >
                {canStart ? 'Begin · Month 01' : `Waiting for more players (${2 - players.length} needed)`}
              </button>
            ) : (
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-2)' }}>
                Waiting for the host to begin the game…
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pre-game: create or join
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <LobbyHeader />
      <div style={{ padding: '48px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
        {/* Left: hero */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 88, lineHeight: 0.9, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 24px', color: 'var(--ink)' }}>
            The<br/>Wedding<br/><span style={{ color: 'var(--accent)' }}>Planner.</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.35, color: 'var(--ink-2)', maxWidth: 420, margin: 0 }}>
            Twelve months. Four actions. One ring. Plan a better wedding than your friends and collect more gifts than they do.
          </p>
          {!connected && (
            <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--warning)' }}>
              Connecting to server…
            </div>
          )}
        </div>

        {/* Right: form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tab switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '2px solid var(--ink)' }}>
            {['create', 'join'].map((t, i) => (
              <button key={t}
                onClick={() => setTab(t)}
                style={{ padding: '12px 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', background: tab === t ? 'var(--ink)' : 'var(--paper-soft)', color: tab === t ? 'var(--paper)' : 'var(--ink)', border: 0, borderRight: i === 0 ? '2px solid var(--ink)' : 0, cursor: 'pointer' }}>
                {t === 'create' ? 'New Game' : 'Join Game'}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-banner">{error}
              <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '2px 8px' }} onClick={clearError}>✕</button>
            </div>
          )}

          {tab === 'create' && (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>Your Name</div>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" maxLength={30} />
              </div>

              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>Optional Modules · {Object.values(modules).filter(Boolean).length} of 5 active</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {MODULE_OPTIONS.map(m => (
                    <label key={m.key} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'var(--paper-soft)', border: '1.5px solid var(--ink-line-2)', cursor: 'pointer' }}>
                      <span style={{ width: 18, height: 18, background: modules[m.key] ? 'var(--ink)' : 'var(--paper-soft)', border: '1.5px solid var(--ink)', display: 'grid', placeItems: 'center' }}>
                        {modules[m.key] && <span style={{ color: 'var(--coin)', fontSize: 12 }}>✓</span>}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink)' }}>{m.label}</span>
                      <span className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>{m.desc}</span>
                      <input type="checkbox" checked={!!modules[m.key]} onChange={() => toggleModule(m.key)} style={{ display: 'none' }} />
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit"
                style={{ padding: '18px 32px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--coin)', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--accent)', cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: name.trim() ? 1 : 0.5 }}
                disabled={!name.trim() || pendingRequest}
              >
                Create Game
              </button>
            </form>
          )}

          {tab === 'join' && (
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>Your Name</div>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" maxLength={30} />
              </div>
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>Game Code</div>
                <input className="input" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="6-character code" maxLength={6}
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: 8, fontSize: 28, textAlign: 'center' }} />
              </div>
              <button type="submit"
                style={{ padding: '18px 32px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--coin)', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--accent)', cursor: 'pointer' }}
                disabled={!name.trim() || joinCode.length < 6 || pendingRequest}
              >
                Join Game
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function LobbyHeader() {
  return (
    <div style={{ background: 'var(--paper-soft)', borderBottom: '2px solid var(--ink)', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)', lineHeight: 1 }}>
        The Wedding<span style={{ color: 'var(--accent)' }}> Planner</span>
      </div>
    </div>
  );
}
