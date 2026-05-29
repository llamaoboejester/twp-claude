/* cards.jsx — The Wedding Planner card library
   Press direction.

   PRIMARY: every card displays cost, excitement, category, theme elements,
   and name at every size — these are required data, never dropped.

   Components:
     VendorCard       — default mini card. The 5 required data points only.
     VendorCardDetail — full-glory card (photo + flavor + When-Booked) shown in zoom modal.
     VenueCard        — center-only mini card.
     VenueCardDetail  — full-glory venue.
     MomentCard, AwardCard, ThemeCard, HelperCard,
     DIYBack, VendorDeckTop, VenueDeckBack.

   Interaction: every card-rendering component accepts an optional `onZoom`
   prop. When provided, the card responds to double-click and ctrl/cmd-click
   by invoking onZoom(). Single-click is reserved for select/draft.
*/

const CARD_W = 196;
const CARD_H = 280;

// ——————————————————————————————————————————————————
// PRIMITIVES
// ——————————————————————————————————————————————————

// Build the standard zoom interactions on any clickable card wrapper.
const zoomHandlers = (onZoom) => onZoom ? {
  onDoubleClick: (e) => { e.stopPropagation(); onZoom(); },
  onClick: (e) => {
    if (e.ctrlKey || e.metaKey) { e.stopPropagation(); onZoom(); }
  },
  onContextMenu: (e) => { e.preventDefault(); onZoom(); },
  title: "Double-click, ctrl-click, or right-click to zoom",
} : {};

const CardShell = ({
  width = CARD_W,
  height = CARD_H,
  lift = false,
  onZoom = null,
  zoomable = true,
  children,
  style = {},
  innerRef,
}) => {
  const handlers = zoomable ? zoomHandlers(onZoom) : {};
  return (
    <div
      ref={innerRef}
      className="card-shell"
      style={{
        width,
        height,
        background: "var(--paper-soft)",
        border: "2px solid var(--ink)",
        boxShadow: lift ? "6px 6px 0 var(--ink)" : "3px 3px 0 var(--ink)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        flex: "0 0 auto",
        cursor: onZoom ? "zoom-in" : "default",
        userSelect: "none",
        ...style,
      }}
      {...handlers}
    >
      {children}
    </div>
  );
};

const CostChip = ({ cost = 3, size = 26 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      background: "var(--coin)",
      border: "2px solid var(--ink)",
      borderRadius: "50%",
      color: "var(--ink)",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: size * 0.55,
      lineHeight: 1,
      fontVariantNumeric: "tabular-nums",
      flex: "0 0 auto",
    }}
    aria-label={`cost ${cost}`}
  >
    {cost}
  </span>
);

// Excitement starburst — vermilion accent
const ExciteBurst = ({ value = 2, size = 28 }) => (
  <span
    style={{
      position: "relative",
      display: "inline-block",
      width: size,
      height: size,
      flex: "0 0 auto",
    }}
    aria-label={`+${value} excitement`}
  >
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ position: "absolute", inset: 0 }}>
      <path
        d="M 16 1 L 17.6 6 L 22.6 3.3 L 22 8.9 L 27.4 7.3 L 25.1 12.5 L 30.5 12.9 L 26.8 16.9 L 31 19.7 L 25.7 21.2 L 28 26.2 L 22.6 25.4 L 22.8 30.8 L 18.2 27.9 L 16 32.5 L 13.8 27.9 L 9.2 30.8 L 9.4 25.4 L 4 26.2 L 6.3 21.2 L 1 19.7 L 5.2 16.9 L 1.5 12.9 L 6.9 12.5 L 4.6 7.3 L 10 8.9 L 9.4 3.3 L 14.4 6 Z"
        fill="var(--accent)"
        stroke="var(--ink)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
    <span
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: size * 0.42,
        lineHeight: 1,
        color: "var(--paper)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </span>
  </span>
);

// Theme element circular chip — uses user's existing source PNG
const ElementChip = ({ element, size = 22 }) => {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: `url(assets/icons/source/${element}.png) center / cover no-repeat`,
        border: "1.5px solid var(--ink)",
        borderRadius: "50%",
        flex: "0 0 auto",
        overflow: "hidden",
      }}
      aria-label={element}
    />
  );
};

// Bottom category cap — stamp-ink color + small white icon + uppercase name
const CategoryCap = ({ category, height = 24, compact = false }) => {
  const tone = CATEGORY_TONE[category];
  return (
    <div
      style={{
        height,
        background: tone,
        color: "var(--paper)",
        borderTop: "2px solid var(--ink)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 8px",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: compact ? 9 : 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        lineHeight: 1,
        flex: "0 0 auto",
      }}
    >
      <span style={{
        display: "inline-block",
        width: height - 10,
        height: height - 10,
        background: "var(--paper)",
        WebkitMask: `url(assets/icons/category/${CATEGORY_SLUG[category]}.png) center / contain no-repeat`,
        mask: `url(assets/icons/category/${CATEGORY_SLUG[category]}.png) center / contain no-repeat`,
        flex: "0 0 auto",
      }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{category}</span>
    </div>
  );
};

// ——————————————————————————————————————————————————
// VENDOR CARD — SQUARE (1:1), all required data, no nice-to-haves
// ——————————————————————————————————————————————————

const VendorCard = ({
  name = "Aerial Drone Photography",
  category = "Photography",
  cost = 3,
  excitement = 2,
  elements = ["whimsy", "edge", "nature"],
  weather = false,
  width = 130,
  height = null,        // default to square if null
  onZoom = null,
  highlight = false,
}) => {
  const h = height ?? width;
  const nameFontSize = Math.max(11, Math.min(16, width * 0.105));
  const chipSize = Math.max(18, Math.min(26, width * 0.20));
  const pipSize = Math.max(14, Math.min(20, width * 0.15));
  const capH = Math.max(18, Math.min(24, width * 0.17));

  return (
    <CardShell
      width={width}
      height={h}
      onZoom={onZoom}
      style={highlight ? { outline: "3px solid var(--accent)", outlineOffset: 2 } : {}}
    >
      {/* Top stat row — cost + (weather) + excitement */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `4px 6px`,
        borderBottom: "1px solid var(--ink-line-2)",
        background: "var(--paper-soft)",
        flex: "0 0 auto",
      }}>
        <CostChip cost={cost} size={chipSize} />
        {weather && <WeatherIcon size={chipSize * 0.6} />}
        <ExciteBurst value={excitement} size={chipSize} />
      </div>

      {/* Name + pips */}
      <div style={{
        padding: "4px 6px 4px",
        textAlign: "center",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
        minHeight: 0,
      }}>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: nameFontSize,
          lineHeight: 1,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
          textWrap: "balance",
        }}>
          {name}
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
        }}>
          {elements.map((e, i) => <ElementChip key={i} element={e} size={pipSize} />)}
        </div>
      </div>

      <CategoryCap category={category} height={capH} compact={width < 120} />
    </CardShell>
  );
};

// ——————————————————————————————————————————————————
// VENDOR CARD DETAIL — full glory, used in zoom modal
// ——————————————————————————————————————————————————

const VendorCardDetail = ({
  name = "Aerial Drone Photography",
  category = "Photography",
  cost = 3,
  excitement = 2,
  elements = ["whimsy", "edge", "nature"],
  weather = false,
  whenBooked = null,
  flavor = "Sweeping aerial views blend whimsy and elegance in breathtaking perspective.",
  width = 320,
  height = 460,
}) => (
  <CardShell width={width} height={height} zoomable={false} lift style={{ overflow: "hidden" }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 14px",
      borderBottom: "1px solid var(--ink-line-2)",
    }}>
      <CostChip cost={cost} size={42} />
      {weather && <WeatherIcon size={22} />}
      <ExciteBurst value={excitement} size={44} />
    </div>

    {/* Photo well */}
    <div style={{
      height: width * 0.42,
      flexShrink: 0,
      borderBottom: "2px solid var(--ink)",
      background: "repeating-linear-gradient(135deg, var(--paper-deep) 0 8px, var(--paper-shade) 8px 16px)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        color: "var(--ink-3)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
      }}>
        Photo
      </div>
    </div>

    <div style={{ padding: "16px 16px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 26,
        lineHeight: 1,
        color: "var(--ink)",
        letterSpacing: "-0.015em",
        textWrap: "balance",
      }}>
        {name}
      </div>

      {flavor && (
        <div style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 13,
          lineHeight: 1.4,
          color: "var(--ink-2)",
          textWrap: "pretty",
        }}>
          “{flavor}”
        </div>
      )}

      {whenBooked && (
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          lineHeight: 1.4,
          color: "var(--ink-2)",
          borderTop: "1px solid var(--ink-line-2)",
          paddingTop: 8,
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginRight: 6,
          }}>
            When booked
          </span>
          {whenBooked}
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "4px 0" }}>
        {elements.map((e, i) => <ElementChip key={i} element={e} size={32} />)}
      </div>
    </div>

    <CategoryCap category={category} height={32} />
  </CardShell>
);

// ——————————————————————————————————————————————————
// VENUE CARD — default mini
// ——————————————————————————————————————————————————

const VenueCard = ({
  name = "The Old Stone Chapel",
  cost = 5,
  excitement = 4,
  elements = ["tradition", "nature", "wild"],
  weather = false,
  exclusive = false,
  width = 130,
  height = null,
  onZoom = null,
  highlight = false,
}) => {
  const h = height ?? width;
  const nameFontSize = Math.max(11, Math.min(16, width * 0.105));
  const chipSize = Math.max(18, Math.min(26, width * 0.20));
  const pipSize = Math.max(14, Math.min(20, width * 0.15));
  const capH = Math.max(18, Math.min(24, width * 0.17));

  return (
    <CardShell
      width={width}
      height={h}
      onZoom={onZoom}
      style={highlight ? { outline: "3px solid var(--accent)", outlineOffset: 2 } : {}}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `4px 6px`,
        borderBottom: "1px solid var(--ink-line-2)",
        background: "var(--paper-soft)",
        flex: "0 0 auto",
      }}>
        <CostChip cost={cost} size={chipSize} />
        {weather && <WeatherIcon size={chipSize * 0.6} />}
        <ExciteBurst value={excitement} size={chipSize} />
      </div>

      <div style={{
        padding: "4px 6px",
        textAlign: "center",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
        minHeight: 0,
      }}>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: nameFontSize,
          lineHeight: 1,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
          textWrap: "balance",
        }}>
          {name}
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
        }}>
          {elements.map((e, i) => <ElementChip key={i} element={e} size={pipSize} />)}
        </div>
      </div>

      <div style={{
        height: capH,
        background: "var(--ink)",
        color: "var(--coin)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        borderTop: "2px solid var(--ink)",
        flex: "0 0 auto",
      }}>
        {exclusive ? "Exclusive Venue" : "The Venue"}
      </div>
    </CardShell>
  );
};

// ——————————————————————————————————————————————————
// VENUE CARD DETAIL
// ——————————————————————————————————————————————————

const VenueCardDetail = ({
  name = "The Old Stone Chapel",
  cost = 5,
  excitement = 4,
  elements = ["tradition", "nature", "wild"],
  weather = false,
  whenBooked = "Add Officiant Pastor Hart to your hand.",
  flavor = "Time-softened stone, hymn-warmed wood, and the murmur of vows said a thousand times before.",
  exclusive = false,
  width = 320,
  height = 480,
}) => (
  <CardShell width={width} height={height} zoomable={false} lift style={{ overflow: "hidden" }}>
    <div style={{
      background: "var(--ink)",
      color: "var(--coin)",
      padding: "8px 14px",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      textAlign: "center",
      borderBottom: "2px solid var(--ink)",
    }}>
      {exclusive ? "Exclusive Venue · Center Only" : "Venue · Center Only"}
    </div>

    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 14px",
      borderBottom: "1px solid var(--ink-line-2)",
    }}>
      <CostChip cost={cost} size={42} />
      {weather && <WeatherIcon size={22} />}
      <ExciteBurst value={excitement} size={44} />
    </div>

    <div style={{
      height: width * 0.36,
      flexShrink: 0,
      borderBottom: "2px solid var(--ink)",
      background: "repeating-linear-gradient(135deg, var(--paper-deep) 0 8px, var(--paper-shade) 8px 16px)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        color: "var(--ink-3)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
      }}>
        Venue photo
      </div>
    </div>

    <div style={{ padding: "16px 16px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: 26,
        lineHeight: 1,
        color: "var(--ink)",
        letterSpacing: "-0.015em",
        textWrap: "balance",
      }}>
        {name}
      </div>
      {flavor && (
        <div style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 13,
          lineHeight: 1.4,
          color: "var(--ink-2)",
          textWrap: "pretty",
        }}>
          “{flavor}”
        </div>
      )}
      {whenBooked && (
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          lineHeight: 1.4,
          color: "var(--ink-2)",
          borderTop: "1px solid var(--ink-line-2)",
          paddingTop: 8,
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginRight: 6,
          }}>
            When booked
          </span>
          {whenBooked}
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "4px 0" }}>
        {elements.map((e, i) => <ElementChip key={i} element={e} size={32} />)}
      </div>
    </div>

    <div style={{
      height: 32,
      background: "var(--ink)",
      color: "var(--coin)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
    }}>
      The Venue
    </div>
  </CardShell>
);

// ——————————————————————————————————————————————————
// MOMENT CARD
// ——————————————————————————————————————————————————

const MomentCard = ({
  name = "The Aisle",
  pattern = [0, 1, 0, 0, 1, 0, 0, 1, 0],
  first = 3,
  others = 1,
  difficulty = "Easy",
  flavor = null,
  width = 150,
  height = 210,
  onZoom = null,
}) => {
  const cellSize = Math.max(16, Math.min(28, width * 0.18));
  return (
    <CardShell width={width} height={height} onZoom={onZoom} style={{ background: "var(--paper-soft)" }}>
      <div style={{
        background: "var(--accent)",
        color: "var(--paper)",
        padding: "5px 10px",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "2px solid var(--ink)",
      }}>
        <span>Moment</span>
        <span style={{ opacity: 0.9 }}>{difficulty}</span>
      </div>

      <div style={{ padding: "10px 8px 4px", textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: Math.max(16, width * 0.13),
          lineHeight: 1,
          color: "var(--ink)",
        }}>
          {name}
        </div>
      </div>

      <div style={{ display: "grid", placeItems: "center", padding: "6px 8px", flex: 1 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(3, ${cellSize}px)`,
          gridTemplateRows: `repeat(3, ${cellSize}px)`,
          gap: 2,
          padding: 3,
          background: "var(--ink)",
        }}>
          {pattern.map((p, i) => (
            <div key={i} style={{
              background: p ? "var(--accent)" : "var(--paper)",
              border: p ? "1.5px solid var(--ink)" : "1.5px solid var(--ink-line-2)",
            }} />
          ))}
        </div>
      </div>

      <div style={{
        borderTop: "2px solid var(--ink)",
        display: "grid",
        gridTemplateColumns: "1fr 1px 1fr",
        background: "var(--paper-deep)",
      }}>
        <div style={{ padding: "6px 4px", textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}>
            First
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.1,
            color: "var(--gift)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {first}
          </div>
        </div>
        <div style={{ background: "var(--ink)" }} />
        <div style={{ padding: "6px 4px", textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}>
            Others
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.1,
            color: "var(--gift)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {others}
          </div>
        </div>
      </div>
    </CardShell>
  );
};

// ——————————————————————————————————————————————————
// HELPER CARD
// ——————————————————————————————————————————————————

const HelperCard = ({
  name = "Aunt Margaret",
  type = "Money",
  offer = "Receive 4 coins now.",
  commitment = null,
  faceDown = false,
  width = 140,
  height = 130,
  onZoom = null,
}) => {
  const typeTone = {
    Money: "var(--coin)",
    Effort: "var(--el-edge)",
    Research: "var(--el-nature)",
  }[type];
  if (faceDown) {
    return (
      <CardShell width={width} height={height} onZoom={onZoom}>
        <div style={{
          flex: 1,
          background: `repeating-linear-gradient(45deg, ${typeTone} 0 8px, var(--ink) 8px 10px)`,
          display: "grid",
          placeItems: "center",
        }}>
          <div style={{
            background: "var(--paper-soft)",
            color: "var(--ink)",
            padding: "5px 12px",
            border: "2px solid var(--ink)",
            boxShadow: "2px 2px 0 var(--ink)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}>
            {type}
          </div>
        </div>
      </CardShell>
    );
  }
  return (
    <CardShell width={width} height={height} onZoom={onZoom}>
      <div style={{
        background: typeTone,
        color: type === "Money" ? "var(--ink)" : "var(--paper)",
        padding: "4px 8px",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        borderBottom: "2px solid var(--ink)",
        textAlign: "center",
      }}>
        Helper · {type}
      </div>
      <div style={{ padding: "6px 8px 0" }}>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          lineHeight: 1,
          color: "var(--ink)",
        }}>
          {name}
        </div>
      </div>
      <div style={{
        padding: "6px 8px",
        fontFamily: "var(--font-sans)",
        fontSize: 10,
        lineHeight: 1.35,
        color: "var(--ink-2)",
        flex: 1,
      }}>
        {offer}
      </div>
      {commitment && (
        <div style={{
          margin: "0 6px 6px",
          padding: "4px 6px",
          background: "var(--accent-soft)",
          border: "1.5px solid var(--accent)",
          fontFamily: "var(--font-sans)",
          fontSize: 9,
          lineHeight: 1.3,
          color: "var(--ink)",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--accent-deep)",
            display: "block",
          }}>
            Commitment
          </span>
          {commitment}
        </div>
      )}
    </CardShell>
  );
};

// ——————————————————————————————————————————————————
// AWARD CARD
// ——————————————————————————————————————————————————

const AwardCard = ({
  name = "First Spark",
  kind = "Race",
  condition = "First player to reach 12 excitement.",
  value = 7,
  earnedBy = null,
  width = 140,
  height = 195,
  onZoom = null,
}) => (
  <CardShell width={width} height={height} onZoom={onZoom}>
    <div style={{
      background: kind === "Race" ? "var(--accent)" : "var(--ink)",
      color: kind === "Race" ? "var(--paper)" : "var(--coin)",
      padding: "5px 8px",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "2px solid var(--ink)",
    }}>
      <span>{kind} Award</span>
      <span style={{ opacity: 0.9 }}>+{value}g</span>
    </div>
    <div style={{ padding: "8px 10px 4px" }}>
      <div style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: 18,
        lineHeight: 1,
        color: "var(--ink)",
        textWrap: "balance",
      }}>
        {name}
      </div>
    </div>
    <div style={{
      padding: "0 10px 8px",
      fontFamily: "var(--font-sans)",
      fontSize: 10,
      lineHeight: 1.35,
      color: "var(--ink-2)",
      flex: 1,
    }}>
      {condition}
    </div>
    {earnedBy && (
      <div style={{
        margin: "0 8px 8px",
        padding: "4px 8px",
        background: "var(--ink)",
        color: "var(--coin)",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}>
        Earned · {earnedBy}
      </div>
    )}
  </CardShell>
);

// ——————————————————————————————————————————————————
// THEME CARD
// ——————————————————————————————————————————————————

const ThemeCard = ({
  name = "Bohemian",
  elements = ["nature", "whimsy"],
  width = 140,
  height = 170,
  onZoom = null,
  highlight = false,
  faded = false,
}) => (
  <CardShell
    width={width}
    height={height}
    onZoom={onZoom}
    style={{
      outline: highlight ? "3px solid var(--accent)" : "none",
      outlineOffset: 2,
      opacity: faded ? 0.45 : 1,
    }}
  >
    <div style={{
      flex: 1,
      background: `linear-gradient(135deg, var(--el-${elements[0]}) 0 50%, var(--el-${elements[1]}) 50% 100%)`,
      borderBottom: "2px solid var(--ink)",
      display: "grid",
      placeItems: "center",
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <img src={`assets/icons/source/${elements[0]}.png`} style={{
          width: Math.min(40, width * 0.28),
          height: Math.min(40, width * 0.28),
          borderRadius: "50%",
          border: "2px solid var(--ink)",
        }} alt="" />
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 18,
          color: "var(--paper)",
          textShadow: "1px 1px 0 var(--ink)",
        }}>+</span>
        <img src={`assets/icons/source/${elements[1]}.png`} style={{
          width: Math.min(40, width * 0.28),
          height: Math.min(40, width * 0.28),
          borderRadius: "50%",
          border: "2px solid var(--ink)",
        }} alt="" />
      </div>
    </div>
    <div style={{ padding: "6px 10px 8px", textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 8,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--ink-3)",
      }}>
        Theme
      </div>
      <div style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: Math.min(20, width * 0.16),
        lineHeight: 1,
        color: "var(--ink)",
      }}>
        {name}
      </div>
    </div>
  </CardShell>
);

// ——————————————————————————————————————————————————
// DIY CARD BACK + DECK TOPS
// ——————————————————————————————————————————————————

const DIYBack = ({ category = "Photography", width = 130, height = null, onZoom = null }) => {
  const h = height ?? width;
  return (
  <CardShell width={width} height={h} onZoom={onZoom}>
    <div style={{
      flex: 1,
      background: CATEGORY_TONE[category],
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--paper)",
      padding: 8,
      gap: 8,
    }}>
      <img
        src={`assets/icons/category/${CATEGORY_SLUG[category]}.png`}
        alt=""
        style={{ width: Math.min(54, width * 0.42), height: Math.min(54, width * 0.42), objectFit: "contain" }}
      />
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: Math.min(10, width * 0.075),
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        textAlign: "center",
        lineHeight: 1.1,
      }}>
        {category}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 7,
        letterSpacing: "0.20em",
        textTransform: "uppercase",
        border: "1.5px solid var(--paper)",
        padding: "1px 5px",
      }}>
        D · I · Y
      </div>
    </div>
  </CardShell>
  );
};

const VendorDeckTop = ({ category = "Photography", width = 130, height = null }) => {
  const h = height ?? width;
  return (
  <CardShell width={width} height={h} zoomable={false} style={{ overflow: "hidden" }}>
    <div style={{
      flex: 1,
      minHeight: 0,
      background: CATEGORY_TONE[category],
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--paper)",
      padding: 8,
      gap: 6,
    }}>
      <img
        src={`assets/icons/category/${CATEGORY_SLUG[category]}.png`}
        alt=""
        style={{ width: Math.min(40, width * 0.36), height: Math.min(40, width * 0.36), objectFit: "contain", flex: "0 0 auto" }}
      />
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: Math.min(10, width * 0.075),
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        textAlign: "center",
        lineHeight: 1.1,
      }}>
        {category}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 7,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--paper)",
        opacity: 0.75,
      }}>
        Top of deck
      </div>
    </div>
  </CardShell>
  );
};

const VenueDeckBack = ({ width = 130, height = null }) => {
  const h = height ?? width;
  return (
  <CardShell width={width} height={h} zoomable={false}>
    <div style={{
      flex: 1,
      background: "var(--ink)",
      color: "var(--coin)",
      display: "grid",
      placeItems: "center",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: Math.min(22, width * 0.15),
      letterSpacing: "0.22em",
      textTransform: "uppercase",
    }}>
      Venues
    </div>
  </CardShell>
  );
};

// Aliases for backwards compatibility with screens.jsx / canvas
const VendorCardPhoto = VendorCardDetail; // (deprecated name, kept for canvas)
const VendorCardStat = VendorCard;        // (deprecated name, kept for canvas)

Object.assign(window, {
  CardShell, CostChip, ExciteBurst, ElementChip, CategoryCap,
  VendorCard, VendorCardDetail,
  VenueCard, VenueCardDetail,
  MomentCard, HelperCard, AwardCard, ThemeCard,
  DIYBack, VendorDeckTop, VenueDeckBack,
  VendorCardPhoto, VendorCardStat, // deprecated aliases
  CARD_W, CARD_H, zoomHandlers,
});
