import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ThemeCard } from './Cards';
import '../styles.css';

const GOAL_TYPES = [
  {
    type: 'theme', label: 'Theme Goal',
    tiers: [
      { key: 'unforgettable', label: 'Unforgettable', gifts: 30, desc: 'Only your 2 theme elements have any progress at game end.' },
      { key: 'thematic',      label: 'Thematic',      gifts: 20, desc: 'Both theme elements in the top 2; no other element as high as the lower.' },
      { key: 'coordinated',   label: 'Coordinated',   gifts: 15, desc: 'Both theme elements in the top 2; another may tie the lower.' },
      { key: 'subtle',        label: 'Subtle',         gifts: 10, desc: 'At least 1 theme element in the top 2.' },
    ],
  },
  {
    type: 'budget', label: 'Budget Goal',
    tiers: [
      { key: 'extravagant', label: 'Extravagant', gifts: 15, desc: 'Most booked cards cost 3+ coins.' },
      { key: 'refined',     label: 'Refined',     gifts: 10, desc: 'Most booked cards cost 2 coins.' },
      { key: 'modest',      label: 'Modest',      gifts: 5,  desc: 'Most booked cards cost 1 coin.' },
    ],
  },
  {
    type: 'excitement', label: 'Excitement Goal',
    tiers: [
      { key: 'spectacular', label: 'Spectacular', gifts: 15, desc: 'Most booked cards grant 3+ excitement.' },
      { key: 'vibrant',     label: 'Vibrant',     gifts: 10, desc: 'Most booked cards grant 2 excitement.' },
      { key: 'intimate',    label: 'Intimate',    gifts: 5,  desc: 'Most booked cards grant 1 excitement.' },
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
  const number = ci.checkInNumber;

  const QUOTES = {
    1: 'What kind of wedding is this, anyway?',
    2: 'The plans are taking shape.',
    3: 'Quarter four — the home stretch.',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--ink)',
      color: 'var(--paper)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 150,
      overflowY: 'auto',
    }}>
      {/* Top banner */}
      <div style={{ padding: '28px 64px 24px', borderBottom: '2px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            End of Q{number} · After Month {number * 3} · Pause
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '8px 0 0' }}>
            Check-In <span style={{ color: 'var(--accent)' }}>{String(number).padStart(2, '0')}</span>
          </h1>
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, lineHeight: 1.3, color: 'var(--coin)', textAlign: 'right', maxWidth: 380 }}>
          "{QUOTES[number] || ''}"
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '48px 64px' }}>
        {!isMyCheckinTurn ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)' }}>Waiting</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>
              Waiting for other players…
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--coin)', opacity: 0.8 }}>
              Step: {ci.step} · {ci.pendingPlayers.length} player(s) remaining
            </div>
          </div>
        ) : ci.step === 'theme' ? (
          <ThemeChoice player={player} number={number} sendAction={sendAction} />
        ) : ci.step === 'goal' ? (
          <GoalChoice player={player} number={number} sendAction={sendAction} />
        ) : (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--coin)' }}>Step: {ci.step}</div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 64px', borderTop: '1px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--paper)', opacity: 0.7 }}>
          {gameState.playerOrder.map(pid => `${gameState.players[pid]?.name} · ${ci.pendingPlayers.includes(pid) ? 'choosing…' : 'ready'}`).join('   ·   ')}
        </div>
      </div>
    </div>
  );
}

function ThemeChoice({ player, number, sendAction }) {
  const [chosen, setChosen] = useState(null);

  if (!player.themeCards || player.themeCards.length === 0 || player.themeCards[0]?.hidden) {
    return <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--coin)' }}>Loading theme cards…</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
      <div>
        <div className="t-eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>Step 1 · Set Your Theme</div>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: 'var(--coin)', maxWidth: 460, margin: '0 0 24px' }}>
          Choose 1 of the 2 themes you drew at setup. The other is discarded. Themes are public from this point on.
        </p>
        <div style={{ display: 'flex', gap: 18 }}>
          {player.themeCards.map((card, i) => (
            <div key={card.id} style={{ cursor: 'pointer', outline: chosen === card.id ? '4px solid var(--accent)' : 'none', outlineOffset: 4 }}
              onClick={() => setChosen(card.id)}>
              <ThemeCard name={card.name} elements={card.elements} width={200} height={240} />
              {chosen === card.id && (
                <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', textAlign: 'center' }}>
                  ▼ Selected
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          style={{ marginTop: 28, padding: '14px 28px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--accent)', color: 'var(--paper)', border: '2px solid var(--paper)', cursor: chosen ? 'pointer' : 'not-allowed', opacity: chosen ? 1 : 0.5 }}
          disabled={!chosen}
          onClick={() => sendAction({ type: 'CHOOSE_THEME', payload: { themeCardId: chosen } })}
        >
          Confirm Theme
        </button>
      </div>
    </div>
  );
}

function GoalChoice({ player, number, sendAction }) {
  const [goalType, setGoalType]       = useState(null);
  const [tier, setTier]               = useState(null);
  const [guestCategory, setGuestCat]  = useState(null);

  const alreadySet = new Set(player.goals.map(g => g.type));
  const available = GOAL_TYPES.filter(g => !alreadySet.has(g.type));
  const selectedGoal = GOAL_TYPES.find(g => g.type === goalType);

  const isValid = goalType && (goalType === 'guest' ? !!guestCategory : !!tier);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
      <div>
        <div className="t-eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>Step {number === 1 ? '2' : '1'} · Set a Goal</div>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: 'var(--coin)', maxWidth: 460, margin: '0 0 24px' }}>
          Set 1 of the 4 goal types — one per Check-In. Goals are public for the rest of the game.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {available.map(g => (
            <button key={g.type}
              onClick={() => { setGoalType(g.type); setTier(null); setGuestCat(null); }}
              style={{ padding: '16px 18px', background: goalType === g.type ? 'var(--paper-soft)' : 'transparent', color: goalType === g.type ? 'var(--ink)' : 'var(--paper)', border: goalType === g.type ? '2px solid var(--accent)' : '2px solid var(--accent)', boxShadow: goalType === g.type ? '4px 4px 0 var(--accent)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{g.label}</div>
            </button>
          ))}
        </div>

        <button
          style={{ marginTop: 28, padding: '14px 28px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--accent)', color: 'var(--paper)', border: '2px solid var(--paper)', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5 }}
          disabled={!isValid}
          onClick={() => sendAction({ type: 'SET_GOAL', payload: { goalType, tier, guestCategory } })}
        >
          Set Goal · Begin Q{number + 1}
        </button>
      </div>

      {/* Tier / category selection */}
      {selectedGoal && (
        <div>
          {selectedGoal.tiers && (
            <>
              <div className="t-eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>Choose Tier</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedGoal.tiers.map(t => (
                  <div key={t.key}
                    onClick={() => setTier(t.key)}
                    style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center', padding: '14px 16px', background: tier === t.key ? 'var(--paper-soft)' : 'transparent', color: tier === t.key ? 'var(--ink)' : 'var(--paper)', border: tier === t.key ? '2px solid var(--accent)' : '1.5px solid var(--accent)', cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, border: `2px solid ${tier === t.key ? 'var(--ink)' : 'var(--accent)'}`, display: 'grid', placeItems: 'center', background: tier === t.key ? 'var(--accent)' : 'transparent' }}>
                      {tier === t.key && <span style={{ color: 'var(--paper)', fontSize: 10 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>{t.label}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 1.4, marginTop: 4, opacity: 0.75 }}>{t.desc}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: tier === t.key ? 'var(--gift)' : 'var(--coin)', fontVariantNumeric: 'tabular-nums' }}>+{t.gifts}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedGoal.categories && (
            <>
              <div className="t-eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>Choose Category</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedGoal.categories.map(cat => (
                  <button key={cat}
                    onClick={() => setGuestCat(cat)}
                    style={{ padding: '10px 16px', background: guestCategory === cat ? 'var(--paper-soft)' : 'transparent', color: guestCategory === cat ? 'var(--ink)' : 'var(--paper)', border: '1.5px solid var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {cat}
                  </button>
                ))}
              </div>
              {guestCategory && (
                <div style={{ marginTop: 14, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--coin)', lineHeight: 1.5 }}>
                  Scoring: 1 vendor = 5 gifts, 2 = 10 gifts, 3+ = 15 gifts (DIY counts)
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
