import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { WeddingGrid } from './PlayerBoard';
import { VendorCard, VenueCard, CostChip, ExciteBurst } from './Cards';
import { CATEGORY_TONE } from './Icons';
import { TASK_DEFS } from '../data/taskDefs';
import { adaptCard } from './stateAdapters';
import '../styles.css';

const TASK_DEFS_MAP = Object.fromEntries(TASK_DEFS.map(d => [d.id, d]));

export default function ActionPanel() {
  const { gameState, playerId, sendAction, isMyTurn } = useGame();
  if (!gameState || !isMyTurn) return null;

  const player = gameState.players[playerId];
  const { pendingAction } = gameState;

  if (!pendingAction) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(20, 12, 8, 0.65)',
      display: 'grid',
      placeItems: 'center',
      padding: 48,
      zIndex: 100,
    }}>
      <PendingActionResolver pa={pendingAction} player={player} sendAction={sendAction} gameState={gameState} />
    </div>
  );
}

// ——————————————————————————————————————————————————
// MODAL FRAME
// ——————————————————————————————————————————————————

function Modal({ title, eyebrow, children, footer, width = 760, onClose, padding = 28 }) {
  return (
    <div style={{ width, background: 'var(--paper-soft)', border: '3px solid var(--ink)', boxShadow: '10px 10px 0 var(--ink)', maxHeight: '92vh', overflow: 'auto', cursor: 'default' }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '16px 24px', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid var(--ink)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)' }}>{eyebrow}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--paper)', lineHeight: 1, marginTop: 4 }}>{title}</div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'transparent', border: '1.5px solid var(--paper)', color: 'var(--paper)', padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
        )}
      </div>
      <div style={{ padding }}>
        {children}
      </div>
      {footer && (
        <div style={{ padding: '16px 24px', background: 'var(--paper-deep)', borderTop: '2px solid var(--ink)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// ——————————————————————————————————————————————————
// PENDING ACTION ROUTER
// ——————————————————————————————————————————————————

function PendingActionResolver({ pa, player, sendAction, gameState }) {
  switch (pa.type) {
    case 'CHOOSE_RESEARCH_SOURCE':    return <ResearchSource pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_FVR_CARD':           return <FvrPick pa={pa} sendAction={sendAction} gameState={gameState} />;
    case 'CHOOSE_BOOK_TARGET':        return <BookTarget pa={pa} player={player} sendAction={sendAction} gameState={gameState} />;
    case 'CHOOSE_PLAN_EFFORT':        return <PlanEffort key="plan" pa={pa} player={player} sendAction={sendAction} />;
    case 'APPLY_DEFERRED_EFFORT':     return <PlanEffort key={`deferred-${pa._seq}`} pa={{ ...pa, type: 'CHOOSE_PLAN_EFFORT' }} player={player} sendAction={sendAction} deferred />;
    case 'CHOOSE_HELP_DECK':          return <HelpDeck pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_HELP_CHOICE':        return <HelpChoice pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_WILD':               return <WildChoice pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_EXCITEMENT_MILESTONE': return <ExcitementMilestone pa={pa} player={player} sendAction={sendAction} />;
    case 'CHOOSE_BONUS_ANY_ACTION':   return <BonusAnyAction pa={pa} player={player} sendAction={sendAction} />;
    case 'CHOOSE_HAND_DISCARD':       return <HandDiscard pa={pa} player={player} sendAction={sendAction} />;
    default:
      return (
        <Modal title={pa.type} eyebrow="Pending Action" width={480}>
          <div style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>Waiting: {pa.type}</div>
        </Modal>
      );
  }
}

// ——————————————————————————————————————————————————
// RESEARCH SOURCE
// ——————————————————————————————————————————————————

function ResearchSource({ pa, sendAction }) {
  const opts = [
    { key: 'fvr',         label: 'Featured Vendor Row', desc: 'Take 1 face-up card from FVR' },
    { key: 'venue_deck',  label: 'Venue Deck',          desc: 'Draw 2 venue cards' },
    { key: 'vendor_deck', label: 'Vendor Deck',         desc: 'Draw 3 vendor cards' },
  ];
  return (
    <Modal title="Research" eyebrow="Action · Research" width={520}>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-2)', margin: '0 0 20px' }}>Choose your research source.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {opts.map(opt => (
          <button key={opt.key} className="btn btn-secondary" style={{ width: '100%', textAlign: 'left', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}
            onClick={() => sendAction({ type: 'RESEARCH_CHOICE', payload: { source: opt.key } })}>
            <div style={{ fontSize: 14 }}>{opt.label}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>{opt.desc}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// FVR PICK
// ——————————————————————————————————————————————————

function FvrPick({ pa, sendAction, gameState }) {
  const fvr = (gameState?.shared?.fvr || []).filter(Boolean);
  return (
    <Modal title="Take from FVR" eyebrow="Action · Research" width={700}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {fvr.map(card => (
          <MiniCard key={card.id} card={card} onClick={() => sendAction({ type: 'RESEARCH_CHOICE', payload: { source: 'fvr', cardId: card.id } })} />
        ))}
        {fvr.length === 0 && <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>FVR is empty</div>}
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// BOOK TARGET
// ——————————————————————————————————————————————————

const GRID_BONUS = { 0: 'Research', 1: 'Plan', 2: 'Book', 3: 'Help', 4: 'Any', 5: 'Help', 6: 'Book', 7: 'Plan', 8: 'Research' };

function BookTarget({ pa, player, sendAction, gameState }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedPos, setSelectedPos]   = useState(null);
  const [diy, setDiy]                   = useState(false);

  const openMarket = gameState?.shared?.checkin3Event?.effect?.type === 'open_market';
  const fvr = gameState?.shared?.fvr || [];
  const exclusiveVenue = pa.exclusiveVenue || null;

  const card = player.hand.find(c => c.id === selectedCard)
    || fvr.find(c => c.id === selectedCard)
    || (exclusiveVenue?.id === selectedCard ? exclusiveVenue : null);

  const isVenue = card?.type === 'venue';
  const validPositions = pa.positions.filter(pos => isVenue ? pos === 4 : pos !== 4);

  function effectiveCost(c) {
    if (!c) return 0;
    const ev = gameState?.shared?.checkin3Event?.effect;
    if (ev?.type === 'cost_reduction' && c.type === 'vendor' && c.cost >= ev.minCost) return Math.min(c.cost, ev.reduceTo);
    return c.cost;
  }

  const canBook = selectedCard && selectedPos !== null && !(isVenue && diy) && (diy || !card || player.coins >= effectiveCost(card));

  return (
    <Modal title="Book a Card" eyebrow="Action · Book" width={700}
      footer={
        selectedCard && (
          <>
            {!isVenue && (
              <button className="btn btn-ghost" onClick={() => { if (canBook || diy) sendAction({ type: 'BOOK_CARD', payload: { cardId: selectedCard, position: selectedPos, diy: true } }); }} disabled={!selectedPos}>
                DIY for free
              </button>
            )}
            <button className="btn btn-primary" disabled={!canBook} onClick={() => sendAction({ type: 'BOOK_CARD', payload: { cardId: selectedCard, position: selectedPos, diy } })}>
              {diy ? 'Book DIY (free)' : `Book · pay ${effectiveCost(card)} coins`}
            </button>
          </>
        )
      }
    >
      <div style={{ marginBottom: 16 }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Your Hand ({player.hand.length} cards)</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {player.hand.length === 0
            ? <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>No cards</div>
            : player.hand.map(c => (
              <MiniCard key={c.id} card={c} selected={selectedCard === c.id}
                onClick={() => { setSelectedCard(c.id); setSelectedPos(null); setDiy(false); }} />
            ))}
        </div>
      </div>

      {openMarket && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 8, color: 'var(--accent)' }}>Open Market — FVR</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {fvr.map(c => (
              <MiniCard key={c.id} card={c} selected={selectedCard === c.id}
                onClick={() => { setSelectedCard(c.id); setSelectedPos(null); setDiy(false); }} />
            ))}
          </div>
        </div>
      )}

      {exclusiveVenue && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 8, color: 'var(--accent)' }}>Exclusive Venue (Planner)</div>
          <MiniCard card={exclusiveVenue} selected={selectedCard === exclusiveVenue.id}
            onClick={() => { setSelectedCard(exclusiveVenue.id); setSelectedPos(4); setDiy(false); }} />
        </div>
      )}

      {selectedCard && (
        <>
          {!isVenue && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={diy} onChange={e => setDiy(e.target.checked)} />
              Book as DIY (free — no elements, no excitement, no When Booked)
            </label>
          )}

          <div className="section-label" style={{ marginBottom: 8 }}>
            Choose position {isVenue ? '(center only)' : ''}
          </div>
          <div style={{ display: 'inline-block' }}>
            <WeddingGrid
              cells={player.grid}
              cellSize={100}
              showBonusLabels
              highlightTargets={validPositions}
              onCellClick={(pos) => { if (validPositions.includes(pos)) setSelectedPos(pos); }}
            />
          </div>

          {selectedPos !== null && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--paper-deep)', border: '1.5px solid var(--ink-line-2)', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-2)' }}>
              Cell {selectedPos + 1} · Bonus: <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{GRID_BONUS[selectedPos]}</strong>
              {!diy && card && player.coins < effectiveCost(card) && (
                <span style={{ color: 'var(--accent)', marginLeft: 12 }}>Not enough coins (have {player.coins}, need {effectiveCost(card)})</span>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// PLAN EFFORT
// ——————————————————————————————————————————————————

const PLAN_SECTIONS = ['getting_started', 'making_it_yours', 'putting_together', 'locking_in'];
const PLAN_SECTION_LABELS = {
  getting_started:  'Getting Started',
  making_it_yours:  'Making It Yours',
  putting_together: 'Putting It Together',
  locking_in:       'Locking It In',
};

// Tasks that fire an excitement bonus when a specific effort slot is filled.
const TASK_HOOKS = {
  task_website:       { 1: '+1 exc' },
  task_wedding_party: { 3: '+1 exc' },
  task_tastings:      { 3: '+1 exc' },
  task_guest_list:    { 4: '+1 exc' },
  task_save_dates:    { 2: '+1 exc' },
  task_invitations:   { 2: '+1 exc' },
};

const PLAN_MILESTONES = [
  { at: 4, reward: '+1 effort' }, { at: 8, reward: '+1 effort' },
  { at: 10, reward: '+1 exc' },   { at: 12, reward: '+1 effort' },
  { at: 16, reward: '+1 effort' }, { at: 20, reward: '+5 gifts' },
];

function lockReasonStr(def) {
  for (const cond of def.lockConditions) {
    if (cond.type === 'month_min') return `Available month ${cond.month}`;
    if (cond.type === 'venue_booked') return 'Need venue booked';
    if (cond.type === 'vendor_booked') return `Need ${cond.category} booked`;
    if (cond.type === 'task_completed') {
      const dep = TASK_DEFS_MAP[cond.taskId];
      return `Complete "${dep?.name || cond.taskId}" first`;
    }
  }
  return '';
}

// Single clickable effort box.
function PlanEffortBox({ state, onClick }) {
  const bg = state === 'base' ? 'var(--ink)' : state === 'new' ? 'var(--accent)' : 'var(--paper-soft)';
  const border = state === 'new' ? 'var(--accent-deep)' : 'var(--ink)';
  const interactive = state === 'next' || state === 'new';
  return (
    <span
      onClick={interactive ? onClick : undefined}
      style={{
        width: 18, height: 18,
        background: bg,
        border: `1.5px solid ${border}`,
        flex: '0 0 auto',
        cursor: interactive ? 'pointer' : 'default',
        position: 'relative',
        boxShadow: state === 'next' ? 'inset 0 0 0 2px var(--accent-soft)' : 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 80ms ease',
      }}
    >
      {state === 'next' && (
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>+</span>
      )}
    </span>
  );
}

// One task row with click-to-fill effort boxes.
function PlanTaskRow({ def, ws, added, canAdd, onSetAdded, isLocked, starredOnly }) {
  const baseFilled = ws?.completed ? def.effortRequired : (ws?.effortApplied || 0);
  const completedAlready = !!ws?.completed;
  const willComplete = !completedAlready && (baseFilled + added) >= def.effortRequired;
  const isDisabled = isLocked || completedAlready || (starredOnly && !def.starred);

  const clickBox = (i) => {
    if (isDisabled) return;
    if (i === baseFilled + added && canAdd) {
      onSetAdded(added + 1);
    } else if (i >= baseFilled && i < baseFilled + added) {
      onSetAdded(i - baseFilled);
    }
  };

  const boxState = (i) => {
    if (i < baseFilled) return 'base';
    if (i < baseFilled + added) return 'new';
    if (i === baseFilled + added && !isDisabled) return canAdd ? 'next' : 'empty';
    return 'empty';
  };

  const lockReason = isLocked ? lockReasonStr(def) : '';
  const hooks = TASK_HOOKS[def.id];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '16px 1fr auto auto',
      gap: 10, alignItems: 'center',
      padding: '7px 6px',
      background: willComplete ? 'var(--accent-soft)' : (completedAlready ? 'var(--paper-deep)' : 'transparent'),
      opacity: isDisabled ? 0.45 : 1,
      borderBottom: '1px solid var(--ink-line-2)',
    }}>
      <span style={{ width: 16, display: 'grid', placeItems: 'center' }}>
        {isLocked && <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>🔒</span>}
        {!isLocked && completedAlready && <span style={{ color: 'var(--gift)', fontSize: 13 }}>✓</span>}
        {!isLocked && !completedAlready && def.key && (
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>★</span>
        )}
      </span>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.2, color: isLocked ? 'var(--ink-3)' : 'var(--ink)', textDecoration: completedAlready ? 'line-through' : 'none' }}>
          {def.name}{def.starred && !def.key ? '★' : ''}
        </div>
        {(lockReason || hooks) && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.08em', color: isLocked ? 'var(--warning)' : 'var(--ink-3)', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {lockReason && <span>{lockReason}</span>}
            {hooks && Object.entries(hooks).map(([slot, rw]) => (
              <span key={slot} style={{ color: 'var(--accent)' }}>SLOT {slot}: {rw}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: def.effortRequired }, (_, i) => (
          <PlanEffortBox key={i} state={completedAlready ? 'base' : boxState(i)} onClick={() => clickBox(i)} />
        ))}
      </div>

      <div style={{ width: 30, textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: (willComplete || completedAlready) ? 'var(--gift)' : 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
        +{def.gifts}
      </div>
    </div>
  );
}

function PlanEffort({ pa, player, sendAction, deferred }) {
  const [added, setAdded] = useState({});
  const maxEffort = pa.effortAmount;
  const unlocked = new Set(pa.unlockedTasks || []);
  const spent = Object.values(added).reduce((a, b) => a + b, 0);
  const remaining = maxEffort - spent;

  const setTaskAdded = (taskId, val) => {
    setAdded(prev => {
      const next = { ...prev };
      if (val <= 0) delete next[taskId]; else next[taskId] = val;
      return next;
    });
  };

  const consequences = React.useMemo(() => {
    let gifts = 0;
    const completing = [];
    const hooks = [];
    Object.entries(added).forEach(([taskId, add]) => {
      if (!add) return;
      const def = TASK_DEFS_MAP[taskId];
      const ws = player.taskWorksheet?.[taskId];
      if (!def) return;
      const base = ws?.effortApplied || 0;
      const newFilled = base + add;
      const taskHooks = TASK_HOOKS[taskId];
      if (taskHooks) {
        Object.entries(taskHooks).forEach(([slot, rw]) => {
          const s = Number(slot);
          if (newFilled >= s && base < s) hooks.push({ name: def.name, slot: s, reward: rw });
        });
      }
      if (newFilled >= def.effortRequired && !ws?.completed) {
        completing.push({ name: def.name, gift: def.gifts });
        gifts += def.gifts;
      }
    });
    const startCompleted = player.completedTasksCount || 0;
    const endCompleted = startCompleted + completing.length;
    const crossed = PLAN_MILESTONES.filter(m => m.at > startCompleted && m.at <= endCompleted);
    return { gifts, completing, hooks, startCompleted, endCompleted, crossed };
  }, [added, player]);

  function submit() {
    const filtered = Object.fromEntries(Object.entries(added).filter(([, v]) => v > 0));
    sendAction({ type: deferred ? 'APPLY_DEFERRED_EFFORT' : 'PLAN_EFFORT', payload: { assignments: filtered } });
  }

  const eyebrow = deferred
    ? `Deferred effort${pa.starredOnly ? ' · Starred tasks only' : ''}`
    : 'Action · Plan';
  const title = `Apply ${maxEffort} Effort`;

  return (
    <Modal title={title} eyebrow={eyebrow} width={1000} padding={0}
      footer={
        <>
          <button onClick={() => setAdded({})} style={{ padding: '10px 18px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--paper-soft)', color: 'var(--ink)', border: '1.5px solid var(--ink)', cursor: 'pointer' }}>
            Reset
          </button>
          <button className="btn btn-primary" disabled={spent === 0} onClick={submit}>
            Confirm Plan · spend {spent} effort
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', alignItems: 'stretch' }}>

        {/* LEFT: interactive worksheet */}
        <div style={{ borderRight: '2px solid var(--ink)' }}>
          <div style={{ padding: '12px 20px', background: 'var(--paper-deep)', borderBottom: '2px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Click an effort box to assign · ★ = key task</div>
            <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Gifts on completion →</div>
          </div>
          <div style={{ maxHeight: '60vh', overflow: 'auto', padding: '4px 20px 16px' }}>
            {PLAN_SECTIONS.map(section => {
              const defs = TASK_DEFS.filter(d => d.section === section);
              return (
                <div key={section} style={{ marginBottom: 6 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', padding: '12px 4px 4px', borderBottom: '2px solid var(--ink)', marginBottom: 2, position: 'sticky', top: 0, background: 'var(--paper-soft)', zIndex: 1 }}>
                    {PLAN_SECTION_LABELS[section]}
                  </div>
                  {defs.map(def => {
                    const ws = player.taskWorksheet?.[def.id];
                    const isLocked = !unlocked.has(def.id) && !ws?.completed;
                    const taskAdded = added[def.id] || 0;
                    const baseFilled = ws?.completed ? def.effortRequired : (ws?.effortApplied || 0);
                    const maxForTask = def.effortRequired - baseFilled;
                    const canAdd = remaining > 0 && !isLocked && !ws?.completed && taskAdded < maxForTask;
                    return (
                      <PlanTaskRow
                        key={def.id}
                        def={def}
                        ws={ws}
                        added={taskAdded}
                        canAdd={canAdd}
                        isLocked={isLocked}
                        starredOnly={deferred && pa.starredOnly}
                        onSetAdded={(v) => setTaskAdded(def.id, v)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: live "this turn" rail */}
        <div style={{ background: 'var(--paper-soft)', display: 'flex', flexDirection: 'column' }}>

          {/* effort budget */}
          <div style={{ padding: '18px 20px', borderBottom: '2px solid var(--ink)', background: 'var(--ink)' }}>
            <div className="t-eyebrow" style={{ color: 'var(--coin)', marginBottom: 10 }}>Effort this turn</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {Array.from({ length: maxEffort }, (_, i) => (
                <span key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--coin)', background: i < spent ? 'var(--accent)' : 'transparent', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: i < spent ? 'var(--paper)' : 'var(--coin)', transition: 'background 100ms ease' }}>
                  {i < spent ? '✓' : i + 1}
                </span>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--paper)' }}>
              {remaining > 0
                ? <><strong style={{ color: 'var(--coin)' }}>{remaining}</strong> effort left to assign</>
                : <span style={{ color: 'var(--coin)' }}>All effort assigned</span>}
            </div>
          </div>

          {/* consequences */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>

            {spent === 0 && (
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.35 }}>
                Assign your effort on the left. The results of this turn will tally here.
              </div>
            )}

            {consequences.completing.length > 0 && (
              <div>
                <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 8 }}>Completing ({consequences.completing.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {consequences.completing.map(c => (
                    <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 8px', background: 'var(--paper-deep)', border: '1px solid var(--ink-line-2)' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink)' }}>{c.name}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--gift)' }}>+{c.gift}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {consequences.hooks.length > 0 && (
              <div>
                <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 8 }}>Hooks fired</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {consequences.hooks.map((h, i) => (
                    <div key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'var(--ink-2)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{h.name} · slot {h.slot}</span>
                      <strong style={{ color: 'var(--accent)' }}>{h.reward}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {consequences.crossed.length > 0 && (
              <div>
                <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 8 }}>Tracker milestones</div>
                {consequences.crossed.map(m => (
                  <div key={m.at} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'var(--ink-2)' }}>
                    <span>Reach {m.at} completed</span>
                    <strong style={{ color: 'var(--accent)' }}>{m.reward}</strong>
                  </div>
                ))}
              </div>
            )}

            <div style={{ flex: 1 }} />

            <div style={{ borderTop: '2px solid var(--ink)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Gifts gained</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--gift)', fontVariantNumeric: 'tabular-nums' }}>+{consequences.gifts}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Completed tasks</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                  {consequences.startCompleted}
                  <span style={{ color: 'var(--ink-3)' }}> → </span>
                  <span style={{ color: consequences.endCompleted > consequences.startCompleted ? 'var(--accent)' : 'var(--ink)' }}>{consequences.endCompleted}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-3)' }}> /28</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// HELP DECK
// ——————————————————————————————————————————————————

function HelpDeck({ pa, sendAction }) {
  const tone = (t) => ({ money: 'var(--coin)', effort: 'var(--el-edge)', research: 'var(--el-nature)' }[t]);
  return (
    <Modal title="Choose a Help Deck" eyebrow="Action · Help" width={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pa.available.map(deck => (
          <button key={deck} onClick={() => sendAction({ type: 'HELP_CHOOSE_DECK', payload: { deck } })}
            style={{ padding: '16px 20px', background: tone(deck), color: deck === 'money' ? 'var(--ink)' : 'var(--paper)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {deck.charAt(0).toUpperCase() + deck.slice(1)}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// HELP CHOICE
// ——————————————————————————————————————————————————

function HelpChoice({ pa, sendAction }) {
  const card = pa.card;
  return (
    <Modal title={card.name} eyebrow="Help Card · Choose Option" width={560}>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)', marginBottom: 20 }}>Choose one option:</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button className="btn btn-primary" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}
          onClick={() => sendAction({ type: 'HELP_RESOLVE_CHOICE', payload: { choice: 'A' } })}>
          <div style={{ fontSize: 14 }}>Option A</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: 0, textTransform: 'none', opacity: 0.85 }}>{describeEffect(card.choiceA)}</div>
        </button>
        <button className="btn btn-secondary" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}
          onClick={() => sendAction({ type: 'HELP_RESOLVE_CHOICE', payload: { choice: 'B' } })}>
          <div style={{ fontSize: 14 }}>Option B</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'var(--ink-2)' }}>{describeEffect(card.choiceB)}</div>
        </button>
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// WILD CHOICE
// ——————————————————————————————————————————————————

function WildChoice({ pa, sendAction }) {
  return (
    <Modal title="Choose Your Wild" eyebrow="Card Triggered · Wild Element" width={580}>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-2)', margin: '0 0 24px' }}>
        Your booking triggered a Wild element. Pick any one of the five to advance by 1.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {['whimsy', 'edge', 'nature', 'tradition', 'elegance'].map(el => (
          <button key={el} onClick={() => sendAction({ type: 'RESOLVE_WILD', payload: { element: el } })}
            style={{ padding: 16, background: `var(--el-${el})`, color: el === 'elegance' ? 'var(--ink)' : 'var(--paper)', border: '2px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <img src={`/icons/source/${el}.png`} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--ink)' }} alt="" />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{el}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// EXCITEMENT MILESTONE
// ——————————————————————————————————————————————————

function ExcitementMilestone({ pa, player, sendAction }) {
  const choices = [
    { key: 'coin',        label: 'Gain 1 Coin',        available: true },
    { key: 'vendor_card', label: 'Draw 1 Vendor Card', available: true },
    { key: 'venue_card',  label: 'Draw 1 Venue Card',  available: !pa.venueDeckEmpty },
    { key: 'fvr_card',    label: 'Take from FVR',       available: !!pa.canFvr && !pa.fvrEmpty },
  ].filter(c => c.available);
  return (
    <Modal title={`Excitement Milestone`} eyebrow={`Position ${pa.position} · Choose Reward`} width={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {choices.map(c => (
          <button key={c.key} className="btn btn-secondary" style={{ width: '100%', padding: '14px 16px', textAlign: 'left', fontSize: 14 }}
            onClick={() => sendAction({ type: 'EXCITEMENT_MILESTONE_CHOICE', payload: { choice: c.key } })}>
            {c.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// BONUS ANY ACTION
// ——————————————————————————————————————————————————

function BonusAnyAction({ pa, player, sendAction }) {
  return (
    <Modal title="Bonus: Any Action" eyebrow="Grid Bonus · Meeple Does Not Move" width={480}>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)', marginBottom: 20 }}>Choose a bonus action:</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {pa.choices.map(a => (
          <button key={a} className="btn btn-secondary" style={{ padding: '14px 12px', fontSize: 14 }}
            onClick={() => sendAction({ type: 'RESOLVE_BONUS_ANY_ACTION', payload: { choice: a } })}>
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// HAND DISCARD
// ——————————————————————————————————————————————————

function HandDiscard({ pa, player, sendAction }) {
  const [selected, setSelected] = useState([]);

  function toggle(cardId) {
    setSelected(s => s.includes(cardId) ? s.filter(x => x !== cardId) : [...s, cardId]);
  }

  const selectedVenueCount = selected.filter(id => player.hand.find(c => c.id === id)?.type === 'venue').length;
  const venueConstraintMet = selectedVenueCount >= (pa.mustDiscardVenues || 0);
  const canSubmit = selected.length === pa.required && venueConstraintMet;

  return (
    <Modal title={`Discard ${pa.required} Card(s)`} eyebrow="Hand Limit · Choose to Discard" width={700}
      footer={
        <button className="btn btn-warn" disabled={!canSubmit} onClick={() => sendAction({ type: 'HAND_DISCARD', payload: { cardIds: selected } })}>
          Discard {selected.length} Card(s)
        </button>
      }
    >
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)', marginBottom: 8 }}>
        Select {pa.required} card(s) to discard. Selected: {selected.length}/{pa.required}
      </p>
      {pa.mustDiscardVenues > 0 && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: venueConstraintMet ? 'var(--ink-3)' : 'var(--accent)', marginBottom: 14 }}>
          Must include at least {pa.mustDiscardVenues} venue card(s) — {selectedVenueCount} selected
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {player.hand.map(c => (
          <MiniCard key={c.id} card={c} selected={selected.includes(c.id)} onClick={() => toggle(c.id)} />
        ))}
      </div>
    </Modal>
  );
}

// ——————————————————————————————————————————————————
// MINI CARD — compact card button used in modals
// ——————————————————————————————————————————————————

function MiniCard({ card, selected = false, onClick }) {
  const adapted = adaptCard(card);
  const isVenue = card.type === 'venue';
  const catTone = card.category ? (CATEGORY_TONE[card.category] || 'var(--ink-3)') : 'var(--ink-3)';
  return (
    <div
      onClick={onClick}
      style={{
        width: 120,
        background: 'var(--paper-soft)',
        border: selected ? '2.5px solid var(--accent)' : '2px solid var(--ink)',
        boxShadow: selected ? '4px 4px 0 var(--accent)' : '2px 2px 0 var(--ink)',
        cursor: 'pointer',
        padding: '8px 10px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        userSelect: 'none',
        transform: selected ? 'translateY(-4px)' : 'none',
        transition: 'transform 80ms ease, box-shadow 80ms ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ background: 'var(--coin)', border: '1.5px solid var(--ink)', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--ink)' }}>{card.cost}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.12em' }}>+{card.excitement}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, lineHeight: 1.1, color: 'var(--ink)' }}>{card.name}</div>
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {adapted.elements.map((el, i) => (
          <span key={i} style={{ width: 10, height: 10, background: `var(--el-${el})`, border: '1px solid var(--ink)', borderRadius: '50%', display: 'inline-block' }} />
        ))}
      </div>
      <div style={{ height: 18, background: isVenue ? 'var(--ink)' : catTone, color: 'var(--paper)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto', marginLeft: -10, marginRight: -10, borderTop: '1.5px solid var(--ink)' }}>
        {isVenue ? 'Venue' : card.category}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————————
// HAND CARD (exported for external use)
// ——————————————————————————————————————————————————

export function HandCard({ card, selectable, selected, onClick }) {
  return <MiniCard card={card} selected={selected} onClick={selectable ? onClick : undefined} />;
}

// ——————————————————————————————————————————————————
// HELPERS
// ——————————————————————————————————————————————————

function describeEffect(effect) {
  if (!effect) return '—';
  switch (effect.type) {
    case 'gain_coins':   return `+${effect.amount} coins`;
    case 'gain_gifts':   return `+${effect.amount} gifts`;
    case 'gain_cards':   return `Draw ${effect.count} ${effect.deckType} card(s)`;
    case 'apply_effort': return `+${effect.amount} effort${effect.restriction ? ' (starred tasks)' : ''}`;
    case 'gain_fvr_card':return 'Take 1 card from FVR';
    default: return effect.type;
  }
}
