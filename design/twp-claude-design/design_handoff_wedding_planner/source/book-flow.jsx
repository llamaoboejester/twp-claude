/* book-flow.jsx — The full 3-step Book action.
   Step 1 Choose Card · Step 2 Choose Position · Step 3 Confirm & Book.
   Step 3 reuses the existing BookCardModal (flows.jsx) verbatim.

   Press direction. Built on the shared <Modal> frame + its `stepper` slot.
*/

const BOOK_STEPS = [
  { n: 1, label: "Choose Card" },
  { n: 2, label: "Choose Position" },
  { n: 3, label: "Confirm & Book" },
];

// ——————————————————————————————————————————————————
// STEP INDICATOR — shared across all three steps
// ——————————————————————————————————————————————————
const BookStepper = ({ current, onJump }) => (
  <div style={{
    display: "flex", alignItems: "center",
    padding: "12px 24px",
    background: "var(--paper-deep)",
    borderBottom: "2px solid var(--ink)",
  }}>
    {BOOK_STEPS.map((s, i) => {
      const done = s.n < current;
      const active = s.n === current;
      const clickable = done && !!onJump;
      return (
        <React.Fragment key={s.n}>
          <div
            onClick={clickable ? () => onJump(s.n) : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              cursor: clickable ? "pointer" : "default",
            }}
          >
            <span style={{
              width: 26, height: 26, borderRadius: "50%",
              display: "grid", placeItems: "center", flex: "0 0 auto",
              background: active ? "var(--accent)" : done ? "var(--ink)" : "transparent",
              border: `2px solid ${active ? "var(--accent)" : done ? "var(--ink)" : "var(--ink-line-2)"}`,
              color: (active || done) ? "var(--paper)" : "var(--ink-3)",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, lineHeight: 1,
            }}>
              {done ? "✓" : s.n}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: active ? "var(--ink)" : "var(--ink-3)",
              fontWeight: active ? 700 : 400,
            }}>{s.label}</span>
          </div>
          {i < BOOK_STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: "0 14px",
              background: s.n < current ? "var(--ink)" : "var(--ink-line-2)",
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ——————————————————————————————————————————————————
// STEP 1 — CHOOSE CARD
// ——————————————————————————————————————————————————
const BookHandCard = ({ card, affordable, onPick }) => {
  const [hover, setHover] = React.useState(false);
  const CardComp = card.type === "venue" ? VenueCard : VendorCard;
  const lifted = hover && affordable;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={affordable ? onPick : undefined}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        width: 172,
        cursor: affordable ? "pointer" : "not-allowed",
        opacity: affordable ? 1 : 0.55,
        transform: lifted ? "translateY(-8px)" : "none",
        transition: "transform 130ms ease",
      }}
    >
      <div style={{ pointerEvents: "none" }}>
        <CardComp {...card} width={172} highlight={lifted} />
      </div>
      {affordable ? (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em",
          textTransform: "uppercase", padding: "6px 14px",
          border: "2px solid var(--ink)",
          background: lifted ? "var(--accent)" : "var(--paper-soft)",
          color: lifted ? "var(--paper)" : "var(--ink)",
          boxShadow: lifted ? "3px 3px 0 var(--ink)" : "2px 2px 0 var(--ink)",
          transition: "background 120ms ease",
        }}>Select →</span>
      ) : (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--warning)", textAlign: "center", lineHeight: 1.3,
        }}>Need {card.cost - 0} coins<br />({card.cost - 0} &gt; balance)</span>
      )}
    </div>
  );
};

const BookChooseCard = ({ hand, coins, onPick, onClose, stepper }) => (
  <Modal
    title="Book a Card"
    eyebrow="Action · Book · Step 1 of 3"
    width={1000}
    padding={0}
    onClose={onClose}
    stepper={stepper}
  >
    <div style={{
      padding: "14px 24px", background: "var(--paper-deep)",
      borderBottom: "2px solid var(--ink)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Your hand · {hand.length} cards</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Coins available</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--coin-deep)", lineHeight: 1 }}>{coins}</span>
      </div>
    </div>

    <div style={{ padding: "30px 24px 26px" }}>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {hand.map((card, idx) => (
          <BookHandCard key={idx} card={card} affordable={card.cost <= coins} onPick={() => onPick(idx)} />
        ))}
      </div>
      <div style={{
        textAlign: "center", marginTop: 26,
        fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15,
        color: "var(--ink-3)",
      }}>
        Choose a card to place on your wedding grid. Venues are booked into the center; vendors fill any open cell.
      </div>
    </div>
  </Modal>
);

// ——————————————————————————————————————————————————
// STEP 2 — CHOOSE POSITION
// ——————————————————————————————————————————————————
const BookOccupantTile = ({ cell }) => {
  const isDIY = cell.type === "diy";
  const cat = isDIY ? cell.category : (cell.card && cell.card.category);
  const name = isDIY ? `DIY ${cell.category}` : (cell.card && cell.card.name);
  const tone = isDIY ? "var(--ink-2)" : CATEGORY_TONE[cat];
  return (
    <div style={{
      aspectRatio: "1 / 1", position: "relative",
      background: tone, border: "2px solid var(--ink)",
      display: "flex", flexDirection: "column",
      filter: "saturate(0.85)",
    }}>
      <div style={{
        position: "absolute", top: 6, left: 6,
        fontFamily: "var(--font-mono)", fontSize: 7.5, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "var(--paper)",
        background: "rgba(0,0,0,0.35)", padding: "2px 5px",
      }}>{isDIY ? "DIY" : "Booked"}</div>
      <div style={{ flex: 1, display: "grid", placeItems: "center", minHeight: 0 }}>
        <img
          src={`assets/icons/category/${CATEGORY_SLUG[cat]}.png`}
          alt=""
          style={{ width: 40, height: 40, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }}
        />
      </div>
      <div style={{
        padding: "6px 8px", background: "rgba(0,0,0,0.32)",
        fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 12,
        color: "var(--paper)", lineHeight: 1.15, textAlign: "center",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{name}</div>
    </div>
  );
};

const BookGridCell = ({ index, cell, legal, isVenueSlot, isVenueCard, onPlace }) => {
  const [hover, setHover] = React.useState(false);

  if (cell) return <BookOccupantTile cell={cell} />;

  const bonus = GRID_BONUS[index];

  if (legal) {
    return (
      <div
        role="button"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onPlace(index)}
        style={{
          aspectRatio: "1 / 1", position: "relative", cursor: "pointer",
          background: hover ? "var(--accent-soft)" : "var(--paper-soft)",
          border: `3px solid var(--accent)`,
          boxShadow: hover ? "4px 4px 0 var(--ink)" : "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 6, transition: "background 100ms ease",
        }}
      >
        {isVenueSlot && (
          <span style={{
            position: "absolute", top: 8, left: 0, right: 0, textAlign: "center",
            fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "var(--accent-deep)",
          }}>Venue slot</span>
        )}
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 40, lineHeight: 1,
          color: "var(--accent)",
        }}>{index + 1}</span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "var(--ink-2)",
        }}>+{bonus}</span>
        <span style={{
          position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center",
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "var(--accent)",
          opacity: hover ? 1 : 0,
        }}>Place here</span>
      </div>
    );
  }

  // illegal empty (e.g. the venue centre when holding a vendor, or vice-versa)
  return (
    <div style={{
      aspectRatio: "1 / 1", position: "relative",
      background: "var(--paper-deep)",
      border: "2px dashed var(--ink-line-2)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      {isVenueSlot && (
        <span style={{
          position: "absolute", top: 8, left: 0, right: 0, textAlign: "center",
          fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "var(--ink-3)",
        }}>{isVenueCard ? "" : "Venue only"}</span>
      )}
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 40, lineHeight: 1,
        color: "var(--ink-line-2)",
      }}>{index + 1}</span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "var(--ink-3)",
      }}>+{bonus}</span>
    </div>
  );
};

const BookChoosePosition = ({ card, grid, onPlace, onBack, onClose, stepper }) => {
  const isVenueCard = card.type === "venue";
  const CardComp = isVenueCard ? VenueCard : VendorCard;
  const legalCell = (i) => {
    if (grid[i]) return false;       // occupied
    if (i === 4) return isVenueCard; // centre is venue-only
    return !isVenueCard;             // a venue can only sit in the centre
  };
  const legalCount = grid.reduce((n, _, i) => n + (legalCell(i) ? 1 : 0), 0);

  return (
    <Modal
      title="Choose Position"
      eyebrow="Action · Book · Step 2 of 3"
      width={1000}
      padding={0}
      onClose={onClose}
      stepper={stepper}
      footer={
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)" }}>
            {legalCount} open {legalCount === 1 ? "cell" : "cells"} · select one to continue
          </span>
          <button onClick={onBack} style={bookFlowGhost}>← Back to cards</button>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", alignItems: "stretch" }}>

        {/* LEFT — the chosen card */}
        <div style={{
          borderRight: "2px solid var(--ink)", padding: 24,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          background: "var(--paper-soft)",
        }}>
          <div className="t-eyebrow t-eyebrow-accent" style={{ alignSelf: "flex-start" }}>You're placing</div>
          <div style={{ pointerEvents: "none" }}>
            <CardComp {...card} width={200} />
          </div>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 17, color: "var(--ink)", lineHeight: 1.2 }}>{card.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              {card.cost} {card.cost === 1 ? "coin" : "coins"} · +{card.excitement} excite
            </div>
          </div>
          <button onClick={onBack} style={{ ...bookFlowGhost, marginTop: "auto" }}>Change card</button>
        </div>

        {/* RIGHT — the grid */}
        <div style={{ padding: 24 }}>
          <div className="t-eyebrow" style={{ color: "var(--ink-3)", marginBottom: 4 }}>
            Your wedding grid
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--ink-2)", marginBottom: 14, lineHeight: 1.35 }}>
            {isVenueCard
              ? "Venues are booked into the center slot. Its bonus applies on placement."
              : "Pick any highlighted cell. The cell's bonus action triggers when you book here."}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {grid.map((cell, i) => (
              <BookGridCell
                key={i}
                index={i}
                cell={cell}
                legal={legalCell(i)}
                isVenueSlot={i === 4}
                isVenueCard={isVenueCard}
                onPlace={onPlace}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ——————————————————————————————————————————————————
// ORCHESTRATOR
// ——————————————————————————————————————————————————
const BookCardFlow = ({ hand, grid, coins = 7, onClose, onComplete }) => {
  const theHand = hand || window.SAMPLE_HAND;
  const theGrid = grid || (window.SAMPLE_ALEX_STATE && window.SAMPLE_ALEX_STATE.grid);
  const [step, setStep] = React.useState(1);
  const [cardIdx, setCardIdx] = React.useState(null);
  const [cell, setCell] = React.useState(null);
  const card = cardIdx != null ? theHand[cardIdx] : null;

  const jump = (n) => {
    if (n === 1) setStep(1);
    else if (n === 2 && card) setStep(2);
  };
  const stepper = (cur) => <BookStepper current={cur} onJump={jump} />;

  if (step === 2 && card) {
    return (
      <BookChoosePosition
        card={card}
        grid={theGrid}
        onClose={onClose}
        onBack={() => setStep(1)}
        stepper={stepper(2)}
        onPlace={(i) => { setCell(i); setStep(3); }}
      />
    );
  }
  if (step === 3 && card && cell != null) {
    return (
      <BookCardModal
        card={card}
        targetCell={cell}
        coins={coins}
        onClose={onClose}
        stepper={stepper(3)}
      />
    );
  }
  // default — step 1
  return (
    <BookChooseCard
      hand={theHand}
      coins={coins}
      onClose={onClose}
      stepper={stepper(1)}
      onPick={(idx) => { setCardIdx(idx); setStep(2); }}
    />
  );
};

const bookFlowGhost = {
  padding: "9px 16px",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  background: "var(--paper-soft)",
  color: "var(--ink)",
  border: "1.5px solid var(--ink)",
  cursor: "pointer",
};

Object.assign(window, { BookCardFlow, BookStepper, BookChooseCard, BookChoosePosition });
