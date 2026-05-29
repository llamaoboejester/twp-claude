import React from 'react';
import { VendorCard, VenueCard, DIYBack, ThemeCard } from './Cards';
import { Meeple, FirstPlayerToken, EffortBox, LockIcon } from './Icons';
import { CATEGORY_TONE, CATEGORY_SLUG } from './Icons';
import { adaptCard, adaptGridCell } from './stateAdapters';
import { TASK_DEFS } from '../data/taskDefs';

const GRID_BONUS = {
  0: 'Research', 1: 'Plan', 2: 'Book',
  3: 'Help',     4: 'Any',  5: 'Help',
  6: 'Book',     7: 'Plan', 8: 'Research',
};

// ——————————————————————————————————————————————————
// WEDDING GRID — 3x3
// ——————————————————————————————————————————————————

export function WeddingGrid({
  cells = [],
  cellSize = 130,
  showBonusLabels = true,
  highlightTargets = null,
  onCellClick = null,
  onZoom = null,
}) {
  const adaptedCells = cells.map(adaptGridCell);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${cellSize}px)`,
      gridTemplateRows: `repeat(3, ${cellSize}px)`,
      gap: 4,
      padding: 4,
      background: 'var(--ink)',
      border: '2px solid var(--ink)',
      boxShadow: '4px 4px 0 var(--ink)',
    }}>
      {adaptedCells.map((cell, i) => {
        const isCenter = i === 4;
        const isHighlight = highlightTargets?.includes(i);
        return (
          <div
            key={i}
            onClick={() => onCellClick?.(i)}
            style={{
              background: 'var(--paper-deep)',
              position: 'relative',
              cursor: onCellClick ? 'pointer' : 'default',
              outline: isHighlight ? '3px solid var(--accent)' : 'none',
              outlineOffset: -3,
              overflow: 'hidden',
            }}
          >
            {cell ? (
              cell.type === 'diy' ? (
                <DIYBack category={cell.category} width={cellSize} height={cellSize} onZoom={onZoom ? () => onZoom({ kind: 'diy', category: cell.category }) : null} />
              ) : cell.type === 'venue' ? (
                <VenueCard {...cell.card} width={cellSize} height={cellSize} onZoom={onZoom ? () => onZoom({ kind: 'venue', ...cell.card }) : null} />
              ) : (
                <VendorCard {...cell.card} width={cellSize} height={cellSize} onZoom={onZoom ? () => onZoom({ kind: 'vendor', ...cell.card }) : null} />
              )
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--ink-3)', position: 'relative' }}>
                {isCenter && (
                  <div style={{ position: 'absolute', top: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', border: '1.5px solid var(--ink-line-2)', padding: '2px 6px' }}>
                      Venue
                    </div>
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink-line-2)' }}>
                  {i + 1}
                </div>
                {showBonusLabels && !isCenter && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                    +{GRID_BONUS[i]}
                  </div>
                )}
                {showBonusLabels && isCenter && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    +Any
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ——————————————————————————————————————————————————
// THEME ELEMENT TRACK
// ——————————————————————————————————————————————————

export function ThemeElementTrack({ element = 'whimsy', position = 0 }) {
  const tone = `var(--el-${element})`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 92, flex: '0 0 auto' }}>
        <img src={`/icons/source/${element}.png`} style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid var(--ink)' }} alt="" />
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink)' }}>
          {element}
        </div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 2, border: '1.5px solid var(--ink)', background: 'var(--paper-deep)' }}>
        {Array.from({ length: 9 }, (_, i) => {
          const filled = i < position;
          const isMilestone = [2, 5, 8].includes(i);
          return (
            <div key={i} style={{ position: 'relative', height: 22, background: filled ? tone : 'var(--paper-soft)', borderRight: i < 8 ? '1px solid var(--ink-line-2)' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isMilestone && !filled && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-3)' }}>
                  {i === 8 ? '★' : '•'}
                </span>
              )}
              {i === position - 1 && (
                <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--ink)', pointerEvents: 'none' }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--ink)', width: 22, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {position}
      </div>
    </div>
  );
}

export function ThemeTrackerStack({ positions = { whimsy: 0, edge: 0, nature: 0, tradition: 0, elegance: 0 } }) {
  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: '12px 14px', boxShadow: '3px 3px 0 var(--ink)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div className="t-eyebrow t-eyebrow-accent">Theme Elements</div>
        <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>0 — 8</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['whimsy', 'edge', 'nature', 'tradition', 'elegance'].map(el => (
          <ThemeElementTrack key={el} element={el} position={positions[el] ?? 0} />
        ))}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// EXCITEMENT TRACK (compact, for right column)
// ——————————————————————————————————————————————————

export function ExcitementTrack({ position = 0 }) {
  const milestones = [5, 15, 25];
  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: '12px 14px', boxShadow: '3px 3px 0 var(--ink)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div className="t-eyebrow" style={{ color: 'var(--accent)' }}>Excitement</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, lineHeight: 1, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{position}</span>
          <span className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>/ 30</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: 1.5, border: '1.5px solid var(--ink)', background: 'var(--paper-deep)', marginBottom: 4 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const filled = i < position;
          const isMs = milestones.includes(i + 1);
          return (
            <div key={i} style={{ position: 'relative', height: 18, background: filled ? 'var(--accent)' : 'var(--paper-soft)', borderRight: i === position - 1 ? '2px solid var(--ink)' : 0 }}>
              {isMs && (
                <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, background: 'var(--ink)', borderRadius: '50%' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// HELPER SLOTS
// ——————————————————————————————————————————————————

export function HelperSlots({ slots = [null, null, null] }) {
  const typeTone = (t) => ({ Money: 'var(--coin)', Effort: 'var(--el-edge)', Research: 'var(--el-nature)' }[t] || 'var(--ink-line-2)');
  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: 14, boxShadow: '3px 3px 0 var(--ink)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div className="t-eyebrow t-eyebrow-accent">Helpers</div>
        <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>{slots.filter(Boolean).length} / 3</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slots.map((slot, i) => (
          slot ? (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'stretch', border: '2px solid var(--ink)', background: 'var(--paper-soft)', boxShadow: '2px 2px 0 var(--ink)' }}>
              <div style={{ background: typeTone(slot.type || slot.helpType), color: (slot.type || slot.helpType) === 'Money' ? 'var(--ink)' : 'var(--paper)', padding: '6px 6px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {slot.type || slot.helpType}
              </div>
              <div style={{ padding: '6px 8px 6px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, lineHeight: 1.1, color: 'var(--ink)' }}>{slot.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, lineHeight: 1.3, color: 'var(--ink-2)' }}>{slot.offer}</div>
                {slot.commitment && (
                  <div style={{ marginTop: 2, padding: '3px 5px', background: 'var(--accent-soft)', border: '1px solid var(--accent)', fontFamily: 'var(--font-sans)', fontSize: 9, lineHeight: 1.25, color: 'var(--ink)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginRight: 4 }}>Commit</span>
                    {slot.commitment}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={i} style={{ padding: '10px 8px', border: '2px dashed var(--ink-line-2)', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center' }}>
              Empty slot {i + 1}
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// VISION BOARD
// ——————————————————————————————————————————————————

export function VisionBoard({ theme = null, themeOptions = null, goals = [], compact = false, onZoom = null }) {
  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: 14, boxShadow: '3px 3px 0 var(--ink)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div className="t-eyebrow t-eyebrow-accent">Vision Board</div>
        {!theme && themeOptions && (
          <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Choose at Check-In 1</div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: themeOptions && !theme ? 'auto auto 1fr' : 'auto 1fr', gap: 12 }}>
        {theme ? (
          <div>
            <ThemeCard {...theme} width={compact ? 100 : 120} height={compact ? 130 : 150} onZoom={onZoom ? () => onZoom({ kind: 'theme', ...theme }) : null} />
          </div>
        ) : themeOptions ? (
          <>
            <div>
              <ThemeCard {...themeOptions[0]} width={92} height={120} onZoom={onZoom ? () => onZoom({ kind: 'theme', ...themeOptions[0] }) : null} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textAlign: 'center', marginTop: 4 }}>Option 1</div>
            </div>
            <div>
              <ThemeCard {...themeOptions[1]} width={92} height={120} onZoom={onZoom ? () => onZoom({ kind: 'theme', ...themeOptions[1] }) : null} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textAlign: 'center', marginTop: 4 }}>Option 2</div>
            </div>
          </>
        ) : (
          <div style={{ width: 120, height: 150, border: '2px dashed var(--ink-line-2)', display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', padding: 12 }}>
            Set at<br/>Check-In 1
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[1, 2, 3].map(n => {
            const g = goals.find(x => x.checkIn === n || (x.type && n === goals.indexOf(x) + 1));
            if (g) {
              return (
                <div key={n} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center', border: '1.5px solid var(--ink)', padding: '6px 8px', background: 'var(--paper-deep)' }}>
                  <span className="t-eyebrow" style={{ color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>Check-In {n}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                      {g.type}
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1 }}>
                      {g.tier || g.guestCategory || '—'}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--gift)', fontVariantNumeric: 'tabular-nums' }}>
                    +{g.value ?? g.gifts ?? '?'}
                  </div>
                </div>
              );
            }
            return (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center', border: '1.5px dashed var(--ink-line-2)', padding: '6px 8px', color: 'var(--ink-3)' }}>
                <span className="t-eyebrow" style={{ color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>Check-In {n}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Goal not yet set</span>
              </div>
            );
          })}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', padding: '4px 8px', marginTop: 2 }}>
            <div>
              <div className="t-eyebrow" style={{ color: 'var(--accent)' }}>Balanced bonus</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.2 }}>Both theme elements equal at endgame.</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--gift)' }}>+5</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// HAND STRIP
// ——————————————————————————————————————————————————

export function HandStrip({ cards = [], cardW = 124, selected = -1, onSelect = null, onZoom = null }) {
  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: 14, boxShadow: '3px 3px 0 var(--ink)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div className="t-eyebrow t-eyebrow-accent">Your Hand</div>
        <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>{cards.length} / 5 · max 3 venues</div>
      </div>
      <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
        {cards.length === 0 && (
          <div style={{ padding: '32px 0', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Hand empty
          </div>
        )}
        {cards.map((card, i) => {
          const adapted = adaptCard(card);
          return (
            <div
              key={card.id || i}
              onClick={(e) => { if (e.ctrlKey || e.metaKey) return; onSelect?.(i); }}
              style={{ cursor: onSelect ? 'pointer' : 'default', transform: selected === i ? 'translateY(-12px)' : 'none', transition: 'transform 120ms ease' }}
            >
              {card.type === 'venue' ? (
                <VenueCard {...adapted} width={cardW} height={cardW} onZoom={onZoom ? () => onZoom({ kind: 'venue', ...adapted }) : null} highlight={selected === i} />
              ) : (
                <VendorCard {...adapted} width={cardW} height={cardW} onZoom={onZoom ? () => onZoom({ kind: 'vendor', ...adapted }) : null} highlight={selected === i} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// ACTION DOCK
// ——————————————————————————————————————————————————

export function ActionDock({ meepleAt = null, available = ['Research', 'Book', 'Plan', 'Help'], active = null, onChoose = null }) {
  const ACTIONS = ['Research', 'Book', 'Plan', 'Help'];
  const DESCS = {
    Research: 'Draw or take FVR',
    Book:     'Place from hand',
    Plan:     '3 effort to tasks',
    Help:     'Draw a helper',
  };

  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: 14, boxShadow: '3px 3px 0 var(--ink)' }}>
      <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 10 }}>Actions · move your meeple</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {ACTIONS.map(a => {
          const normalizedMeeple = meepleAt ? meepleAt.charAt(0).toUpperCase() + meepleAt.slice(1) : null;
          const hasMeeple = normalizedMeeple === a;
          const isActive = active === a;
          const isDisabled = !available.includes(a) || hasMeeple || !onChoose;
          return (
            <button
              key={a}
              onClick={() => !isDisabled && onChoose?.(a)}
              disabled={isDisabled}
              style={{
                background: isActive ? 'var(--accent)' : (isDisabled ? 'var(--paper-deep)' : 'var(--paper-soft)'),
                color: isActive ? 'var(--paper)' : (isDisabled ? 'var(--ink-3)' : 'var(--ink)'),
                border: '2px solid var(--ink)',
                padding: '16px 8px 12px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                lineHeight: 1,
                position: 'relative',
                boxShadow: !isDisabled && !isActive ? '3px 3px 0 var(--ink)' : 'none',
                transform: !isDisabled && !isActive ? 'translate(-1.5px, -1.5px)' : 'none',
              }}
            >
              {hasMeeple && (
                <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)' }}>
                  <Meeple size={26} color="var(--accent)" outline="var(--ink)" />
                </div>
              )}
              <div>{a}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 400, letterSpacing: '0.12em', marginTop: 4, color: isActive ? 'var(--paper)' : 'var(--ink-3)' }}>
                {DESCS[a]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// PLAYER CHROME — name header bar
// ——————————————————————————————————————————————————

export function PlayerChrome({ name = 'Player', isYou = true, isActive = false, coins = 0, gifts = 0, isFirstPlayer = false }) {
  return (
    <div style={{ background: isActive ? 'var(--accent)' : 'var(--ink)', color: isActive ? 'var(--paper)' : 'var(--coin)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
      {isFirstPlayer && <FirstPlayerToken size={26} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>
          {isYou ? 'You' : 'Opponent'} {isActive && '· active turn'}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1, color: 'var(--paper)' }}>
          {name}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>Coins</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--coin)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{coins}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>Gifts</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: isActive ? 'var(--paper)' : 'var(--gift)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{gifts}</div>
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// TASK WORKSHEET
// ——————————————————————————————————————————————————

const SECTION_LABELS = {
  getting_started:   'Getting Started',
  making_it_yours:   'Making It Yours',
  putting_together:  'Putting It Together',
  locking_in:        'Locking It In',
};

const SECTIONS = ['getting_started', 'making_it_yours', 'putting_together', 'locking_in'];

function isTaskUnlocked(def, player, month) {
  for (const cond of def.lockConditions) {
    if (cond.type === 'month_min' && month < cond.month) return false;
    if (cond.type === 'venue_booked' && !player.grid[4]) return false;
    if (cond.type === 'vendor_booked') {
      if (!player.grid.some(c => c && c.type === 'vendor' && c.category === cond.category)) return false;
    }
    if (cond.type === 'task_completed') {
      if (!player.completedTaskIds?.includes(cond.taskId)) return false;
    }
  }
  return true;
}

export function TaskWorksheet({ player, month, completedCount = 0 }) {
  const milestones = [
    { at: 4, reward: '+1 effort' },
    { at: 8, reward: '+1 effort' },
    { at: 10, reward: '+1 exc' },
    { at: 12, reward: '+1 effort' },
    { at: 16, reward: '+1 effort' },
    { at: 20, reward: '+5 gifts' },
  ];

  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)' }}>
      <div style={{ padding: '10px 14px 8px', borderBottom: '2px solid var(--ink)', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="t-eyebrow" style={{ color: 'var(--coin)' }}>Task Worksheet</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--coin)' }}>{completedCount} completed</div>
      </div>

      <div style={{ padding: '10px 14px', borderBottom: '2px solid var(--ink)', background: 'var(--paper-deep)' }}>
        <div className="t-eyebrow" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>Completed track</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 1.5, border: '1.5px solid var(--ink)' }}>
          {Array.from({ length: 20 }, (_, i) => {
            const filled = i < completedCount;
            const ms = milestones.find(m => m.at === i + 1);
            return (
              <div key={i} style={{ position: 'relative', height: 14, background: filled ? 'var(--ink)' : 'var(--paper-soft)', borderRight: i === completedCount - 1 ? '2px solid var(--accent)' : 0 }}>
                {ms && (
                  <span style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--ink-3)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {ms.at}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
          {milestones.map(m => (
            <span key={m.at} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: completedCount >= m.at ? 'var(--accent)' : 'var(--ink-3)', letterSpacing: '0.08em' }}>
              {m.reward}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: '8px 12px 12px', maxHeight: 400, overflowY: 'auto' }}>
        {SECTIONS.map(section => {
          const defs = TASK_DEFS.filter(d => d.section === section);
          return (
            <div key={section} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', padding: '8px 4px 4px', borderBottom: '2px solid var(--ink)', marginBottom: 2 }}>
                {SECTION_LABELS[section]}
              </div>
              {defs.map(def => {
                const ws = player?.taskWorksheet?.[def.id] || {};
                const isLocked = player ? !isTaskUnlocked(def, player, month) : false;
                const isCompleted = ws.completed;
                return (
                  <div key={def.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 8, alignItems: 'center', padding: '5px 6px', background: isCompleted ? 'var(--paper-deep)' : 'transparent', opacity: isLocked ? 0.5 : 1, borderBottom: '1px solid var(--ink-line-2)' }}>
                    <span style={{ width: 14, display: 'grid', placeItems: 'center' }}>
                      {isLocked && <LockIcon size={12} />}
                      {def.key && !isLocked && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)' }}>★</span>}
                    </span>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, lineHeight: 1.2, color: isLocked ? 'var(--ink-3)' : 'var(--ink-2)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {def.name}{def.starred ? '★' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: def.effortRequired }, (_, i) => (
                        <EffortBox key={i} filled={i < (ws.effortApplied ?? 0) || isCompleted} size={12} />
                      ))}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: isCompleted ? 'var(--gift)' : 'var(--ink-3)', width: 24, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      +{def.gifts}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlayerBoard() {
  return null;
}
