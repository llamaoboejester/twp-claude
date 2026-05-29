/* player-board.jsx — The Wedding Planner player board components
   Press direction. The "own state" surfaces:
     WeddingGrid, ThemeTrackerStack, ExcitementTrack, HelperSlots,
     VisionBoard, HandStrip, PlayerChrome, ActionDock.
*/

// ——————————————————————————————————————————————————
// WEDDING GRID — 3x3, center accepts only venues.
// ——————————————————————————————————————————————————

const GRID_BONUS = {
  0: "Research", 1: "Plan", 2: "Book",
  3: "Help",     4: "Any",  5: "Help",
  6: "Book",     7: "Plan", 8: "Research",
};

const WeddingGrid = ({
  cells = [null, null, null, null, null, null, null, null, null], // 9 entries: null | { type:"vendor"|"diy"|"venue", card }
  cellSize = 130,
  showBonusLabels = true,
  highlightTargets = null,         // array of indices to highlight (for "book" action)
  onCellClick = null,
  onZoom = null,                   // (card) => void for double/ctrl click on a booked card
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(3, ${cellSize}px)`,
        gridTemplateRows: `repeat(3, ${cellSize}px)`,
        gap: 4,
        padding: 4,
        background: "var(--ink)",
        border: "2px solid var(--ink)",
        boxShadow: "4px 4px 0 var(--ink)",
      }}
    >
      {cells.map((cell, i) => {
        const isCenter = i === 4;
        const isHighlight = highlightTargets?.includes(i);
        return (
          <div
            key={i}
            onClick={() => onCellClick?.(i)}
            style={{
              background: "var(--paper-deep)",
              position: "relative",
              cursor: onCellClick ? "pointer" : "default",
              outline: isHighlight ? "3px solid var(--accent)" : "none",
              outlineOffset: -3,
              overflow: "hidden",
            }}
          >
            {cell ? (
              cell.type === "diy" ? (
                <DIYBack category={cell.category} width={cellSize} height={cellSize} onZoom={onZoom ? () => onZoom({ kind: "diy", category: cell.category }) : null} />
              ) : cell.type === "venue" ? (
                <VenueCard {...cell.card} width={cellSize} height={cellSize} onZoom={onZoom ? () => onZoom({ kind: "venue", ...cell.card }) : null} />
              ) : (
                <VendorCard {...cell.card} width={cellSize} height={cellSize} onZoom={onZoom ? () => onZoom({ kind: "vendor", ...cell.card }) : null} />
              )
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                color: "var(--ink-3)",
                position: "relative",
              }}>
                {isCenter && (
                  <div style={{
                    position: "absolute",
                    top: 8,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                      border: "1.5px solid var(--ink-line-2)",
                      padding: "2px 6px",
                    }}>
                      Venue
                    </div>
                  </div>
                )}
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "var(--ink-line-2)",
                }}>
                  {i + 1}
                </div>
                {showBonusLabels && !isCenter && (
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--ink-3)",
                  }}>
                    +{GRID_BONUS[i]}
                  </div>
                )}
                {showBonusLabels && isCenter && (
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                  }}>
                    +Any
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ——————————————————————————————————————————————————
// THEME ELEMENT TRACK — single element 0-8 with milestones
// ——————————————————————————————————————————————————
// Milestones: pos 2 → +1 excite, pos 5 → +1 excite, pos 8 → +5 gifts

const ThemeElementTrack = ({
  element = "whimsy",
  position = 0,
  width = 280,
  compact = false,
}) => {
  const tone = `var(--el-${element})`;
  const cellW = (width - 24) / 9; // 9 positions 0-8
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        width: 92, flex: "0 0 auto",
      }}>
        <img
          src={`assets/icons/source/${element}.png`}
          style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid var(--ink)" }}
          alt=""
        />
        {!compact && (
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink)",
          }}>
            {element}
          </div>
        )}
      </div>
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: `repeat(9, 1fr)`,
        gap: 2,
        border: "1.5px solid var(--ink)",
        background: "var(--paper-deep)",
      }}>
        {Array.from({ length: 9 }, (_, i) => {
          const filled = i < position;
          const isMilestone = [2, 5, 8].includes(i);
          return (
            <div
              key={i}
              style={{
                position: "relative",
                height: 22,
                background: filled ? tone : "var(--paper-soft)",
                borderRight: i < 8 ? "1px solid var(--ink-line-2)" : 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isMilestone && !filled && (
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  color: "var(--ink-3)",
                }}>
                  {i === 8 ? "★" : "•"}
                </span>
              )}
              {i === position - 1 && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  border: "2px solid var(--ink)",
                  pointerEvents: "none",
                }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--ink)",
        width: 22,
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
      }}>
        {position}
      </div>
    </div>
  );
};

const ThemeTrackerStack = ({
  positions = { whimsy: 0, edge: 0, nature: 0, tradition: 0, elegance: 0 },
  width = 320,
}) => (
  <div style={{
    background: "var(--paper-soft)",
    border: "2px solid var(--ink)",
    padding: "12px 14px",
    boxShadow: "3px 3px 0 var(--ink)",
  }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 10,
    }}>
      <div className="t-eyebrow t-eyebrow-accent">Theme Elements</div>
      <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>0 — 8</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {["whimsy","edge","nature","tradition","elegance"].map(el => (
        <ThemeElementTrack key={el} element={el} position={positions[el] ?? 0} width={width - 32} />
      ))}
    </div>
  </div>
);

// ——————————————————————————————————————————————————
// EXCITEMENT TRACK — linear 0-30 with milestones
// ——————————————————————————————————————————————————
// Milestones at 5, 15, 25: gain 1 coin OR draw 1 card

const ExcitementTrack = ({
  position = 0,
  width = 480,
}) => {
  const milestones = [5, 15, 25];
  return (
    <div style={{
      background: "var(--paper-soft)",
      border: "2px solid var(--ink)",
      padding: "12px 14px",
      boxShadow: "3px 3px 0 var(--ink)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div className="t-eyebrow" style={{ color: "var(--accent)" }}>Excitement</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1,
            color: "var(--accent)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {position}
          </span>
          <span className="t-eyebrow" style={{ color: "var(--ink-3)" }}>/ 30</span>
        </div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(30, 1fr)",
        gap: 1.5,
        border: "1.5px solid var(--ink)",
        background: "var(--paper-deep)",
        marginBottom: 4,
      }}>
        {Array.from({ length: 30 }, (_, i) => {
          const filled = i < position;
          const isMs = milestones.includes(i + 1);
          return (
            <div
              key={i}
              style={{
                position: "relative",
                height: 18,
                background: filled ? "var(--accent)" : "var(--paper-soft)",
                borderRight: i === position - 1 ? "2px solid var(--ink)" : 0,
              }}
            >
              {isMs && (
                <div style={{
                  position: "absolute",
                  top: -2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 4, height: 4,
                  background: "var(--ink)",
                  borderRadius: "50%",
                }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "var(--ink-3)",
        letterSpacing: "0.08em",
      }}>
        <span>0</span>
        <span style={{ marginLeft: `${(5/30)*100 - 2}%` }}>5 ◆ coin or card</span>
        <span style={{ marginLeft: `${(15/30)*100 - 26}%` }}>15 ◆</span>
        <span style={{ marginLeft: `${(25/30)*100 - 50}%` }}>25 ◆</span>
        <span>30</span>
      </div>
    </div>
  );
};

// ——————————————————————————————————————————————————
// HELPER SLOTS — 3 slots, face up/down per slot
// ——————————————————————————————————————————————————

const HelperSlots = ({
  slots = [null, null, null],
  width = 420,
}) => {
  // Vertical stack if narrow (sidebar use); 3-column grid if wide.
  const vertical = width <= 300;
  const typeTone = (t) => ({
    Money: "var(--coin)",
    Effort: "var(--el-edge)",
    Research: "var(--el-nature)",
  }[t] || "var(--ink-line-2)");
  return (
    <div style={{
      background: "var(--paper-soft)",
      border: "2px solid var(--ink)",
      padding: 14,
      boxShadow: "3px 3px 0 var(--ink)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div className="t-eyebrow t-eyebrow-accent">Helpers</div>
        <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>{slots.filter(Boolean).length} / 3</div>
      </div>
      {vertical ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {slots.map((slot, i) => (
            slot ? (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 8,
                alignItems: "stretch",
                border: "2px solid var(--ink)",
                background: "var(--paper-soft)",
                boxShadow: "2px 2px 0 var(--ink)",
              }}>
                <div style={{
                  background: typeTone(slot.type),
                  color: slot.type === "Money" ? "var(--ink)" : "var(--paper)",
                  padding: "6px 6px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 8,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}>
                  {slot.type}
                </div>
                <div style={{ padding: "6px 8px 6px 0", display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 13,
                    lineHeight: 1.1,
                    color: "var(--ink)",
                  }}>{slot.name}</div>
                  <div style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 10,
                    lineHeight: 1.3,
                    color: "var(--ink-2)",
                  }}>{slot.offer}</div>
                  {slot.commitment && (
                    <div style={{
                      marginTop: 2,
                      padding: "3px 5px",
                      background: "var(--accent-soft)",
                      border: "1px solid var(--accent)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 9,
                      lineHeight: 1.25,
                      color: "var(--ink)",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 7,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--accent-deep)",
                        marginRight: 4,
                      }}>Commit</span>
                      {slot.commitment}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={i} style={{
                padding: "10px 8px",
                border: "2px dashed var(--ink-line-2)",
                color: "var(--ink-3)",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                textAlign: "center",
              }}>
                Empty slot {i+1}
              </div>
            )
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {slots.map((slot, i) => (
            slot ? (
              <HelperCard
                key={i}
                {...slot}
                width={(width - 28 - 16) / 3}
                height={120}
              />
            ) : (
              <div key={i} style={{
                height: 120,
                border: "2px dashed var(--ink-line-2)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink-3)",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}>
                Slot {i+1}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

// ——————————————————————————————————————————————————
// VISION BOARD — theme card + goals
// ——————————————————————————————————————————————————

const VisionBoard = ({
  theme = null,
  themeOptions = null, // [{name, elements}, ...] when no theme picked yet (pre-CI1)
  goals = [],
  unsetCheckIns = [],
  width = 420,
  onZoom = null,
  compact = false,
}) => (
  <div style={{
    background: "var(--paper-soft)",
    border: "2px solid var(--ink)",
    padding: 14,
    boxShadow: "3px 3px 0 var(--ink)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
      <div className="t-eyebrow t-eyebrow-accent">Vision Board</div>
      {!theme && themeOptions && (
        <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Choose at Check-In 1</div>
      )}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: themeOptions && !theme ? "auto auto 1fr" : "auto 1fr", gap: 12 }}>
      {/* Theme slot(s) */}
      {theme ? (
        <div>
          <ThemeCard {...theme} width={compact ? 100 : 120} height={compact ? 130 : 150} onZoom={onZoom ? () => onZoom({ kind: "theme", ...theme }) : null} />
        </div>
      ) : themeOptions ? (
        <>
          <div>
            <ThemeCard {...themeOptions[0]} width={92} height={120} onZoom={onZoom ? () => onZoom({ kind: "theme", ...themeOptions[0] }) : null} />
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9, color: "var(--ink-3)",
              letterSpacing: "0.12em", textAlign: "center", marginTop: 4,
            }}>Option 1</div>
          </div>
          <div>
            <ThemeCard {...themeOptions[1]} width={92} height={120} onZoom={onZoom ? () => onZoom({ kind: "theme", ...themeOptions[1] }) : null} />
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9, color: "var(--ink-3)",
              letterSpacing: "0.12em", textAlign: "center", marginTop: 4,
            }}>Option 2</div>
          </div>
        </>
      ) : (
        <div style={{
          width: 120, height: 150,
          border: "2px dashed var(--ink-line-2)",
          display: "grid", placeItems: "center",
          color: "var(--ink-3)",
          fontFamily: "var(--font-mono)",
          fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
          textAlign: "center", padding: 12,
        }}>
          Set at<br/>Check-In 1
        </div>
      )}
      {/* Goals */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[1, 2, 3].map(n => {
          const g = goals.find(x => x.checkIn === n);
          if (g) {
            return (
              <div key={n} style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 8,
                alignItems: "center",
                border: "1.5px solid var(--ink)",
                padding: "6px 8px",
                background: "var(--paper-deep)",
              }}>
                <span className="t-eyebrow" style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>Check-In {n}</span>
                <div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700, fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                  }}>
                    {g.type}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic", fontSize: 13,
                    color: "var(--ink-2)",
                    lineHeight: 1,
                  }}>
                    {g.tier}
                  </div>
                </div>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700, fontSize: 18,
                  color: "var(--gift)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  +{g.value}
                </div>
              </div>
            );
          }
          return (
            <div key={n} style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 8,
              alignItems: "center",
              border: "1.5px dashed var(--ink-line-2)",
              padding: "6px 8px",
              color: "var(--ink-3)",
            }}>
              <span className="t-eyebrow" style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>Check-In {n}</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}>
                Goal not yet set
              </span>
            </div>
          );
        })}
        {/* Balanced bonus */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 8,
          alignItems: "center",
          padding: "4px 8px",
          marginTop: 2,
        }}>
          <div>
            <div className="t-eyebrow" style={{ color: "var(--accent)" }}>Balanced bonus</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-2)", lineHeight: 1.2 }}>
              Both theme elements equal at endgame.
            </div>
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 18,
            color: "var(--gift)",
          }}>
            +5
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ——————————————————————————————————————————————————
// HAND STRIP — your private hand cards
// ——————————————————————————————————————————————————

const HandStrip = ({
  cards = [],           // [{type:"vendor"|"venue", ...cardProps}]
  width = 880,
  cardW = 140,
  selected = -1,
  onSelect = null,
  onZoom = null,
}) => (
  <_HandStrip cards={cards} width={width} cardW={cardW} selected={selected} onSelect={onSelect} onZoom={onZoom} />
);

const _HandStrip = ({ cards, width, cardW, selected, onSelect, onZoom }) => (
  <div style={{
    background: "var(--paper-soft)",
    border: "2px solid var(--ink)",
    padding: 14,
    boxShadow: "3px 3px 0 var(--ink)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
      <div className="t-eyebrow t-eyebrow-accent">Your Hand</div>
      <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>
        {cards.length} / 5 · max 3 venues
      </div>
    </div>
    <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
      {cards.length === 0 && (
        <div style={{
          padding: "32px 0",
          color: "var(--ink-3)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}>Hand empty</div>
      )}
      {cards.map((card, i) => (
        <div
          key={i}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) return; // let zoom handler in card fire
            onSelect?.(i);
          }}
          style={{
            cursor: onSelect ? "pointer" : "default",
            transform: selected === i ? "translateY(-12px)" : "none",
            transition: "transform 120ms ease",
          }}
        >
          {card.type === "venue" ? (
            <VenueCard {...card} width={cardW} height={cardW} onZoom={onZoom ? () => onZoom({ kind: "venue", ...card }) : null} highlight={selected === i} />
          ) : (
            <VendorCard {...card} width={cardW} height={cardW} onZoom={onZoom ? () => onZoom({ kind: "vendor", ...card }) : null} highlight={selected === i} />
          )}
        </div>
      ))}
    </div>
  </div>
);

// ——————————————————————————————————————————————————
// ACTION DOCK — the 4 action spaces with meeple
// ——————————————————————————————————————————————————

const ActionDock = ({
  meepleAt = "Vision",      // "Vision"|"Research"|"Book"|"Plan"|"Help"
  available = ["Research", "Book", "Plan", "Help"],
  active = null,            // currently chosen action this turn
  onChoose = null,
}) => {
  const actions = ["Research", "Book", "Plan", "Help"];
  return (
    <div style={{
      background: "var(--paper-soft)",
      border: "2px solid var(--ink)",
      padding: 14,
      boxShadow: "3px 3px 0 var(--ink)",
    }}>
      <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 10 }}>Actions · move your meeple</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {actions.map(a => {
          const hasMeeple = meepleAt === a;
          const isActive = active === a;
          const isDisabled = !available.includes(a) || hasMeeple;
          return (
            <button
              key={a}
              onClick={() => !isDisabled && onChoose?.(a)}
              disabled={isDisabled}
              style={{
                background: isActive ? "var(--accent)" : (isDisabled ? "var(--paper-deep)" : "var(--paper-soft)"),
                color: isActive ? "var(--paper)" : (isDisabled ? "var(--ink-3)" : "var(--ink)"),
                border: `2px solid var(--ink)`,
                padding: "16px 8px 12px",
                cursor: isDisabled ? "not-allowed" : "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                lineHeight: 1,
                position: "relative",
                boxShadow: !isDisabled && !isActive ? "3px 3px 0 var(--ink)" : "none",
                transform: !isDisabled && !isActive ? "translate(-1.5px, -1.5px)" : "none",
              }}
            >
              {hasMeeple && (
                <div style={{
                  position: "absolute",
                  top: -16,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}>
                  <Meeple size={26} color="var(--accent)" outline="var(--ink)" />
                </div>
              )}
              <div>{a}</div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 400,
                letterSpacing: "0.12em",
                marginTop: 4,
                color: isActive ? "var(--paper)" : "var(--ink-3)",
              }}>
                {a === "Research" && "Draw or take FVR"}
                {a === "Book" && "Place from hand"}
                {a === "Plan" && "3 effort to tasks"}
                {a === "Help" && "Draw a helper"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ——————————————————————————————————————————————————
// PLAYER CHROME — name, coins, gifts, header
// ——————————————————————————————————————————————————

const PlayerChrome = ({
  name = "Alex",
  isYou = true,
  isActive = false,
  coins = 12,
  gifts = 0,
  isFirstPlayer = false,
  color = "var(--accent)",
}) => (
  <div style={{
    background: isActive ? "var(--accent)" : "var(--ink)",
    color: isActive ? "var(--paper)" : "var(--coin)",
    border: "2px solid var(--ink)",
    boxShadow: "3px 3px 0 var(--ink)",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  }}>
    {isFirstPlayer && <FirstPlayerToken size={26} />}
    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        opacity: 0.7,
      }}>
        {isYou ? "You" : "Opponent"} {isActive && "· active turn"}
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        lineHeight: 1,
        color: isActive ? "var(--paper)" : "var(--paper)",
      }}>
        {name}
      </div>
    </div>
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: 0.7,
        }}>
          Coins
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 22,
          color: "var(--coin)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}>
          {coins}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: 0.7,
        }}>
          Gifts
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 22,
          color: isActive ? "var(--paper)" : "var(--gift)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}>
          {gifts}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  WeddingGrid, ThemeElementTrack, ThemeTrackerStack, ExcitementTrack,
  HelperSlots, VisionBoard, HandStrip, ActionDock, PlayerChrome, GRID_BONUS,
});
