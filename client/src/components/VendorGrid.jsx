import React from 'react';
import '../styles.css';

const POSITION_LABELS = ['1', '2', '3', '4', 'V', '6', '7', '8', '9'];
const BONUS_LABELS = ['Research', 'Plan', 'Book', 'Help', 'Any', 'Help', 'Book', 'Plan', 'Research'];
const ELEMENT_COLORS = { whimsy: '#ff69b4', edge: '#9c27b0', nature: '#4caf50', tradition: '#8b1a1a', elegance: '#c9a227' };

export default function VendorGrid({ grid, isOwn, onSelectPosition, selectedPosition, highlightPositions }) {
  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="section-label">Wedding Grid</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {grid.map((cell, pos) => (
          <GridCell
            key={pos}
            pos={pos}
            cell={cell}
            isOwn={isOwn}
            onClick={onSelectPosition ? () => onSelectPosition(pos) : undefined}
            selected={selectedPosition === pos}
            highlighted={highlightPositions?.includes(pos)}
          />
        ))}
      </div>
    </div>
  );
}

function GridCell({ pos, cell, isOwn, onClick, selected, highlighted }) {
  const isEmpty = cell === null;
  const isCenter = pos === 4;
  const bonus = BONUS_LABELS[pos];

  let bgColor = 'var(--surface2)';
  let borderColor = selected ? 'var(--accent)' : highlighted ? 'var(--accent2)' : 'var(--border)';

  if (cell?.diy) {
    bgColor = '#33333a';
    borderColor = cell.category ? CATEGORY_BORDER_COLOR[cell.category] || '#666' : '#666';
  } else if (cell) {
    bgColor = 'var(--surface)';
  }

  return (
    <div
      onClick={onClick}
      style={{
        minHeight: 68,
        borderRadius: 6,
        border: `2px solid ${borderColor}`,
        background: bgColor,
        padding: 6,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 2px var(--accent)' : highlighted ? '0 0 0 1px var(--accent2)' : 'none',
      }}
    >
      {/* Position label */}
      <div style={{
        position: 'absolute', top: 3, left: 5,
        fontSize: 9, color: 'var(--text-dim)', fontWeight: 700,
      }}>
        {isCenter ? '✱' : POSITION_LABELS[pos]}
      </div>

      {/* Bonus hint (empty cells) */}
      {isEmpty && (
        <div style={{
          position: 'absolute', bottom: 3, right: 5,
          fontSize: 9, color: 'var(--text-dim)',
        }}>
          {bonus}
        </div>
      )}

      {/* Card content */}
      {!isEmpty && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 10 }}>
          {cell.diy
            ? <DiyCardDisplay card={cell} />
            : <FaceUpCardDisplay card={cell} />
          }
        </div>
      )}

      {isEmpty && isCenter && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Venue</span>
        </div>
      )}
    </div>
  );
}

function FaceUpCardDisplay({ card }) {
  const isVenue = card.type === 'venue';
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.2, color: isVenue ? 'var(--accent2)' : 'var(--text)' }}>
        {card.name}
      </div>
      {!isVenue && (
        <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{card.category}</div>
      )}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
        {card.cost > 0 && (
          <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.1)', borderRadius: 3, padding: '1px 4px' }}>
            {card.cost}¢
          </span>
        )}
        {(card.excitement > 0) && (
          <span style={{ fontSize: 9, color: 'var(--accent2)', background: 'rgba(245,166,35,0.1)', borderRadius: 3, padding: '1px 4px' }}>
            +{card.excitement}✨
          </span>
        )}
        {card.wild > 0 && (
          <span style={{ fontSize: 9, color: '#aaa', background: 'rgba(255,255,255,0.1)', borderRadius: 3, padding: '1px 4px' }}>
            ★wild
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 1 }}>
        {Object.entries(card.elements || {}).map(([el, v]) =>
          v > 0 ? (
            <div key={el} style={{ width: 6, height: 6, borderRadius: '50%', background: ELEMENT_COLORS[el] }} />
          ) : null
        )}
      </div>
    </>
  );
}

function DiyCardDisplay({ card }) {
  const color = CATEGORY_BORDER_COLOR[card.category] || '#666';
  return (
    <>
      <div style={{ fontSize: 9, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
        DIY
      </div>
      <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{card.category}</div>
    </>
  );
}

const CATEGORY_BORDER_COLOR = {
  'Photography':           '#e91e63',
  'Flowers & Decorations': '#4caf50',
  'Entertainment':         '#9c27b0',
  'Stationery':            '#2196f3',
  'Attire & Accessories':  '#ff9800',
  'Food & Drink':          '#f44336',
  'Ceremony':              '#c9a227',
  'Favors & Gifts':        '#00bcd4',
  'Transportation':        '#607d8b',
};
