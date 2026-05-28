import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import VendorGrid from './VendorGrid';
import '../styles.css';

const ELEMENTS = ['whimsy', 'edge', 'nature', 'tradition', 'elegance'];
const ELEMENT_ICONS = { whimsy: '🌀', edge: '⚡', nature: '🌿', tradition: '💍', elegance: '💎' };

export default function ActionPanel() {
  const { gameState, playerId, sendAction, isMyTurn } = useGame();
  if (!gameState || !isMyTurn) return null;

  const player = gameState.players[playerId];
  const { pendingAction } = gameState;

  if (pendingAction) return <PendingActionResolver pa={pendingAction} player={player} />;

  return <MainActionSelect player={player} gameState={gameState} sendAction={sendAction} />;
}

// ── Main action selection ───────────────────────────────────────────────────

function MainActionSelect({ player, gameState, sendAction }) {
  const ACTIONS = [
    { id: 'research', label: 'Research', desc: 'Draw cards or take from FVR', icon: '🔍' },
    { id: 'book',     label: 'Book',     desc: 'Play a card to your grid',   icon: '📋' },
    { id: 'plan',     label: 'Plan',     desc: 'Apply 3 effort to tasks',    icon: '📝' },
    { id: 'help',     label: 'Help',     desc: 'Draw from a help deck',      icon: '🤝' },
  ];

  const canHelp = player.helpers.length < 3;

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <span className="section-label">Choose Action</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 8 }}>
          Meeple is on: <strong>{player.meeplePosition}</strong>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {ACTIONS.map(a => {
          const isCurrentMeeple = player.meeplePosition === a.id;
          const disabled = isCurrentMeeple || (a.id === 'help' && !canHelp);
          return (
            <button
              key={a.id}
              className="btn btn-secondary"
              style={{
                padding: 12, textAlign: 'left', opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: `1px solid ${isCurrentMeeple ? 'var(--accent)' : 'var(--border)'}`,
              }}
              disabled={disabled}
              onClick={() => sendAction({ type: 'SELECT_ACTION', payload: { action: a.id } })}
            >
              <div style={{ fontSize: 20 }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.desc}</div>
              {isCurrentMeeple && <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2 }}>Meeple here — must move</div>}
              {a.id === 'help' && !canHelp && <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>All slots filled</div>}
            </button>
          );
        })}
      </div>

      {/* Wedding Planner contract button */}
      {gameState.modules.weddingPlanners && player.plannerContract && !player.plannerContracted && (
        <div style={{ marginTop: 12 }}>
          <button
            className="btn btn-warn"
            style={{ width: '100%' }}
            disabled={player.coins < 3 || player.diyCount >= 2}
            onClick={() => sendAction({ type: 'CONTRACT_PLANNER', payload: {} })}
          >
            Contract Wedding Planner — 3¢
            {player.diyCount >= 2 && ' (blocked: 2+ DIY bookings)'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Pending action resolvers ────────────────────────────────────────────────

function PendingActionResolver({ pa, player }) {
  const { sendAction } = useGame();

  switch (pa.type) {
    case 'CHOOSE_RESEARCH_SOURCE':    return <ResearchSource pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_FVR_CARD':           return <FvrPick pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_BOOK_TARGET':        return <BookTarget pa={pa} player={player} sendAction={sendAction} />;
    case 'CHOOSE_PLAN_EFFORT':        return <PlanEffort pa={pa} player={player} sendAction={sendAction} />;
    case 'APPLY_DEFERRED_EFFORT':     return <PlanEffort pa={{ ...pa, type: 'CHOOSE_PLAN_EFFORT' }} player={player} sendAction={sendAction} deferred />;
    case 'CHOOSE_HELP_DECK':          return <HelpDeck pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_HELP_CHOICE':        return <HelpChoice pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_WILD':               return <WildChoice pa={pa} sendAction={sendAction} />;
    case 'CHOOSE_EXCITEMENT_MILESTONE': return <ExcitementMilestone pa={pa} player={player} sendAction={sendAction} />;
    case 'CHOOSE_BONUS_ANY_ACTION':   return <BonusAnyAction pa={pa} player={player} sendAction={sendAction} />;
    case 'CHOOSE_HAND_DISCARD':       return <HandDiscard pa={pa} player={player} sendAction={sendAction} />;
    default:
      return (
        <div style={{ padding: 16, color: 'var(--text-dim)', fontSize: 13 }}>
          Waiting: {pa.type}
        </div>
      );
  }
}

function ResearchSource({ pa, sendAction }) {
  return (
    <PanelWrapper title="Research — Choose Source" icon="🔍">
      {[
        { key: 'fvr',         label: 'Featured Vendor Row', desc: 'Take 1 face-up card from FVR' },
        { key: 'venue_deck',  label: 'Venue Deck',          desc: 'Draw 2 venue cards' },
        { key: 'vendor_deck', label: 'Vendor Deck',         desc: 'Draw 3 vendor cards' },
      ].map(opt => (
        <button key={opt.key} className="btn btn-secondary"
          style={{ width: '100%', textAlign: 'left', marginBottom: 6 }}
          onClick={() => sendAction({ type: 'RESEARCH_CHOICE', payload: { source: opt.key } })}>
          <strong>{opt.label}</strong>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 8 }}>{opt.desc}</span>
        </button>
      ))}
    </PanelWrapper>
  );
}

function FvrPick({ pa, sendAction }) {
  const { gameState } = useGame();
  const fvr = gameState?.shared?.fvr || [];
  return (
    <PanelWrapper title="Take a card from FVR" icon="🔍">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {fvr.map(card => (
          <HandCard key={card.id} card={card} selectable
            onClick={() => sendAction({ type: 'RESEARCH_CHOICE', payload: { source: 'fvr', cardId: card.id } })} />
        ))}
        {fvr.length === 0 && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>FVR is empty</span>}
      </div>
    </PanelWrapper>
  );
}

function BookTarget({ pa, player, sendAction }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedPos, setSelectedPos]   = useState(null);
  const [diy, setDiy]                   = useState(false);
  const { gameState } = useGame();

  // For Open Market event: can also pick from FVR
  const openMarket = gameState?.shared?.checkin3Event?.effect?.type === 'open_market';

  const card = player.hand.find(c => c.id === selectedCard);
  const isVenue = card?.type === 'venue';
  const validPositions = pa.positions.filter(pos => {
    if (isVenue) return pos === 4;
    return pos !== 4;
  });

  function canBook() {
    if (!selectedCard || selectedPos === null) return false;
    if (isVenue && diy) return false;
    if (!diy && card && player.coins < card.cost) return false;
    return true;
  }

  return (
    <PanelWrapper title="Book a Card" icon="📋">
      <div style={{ marginBottom: 8 }}>
        <div className="section-label">Your Hand ({player.hand.length} cards)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {player.hand.map(c => (
            <HandCard key={c.id} card={c} selectable
              selected={selectedCard === c.id}
              onClick={() => { setSelectedCard(c.id); setSelectedPos(null); setDiy(false); }} />
          ))}
        </div>
      </div>

      {selectedCard && (
        <>
          {/* DIY toggle (vendors only) */}
          {!isVenue && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
              <input type="checkbox" checked={diy} onChange={e => setDiy(e.target.checked)} />
              Book as DIY (free — no elements, no excitement, no When Booked)
            </label>
          )}

          <div style={{ marginBottom: 8 }}>
            <div className="section-label">
              Choose Position {isVenue ? '(center only)' : ''}
            </div>
            <VendorGrid
              grid={player.grid}
              isOwn={true}
              onSelectPosition={pos => {
                if (validPositions.includes(pos)) setSelectedPos(pos);
              }}
              selectedPosition={selectedPos}
              highlightPositions={validPositions}
            />
          </div>

          {!diy && card && player.coins < card.cost && (
            <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 8 }}>
              Not enough coins (have {player.coins}, need {card.cost})
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={!canBook()}
            onClick={() => sendAction({ type: 'BOOK_CARD', payload: { cardId: selectedCard, position: selectedPos, diy } })}
          >
            {diy ? 'Book DIY (free)' : `Book for ${card?.cost || 0}¢`}
          </button>
        </>
      )}
    </PanelWrapper>
  );
}

function PlanEffort({ pa, player, sendAction, deferred }) {
  const [assignments, setAssignments] = useState({});
  const { gameState } = useGame();
  const maxEffort = pa.effortAmount;
  const totalAssigned = Object.values(assignments).reduce((a, b) => a + b, 0);
  const remaining = maxEffort - totalAssigned;

  const TASK_DEFS_MAP = buildTaskDefsMap();

  function assign(taskId, delta) {
    const current = assignments[taskId] || 0;
    const taskDef = TASK_DEFS_MAP[taskId];
    if (!taskDef) return;
    const ws = player.taskWorksheet[taskId];
    if (!ws) return;
    const maxForTask = taskDef.effortRequired - ws.effortApplied;
    const newVal = Math.max(0, Math.min(current + delta, maxForTask, remaining + current));
    setAssignments(a => ({ ...a, [taskId]: newVal }));
  }

  function submit() {
    const filtered = Object.fromEntries(Object.entries(assignments).filter(([, v]) => v > 0));
    sendAction({
      type: deferred ? 'APPLY_DEFERRED_EFFORT' : 'PLAN_EFFORT',
      payload: { assignments: filtered },
    });
  }

  const unlocked = pa.unlockedTasks || [];

  return (
    <PanelWrapper title={deferred ? `Apply ${maxEffort} Effort (from reward)` : `Plan — Apply ${maxEffort} Effort`} icon="📝">
      <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--text-dim)' }}>
        Remaining: <strong style={{ color: remaining > 0 ? 'var(--success)' : 'var(--text-dim)' }}>{remaining}</strong>
      </div>
      <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {unlocked.map(taskId => {
          const def = TASK_DEFS_MAP[taskId];
          if (!def) return null;
          const ws = player.taskWorksheet[taskId];
          const assigned = assignments[taskId] || 0;
          const maxForTask = def.effortRequired - (ws?.effortApplied || 0);
          return (
            <div key={taskId} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderRadius: 6, background: 'var(--surface2)',
            }}>
              <div style={{ flex: 1, fontSize: 12 }}>
                {def.key && <span className="badge" style={{ background: '#ff980020', color: '#ff9800', fontSize: 9, marginRight: 4 }}>KEY</span>}
                {def.name}
                <span style={{ color: 'var(--text-dim)', marginLeft: 4 }}>
                  ({ws?.effortApplied || 0}/{def.effortRequired})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button className="btn btn-ghost" style={{ padding: '2px 8px' }}
                  onClick={() => assign(taskId, -1)} disabled={assigned === 0}>−</button>
                <span style={{ minWidth: 16, textAlign: 'center', fontWeight: 700 }}>{assigned}</span>
                <button className="btn btn-ghost" style={{ padding: '2px 8px' }}
                  onClick={() => assign(taskId, 1)} disabled={remaining === 0 || assigned >= maxForTask}>+</button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }}
        disabled={totalAssigned === 0}
        onClick={submit}>
        Apply {totalAssigned} Effort
      </button>
    </PanelWrapper>
  );
}

function HelpDeck({ pa, sendAction }) {
  return (
    <PanelWrapper title="Help — Choose Deck" icon="🤝">
      {pa.available.map(deck => (
        <button key={deck} className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 6, textAlign: 'left', padding: '10px 12px' }}
          onClick={() => sendAction({ type: 'HELP_CHOOSE_DECK', payload: { deck } })}>
          <strong style={{ textTransform: 'capitalize' }}>{deck}</strong>
        </button>
      ))}
    </PanelWrapper>
  );
}

function HelpChoice({ pa, sendAction }) {
  const card = pa.card;
  return (
    <PanelWrapper title={`Help Card: ${card.name}`} icon="🤝">
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>Choose one option:</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }}
          onClick={() => sendAction({ type: 'HELP_RESOLVE_CHOICE', payload: { choice: 'A' } })}>
          <div style={{ fontWeight: 700 }}>Option A</div>
          <div style={{ fontSize: 11 }}>{describeEffect(card.choiceA)}</div>
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }}
          onClick={() => sendAction({ type: 'HELP_RESOLVE_CHOICE', payload: { choice: 'B' } })}>
          <div style={{ fontWeight: 700 }}>Option B</div>
          <div style={{ fontSize: 11 }}>{describeEffect(card.choiceB)}</div>
        </button>
      </div>
    </PanelWrapper>
  );
}

function WildChoice({ pa, sendAction }) {
  return (
    <PanelWrapper title="Wild Icon — Choose Element" icon="★">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ELEMENTS.map(el => (
          <button key={el} className={`btn element-${el}`}
            style={{ border: '1px solid', padding: '8px 14px', flex: '1 1 calc(50% - 3px)' }}
            onClick={() => sendAction({ type: 'RESOLVE_WILD', payload: { element: el } })}>
            {ELEMENT_ICONS[el]} {el.charAt(0).toUpperCase() + el.slice(1)}
          </button>
        ))}
      </div>
    </PanelWrapper>
  );
}

function ExcitementMilestone({ pa, player, sendAction }) {
  const choices = [
    { key: 'coin',        label: 'Gain 1 Coin',         available: true },
    { key: 'vendor_card', label: 'Draw 1 Vendor Card',  available: true },
    { key: 'venue_card',  label: 'Draw 1 Venue Card',   available: true },
    { key: 'fvr_card',    label: 'Take from FVR',        available: !!pa.canFvr },
  ];
  return (
    <PanelWrapper title={`Excitement Milestone — Position ${pa.position}`} icon="✨">
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10 }}>Choose a reward:</p>
      {choices.filter(c => c.available).map(c => (
        <button key={c.key} className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 6, textAlign: 'left' }}
          onClick={() => sendAction({ type: 'EXCITEMENT_MILESTONE_CHOICE', payload: { choice: c.key } })}>
          {c.label}
        </button>
      ))}
    </PanelWrapper>
  );
}

function BonusAnyAction({ pa, player, sendAction }) {
  const ACTION_ICONS = { research: '🔍', book: '📋', plan: '📝', help: '🤝' };
  return (
    <PanelWrapper title="Bonus: Any Action" icon="⭐">
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10 }}>
        Choose a bonus action (meeple does not move):
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {pa.choices.map(a => (
          <button key={a} className="btn btn-secondary"
            style={{ padding: '10px 12px' }}
            onClick={() => sendAction({ type: 'RESOLVE_BONUS_ANY_ACTION', payload: { choice: a } })}>
            {ACTION_ICONS[a]} {a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>
    </PanelWrapper>
  );
}

function HandDiscard({ pa, player, sendAction }) {
  const [selected, setSelected] = useState([]);

  function toggle(cardId) {
    setSelected(s => s.includes(cardId) ? s.filter(x => x !== cardId) : [...s, cardId]);
  }

  return (
    <PanelWrapper title={`Hand Limit — Discard ${pa.required} Card(s)`} icon="✋">
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10 }}>
        Select {pa.required} card(s) to discard to the FVR.
        Selected: {selected.length}/{pa.required}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {player.hand.map(c => (
          <HandCard key={c.id} card={c} selectable
            selected={selected.includes(c.id)}
            onClick={() => toggle(c.id)} />
        ))}
      </div>
      <button className="btn btn-warn" style={{ width: '100%' }}
        disabled={selected.length !== pa.required}
        onClick={() => sendAction({ type: 'HAND_DISCARD', payload: { cardIds: selected } })}>
        Discard {selected.length} Card(s)
      </button>
    </PanelWrapper>
  );
}

// ── Shared sub-components ───────────────────────────────────────────────────

function PanelWrapper({ title, icon, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--accent)',
      borderRadius: 8,
      padding: 14,
      margin: 10,
      boxShadow: '0 0 16px rgba(233,69,96,0.15)',
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--accent)' }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {title}
      </div>
      {children}
    </div>
  );
}

export function HandCard({ card, selectable, selected, onClick }) {
  const isVenue = card.type === 'venue';
  return (
    <div
      onClick={selectable ? onClick : undefined}
      style={{
        background: selected ? 'var(--surface2)' : 'var(--surface)',
        border: `2px solid ${selected ? 'var(--accent)' : isVenue ? 'var(--accent2)' : 'var(--border)'}`,
        borderRadius: 6, padding: '6px 8px',
        cursor: selectable ? 'pointer' : 'default',
        minWidth: 80, maxWidth: 120,
        fontSize: 11,
        boxShadow: selected ? '0 0 8px rgba(233,69,96,0.4)' : 'none',
        transition: 'border-color 0.1s, box-shadow 0.1s',
      }}
    >
      <div style={{ fontWeight: 700, color: isVenue ? 'var(--accent2)' : 'var(--text)', lineHeight: 1.2 }}>
        {card.name}
      </div>
      {!isVenue && <div style={{ color: 'var(--text-dim)', fontSize: 10 }}>{card.category}</div>}
      <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
        <span>{card.cost}¢</span>
        {(card.excitement > 0) && <span style={{ color: 'var(--accent2)' }}>+{card.excitement}✨</span>}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function buildTaskDefsMap() {
  const defs = [
    { id: 'task_marriage_license',   name: 'Apply for Marriage License',    effortRequired: 1, key: false },
    { id: 'task_hotel_rooms',        name: 'Block Out Guest Hotel Rooms',   effortRequired: 1, key: false },
    { id: 'task_gift_registry',      name: 'Create Gift Registry',          effortRequired: 1, key: false },
    { id: 'task_website',            name: 'Launch Wedding Website',        effortRequired: 1, key: false },
    { id: 'task_rings',              name: 'Order Wedding Rings',           effortRequired: 2, key: false },
    { id: 'task_bridal_shower',      name: 'Plan Bridal Shower',            effortRequired: 2, key: false },
    { id: 'task_honeymoon',          name: 'Plan Honeymoon',                effortRequired: 2, key: false },
    { id: 'task_vows',               name: 'Write Wedding Vows',            effortRequired: 2, key: false },
    { id: 'task_wedding_bags',       name: 'Assemble Guest Wedding Bags',   effortRequired: 2, key: false },
    { id: 'task_guest_arrivals',     name: 'Coordinate Guest Arrivals',     effortRequired: 2, key: false },
    { id: 'task_playlist',           name: 'Create Playlist',               effortRequired: 2, key: false },
    { id: 'task_centerpieces',       name: 'Design Centerpieces',           effortRequired: 2, key: false },
    { id: 'task_ceremony_structure', name: 'Plan Ceremony Structure',       effortRequired: 2, key: false },
    { id: 'task_photoshoot',         name: 'Schedule Engagement Photoshoot', effortRequired: 2, key: false },
    { id: 'task_fitting',            name: 'Schedule Fitting Session',      effortRequired: 2, key: false },
    { id: 'task_venue_setup',        name: 'Venue Setup / Teardown',        effortRequired: 2, key: false },
    { id: 'task_wedding_party',      name: 'Choose Wedding Party',          effortRequired: 3, key: true },
    { id: 'task_post_brunch',        name: 'Host Post-Wedding Brunch',      effortRequired: 1, key: false },
    { id: 'task_rehearsal_dinner',   name: 'Host Rehearsal Dinner',         effortRequired: 1, key: false },
    { id: 'task_party_gifts',        name: 'Purchase Wedding Party Gifts',  effortRequired: 1, key: false },
    { id: 'task_tastings',           name: 'Conduct Vendor Tastings',       effortRequired: 3, key: true },
    { id: 'task_signature_drink',    name: 'Design Signature Drink',        effortRequired: 1, key: false },
    { id: 'task_menu',               name: 'Finalize Menu Selections',      effortRequired: 2, key: false },
    { id: 'task_cake',               name: 'Order Wedding Cake',            effortRequired: 2, key: false },
    { id: 'task_guest_list',         name: 'Create Guest List',             effortRequired: 4, key: true },
    { id: 'task_save_dates',         name: 'Send Save-the-Dates',           effortRequired: 2, key: false },
    { id: 'task_invitations',        name: 'Mail Wedding Invitations',      effortRequired: 2, key: false },
    { id: 'task_seating_chart',      name: 'Create Seating Chart',         effortRequired: 2, key: false },
  ];
  return Object.fromEntries(defs.map(d => [d.id, d]));
}
