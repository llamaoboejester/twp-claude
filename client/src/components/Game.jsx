import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import PlayerBoard from './PlayerBoard';
import SharedBoard from './SharedBoard';
import ActionPanel from './ActionPanel';
import OtherPlayers from './OtherPlayers';
import CheckIn from './CheckIn';
import '../styles.css';

export default function Game() {
  const { gameState, playerId, isMyTurn, isCheckinActive, isMyCheckinTurn, error, clearError } = useGame();
  const [viewTab, setViewTab] = useState('board');

  if (!gameState) return null;

  const { month, quarter, playerOrder, currentPlayerIndex, log } = gameState;
  const currentPid = playerOrder[currentPlayerIndex];
  const currentPlayerName = gameState.players[currentPid]?.name;
  const myPlayer = gameState.players[playerId];

  return (
    <div style={styles.layout}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <span style={styles.gameName}>The Wedding Planner</span>
          <span style={styles.monthBadge}>Month {month}</span>
          <span style={styles.quarterBadge}>Q{quarter}</span>
        </div>
        <div style={styles.topCenter}>
          {isCheckinActive && isMyCheckinTurn
            ? <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>Check-In {gameState.checkinState.checkInNumber} — Your turn to act</span>
            : isCheckinActive
            ? <span style={{ color: 'var(--text-dim)' }}>Check-In {gameState.checkinState.checkInNumber} in progress…</span>
            : isMyTurn
            ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>Your turn</span>
            : <span style={{ color: 'var(--text-dim)' }}>Waiting for {currentPlayerName}…</span>
          }
        </div>
        <div style={styles.topRight}>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {myPlayer?.name} · {myPlayer?.coins}¢ · {myPlayer?.gifts} gifts
          </span>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ margin: '8px 16px', flexShrink: 0 }}>
          {error}
          <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '2px 8px' }} onClick={clearError}>✕</button>
        </div>
      )}

      {/* Main content */}
      <div style={styles.main}>
        {/* Left: player's own board */}
        <div style={styles.leftPane}>
          <div style={styles.tabRow}>
            {['board', 'tasks', 'log'].map(t => (
              <button key={t} className={`btn ${viewTab === t ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize: 12 }} onClick={() => setViewTab(t)}>
                {t === 'board' ? 'My Board' : t === 'tasks' ? 'Tasks' : 'Log'}
              </button>
            ))}
          </div>

          {viewTab === 'board' && <PlayerBoard />}
          {viewTab === 'tasks' && <TasksTab />}
          {viewTab === 'log'   && <LogTab log={log} />}
        </div>

        {/* Center: shared board + action panel */}
        <div style={styles.centerPane}>
          <SharedBoard />
          {isCheckinActive
            ? <CheckIn />
            : (isMyTurn && <ActionPanel />)
          }
        </div>

        {/* Right: other players */}
        <div style={styles.rightPane}>
          <OtherPlayers />
        </div>
      </div>
    </div>
  );
}

function TasksTab() {
  const { gameState, playerId, sendAction, isMyTurn } = useGame();
  const player = gameState?.players[playerId];
  const month = gameState?.month;

  if (!player) return null;

  const SECTIONS = ['getting_started', 'making_it_yours', 'putting_together', 'locking_in'];
  const SECTION_LABELS = {
    getting_started: 'Getting Started',
    making_it_yours: 'Making It Yours',
    putting_together: 'Putting It Together',
    locking_in: 'Locking It In',
  };

  return (
    <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 700 }}>Tasks Completed: {player.completedTasksCount}</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 12, marginLeft: 8 }}>
          (milestones at 4, 8, 10, 12, 16, 20)
        </span>
      </div>
      {SECTIONS.map(section => {
        const tasks = Object.entries(player.taskWorksheet).filter(([tid]) => {
          const def = TASK_DEFS.find(t => t.id === tid);
          return def && def.section === section;
        });
        if (tasks.length === 0) return null;
        return (
          <div key={section} style={{ marginBottom: 16 }}>
            <div className="section-label">{SECTION_LABELS[section]}</div>
            {tasks.map(([tid, ws]) => {
              const def = TASK_DEFS.find(t => t.id === tid);
              if (!def) return null;
              return <TaskRow key={tid} def={def} ws={ws} player={player} month={month} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

function TaskRow({ def, ws, player, month }) {
  const locked = !isUnlocked(def, player, month);
  return (
    <div style={{
      padding: '6px 8px',
      marginBottom: 4,
      borderRadius: 6,
      background: ws.completed ? '#4caf5015' : locked ? '#88888815' : 'var(--surface2)',
      border: `1px solid ${ws.completed ? '#4caf5040' : 'var(--border)'}`,
      opacity: locked ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {def.key && <span className="badge" style={{ background: '#ff980020', color: '#ff9800', fontSize: 10 }}>KEY</span>}
        {def.starred && <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>★</span>}
        <span style={{ fontSize: 13, fontWeight: ws.completed ? 400 : 600,
          textDecoration: ws.completed ? 'line-through' : 'none', color: ws.completed ? 'var(--text-dim)' : 'var(--text)' }}>
          {def.name}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--accent2)' }}>+{def.gifts} gifts</span>
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        {Array.from({ length: def.effortRequired }).map((_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 3,
            background: i < ws.effortApplied ? 'var(--success)' : 'var(--border)',
            border: '1px solid var(--border)',
          }} />
        ))}
        {locked && (
          <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-dim)' }}>
            🔒 {getLockReason(def, player, month)}
          </span>
        )}
      </div>
    </div>
  );
}

function isUnlocked(def, player, month) {
  for (const cond of def.lockConditions) {
    if (cond.type === 'month_min' && month < cond.month) return false;
    if (cond.type === 'venue_booked' && !player.grid[4]) return false;
    if (cond.type === 'vendor_booked') {
      if (!player.grid.some(c => c && c.type === 'vendor' && c.category === cond.category)) return false;
    }
    if (cond.type === 'task_completed') {
      if (!player.completedTaskIds.includes(cond.taskId)) return false;
    }
  }
  return true;
}

function getLockReason(def, player, month) {
  for (const cond of def.lockConditions) {
    if (cond.type === 'month_min' && month < cond.month) return `Available month ${cond.month}`;
    if (cond.type === 'venue_booked' && !player.grid[4]) return 'Need venue booked';
    if (cond.type === 'vendor_booked') {
      if (!player.grid.some(c => c && c.type === 'vendor' && c.category === cond.category))
        return `Need ${cond.category} booked`;
    }
    if (cond.type === 'task_completed') {
      if (!player.completedTaskIds.includes(cond.taskId)) {
        return `Complete ${TASK_DEFS.find(t => t.id === cond.taskId)?.name || cond.taskId} first`;
      }
    }
  }
  return '';
}

import { TASK_DEFS } from '../data/taskDefs';
export { TASK_DEFS };

function LogTab({ log }) {
  if (!log || log.length === 0) {
    return <div style={{ padding: 16, color: 'var(--text-dim)', fontSize: 13 }}>No events yet.</div>;
  }
  return (
    <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
      {[...log].reverse().map((entry, i) => (
        <div key={i} style={{ fontSize: 12, color: 'var(--text-dim)', padding: '3px 0',
          borderBottom: '1px solid var(--border)' }}>
          {entry.message}
        </div>
      ))}
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--bg)',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
    gap: 12,
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 10, flex: 1 },
  topCenter: { flex: 2, textAlign: 'center', fontSize: 14 },
  topRight: { flex: 1, textAlign: 'right' },
  gameName: { fontWeight: 700, color: 'var(--accent)', fontSize: 16 },
  monthBadge: {
    background: 'var(--surface2)', borderRadius: 6, padding: '2px 10px',
    fontSize: 13, fontWeight: 600,
  },
  quarterBadge: {
    background: 'var(--surface2)', borderRadius: 6, padding: '2px 8px',
    fontSize: 12, color: 'var(--text-dim)',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    gap: 0,
  },
  leftPane: {
    width: 360,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border)',
    overflow: 'hidden',
  },
  centerPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  rightPane: {
    width: 280,
    flexShrink: 0,
    borderLeft: '1px solid var(--border)',
    overflow: 'hidden',
  },
  tabRow: {
    display: 'flex',
    gap: 4,
    padding: '8px 8px 0',
    flexShrink: 0,
  },
};
