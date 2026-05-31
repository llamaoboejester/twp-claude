import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Modal } from './ActionPanel';
import { ThemeCard } from './Cards';
import { CATEGORY_TONE } from './Icons';
import '../styles.css';

const CI_SCRIM = 'rgba(20, 12, 8, 0.4)';

const CI_GOAL_TYPES = [
  { type: 'Theme', desc: 'Lean into your two theme elements.', kind: 'tier',
    options: [
      { name: 'Unforgettable', value: 30, cond: 'Only your 2 theme elements have any progress.' },
      { name: 'Thematic',      value: 20, cond: 'Your 2 theme elements are the only top 2.' },
      { name: 'Coordinated',   value: 15, cond: 'Both theme elements in the top 2 (ties OK).' },
      { name: 'Subtle',        value: 10, cond: 'At least 1 theme element in the top 2.' },
    ] },
  { type: 'Budget', desc: 'By cost of your booked cards.', kind: 'tier',
    options: [
      { name: 'Extravagant', value: 15, cond: 'Most booked cards cost 3+ coins.' },
      { name: 'Refined',     value: 10, cond: 'Most booked cards cost 2 coins.' },
      { name: 'Modest',      value: 5,  cond: 'Most booked cards cost 1 coin.' },
    ] },
  { type: 'Excitement', desc: 'By excitement of your booked cards.', kind: 'tier',
    options: [
      { name: 'Spectacular', value: 15, cond: 'Most booked cards grant 3+ excitement.' },
      { name: 'Vibrant',     value: 10, cond: 'Most booked cards grant 2 excitement.' },
      { name: 'Intimate',    value: 5,  cond: 'Most booked cards grant 1 excitement.' },
    ] },
  { type: 'Guest', desc: 'Stack one vendor category.', kind: 'category',
    options: [
      { name: 'Admired',    cat: 'Photography' },
      { name: 'Amazed',     cat: 'Flowers & Decorations' },
      { name: 'Captivated', cat: 'Entertainment' },
      { name: 'Honored',    cat: 'Stationery' },
      { name: 'Impressed',  cat: 'Attire & Accessories' },
      { name: 'Indulged',   cat: 'Food & Drink' },
      { name: 'Moved',      cat: 'Ceremony' },
      { name: 'Pampered',   cat: 'Favors & Gifts' },
      { name: 'Spoiled',    cat: 'Transportation' },
    ] },
];

function buildGoalPayload(selType, selOpt) {
  const typeData = CI_GOAL_TYPES[selType];
  const optData = typeData.options[selOpt];
  const goalType = typeData.type.toLowerCase();
  if (typeData.kind === 'category') {
    return { goalType, tier: null, guestCategory: optData.cat };
  }
  return { goalType, tier: optData.name.toLowerCase(), guestCategory: null };
}

// ——————————————————————————————————————————————————
// STEPPER
// ——————————————————————————————————————————————————

function CheckInStepper({ steps, current, onJump }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', background: 'var(--paper-deep)', borderBottom: '2px solid var(--ink)' }}>
      {steps.map((s, i) => {
        const done = s.n < current, active = s.n === current;
        const clickable = done && !!onJump;
        return (
          <React.Fragment key={s.n}>
            <div onClick={clickable ? () => onJump(s.n) : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: clickable ? 'pointer' : 'default' }}>
              <span style={{
                width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', flex: '0 0 auto',
                background: active ? 'var(--accent)' : done ? 'var(--ink)' : 'transparent',
                border: `2px solid ${active ? 'var(--accent)' : done ? 'var(--ink)' : 'var(--ink-line-2)'}`,
                color: (active || done) ? 'var(--paper)' : 'var(--ink-3)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, lineHeight: 1,
              }}>
                {done ? '✓' : s.n}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: active ? 'var(--ink)' : 'var(--ink-3)', fontWeight: active ? 700 : 400 }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 14px', background: s.n < current ? 'var(--ink)' : 'var(--ink-line-2)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ——————————————————————————————————————————————————
// STEP 1 — SET THEME
// ——————————————————————————————————————————————————

function CheckInThemeStep({ number, player, sendAction, stepper }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [hover, setHover] = useState(null);

  const themeCards = player.themeCards || [];
  if (themeCards.length === 0 || themeCards[0]?.hidden) {
    return (
      <Modal title="Set Your Theme" eyebrow={`Check-In ${number} · Step 1 of 2`} width={640} stepper={stepper}>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-3)', padding: '24px 0' }}>
          Loading theme cards…
        </div>
      </Modal>
    );
  }

  function confirm() {
    if (selectedIdx === null) return;
    sendAction({ type: 'CHOOSE_THEME', payload: { themeCardId: themeCards[selectedIdx].id } });
  }

  return (
    <Modal
      title="Set Your Theme"
      eyebrow={`Check-In ${number} · Step 1 of 2`}
      width={640}
      padding={0}
      stepper={stepper}
      footer={
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-3)' }}>
            Public for the rest of the game.
          </span>
          <button
            onClick={confirm}
            disabled={selectedIdx === null}
            style={{ padding: '12px 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--accent)', color: 'var(--paper)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', opacity: selectedIdx === null ? 0.4 : 1, cursor: selectedIdx === null ? 'not-allowed' : 'pointer' }}
          >
            Confirm Theme
          </button>
        </div>
      }
    >
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4, marginBottom: 20 }}>
          Keep 1 of the 2 themes you drew at setup — the other is discarded.
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          {themeCards.map((card, i) => (
            <div
              key={card.id}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setSelectedIdx(i)}
              style={{
                cursor: 'pointer',
                outline: selectedIdx === i ? '4px solid var(--accent)' : 'none',
                outlineOffset: 4,
                transform: hover === i && selectedIdx !== i ? 'translateY(-6px)' : 'none',
                transition: 'transform 120ms ease',
              }}
            >
              <ThemeCard name={card.name} elements={card.elements} width={200} height={240} />
              <div style={{ marginTop: 12, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: selectedIdx === i ? 'var(--accent)' : 'transparent' }}>
                ▼ Selected
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// STEP 2 — SET A GOAL
// ——————————————————————————————————————————————————

function CheckInGoalStep({ number, player, sendAction, stepper, onBack }) {
  const [selType, setSelType] = useState(null);
  const [selOpt, setSelOpt]   = useState(null);

  const alreadySet = new Set((player.goals || []).map(g => g.type));
  const ready = selType !== null && selOpt !== null;

  function confirm() {
    if (!ready) return;
    sendAction({ type: 'SET_GOAL', payload: buildGoalPayload(selType, selOpt) });
  }

  const type = selType !== null ? CI_GOAL_TYPES[selType] : null;

  return (
    <Modal
      title="Set a Goal"
      eyebrow={`Check-In ${number} · Step ${number === 1 ? '2 of 2' : '1 of 1'}`}
      width={840}
      padding={0}
      stepper={stepper}
      footer={
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onBack
            ? <button onClick={onBack} style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--paper-soft)', color: 'var(--ink)', border: '1.5px solid var(--ink)', cursor: 'pointer' }}>← Back to theme</button>
            : <span />
          }
          <button
            onClick={confirm}
            disabled={!ready}
            style={{ padding: '12px 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--accent)', color: 'var(--paper)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', opacity: ready ? 1 : 0.4, cursor: ready ? 'pointer' : 'not-allowed' }}
          >
            Confirm · Begin Q{number + 1}
          </button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '288px 1fr', alignItems: 'stretch', height: 392 }}>

        {/* LEFT — goal type */}
        <div style={{ borderRight: '2px solid var(--ink)', padding: 18, background: 'var(--paper-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>1 · Goal type</div>
          {CI_GOAL_TYPES.map((g, i) => {
            const on = selType === i;
            const disabled = alreadySet.has(g.type.toLowerCase());
            return (
              <div
                key={g.type}
                onClick={() => { if (!disabled) { setSelType(i); setSelOpt(null); } }}
                style={{
                  padding: '11px 13px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  background: on ? 'var(--accent-soft)' : 'var(--paper)',
                  border: `2px solid ${on ? 'var(--accent)' : 'var(--ink)'}`,
                  boxShadow: on ? '3px 3px 0 var(--accent)' : '2px 2px 0 var(--ink)',
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)' }}>{g.type}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, lineHeight: 1.3, color: 'var(--ink-2)', marginTop: 3 }}>{g.desc}</div>
                {disabled && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginTop: 4 }}>Already set</div>}
              </div>
            );
          })}
        </div>

        {/* RIGHT — specific goal */}
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {!type && (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.4 }}>
                Pick a goal type on the left, then choose the specific goal you'll commit to.
              </div>
            </div>
          )}
          {type && (
            <>
              <div className="t-eyebrow" style={{ color: 'var(--ink-3)', marginBottom: 10 }}>2 · Choose your {type.type} goal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0, overflow: 'auto' }}>
                {type.options.map((o, j) => {
                  const on = selOpt === j;
                  if (type.kind === 'category') {
                    return (
                      <div key={o.name} onClick={() => setSelOpt(j)} style={{ display: 'grid', gridTemplateColumns: '16px 1fr', gap: 10, alignItems: 'center', padding: '9px 12px', cursor: 'pointer', background: on ? 'var(--accent-soft)' : 'var(--paper-soft)', border: `2px solid ${on ? 'var(--accent)' : 'var(--ink-line-2)'}` }}>
                        <span style={{ width: 14, height: 14, background: CATEGORY_TONE[o.cat] || 'var(--ink-3)', display: 'block', flex: '0 0 auto' }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)' }}>{o.name}</div>
                          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, lineHeight: 1.3, color: 'var(--ink-2)', marginTop: 2 }}>
                            <strong style={{ color: 'var(--ink)' }}>{o.cat}</strong> — 5 gifts per vendor booked, up to 15.
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={o.name} onClick={() => setSelOpt(j)} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', padding: '9px 12px', cursor: 'pointer', background: on ? 'var(--accent-soft)' : 'var(--paper-soft)', border: `2px solid ${on ? 'var(--accent)' : 'var(--ink-line-2)'}` }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)' }}>{o.name}</div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, lineHeight: 1.3, color: 'var(--ink-2)', marginTop: 2 }}>{o.cond}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--gift)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        +{o.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// MAIN COMPONENT
// ——————————————————————————————————————————————————

export default function CheckIn() {
  const { gameState, playerId, isMyCheckinTurn, sendAction } = useGame();
  if (!gameState || !gameState.checkinState) return null;

  const ci = gameState.checkinState;
  const player = gameState.players[playerId];
  const number = ci.checkInNumber;
  const hasThemeStep = number === 1;

  // When it's not my turn, don't show any modal — let the player study the board
  if (!isMyCheckinTurn) return null;

  const isThemeStep = ci.step === 'theme';
  const isGoalStep  = ci.step === 'goal';

  // Build stepper config
  const steps = hasThemeStep
    ? [{ n: 1, label: 'Set Theme' }, { n: 2, label: 'Set Goal' }]
    : [{ n: 1, label: 'Set Goal' }];
  const stepperCurrent = hasThemeStep ? (isThemeStep ? 1 : 2) : 1;
  const stepper = <CheckInStepper steps={steps} current={stepperCurrent} onJump={null} />;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: CI_SCRIM, display: 'grid', placeItems: 'center', zIndex: 150, padding: 48 }}
      onClick={e => e.stopPropagation()}
    >
      {isThemeStep && (
        <CheckInThemeStep
          number={number}
          player={player}
          sendAction={sendAction}
          stepper={stepper}
        />
      )}
      {isGoalStep && (
        <CheckInGoalStep
          number={number}
          player={player}
          sendAction={sendAction}
          stepper={stepper}
          onBack={null}
        />
      )}
    </div>
  );
}
