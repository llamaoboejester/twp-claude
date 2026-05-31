import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FirstPlayerToken } from './Icons';
import { CATEGORY_TONE, CATEGORY_SLUG } from './Icons';
import { adaptMeepleAt } from './stateAdapters';

const GOAL_TIER_VALUES = {
  theme:      { unforgettable: 30, thematic: 20, coordinated: 15, subtle: 10 },
  budget:     { extravagant: 15, refined: 10, modest: 5 },
  excitement: { spectacular: 15, vibrant: 10, intimate: 5 },
};

export default function OtherPlayers() {
  const { gameState, playerId } = useGame();
  if (!gameState) return null;

  const others = gameState.playerOrder
    .filter(pid => pid !== playerId)
    .map(pid => gameState.players[pid]);

  if (others.length === 0) {
    return (
      <div style={{ padding: '20px 14px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center' }}>
        No other players yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {others.map(p => <OpponentSummary key={p.id} player={p} gameState={gameState} />)}
    </div>
  );
}

export function OpponentSummary({ player, gameState }) {
  const isCurrentTurn = gameState?.playerOrder[gameState.currentPlayerIndex] === player.id;
  const meepleAt = adaptMeepleAt(player.meeplePosition);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(`twp-opp-${player.name}-collapsed`);
    return saved !== null ? saved === '1' : false;
  });
  React.useEffect(() => {
    localStorage.setItem(`twp-opp-${player.name}-collapsed`, collapsed ? '1' : '0');
  }, [collapsed, player.name]);

  const completedTasks = player.completedTasksCount ?? 0;
  const themePositions = player.themeElements || { whimsy: 0, edge: 0, nature: 0, tradition: 0, elegance: 0 };

  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)' }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', background: 'transparent', border: 0, padding: '10px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 10, cursor: 'pointer', borderBottom: collapsed ? 0 : '2px solid var(--ink)',
        }}
      >
        {player.isFirstPlayer && <FirstPlayerToken size={18} />}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>
            Opponent {isCurrentTurn ? '· active turn' : meepleAt ? `· at ${meepleAt}` : ''}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: isCurrentTurn ? 'var(--accent)' : 'var(--ink)', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>
            {player.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
          {[
            { value: player.excitement, suffix: 'e', tone: 'var(--accent)' },
            { value: player.coins, suffix: 'c', tone: 'var(--coin-deep)' },
            { value: player.gifts, suffix: 'g', tone: 'var(--gift)' },
            { value: completedTasks, suffix: 't', tone: 'var(--ink)' },
          ].map((s, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: s.tone, fontVariantNumeric: 'tabular-nums' }}>
              {s.value}<span style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', marginLeft: 1 }}>{s.suffix}</span>
            </span>
          ))}
        </div>
        <span style={{ display: 'inline-block', width: 14, height: 14, border: '1.5px solid var(--ink-2)', position: 'relative', flex: '0 0 auto' }}>
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${collapsed ? 0 : 180}deg)`, fontFamily: 'var(--font-mono)', fontSize: 9, lineHeight: 1 }}>▾</span>
        </span>
      </button>

      {!collapsed && (
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* STAT TILES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: 'var(--ink)', border: '2px solid var(--ink)' }}>
            {[
              { label: 'Excite', value: player.excitement, suffix: '/30', tone: 'var(--excite)' },
              { label: 'Coins',  value: player.coins,      suffix: null, tone: 'var(--coin-deep)' },
              { label: 'Gifts',  value: player.gifts,      suffix: null, tone: 'var(--gift)' },
              { label: 'Tasks',  value: completedTasks,    suffix: '/28', tone: 'var(--ink)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--paper-soft)', padding: '8px 6px 7px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, lineHeight: 1, color: s.tone, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
                  {s.suffix && <span style={{ fontSize: 9, color: 'var(--ink-4)' }}>{s.suffix}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* THEME & GOALS */}
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>Theme &amp; Goals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {player.theme ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--ink)', color: 'var(--paper)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--coin)' }}>Theme</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1 }}>{player.theme.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flex: '0 0 auto' }}>
                    {player.theme.elements.map(el => (
                      <img key={el} src={`/icons/source/${el}.png`} alt={el} title={el} style={{ width: 22, height: 22, background: 'var(--paper)', borderRadius: '50%', padding: 1 }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '8px 10px', border: '1.5px dashed var(--ink-line-2)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', textAlign: 'center' }}>
                  Theme set at Check-In 1
                </div>
              )}
              {[1, 2, 3].map(n => {
                const g = (player.goals || []).find(x => x.checkIn === n);
                if (g) {
                  const val = GOAL_TIER_VALUES[g.type]?.[g.tier];
                  return (
                    <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', border: '1.5px solid var(--ink)', padding: '5px 10px', background: 'var(--paper-deep)' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)' }}>{g.type}</div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1 }}>{g.tier || g.guestCategory || '—'}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--gift)', fontVariantNumeric: 'tabular-nums' }}>{val != null ? `+${val}` : ''}</div>
                    </div>
                  );
                }
                return (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', border: '1.5px dashed var(--ink-line-2)', padding: '7px 10px', color: 'var(--ink-4)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Goal not yet set</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* THEME ELEMENTS */}
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>Theme Elements</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, background: 'var(--ink)', border: '2px solid var(--ink)' }}>
              {['whimsy', 'edge', 'nature', 'tradition', 'elegance'].map(el => (
                <div key={el} style={{ background: 'var(--paper-soft)', padding: '7px 2px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <img src={`/icons/source/${el}.png`} style={{ width: 18, height: 18 }} alt={el} title={el} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, lineHeight: 1, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                    {themePositions[el] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* MINI WEDDING GRID */}
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>Wedding Grid</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3, background: 'var(--ink)', border: '2px solid var(--ink)' }}>
              {player.grid.map((cell, i) => {
                const isVenueSlot = i === 4;
                if (!cell) {
                  return (
                    <div key={i} style={{ aspectRatio: '1 / 1', background: isVenueSlot ? 'var(--paper-shade)' : 'var(--paper-deep)', display: 'grid', placeItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>{isVenueSlot ? 'Venue' : '—'}</span>
                    </div>
                  );
                }
                const isVenue = cell.type === 'venue';
                const isDIY = cell.type === 'diy' || cell.diy;
                const cat = isDIY ? cell.category : cell.category;
                const tone = isVenue ? 'var(--ink-2)' : (cat ? CATEGORY_TONE[cat] : 'var(--ink-3)');
                const slug = cat ? CATEGORY_SLUG[cat] : null;
                return (
                  <div key={i} style={{ aspectRatio: '1 / 1', background: tone, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 0 }}>
                      {isVenue ? (
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--coin)', letterSpacing: '0.1em' }}>V</span>
                      ) : slug ? (
                        <img src={`/icons/category/${slug}.png`} alt="" style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
                      ) : null}
                    </div>
                    {isDIY && (
                      <div style={{ position: 'absolute', top: 4, left: 0, background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.14em', padding: '1px 5px' }}>DIY</div>
                    )}
                    {!isDIY && (cell.cost != null || cell.excitement != null) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 5px', background: 'rgba(0,0,0,0.32)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--paper)', fontVariantNumeric: 'tabular-nums' }}>
                        <span>◈{cell.cost ?? '–'}</span>
                        <span style={{ color: 'var(--coin)' }}>✦{cell.excitement ?? '–'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* HELPERS TAKEN */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Helpers Taken</div>
              <div className="t-eyebrow" style={{ color: 'var(--ink-4)' }}>{(player.helpers || []).filter(Boolean).length} / 3</div>
            </div>
            {!(player.helpers || []).some(Boolean) ? (
              <div style={{ padding: '8px 10px', border: '1.5px dashed var(--ink-line-2)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', textAlign: 'center' }}>None taken</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(player.helpers || []).filter(Boolean).map((h, i) => {
                  const type = h.helpType || h.type;
                  const typeTone = { Money: 'var(--coin-deep)', Effort: 'var(--el-edge)', Research: 'var(--el-nature)' }[type] || 'var(--ink-2)';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--paper-deep)', border: '1px solid var(--ink-line-2)' }}>
                      <span style={{ flex: '0 0 auto', background: typeTone, color: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 5px' }}>{type}</span>
                      <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</span>
                      {h.commitment && (
                        <span style={{ marginLeft: 'auto', flex: '0 0 auto', fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-deep)', border: '1px solid var(--accent)', padding: '1px 4px' }}>Commit</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
