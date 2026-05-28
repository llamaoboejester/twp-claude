import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import VendorGrid from './VendorGrid';
import '../styles.css';

const ELEMENTS = ['whimsy', 'edge', 'nature', 'tradition', 'elegance'];
const ELEMENT_ICONS = { whimsy: '🌀', edge: '⚡', nature: '🌿', tradition: '💍', elegance: '💎' };

export default function OtherPlayers() {
  const { gameState, playerId } = useGame();
  if (!gameState) return null;

  const others = gameState.playerOrder
    .filter(pid => pid !== playerId)
    .map(pid => gameState.players[pid]);

  if (others.length === 0) {
    return (
      <div style={{ padding: 16, color: 'var(--text-dim)', fontSize: 13 }}>
        No other players yet.
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="section-label" style={{ padding: '4px 4px 0' }}>Other Players</div>
      {others.map(p => <OtherPlayerCard key={p.id} player={p} gameState={gameState} />)}
    </div>
  );
}

function OtherPlayerCard({ player, gameState }) {
  const [expanded, setExpanded] = useState(false);
  const isCurrentTurn = gameState.playerOrder[gameState.currentPlayerIndex] === player.id;

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isCurrentTurn ? 'var(--success)' : 'var(--border)'}`,
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        style={{
          padding: '8px 10px',
          cursor: 'pointer',
          background: isCurrentTurn ? 'rgba(76,175,80,0.1)' : 'transparent',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {isCurrentTurn && <span style={{ color: 'var(--success)', fontSize: 10 }}>▶</span>}
        <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{player.name}</span>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Summary row always visible */}
      <div style={{
        padding: '0 10px 8px',
        display: 'flex', flexWrap: 'wrap', gap: 8,
        fontSize: 12,
      }}>
        <Stat label="Gifts" value={player.gifts} />
        <Stat label="Coins" value={`${player.coins}¢`} />
        <Stat label="Cards" value={player.hand.length} />
        <Stat label="Excitement" value={player.excitement} />
        <Stat label="Tasks" value={player.completedTasksCount} />
        <Stat label="DIY" value={player.diyCount} />
        <Stat label="Meeple" value={player.meeplePosition} small />
      </div>

      {/* Theme & goals */}
      <div style={{ padding: '0 10px 8px', fontSize: 12 }}>
        {player.theme
          ? (
            <span>
              Theme: <strong>{player.theme.name}</strong>
              {' '}
              {player.theme.elements.map(el => (
                <span key={el} className={`tag element-${el}`} style={{ marginRight: 3, fontSize: 10 }}>
                  {ELEMENT_ICONS[el]}
                </span>
              ))}
            </span>
          )
          : <span style={{ color: 'var(--text-dim)' }}>Theme not set</span>
        }
        {player.goals.length > 0 && (
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {player.goals.map(g => (
              <span key={g.type} className="badge"
                style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--accent2)', fontSize: 10 }}>
                {g.type}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded: full grid + element trackers */}
      {expanded && (
        <div style={{ padding: '0 8px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 0 4px' }}>
            <VendorGrid grid={player.grid} isOwn={false} />
          </div>

          {/* Element bars */}
          <div style={{ display: 'flex', gap: 4, flexDirection: 'column', marginTop: 8 }}>
            {ELEMENTS.map(el => {
              const val = player.themeElements[el];
              const pct = (val / 8) * 100;
              return (
                <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, fontSize: 10 }}>{ELEMENT_ICONS[el]}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `var(--${el})`, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 10, width: 12 }}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 40 }}>
      <div style={{ fontSize: small ? 10 : 13, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{label}</div>
    </div>
  );
}
