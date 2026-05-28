import React from 'react';
import { useGame } from '../context/GameContext';
import '../styles.css';

const MOMENT_GRID_SIZE = 28;

export default function SharedBoard() {
  const { gameState } = useGame();
  if (!gameState) return null;

  const { shared } = gameState;

  return (
    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
      {/* FVR */}
      <div className="card" style={{ padding: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="section-label">Featured Vendor Row (FVR)</div>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            Top of vendor deck: {shared.topVendorCategory || '—'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {shared.fvr.length === 0
            ? <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Empty</span>
            : shared.fvr.map(card => <FvrCard key={card.id} card={card} />)
          }
        </div>
      </div>

      {/* Moments & Awards */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="card" style={{ padding: 10, flex: 2 }}>
          <div className="section-label">Active Moments</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {shared.moments.map(m => (
              <MomentCard key={m.id} moment={m} status={shared.momentStatus[m.id]} />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 10, flex: 1 }}>
          <div className="section-label">Awards</div>
          {shared.raceAward && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Race Award</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{shared.raceAward.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>7 gifts · First to achieve</div>
              {shared.raceAwardWinners.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--success)' }}>
                  Won by: {shared.raceAwardWinners.map(pid =>
                    gameState.players[pid]?.name || pid).join(', ')}
                </div>
              )}
            </div>
          )}
          {shared.endgameAward && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Endgame Award</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{shared.endgameAward.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>5 gifts at end of game</div>
            </div>
          )}
        </div>
      </div>

      {/* Help decks */}
      <div className="card" style={{ padding: 10 }}>
        <div className="section-label">Help Decks</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['money', 'effort', 'research'].map(type => (
            <div key={type} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{type}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{shared.helpDecks[type].length}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>cards left</div>
            </div>
          ))}
        </div>
      </div>

      {/* Check-In 3 event if active */}
      {shared.checkin3Event && (
        <div className="card" style={{ padding: 10, border: '1px solid var(--accent2)' }}>
          <div className="section-label">Q4 Event Active</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{shared.checkin3Event.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
            {shared.checkin3Event.description}
          </div>
        </div>
      )}
    </div>
  );
}

function FvrCard({ card }) {
  const isVenue = card.type === 'venue';
  return (
    <div style={{
      background: 'var(--surface2)',
      border: `1px solid ${isVenue ? 'var(--accent2)' : 'var(--border)'}`,
      borderRadius: 6,
      padding: '6px 8px',
      minWidth: 80, maxWidth: 120,
      fontSize: 11,
    }}>
      <div style={{ fontWeight: 700, color: isVenue ? 'var(--accent2)' : 'var(--text)', lineHeight: 1.2 }}>
        {card.name}
      </div>
      {!isVenue && <div style={{ color: 'var(--text-dim)', fontSize: 10 }}>{card.category}</div>}
      <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
        <span style={{ fontSize: 10 }}>{card.cost}¢</span>
        {(card.excitement > 0) && <span style={{ fontSize: 10, color: 'var(--accent2)' }}>+{card.excitement}✨</span>}
      </div>
    </div>
  );
}

function MomentCard({ moment, status }) {
  const isCompleted = status?.completedBy?.length > 0;
  const firstMonth = status?.firstCompletedMonth;

  return (
    <div style={{
      background: 'var(--surface2)',
      border: `1px solid ${isCompleted ? 'var(--success)' : 'var(--border)'}`,
      borderRadius: 8,
      padding: 8,
      minWidth: 140,
    }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{moment.name}</div>
      <MomentPatternMini pattern={moment.pattern} />
      <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-dim)' }}>
        First: +{moment.firstReward} · Others: +{moment.othersReward}
      </div>
      {isCompleted && (
        <div style={{ fontSize: 10, color: 'var(--success)', marginTop: 2 }}>
          Completed (month {firstMonth})
        </div>
      )}
    </div>
  );
}

function MomentPatternMini({ pattern }) {
  const sz = MOMENT_GRID_SIZE / 3 - 2;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, width: MOMENT_GRID_SIZE }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{
          width: sz, height: sz, borderRadius: 2,
          background: pattern.includes(i) ? 'var(--accent)' : 'var(--surface)',
          border: i === 4 ? '1px solid var(--accent2)' : '1px solid var(--border)',
        }} />
      ))}
    </div>
  );
}
