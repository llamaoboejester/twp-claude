import React from 'react';
import { useGame } from '../context/GameContext';
import VendorGrid from './VendorGrid';
import '../styles.css';

export default function Scoring() {
  const { gameState } = useGame();
  if (!gameState) return null;

  const { players, playerOrder, scoring } = gameState;

  // Determine winner(s)
  const eligiblePlayers = playerOrder.filter(pid => players[pid].grid[4] !== null);
  const ineligible = playerOrder.filter(pid => players[pid].grid[4] === null);

  const sorted = [...eligiblePlayers].sort((a, b) => {
    const ga = players[a].gifts, gb = players[b].gifts;
    if (gb !== ga) return gb - ga;
    // Tiebreaker 1: most vendors booked
    const va = players[a].grid.filter(c => c && c.type === 'vendor').length;
    const vb = players[b].grid.filter(c => c && c.type === 'vendor').length;
    if (vb !== va) return vb - va;
    // Tiebreaker 2: most tasks completed
    const ta = players[a].completedTasksCount, tb = players[b].completedTasksCount;
    if (tb !== ta) return tb - ta;
    // Tiebreaker 3: highest excitement
    return players[b].excitement - players[a].excitement;
  });

  const topScore = sorted[0] ? players[sorted[0]].gifts : 0;
  const winners = sorted.filter(pid => players[pid].gifts === topScore);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--accent)', fontSize: 32, marginBottom: 4 }}>
          Game Over!
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 32 }}>
          Month 12 complete — final scores
        </p>

        {/* Winners banner */}
        {winners.length > 0 && (
          <div style={{
            background: 'rgba(233,69,96,0.15)', border: '2px solid var(--accent)',
            borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 4 }}>
              {winners.length > 1 ? 'Winners (tied)' : 'Winner'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
              {winners.map(pid => players[pid].name).join(' & ')}
            </div>
            <div style={{ fontSize: 18, color: 'var(--accent2)', marginTop: 4 }}>
              {topScore} gifts 🎁
            </div>
          </div>
        )}

        {/* Ineligible players */}
        {ineligible.length > 0 && (
          <div style={{
            background: 'rgba(255,152,0,0.1)', border: '1px solid var(--warn)',
            borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13,
          }}>
            <strong style={{ color: 'var(--warn)' }}>Cannot win (no venue booked): </strong>
            {ineligible.map(pid => players[pid].name).join(', ')}
          </div>
        )}

        {/* Score breakdown per player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sorted.concat(ineligible).map((pid, rank) => {
            const p = players[pid];
            const isWinner = winners.includes(pid);
            const isIneligible = ineligible.includes(pid);
            const breakdown = scoring?.[pid] || {};

            return (
              <div key={pid} style={{
                background: 'var(--surface)',
                border: `1px solid ${isWinner ? 'var(--accent)' : isIneligible ? 'var(--warn)' : 'var(--border)'}`,
                borderRadius: 10, padding: 16,
                opacity: isIneligible ? 0.6 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {!isIneligible && (
                    <span style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: rank === 0 ? 'var(--accent)' : 'var(--surface2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14, flexShrink: 0,
                    }}>
                      {rank + 1}
                    </span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                    {p.theme && (
                      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                        Theme: {p.theme.name}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: isWinner ? 'var(--accent)' : 'var(--text)' }}>
                      {p.gifts}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>gifts</div>
                  </div>
                </div>

                {/* Score breakdown */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <ScoreStat label="Excitement" value={`+${breakdown.excitement || p.excitement}`} />
                  {Object.entries(breakdown.goals || {}).map(([type, gifts]) => (
                    <ScoreStat key={type} label={`${type} goal`} value={`+${gifts}`} />
                  ))}
                  {breakdown.balanced > 0 && <ScoreStat label="Balanced Bonus" value={`+${breakdown.balanced}`} />}
                  <ScoreStat label="Tasks" value={`${p.completedTasksCount} completed`} />
                  <ScoreStat label="DIY" value={p.diyCount} />
                </div>

                {isIneligible && (
                  <div style={{ color: 'var(--warn)', fontSize: 12 }}>
                    ⚠ No venue booked — cannot win
                  </div>
                )}

                {/* Grid thumbnail */}
                <VendorGrid grid={p.grid} isOwn={false} />
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '12px 32px' }}
            onClick={() => {
              sessionStorage.removeItem('twp_session');
              window.location.reload();
            }}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreStat({ label, value }) {
  return (
    <div style={{
      background: 'var(--surface2)', borderRadius: 6, padding: '4px 10px',
      fontSize: 12,
    }}>
      <span style={{ color: 'var(--text-dim)' }}>{label}: </span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
