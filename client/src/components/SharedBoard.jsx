import React from 'react';
import { VendorCard, VenueCard, MomentCard, AwardCard, VendorDeckTop, VenueDeckBack } from './Cards';
import { adaptCard } from './stateAdapters';

// ——————————————————————————————————————————————————
// MONTH TIMELINE
// ——————————————————————————————————————————————————

export function MonthTimeline({ currentMonth = 1 }) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentQuarter = Math.ceil(currentMonth / 3);
  return (
    <div style={{
      background: 'var(--ink)',
      color: 'var(--paper)',
      border: '2px solid var(--ink)',
      boxShadow: '3px 3px 0 var(--ink)',
      padding: '12px 18px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--coin)' }}>
            Timeline
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--paper)', opacity: 0.55 }}>
            12 months · 3 check-ins · 4 quarters
          </span>
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--paper)', opacity: 0.7 }}>
            Q{currentQuarter} · Month
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {String(currentMonth).padStart(2, '0')}<span style={{ color: 'var(--coin)', opacity: 0.6, fontSize: 14 }}>/12</span>
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr 1fr 1fr auto) 1fr 1fr 1fr',
        gap: 4,
      }}>
        {months.map((m) => {
          const ci = [3, 6, 9].includes(m);
          const isCurrent = m === currentMonth;
          const isPast = m < currentMonth;
          const quarter = Math.ceil(m / 3);
          const isQuarterStart = m === (quarter - 1) * 3 + 1;
          return (
            <React.Fragment key={m}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
                <div style={{
                  height: 14,
                  background: isCurrent ? 'var(--accent)' : (isPast ? 'var(--coin)' : 'var(--paper-deep)'),
                  border: isCurrent ? '1.5px solid var(--paper)' : (isPast ? '1px solid var(--coin)' : '1px solid var(--ink-3)'),
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 2px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: isCurrent ? 'var(--accent)' : (isPast ? 'var(--coin)' : 'var(--paper)'), fontVariantNumeric: 'tabular-nums' }}>
                    {String(m).padStart(2, '0')}
                  </span>
                  {isQuarterStart && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--coin)', opacity: 0.7 }}>
                      Q{quarter}
                    </span>
                  )}
                </div>
              </div>
              {ci && (
                <div style={{ width: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    height: 14,
                    width: '100%',
                    background: m < currentMonth ? 'var(--accent)' : 'var(--coin)',
                    border: `1.5px solid ${m < currentMonth ? 'var(--accent)' : 'var(--coin)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: m < currentMonth ? 'var(--paper)' : 'var(--ink)', lineHeight: 1 }}>
                      ★ {m / 3}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--coin)', opacity: m < currentMonth ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                    Check-In {m / 3}
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// EXCITEMENT STRIP WIDE
// ——————————————————————————————————————————————————

export function ExcitementStripWide({ position = 0 }) {
  const milestones = [5, 15, 25];
  return (
    <div style={{
      background: 'var(--paper-soft)',
      border: '2px solid var(--ink)',
      boxShadow: '3px 3px 0 var(--ink)',
      padding: '12px 18px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 200 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            Excitement
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: 1, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            {position}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--ink-3)' }}>/ 30</span>
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: 2, border: '1.5px solid var(--ink)', background: 'var(--paper-deep)', marginBottom: 4 }}>
            {Array.from({ length: 30 }, (_, i) => {
              const filled = i < position;
              const isMs = milestones.includes(i + 1);
              return (
                <div key={i} style={{ position: 'relative', height: 24, background: filled ? 'var(--accent)' : 'var(--paper-soft)', borderRight: i === position - 1 ? '2px solid var(--ink)' : 0 }}>
                  {isMs && (
                    <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, background: 'var(--ink)', borderRadius: '50%' }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ position: 'relative', height: 18 }}>
            {[{ at: 5, label: '+coin or card' }, { at: 15, label: '+coin or card' }, { at: 25, label: '+coin or card' }].map(m => (
              <span key={m.at} style={{ position: 'absolute', left: `${((m.at - 0.5) / 30) * 100}%`, transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', color: position >= m.at ? 'var(--accent)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                {m.at} ◆ {m.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'right', minWidth: 100 }}>
          1 gift per excitement<br/>at endgame
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// FEATURED VENDOR ROW
// ——————————————————————————————————————————————————

export function FVR({ cards = [], cardW = 124, selectable = false, selected = -1, onSelect = null, onZoom = null }) {
  return (
    <div style={{
      background: 'var(--paper-soft)',
      border: '2px solid var(--ink)',
      padding: 14,
      boxShadow: '3px 3px 0 var(--ink)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div className="t-eyebrow t-eyebrow-accent">Featured Vendor Row</div>
        <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>
          {cards.filter(Boolean).length} face-up
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start' }}>
        {cards.map((card, i) => (
          card === null ? (
            <div key={i} style={{
              width: cardW,
              height: cardW,
              border: '2px dashed var(--ink-line-2)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}>
              Taken
            </div>
          ) : (
            <div
              key={i}
              onClick={(e) => { if (e.ctrlKey || e.metaKey) return; selectable && onSelect?.(i); }}
              style={{ cursor: selectable ? 'pointer' : 'default', transform: selected === i ? 'translateY(-10px)' : 'none', transition: 'transform 120ms ease' }}
            >
              {card.type === 'venue' ? (
                <VenueCard {...adaptCard(card)} width={cardW} height={cardW} onZoom={onZoom ? () => onZoom({ kind: 'venue', ...adaptCard(card) }) : null} highlight={selected === i} />
              ) : (
                <VendorCard {...adaptCard(card)} width={cardW} height={cardW} onZoom={onZoom ? () => onZoom({ kind: 'vendor', ...adaptCard(card) }) : null} highlight={selected === i} />
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// MOMENTS & AWARDS ROW
// ——————————————————————————————————————————————————

export function MomentsAwardsRow({ moments = [], awards = { race: null, endgame: null }, completedBy = {}, onZoom = null }) {
  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('twp-moments-collapsed');
    return saved !== null ? saved === '1' : false;
  });
  React.useEffect(() => {
    localStorage.setItem('twp-moments-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)' }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', background: 'transparent', border: 0, padding: '10px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', borderBottom: collapsed ? 0 : '2px solid var(--ink)',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
          <span className="t-eyebrow t-eyebrow-accent">Moments &amp; Awards</span>
          <span className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>
            {moments.length} moments · {(awards.race ? 1 : 0) + (awards.endgame ? 1 : 0)} awards
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-2)', display: 'flex', gap: 8, alignItems: 'center' }}>
          {collapsed ? 'Expand' : 'Collapse'}
          <span style={{ display: 'inline-block', width: 14, height: 14, border: '1.5px solid var(--ink-2)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${collapsed ? 0 : 180}deg)`, fontFamily: 'var(--font-mono)', fontSize: 9, transition: 'transform 120ms ease', lineHeight: 1 }}>▾</span>
          </span>
        </span>
      </button>

      {!collapsed && (
        <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {moments.map((m, i) => {
            const flagPattern = Array.from({ length: 9 }, (_, idx) => m.pattern.includes(idx) ? 1 : 0);
            return (
            <div key={i} style={{ position: 'relative' }}>
              <MomentCard
                name={m.name}
                pattern={flagPattern}
                first={m.firstReward ?? m.first ?? 3}
                others={m.othersReward ?? m.others ?? 1}
                difficulty={m.difficulty ?? 'Easy'}
                width={120}
                height={196}
                onZoom={onZoom ? () => onZoom({ kind: 'moment', ...m, pattern: flagPattern }) : null}
              />
              {completedBy[i]?.length > 0 && (
                <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--gift)', color: 'var(--paper)', border: '2px solid var(--ink)', padding: '3px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', boxShadow: '2px 2px 0 var(--ink)' }}>
                  {completedBy[i].join(', ')}
                </div>
              )}
            </div>
          );})}
          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--ink-line-2)', margin: '0 4px' }} />
          {awards.race && (
            <AwardCard
              kind="Race"
              name={awards.race.name}
              condition={awards.race.condition}
              value={awards.race.value ?? 7}
              earnedBy={awards.race.earnedBy}
              width={120}
              height={196}
              onZoom={onZoom ? () => onZoom({ kind: 'award', kindLabel: 'Race', ...awards.race }) : null}
            />
          )}
          {awards.endgame && (
            <AwardCard
              kind="Endgame"
              name={awards.endgame.name}
              condition={awards.endgame.condition}
              value={awards.endgame.value ?? 5}
              width={120}
              height={196}
              onZoom={onZoom ? () => onZoom({ kind: 'award', kindLabel: 'Endgame', ...awards.endgame }) : null}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ——————————————————————————————————————————————————
// HELP DECKS
// ——————————————————————————————————————————————————

export function HelpDecks({ decks = { Money: 3, Effort: 3, Research: 3 } }) {
  const tone = (t) => ({ Money: 'var(--coin)', Effort: 'var(--el-edge)', Research: 'var(--el-nature)' }[t]);
  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: 14, boxShadow: '3px 3px 0 var(--ink)' }}>
      <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 10 }}>Help Decks</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {Object.entries(decks).map(([type, count]) => (
          <div key={type} style={{ border: '2px solid var(--ink)', background: tone(type), color: type === 'Money' ? 'var(--ink)' : 'var(--paper)', padding: '10px 8px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', lineHeight: 1 }}>{type}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: 1, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{count}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7, marginTop: 2 }}>left</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// DECK COLUMN
// ——————————————————————————————————————————————————

export function DeckColumn({ vendorTopCategory = 'Photography', vendorRemaining = 88, venueRemaining = 9 }) {
  return (
    <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: 14, boxShadow: '3px 3px 0 var(--ink)' }}>
      <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 10 }}>Decks</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <VendorDeckTop category={vendorTopCategory} width={96} height={96} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 6, letterSpacing: '0.12em' }}>{vendorRemaining} vendors</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <VenueDeckBack width={96} height={96} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 6, letterSpacing: '0.12em' }}>{venueRemaining} venues</div>
        </div>
      </div>
    </div>
  );
}
