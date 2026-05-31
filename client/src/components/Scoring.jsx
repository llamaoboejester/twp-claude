import React from 'react';
import { useGame } from '../context/GameContext';
import '../styles.css';

export default function Scoring() {
  const { gameState } = useGame();
  if (!gameState) return null;

  const { players, playerOrder, scoring } = gameState;

  const eligiblePlayers = playerOrder.filter(pid => players[pid].grid[4] !== null);
  const ineligible = playerOrder.filter(pid => players[pid].grid[4] === null);

  const sorted = [...eligiblePlayers].sort((a, b) => {
    const ga = players[a].gifts, gb = players[b].gifts;
    if (gb !== ga) return gb - ga;
    const va = players[a].grid.filter(c => c && c.type === 'vendor').length;
    const vb = players[b].grid.filter(c => c && c.type === 'vendor').length;
    if (vb !== va) return vb - va;
    const ta = players[a].completedTasksCount, tb = players[b].completedTasksCount;
    if (tb !== ta) return tb - ta;
    return players[b].excitement - players[a].excitement;
  });

  const topScore = sorted[0] ? players[sorted[0]].gifts : 0;
  const winners = sorted.filter(pid => players[pid].gifts === topScore);

  return (
    <div style={{ minWidth: 1440, minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      {/* Header */}
      <div style={{ background: 'var(--paper-soft)', borderBottom: '2px solid var(--ink)', padding: '12px 28px', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)', lineHeight: 1 }}>
          The Wedding<span style={{ color: 'var(--accent)' }}> Planner</span>
        </div>
      </div>

      <div style={{ padding: '48px 64px' }}>
        {/* Hero */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div className="t-eyebrow t-eyebrow-accent">End of Month 12 · Final Scoring</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 96, lineHeight: 0.9, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '12px 0 0', color: 'var(--ink)' }}>
              The <span style={{ color: 'var(--accent)' }}>Reception.</span>
            </h1>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--ink-2)', textAlign: 'right', maxWidth: 340 }}>
            Gifts unwrapped. Photos in. Cake counted.<br/>The winner takes everything.
          </div>
        </div>

        {/* Ineligible warning */}
        {ineligible.length > 0 && (
          <div style={{ marginBottom: 24, padding: '12px 18px', background: 'var(--paper-deep)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>Cannot win (no venue booked):</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-2)' }}>{ineligible.map(pid => players[pid].name).join(', ')}</span>
          </div>
        )}

        {/* Player cards */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(sorted.length + ineligible.length, 3)}, 1fr)`, gap: 24 }}>
          {sorted.concat(ineligible).map((pid, rank) => {
            const p = players[pid];
            const isWinner = winners.includes(pid);
            const isIneligible = ineligible.includes(pid);
            const breakdown = scoring?.[pid] || {};

            const breakdownItems = [
              { label: 'In-play gifts', sub: 'from Moments, Tasks, Race Awards', value: p.gifts - (p.excitement || 0) - (Object.values(breakdown.goals || {}).reduce((a, b) => a + b, 0)) - (breakdown.balanced || 0) - (breakdown.endgameAward || 0) },
              { label: 'Excitement', sub: `1 gift per excitement, final ${p.excitement}`, value: p.excitement || 0 },
              ...Object.entries(breakdown.goals || {}).map(([type, gifts]) => ({
                label: `Goal · ${type.charAt(0).toUpperCase() + type.slice(1)}`, sub: 'check-in goal', value: gifts,
              })),
              ...(breakdown.balanced > 0 ? [{ label: 'Balanced bonus', sub: 'theme elements equal', value: breakdown.balanced }] : []),
              ...(breakdown.raceAward > 0 ? [{ label: 'Race Award', sub: 'won during play', value: breakdown.raceAward }] : []),
              ...(breakdown.endgameAward > 0 ? [{ label: 'Endgame Award', sub: 'final scoring', value: breakdown.endgameAward }] : []),
            ].filter(item => item.value !== 0);

            return (
              <div key={pid} style={{
                background: isWinner ? 'var(--ink)' : 'var(--paper-soft)',
                color: isWinner ? 'var(--paper)' : 'var(--ink)',
                border: '2px solid var(--ink)',
                boxShadow: isWinner ? '8px 8px 0 var(--accent)' : '4px 4px 0 var(--ink)',
                opacity: isIneligible ? 0.6 : 1,
              }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '2px solid var(--ink)', background: isWinner ? 'var(--accent)' : 'var(--paper-deep)', color: isWinner ? 'var(--paper)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.8 }}>
                      {isIneligible ? 'No venue — cannot win' : (isWinner ? 'Winner · most gifts' : `Rank ${rank + 1}`)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1, marginTop: 4 }}>
                      {p.name}
                    </div>
                    {p.theme && (
                      <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, marginTop: 4, opacity: 0.8 }}>
                        {p.theme.name}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.8 }}>Total gifts</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 60, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {p.gifts}
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{ padding: 24 }}>
                  {breakdownItems.map((b, j) => (
                    <div key={j} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'baseline', padding: '10px 0', borderBottom: j < breakdownItems.length - 1 ? '1px solid var(--ink-line-2)' : 0 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.10em', textTransform: 'uppercase', color: isWinner ? 'var(--paper)' : 'var(--ink)' }}>{b.label}</div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: isWinner ? 'var(--coin)' : 'var(--ink-3)', marginTop: 2 }}>{b.sub}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: b.value < 0 ? 'var(--gift)' : (isWinner ? 'var(--coin)' : 'var(--gift)'), fontVariantNumeric: 'tabular-nums' }}>
                        {b.value > 0 ? '+' : ''}{b.value}
                      </div>
                    </div>
                  ))}

                  {breakdownItems.length === 0 && (
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: isWinner ? 'var(--coin)' : 'var(--ink-3)', fontStyle: 'italic' }}>
                      Final gifts: {p.gifts}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, padding: '20px 28px', background: 'var(--paper-soft)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-2)', flex: 1 }}>
            {winners.length > 1
              ? `${winners.map(pid => players[pid].name).join(' & ')} tie with ${topScore} gifts.`
              : `${players[winners[0]]?.name} wins with ${topScore} gifts.`
            }
          </div>
          <button
            style={{ padding: '12px 24px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--accent)', color: 'var(--paper)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', cursor: 'pointer' }}
            onClick={() => { sessionStorage.removeItem('twp_session'); window.location.reload(); }}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
