import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MonthTimeline, ExcitementStripWide, FVR, MomentsAwardsRow, HelpDecks, DeckColumn } from './SharedBoard';
import { WeddingGrid, HandStrip, ActionDock, PlayerChrome, VisionBoard, ThemeTrackerStack, HelperSlots, TaskWorksheet } from './PlayerBoard';
import OtherPlayers from './OtherPlayers';
import ActionPanel from './ActionPanel';
import CheckIn from './CheckIn';
import { CardDetailModal } from './Cards';
import { adaptCard, adaptGridCell, adaptMeepleAt, adaptHelpers } from './stateAdapters';
import '../styles.css';

export default function Game() {
  const { gameState, playerId, isMyTurn, isCheckinActive, isMyCheckinTurn, error, clearError, sendAction } = useGame();
  const [zoomCard, setZoomCard] = useState(null);

  if (!gameState) return null;

  const { month, quarter, playerOrder, currentPlayerIndex, shared } = gameState;
  const currentPid = playerOrder[currentPlayerIndex];
  const currentPlayerName = gameState.players[currentPid]?.name;
  const myPlayer = gameState.players[playerId];
  const isMyTurnAct = isMyTurn && !isCheckinActive;

  // Adapt shared state for design components
  const fvrCards = shared.fvr || [];
  const moments = shared.moments || [];
  const raceAward = shared.raceAward ? {
    name: shared.raceAward.name,
    condition: shared.raceAward.description || 'First player to achieve.',
    value: 7,
    earnedBy: (shared.raceAwardWinners || []).map(pid => gameState.players[pid]?.name).filter(Boolean).join(', ') || null,
  } : null;
  const endgameAward = shared.endgameAward ? {
    name: shared.endgameAward.name,
    condition: shared.endgameAward.description || 'At end of game.',
    value: 5,
  } : null;
  const helpDecks = {
    Money: (shared.helpDecks?.money?.length ?? 0),
    Effort: (shared.helpDecks?.effort?.length ?? 0),
    Research: (shared.helpDecks?.research?.length ?? 0),
  };
  const topVendorCategory = shared.topVendorCategory || 'Photography';
  const vendorDeckSize = shared.vendorDeckSize ?? shared.vendorDeck?.length ?? 0;
  const venueDeckSize = shared.venueDeckSize ?? shared.venueDeck?.length ?? 0;

  // Build completedBy map: momentIndex → array of player names who completed it
  const completedBy = {};
  moments.forEach((m, i) => {
    const status = shared.momentStatus?.[m.id];
    if (status?.completedBy?.length > 0) {
      completedBy[i] = status.completedBy.map(pid => gameState.players[pid]?.name || pid);
    }
  });

  // My player adapted state
  const myGrid = (myPlayer?.grid || []).map(adaptGridCell);
  const myHand = (myPlayer?.hand || []);
  const myHelpers = adaptHelpers(myPlayer?.helpers || []);
  const themePositions = myPlayer?.themeElements || { whimsy: 0, edge: 0, nature: 0, tradition: 0, elegance: 0 };
  const meepleAt = adaptMeepleAt(myPlayer?.meeplePosition);
  const completedCount = myPlayer?.completedTasksCount ?? 0;

  // Theme options for VisionBoard pre-CI1
  const themeOptions = (!myPlayer?.theme && myPlayer?.themeCards && myPlayer.themeCards.length > 0 && !myPlayer.themeCards[0]?.hidden)
    ? myPlayer.themeCards.map(c => ({ name: c.name, elements: c.elements }))
    : null;

  function handleActionChoose(action) {
    if (!isMyTurnAct) return;
    sendAction({ type: 'SELECT_ACTION', payload: { action: action.toLowerCase() } });
  }

  return (
    <div style={{ minWidth: 1440, background: 'var(--paper)', color: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
      {/* PAGE HEADER */}
      <PageHeader
        month={month}
        quarter={quarter}
        activePlayer={isCheckinActive ? null : currentPlayerName}
        isMyTurn={isMyTurnAct}
        isCheckinActive={isCheckinActive}
        myName={myPlayer?.name}
        checkInNumber={gameState.checkinState?.checkInNumber}
      />

      {error && (
        <div className="error-banner" style={{ margin: '8px 28px' }}>
          {error}
          <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '2px 8px' }} onClick={clearError}>✕</button>
        </div>
      )}

      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* FULL-WIDTH: TIMELINE + EXCITEMENT */}
        <MonthTimeline currentMonth={month} />
        <ExcitementStripWide position={myPlayer?.excitement ?? 0} />

        {/* THREE COLUMNS */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 380px', gap: 18, alignItems: 'flex-start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <HelpDecks decks={helpDecks} />
            <DeckColumn vendorTopCategory={topVendorCategory} vendorRemaining={vendorDeckSize} venueRemaining={venueDeckSize} />
            <HelperSlots slots={myHelpers} />
          </div>

          {/* CENTER COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PlayerChrome
              name={myPlayer?.name || 'You'}
              isYou={true}
              isActive={isMyTurnAct}
              coins={myPlayer?.coins ?? 0}
              gifts={myPlayer?.gifts ?? 0}
              isFirstPlayer={playerOrder[0] === playerId}
            />
            <MomentsAwardsRow
              moments={moments}
              awards={{ race: raceAward, endgame: endgameAward }}
              completedBy={completedBy}
              onZoom={setZoomCard}
            />
            <FVR
              cards={fvrCards}
              cardW={124}
              onZoom={setZoomCard}
            />

            {/* WEDDING GRID */}
            <div style={{ background: 'var(--paper-soft)', border: '2px solid var(--ink)', padding: 14, boxShadow: '3px 3px 0 var(--ink)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <div className="t-eyebrow t-eyebrow-accent">Your Wedding Grid</div>
                <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Center: venue only</div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center' }}>
                <WeddingGrid cells={myPlayer?.grid || []} cellSize={156} showBonusLabels onZoom={setZoomCard} />
              </div>
            </div>

            <HandStrip cards={myHand} cardW={124} onZoom={setZoomCard} />
            <ActionDock meepleAt={meepleAt} available={['Research', 'Book', 'Plan', 'Help']} onChoose={isMyTurnAct && !gameState.pendingAction ? handleActionChoose : null} />
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <VisionBoard
              theme={myPlayer?.theme}
              themeOptions={themeOptions}
              goals={myPlayer?.goals || []}
              onZoom={setZoomCard}
            />
            <ThemeTrackerStack positions={themePositions} />
            <TaskWorksheet player={myPlayer} month={month} completedCount={completedCount} />
            <OtherPlayers />
          </div>
        </div>
      </div>

      {/* PENDING ACTION MODAL */}
      {isMyTurn && <ActionPanel />}

      {/* CHECK-IN OVERLAY */}
      {isCheckinActive && <CheckIn />}

      {/* CARD ZOOM MODAL */}
      {zoomCard && <CardDetailModal card={zoomCard} onClose={() => setZoomCard(null)} />}
    </div>
  );
}

function PageHeader({ month, quarter, activePlayer, isMyTurn, isCheckinActive, myName, checkInNumber }) {
  return (
    <div style={{
      background: 'var(--paper-soft)',
      borderBottom: '2px solid var(--ink)',
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)', lineHeight: 1 }}>
        The Wedding<span style={{ color: 'var(--accent)' }}> Planner</span>
      </div>
      <div style={{ flex: 1 }} />

      {/* Status */}
      <div style={{ textAlign: 'center' }}>
        <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>
          {isCheckinActive ? `Check-In ${checkInNumber}` : 'Active turn'}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: isCheckinActive ? 'var(--coin)' : (isMyTurn ? 'var(--accent)' : 'var(--ink)'), lineHeight: 1 }}>
          {isCheckinActive ? 'Pause' : (isMyTurn ? 'Your Turn' : (activePlayer || '…'))}
        </div>
      </div>

      <div style={{ width: 1, height: 32, background: 'var(--ink-line-2)' }} />

      <div>
        <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Quarter</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', lineHeight: 1 }}>Q{quarter}</div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Month</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {String(month).padStart(2, '0')}<span style={{ color: 'var(--ink-3)', fontSize: 14 }}>/12</span>
        </div>
      </div>

      {myName && (
        <>
          <div style={{ width: 1, height: 32, background: 'var(--ink-line-2)' }} />
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--ink-3)' }}>Playing as</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>{myName}</div>
          </div>
        </>
      )}
    </div>
  );
}
