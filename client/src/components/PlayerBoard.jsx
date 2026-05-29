import React from 'react';
import { useGame } from '../context/GameContext';
import VendorGrid from './VendorGrid';
import { HandCard } from './ActionPanel';
import '../styles.css';

const ELEMENTS = ['whimsy', 'edge', 'nature', 'tradition', 'elegance'];
const ELEMENT_ICONS = { whimsy: '🌀', edge: '⚡', nature: '🌿', tradition: '💍', elegance: '💎' };
const ELEMENT_COLORS = { whimsy: '#ff69b4', edge: '#9c27b0', nature: '#4caf50', tradition: '#8b1a1a', elegance: '#c9a227' };
const ELEMENT_MILESTONES = [2, 5, 8];

export default function PlayerBoard() {
  const { gameState, playerId } = useGame();
  if (!gameState) return null;
  const player = gameState.players[playerId];
  if (!player) return null;

  return (
    <div style={{ padding: 10, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <HandSection hand={player.hand} />
      <VendorGrid grid={player.grid} isOwn={true} />
      <ThemeSection player={player} />
      <ExcitementBar player={player} />
      <ElementTrackers elements={player.themeElements} />
      <HelpersSection helpers={player.helpers} />
      {player.plannerContract && <PlannerSection player={player} />}
    </div>
  );
}

function HandSection({ hand }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="section-label">Hand</div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{hand.length}/5 cards</span>
      </div>
      {hand.length === 0
        ? <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>No cards in hand</div>
        : (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hand.map(card => (
              <HandCard key={card.id} card={card} selectable={false} />
            ))}
          </div>
        )
      }
    </div>
  );
}

function ThemeSection({ player }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="section-label">Theme</div>
      {player.theme
        ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{player.theme.name}</span>
            {player.theme.elements.map(el => (
              <span key={el} className={`tag element-${el}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: ELEMENT_COLORS[el], display: 'inline-block', flexShrink: 0 }} />
                {ELEMENT_ICONS[el]} {el}
              </span>
            ))}
          </div>
        )
        : player.themeCards.length > 0 && !player.themeCards[0]?.hidden
          ? (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>
                Your options — choose at Check-In 1:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {player.themeCards.map(card => (
                  <div key={card.id} style={{
                    padding: '6px 10px',
                    border: '1px solid var(--accent2)',
                    borderRadius: 6,
                    background: 'var(--surface2)',
                    fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{card.name}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
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
            </div>
          )
          : (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
              Theme selected at Check-In 1
            </div>
          )
      }
      {player.goals.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="section-label">Goals</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {player.goals.map(g => (
              <span key={g.type} className="tag" style={{ border: '1px solid var(--accent2)', color: 'var(--accent2)' }}>
                {g.type}{g.tier ? ` (${g.tier})` : ''}{g.guestCategory ? ` — ${g.guestCategory}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExcitementBar({ player }) {
  const pct = (player.excitement / 30) * 100;
  const milestones = [5, 15, 25];

  return (
    <div className="card" style={{ padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="section-label">Excitement</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent2)' }}>
          {player.excitement} / 30
        </span>
      </div>
      <div style={{ position: 'relative', height: 16, background: 'var(--surface2)', borderRadius: 8, overflow: 'visible' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 8,
          background: 'linear-gradient(90deg, #e94560, #f5a623)',
          transition: 'width 0.3s',
        }} />
        {milestones.map(pos => (
          <div key={pos} style={{
            position: 'absolute',
            left: `${(pos / 30) * 100}%`,
            top: -3, bottom: -3,
            width: 2,
            background: player.excitement >= pos ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
          }}>
            <div style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              fontSize: 9, color: 'var(--text-dim)',
            }}>{pos}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
        At positions 5, 15, 25: choose coin or draw card · Converts to gifts at game end
      </div>
    </div>
  );
}

function ElementTrackers({ elements }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="section-label">Theme Elements</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ELEMENTS.map(el => {
          const val = elements[el];
          return (
            <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 70, fontSize: 12, color: `var(--${el})` }}>
                {ELEMENT_ICONS[el]} {el.charAt(0).toUpperCase() + el.slice(1)}
              </span>
              <div style={{ flex: 1, display: 'flex', gap: 2 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 12, borderRadius: 2,
                    background: i < val ? `var(--${el})` : 'var(--surface2)',
                    border: ELEMENT_MILESTONES.includes(i + 1) ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <span style={{ width: 16, fontSize: 12, fontWeight: 700, color: `var(--${el})` }}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HelpersSection({ helpers }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="section-label">Helpers</div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{helpers.length}/3 slots</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => {
          const h = helpers[i];
          return (
            <div key={i} style={{
              flex: 1, minHeight: 48, borderRadius: 6,
              border: `1px solid ${h ? 'var(--accent2)' : 'var(--border)'}`,
              background: h ? 'var(--surface2)' : 'transparent',
              padding: 6,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              fontSize: 11,
            }}>
              {h
                ? (
                  <>
                    <span style={{ color: `var(--text-dim)` }}>{h.helpType}</span>
                    <span style={{ fontWeight: 600, textAlign: 'center', fontSize: 10 }}>{h.name}</span>
                  </>
                )
                : <span style={{ color: 'var(--border)' }}>—</span>
              }
            </div>
          );
        })}
      </div>
      {helpers.length === 3 && (
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--success)', textAlign: 'center' }}>
          All slots filled — Help action unavailable
        </div>
      )}
    </div>
  );
}

function PlannerSection({ player }) {
  if (!player.plannerContract) return null;
  const contract = player.plannerContract;
  return (
    <div className="card" style={{ padding: 10, border: '1px solid var(--accent2)' }}>
      <div className="section-label">Wedding Planner</div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{contract.name}</div>
      {!player.plannerContracted && (
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Not yet contracted · Pay 3 coins to contract during your turn
        </div>
      )}
      {player.plannerContracted && (
        <div style={{ fontSize: 12, color: 'var(--success)' }}>
          Contracted ✓ · Coordination effort pool: {player.plannerEffortPool}/3
        </div>
      )}
      {contract.exclusiveVenue && (
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-dim)' }}>
          Exclusive venue: {contract.exclusiveVenue.name}
        </div>
      )}
    </div>
  );
}
