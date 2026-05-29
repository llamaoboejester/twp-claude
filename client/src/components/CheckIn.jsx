import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import '../styles.css';

const GOAL_TYPES = [
  {
    type: 'theme', label: 'Theme Goal',
    tiers: [
      { key: 'unforgettable', label: 'Unforgettable', gifts: 30, desc: 'Only your 2 theme elements have any progress at game end (30 gifts)' },
      { key: 'thematic',      label: 'Thematic',      gifts: 20, desc: 'Both theme elements in the top 2; no other element is as high as the lower theme element (20 gifts)' },
      { key: 'coordinated',   label: 'Coordinated',   gifts: 15, desc: 'Both theme elements in the top 2; another element may tie the lower theme element (15 gifts)' },
      { key: 'subtle',        label: 'Subtle',         gifts: 10, desc: 'At least 1 theme element ranks in the top 2 (10 gifts)' },
    ],
  },
  {
    type: 'budget', label: 'Budget Goal',
    tiers: [
      { key: 'extravagant', label: 'Extravagant', gifts: 15, desc: 'Most booked cards cost 3+ coins (15 gifts)' },
      { key: 'refined',     label: 'Refined',     gifts: 10, desc: 'Most booked cards cost 2 coins (10 gifts)' },
      { key: 'modest',      label: 'Modest',       gifts: 5,  desc: 'Most booked cards cost 1 coin (5 gifts)' },
    ],
  },
  {
    type: 'excitement', label: 'Excitement Goal',
    tiers: [
      { key: 'spectacular', label: 'Spectacular', gifts: 15, desc: 'Most booked cards grant 3+ excitement (15 gifts)' },
      { key: 'vibrant',     label: 'Vibrant',     gifts: 10, desc: 'Most booked cards grant 2 excitement (10 gifts)' },
      { key: 'intimate',    label: 'Intimate',    gifts: 5,  desc: 'Most booked cards grant 1 excitement (5 gifts)' },
    ],
  },
  {
    type: 'guest', label: 'Guest Goal',
    categories: [
      'Photography', 'Flowers & Decorations', 'Entertainment', 'Stationery',
      'Attire & Accessories', 'Food & Drink', 'Ceremony', 'Favors & Gifts', 'Transportation',
    ],
  },
];

export default function CheckIn() {
  const { gameState, playerId, isMyCheckinTurn, sendAction } = useGame();
  if (!gameState || !gameState.checkinState) return null;

  const ci = gameState.checkinState;
  const player = gameState.players[playerId];

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--accent2)',
      borderRadius: 8,
      margin: 10,
      padding: 14,
    }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent2)', marginBottom: 4 }}>
        Check-In {ci.checkInNumber}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
        Step: <strong>{ci.step}</strong> ·
        Waiting for {ci.pendingPlayers.length} player(s):
        {ci.pendingPlayers.map(pid => ` ${gameState.players[pid]?.name}`).join(', ')}
      </div>

      {!isMyCheckinTurn && (
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          Waiting for other players to complete this check-in step…
        </div>
      )}

      {isMyCheckinTurn && ci.step === 'theme' && (
        <ThemeChoice player={player} sendAction={sendAction} />
      )}

      {isMyCheckinTurn && ci.step === 'goal' && (
        <GoalChoice player={player} sendAction={sendAction} />
      )}
    </div>
  );
}

function ThemeChoice({ player, sendAction }) {
  const [chosen, setChosen] = useState(null);

  if (!player.themeCards || player.themeCards.length === 0 || player.themeCards[0].hidden) {
    return <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Loading theme cards…</div>;
  }

  const ELEMENT_ICONS  = { whimsy: '🌀', edge: '⚡', nature: '🌿', tradition: '💍', elegance: '💎' };
  const ELEMENT_COLORS = { whimsy: '#ff69b4', edge: '#9c27b0', nature: '#4caf50', tradition: '#8b1a1a', elegance: '#c9a227' };

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Choose your theme:</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {player.themeCards.map(card => (
          <div
            key={card.id}
            onClick={() => setChosen(card.id)}
            style={{
              flex: 1, padding: 14,
              border: `2px solid ${chosen === card.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              background: chosen === card.id ? 'rgba(233,69,96,0.1)' : 'var(--surface2)',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{card.name}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {card.elements.map(el => (
                <span key={el} className={`tag element-${el}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: ELEMENT_COLORS[el], display: 'inline-block', flexShrink: 0 }} />
                  {ELEMENT_ICONS[el]} {el}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        disabled={!chosen}
        onClick={() => sendAction({ type: 'CHOOSE_THEME', payload: { themeCardId: chosen } })}
      >
        Confirm Theme
      </button>
    </div>
  );
}

function GoalChoice({ player, sendAction }) {
  const [goalType, setGoalType]       = useState(null);
  const [tier, setTier]               = useState(null);
  const [guestCategory, setGuestCat]  = useState(null);

  const alreadySet = new Set(player.goals.map(g => g.type));
  const available = GOAL_TYPES.filter(g => !alreadySet.has(g.type));
  const selectedGoal = GOAL_TYPES.find(g => g.type === goalType);

  function submit() {
    sendAction({ type: 'SET_GOAL', payload: { goalType, tier, guestCategory } });
  }

  const isValid = goalType && (
    goalType === 'guest' ? !!guestCategory : !!tier
  );

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Set a goal for this quarter:</div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
        You may not set the same goal type twice. You will set 3 of the 4 types total.
      </div>

      {/* Goal type selection */}
      <div className="section-label">Goal Type</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {available.map(g => (
          <button
            key={g.type}
            className={`btn ${goalType === g.type ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setGoalType(g.type); setTier(null); setGuestCat(null); }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Tier / category selection */}
      {selectedGoal?.tiers && (
        <>
          <div className="section-label">Choose Tier</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {selectedGoal.tiers.map(t => (
              <label key={t.key} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px',
                border: `1px solid ${tier === t.key ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 6, cursor: 'pointer',
                background: tier === t.key ? 'rgba(233,69,96,0.1)' : 'var(--surface2)',
              }}>
                <input type="radio" name="tier" checked={tier === t.key}
                  onChange={() => setTier(t.key)} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label} — +{t.gifts} gifts</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{t.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </>
      )}

      {selectedGoal?.categories && (
        <>
          <div className="section-label">Choose Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {selectedGoal.categories.map(cat => (
              <button key={cat}
                className={`btn ${guestCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 12 }}
                onClick={() => setGuestCat(cat)}>
                {cat}
              </button>
            ))}
          </div>
          {guestCategory && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
              Scoring: 1 vendor = 5 gifts, 2 = 10 gifts, 3+ = 15 gifts (DIY counts)
            </div>
          )}
        </>
      )}

      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        disabled={!isValid}
        onClick={submit}
      >
        Set Goal
      </button>
    </div>
  );
}
