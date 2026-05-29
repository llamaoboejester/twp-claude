/* screens.jsx — main play screens (two layout variations) */

// ——————————————————————————————————————————————————
// SHARED: page chrome (title bar + timeline)
// ——————————————————————————————————————————————————

const PageHeader = ({ month = 6, activePlayer = "Alex", quarter = 2, compact = false }) => (
  <div style={{
    background: "var(--paper-soft)",
    borderBottom: "2px solid var(--ink)",
    padding: compact ? "10px 28px" : "14px 32px",
    display: "flex",
    alignItems: "center",
    gap: 24,
  }}>
    <div style={{
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: compact ? 20 : 26,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--ink)",
      lineHeight: 1,
    }}>
      The Wedding<span style={{ color: "var(--accent)" }}> Planner</span>
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
      <div>
        <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Active turn</div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent)",
          lineHeight: 1,
        }}>
          {activePlayer}
        </div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Quarter</div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink)",
          lineHeight: 1,
        }}>Q{quarter}</div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Month</div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 22,
          color: "var(--ink)",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}>
          {String(month).padStart(2, "0")}<span style={{ color: "var(--ink-3)", fontSize: 14 }}>/12</span>
        </div>
      </div>
    </div>
  </div>
);

// Compact opponent summary — collapsed by default, click header to expand
const OpponentSummary = ({ state, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem(`twp-opp-${state.name}-collapsed`);
    return saved !== null ? saved === "1" : defaultCollapsed;
  });
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`twp-opp-${state.name}-collapsed`, collapsed ? "1" : "0");
    }
  }, [collapsed, state.name]);

  return (
    <div style={{
      background: "var(--paper-soft)",
      border: "2px solid var(--ink)",
      boxShadow: "3px 3px 0 var(--ink)",
    }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: "100%",
          background: "transparent",
          border: 0,
          padding: "10px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          borderBottom: collapsed ? 0 : "2px solid var(--ink)",
        }}
      >
        {state.isFirstPlayer && <FirstPlayerToken size={18} />}
        <div style={{ flex: 1, textAlign: "left" }}>
          <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Opponent · {state.meepleAt === "Vision" ? "—" : `at ${state.meepleAt}`}</div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 16,
            color: "var(--ink)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}>{state.name}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          {[
            { value: state.excitement,    suffix: "e", tone: "var(--accent)" },
            { value: state.coins,         suffix: "c", tone: "var(--coin-deep)" },
            { value: state.gifts,         suffix: "g", tone: "var(--gift)" },
            { value: state.completedTasks, suffix: "t", tone: "var(--ink)" },
          ].map((s, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 14,
              color: s.tone,
              fontVariantNumeric: "tabular-nums",
            }}>{s.value}<span style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.1em", marginLeft: 1 }}>{s.suffix}</span></span>
          ))}
        </div>
        <span style={{
          display: "inline-block",
          width: 14, height: 14,
          border: "1.5px solid var(--ink-2)",
          position: "relative",
          flex: "0 0 auto",
        }}>
          <span style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(-50%, -50%) rotate(${collapsed ? 0 : 180}deg)`,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            lineHeight: 1,
          }}>▾</span>
        </span>
      </button>

      {!collapsed && (
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* STAT TILES — excitement / coins / gifts / tasks */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, background: "var(--ink)", border: "2px solid var(--ink)" }}>
            {[
              { label: "Excite",  value: state.excitement,    suffix: "/30",  tone: "var(--excite)" },
              { label: "Coins",   value: state.coins,         suffix: null,   tone: "var(--coin-deep)" },
              { label: "Gifts",   value: state.gifts,         suffix: null,   tone: "var(--gift)" },
              { label: "Tasks",   value: state.completedTasks, suffix: "/28", tone: "var(--ink)" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "var(--paper-soft)",
                padding: "8px 6px 7px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 8,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "var(--ink-3)",
                }}>{s.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, lineHeight: 1,
                    color: s.tone, fontVariantNumeric: "tabular-nums",
                  }}>{s.value}</span>
                  {s.suffix && <span style={{ fontSize: 9, color: "var(--ink-4)" }}>{s.suffix}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* SELECTED THEME + GOALS */}
          <div>
            <div className="t-eyebrow" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Theme &amp; Goals</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {/* Theme */}
              {state.theme ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px",
                  background: "var(--ink)",
                  color: "var(--paper)",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--coin)" }}>Theme</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1 }}>{state.theme.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flex: "0 0 auto" }}>
                    {state.theme.elements.map(el => (
                      <img key={el} src={`assets/icons/source/${el}.png`} alt={el} title={el} style={{ width: 22, height: 22, background: "var(--paper)", borderRadius: "50%", padding: 1 }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: "8px 10px", border: "1.5px dashed var(--ink-line-2)",
                  fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "var(--ink-4)", textAlign: "center",
                }}>Theme set at Check-In 1</div>
              )}
              {/* Goals — one row per check-in */}
              {[1, 2, 3].map(n => {
                const g = (state.goals || []).find(x => x.checkIn === n);
                if (g) {
                  return (
                    <div key={n} style={{
                      display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center",
                      border: "1.5px solid var(--ink)", padding: "5px 8px", background: "var(--paper-deep)",
                    }}>
                      <span className="t-eyebrow" style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>Check-In {n}</span>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink)" }}>{g.type}</div>
                        <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 12, color: "var(--ink-2)", lineHeight: 1 }}>{g.tier}</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--gift)", fontVariantNumeric: "tabular-nums" }}>+{g.value}</div>
                    </div>
                  );
                }
                return (
                  <div key={n} style={{
                    display: "grid", gridTemplateColumns: "auto 1fr", gap: 8, alignItems: "center",
                    border: "1.5px dashed var(--ink-line-2)", padding: "5px 8px", color: "var(--ink-4)",
                  }}>
                    <span className="t-eyebrow" style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>Check-In {n}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>Not yet set</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* THEME TOTALS */}
          <div>
            <div className="t-eyebrow" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Theme Elements</div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2,
              background: "var(--ink)", border: "2px solid var(--ink)",
            }}>
              {["whimsy","edge","nature","tradition","elegance"].map(el => (
                <div key={el} style={{
                  background: "var(--paper-soft)",
                  padding: "7px 2px 6px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  <img src={`assets/icons/source/${el}.png`} style={{ width: 18, height: 18 }} alt={el} title={el} />
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1,
                    color: "var(--ink)", fontVariantNumeric: "tabular-nums",
                  }}>{state.themePositions[el] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MINI WEDDING GRID — with card info per cell */}
          <div>
            <div className="t-eyebrow" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Wedding Grid</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 3,
              padding: 3,
              background: "var(--ink)",
              border: "2px solid var(--ink)",
            }}>
              {state.grid.map((cell, i) => {
                const isVenueSlot = i === 4;
                if (!cell) {
                  return (
                    <div key={i} style={{
                      aspectRatio: "1 / 1",
                      background: isVenueSlot ? "var(--paper-shade)" : "var(--paper-deep)",
                      display: "grid", placeItems: "center",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 8,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        color: "var(--ink-4)",
                      }}>{isVenueSlot ? "Venue" : "—"}</span>
                    </div>
                  );
                }
                const isVenue = cell.type === "venue";
                const isDIY = cell.type === "diy";
                const cat = isDIY ? cell.category : (cell.card && cell.card.category);
                const tone = isVenue ? "var(--ink-2)" : CATEGORY_TONE[cat];
                const cardData = cell.card || {};
                return (
                  <div key={i} style={{
                    aspectRatio: "1 / 1",
                    background: tone,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                    {/* icon area */}
                    <div style={{ flex: 1, display: "grid", placeItems: "center", minHeight: 0 }}>
                      {isVenue ? (
                        <span style={{
                          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
                          color: "var(--coin)", letterSpacing: "0.1em",
                        }}>V</span>
                      ) : (
                        <img
                          src={`assets/icons/category/${CATEGORY_SLUG[cat]}.png`}
                          alt=""
                          style={{ width: 30, height: 30, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.92 }}
                        />
                      )}
                    </div>
                    {/* DIY ribbon */}
                    {isDIY && (
                      <div style={{
                        position: "absolute", top: 4, left: 0,
                        background: "var(--ink)", color: "var(--paper)",
                        fontFamily: "var(--font-mono)", fontSize: 7,
                        letterSpacing: "0.14em", padding: "1px 5px",
                      }}>DIY</div>
                    )}
                    {/* cost + excite footer */}
                    {!isDIY && (cardData.cost != null || cardData.excitement != null) && (
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "3px 5px",
                        background: "rgba(0,0,0,0.32)",
                        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                        color: "var(--paper)", fontVariantNumeric: "tabular-nums",
                      }}>
                        <span title="cost">◈{cardData.cost ?? "–"}</span>
                        <span title="excitement" style={{ color: "var(--coin)" }}>✦{cardData.excitement ?? "–"}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* HELPERS TAKEN */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Helpers Taken</div>
              <div className="t-eyebrow" style={{ color: "var(--ink-4)" }}>{state.helpers.filter(Boolean).length} / 3</div>
            </div>
            {state.helpers.filter(Boolean).length === 0 ? (
              <div style={{
                padding: "8px 10px", border: "1.5px dashed var(--ink-line-2)",
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--ink-4)", textAlign: "center",
              }}>None taken</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {state.helpers.filter(Boolean).map((h, i) => {
                  const typeTone = { Money: "var(--coin-deep)", Effort: "var(--el-edge)", Research: "var(--el-nature)" }[h.type] || "var(--ink-2)";
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 8px",
                      background: "var(--paper-deep)",
                      border: "1px solid var(--ink-line-2)",
                    }}>
                      <span style={{
                        flex: "0 0 auto",
                        background: typeTone, color: "var(--paper)",
                        fontFamily: "var(--font-mono)", fontSize: 7,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        padding: "2px 5px",
                      }}>{h.type}</span>
                      <span style={{
                        flex: 1, minWidth: 0,
                        fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13,
                        color: "var(--ink)", lineHeight: 1.15,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{h.name}</span>
                      {h.commitment && (
                        <span title="has a later commitment" style={{
                          marginLeft: "auto", flex: "0 0 auto",
                          fontFamily: "var(--font-mono)", fontSize: 7,
                          letterSpacing: "0.12em", textTransform: "uppercase",
                          color: "var(--accent-deep)", border: "1px solid var(--accent)",
                          padding: "1px 4px",
                        }}>Commit</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
// (legacy OpponentSummary continues below — unused, kept for the design canvas)
const LegacyOpponentSummary = ({ state, compact = false }) => {
  return (
    <div style={{
      background: "var(--paper-soft)",
      border: "2px solid var(--ink)",
      padding: 12,
      boxShadow: "3px 3px 0 var(--ink)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {state.isFirstPlayer && <FirstPlayerToken size={20} />}
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Opponent · {state.meepleAt === "Vision" ? "—" : `at ${state.meepleAt}`}</div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 18,
            color: "var(--ink)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}>{state.name}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 18,
            color: "var(--coin)",
            fontVariantNumeric: "tabular-nums",
          }}>{state.coins}<span style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.1em", marginLeft: 2 }}>c</span></span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 18,
            color: "var(--gift)",
            fontVariantNumeric: "tabular-nums",
          }}>{state.gifts}<span style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.1em", marginLeft: 2 }}>g</span></span>
        </div>
      </div>
      {/* Mini grid — height-capped (no aspect ratio stretch) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: 2,
        padding: 2,
        background: "var(--ink)",
        marginBottom: 10,
        height: 144,
      }}>
        {state.grid.map((cell, i) => (
          <div key={i} style={{
            background: cell
              ? (cell.type === "diy" ? CATEGORY_TONE[cell.category]
                : cell.type === "venue" ? "var(--ink-2)"
                : CATEGORY_TONE[cell.card.category])
              : "var(--paper-deep)",
            display: "grid",
            placeItems: "center",
            color: "var(--paper)",
          }}>
            {cell && cell.type !== "venue" && (
              <img src={`assets/icons/category/${CATEGORY_SLUG[cell.type === "diy" ? cell.category : cell.card.category]}.png`} alt="" style={{ width: "60%", height: "60%", objectFit: "contain" }} />
            )}
            {cell && cell.type === "venue" && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--coin)", letterSpacing: "0.16em" }}>V</span>
            )}
            {cell?.type === "diy" && (
              <span style={{ position: "absolute", fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--paper)", opacity: 0.85, marginTop: 22, letterSpacing: "0.16em" }}>DIY</span>
            )}
          </div>
        ))}
      </div>
      {/* Mini theme tracker */}
      <div style={{ display: "flex", gap: 4, justifyContent: "space-between", alignItems: "center" }}>
        {["whimsy","edge","nature","tradition","elegance"].map(el => (
          <div key={el} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <img src={`assets/icons/source/${el}.png`} style={{ width: 14, height: 14, borderRadius: "50%" }} alt="" />
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11, fontWeight: 600,
              color: "var(--ink)",
              fontVariantNumeric: "tabular-nums",
            }}>{state.themePositions[el] ?? 0}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 10,
        padding: "6px 8px",
        background: "var(--paper-deep)",
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 8,
        alignItems: "center",
      }}>
        <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Excitement / Tasks</div>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
          color: "var(--accent)",
          fontVariantNumeric: "tabular-nums",
        }}>{state.excitement}<span style={{ fontSize: 9, opacity: 0.6 }}>/30</span></div>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}>{state.completedTasks}<span style={{ fontSize: 9, opacity: 0.6 }}>/28</span></div>
      </div>
    </div>
  );
};

// ——————————————————————————————————————————————————
// PLAY SCREEN A — Editorial Spread (generous, grid is the hero)
// ——————————————————————————————————————————————————

const PlayScreenA = ({
  alex = window.SAMPLE_ALEX_STATE,
  sam = window.SAMPLE_SAM_STATE,
  hand = window.SAMPLE_HAND,
  fvr = window.SAMPLE_FVR,
  moments = window.SAMPLE_MOMENTS,
  awards = window.SAMPLE_AWARDS,
  month = 6,
  width = 1440,
  height = 1480,
}) => (
  <div style={{ width, minHeight: height, background: "var(--paper)", color: "var(--ink)" }}>
    <PageHeader month={month} activePlayer={alex.name} quarter={Math.ceil(month/3)} />

    <div style={{ padding: 28 }}>
      {/* Timeline */}
      <MonthTimeline currentMonth={month} width={1384} />

      <div style={{ height: 24 }} />

      {/* Main 3-column area */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 360px", gap: 24, alignItems: "flex-start" }}>

        {/* LEFT column — central board */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <MomentsRow moments={moments} completedBy={{}} width={260} />
          <AwardsRow race={awards.race} endgame={awards.endgame} width={260} />
          <HelpDecks decks={{ Money: 3, Effort: 2, Research: 1 }} width={260} />
          <DeckColumn vendorTopCategory="Photography" vendorRemaining={88} venueRemaining={9} width={260} />
        </div>

        {/* CENTER column — your grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
          <PlayerChrome {...alex} isYou isActive />
          <FVR cards={fvr} width={780} cardW={140} />
          <div style={{
            background: "var(--paper-soft)",
            border: "2px solid var(--ink)",
            padding: 18,
            boxShadow: "4px 4px 0 var(--ink)",
            width: 780,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div className="t-eyebrow t-eyebrow-accent">Your Wedding Grid · 3 / 9 booked</div>
              <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Center: venue only</div>
            </div>
            <div style={{ display: "grid", placeItems: "center" }}>
              <WeddingGrid cells={alex.grid} cellSize={150} showBonusLabels />
            </div>
          </div>
          <HandStrip cards={hand} width={780} cardW={140} selected={-1} />
          <ActionDock meepleAt={alex.meepleAt} available={["Research","Book","Plan","Help"]} active={null} />
        </div>

        {/* RIGHT column — your state */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <ThemeTrackerStack positions={alex.themePositions} width={360} />
          <ExcitementTrack position={alex.excitement} width={360} />
          <VisionBoard theme={alex.theme} goals={alex.goals} width={360} />
          <HelperSlots slots={alex.helpers} width={360} />
          <OpponentSummary state={sam} />
        </div>
      </div>

      <div style={{ height: 24 }} />

      {/* Task worksheet — full width row at bottom */}
      <TaskWorksheet
        taskStatus={alex.taskStatus}
        completedCount={alex.completedTasks}
        width={1384}
      />
    </div>
  </div>
);

// ——————————————————————————————————————————————————
// PLAY SCREEN B — Console Dashboard (compact, task always visible)
// ——————————————————————————————————————————————————

const PlayScreenB = ({
  alex = window.SAMPLE_ALEX_STATE,
  sam = window.SAMPLE_SAM_STATE,
  hand = window.SAMPLE_HAND,
  fvr = window.SAMPLE_FVR,
  moments = window.SAMPLE_MOMENTS,
  awards = window.SAMPLE_AWARDS,
  month = 6,
  showThemeOptions = false,
  width = 1440,
  height = 1180,
  onZoom = null,
}) => (
  <div style={{ width, minHeight: height, background: "var(--paper)", color: "var(--ink)" }}>
    <PageHeader month={month} activePlayer={alex.name} quarter={Math.ceil(month/3)} compact />

    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* TELEMETRY STRIP — full width: timeline + excitement */}
      <MonthTimeline currentMonth={month} width={1392} />
      <ExcitementStripWide position={alex.excitement} width={1392} />

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 380px", gap: 18, alignItems: "flex-start" }}>

        {/* LEFT column — shared piles + helpers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <HelpDecks decks={{ Money: 3, Effort: 2, Research: 1 }} width={260} />
          <DeckColumn vendorTopCategory="Photography" vendorRemaining={88} venueRemaining={9} width={260} />
          <HelperSlots slots={alex.helpers} width={260} />
        </div>

        {/* CENTER column — vendor flow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PlayerChrome {...alex} isYou isActive={alex.isActive} />
          <MomentsAwardsRow
            moments={moments}
            awards={{ race: awards.race, endgame: awards.endgame }}
            width={716}
            onZoom={onZoom}
          />
          <FVR cards={fvr} width={716} cardW={124} onZoom={onZoom} />

          {/* Grid — square */}
          <div style={{
            background: "var(--paper-soft)",
            border: "2px solid var(--ink)",
            padding: 14,
            boxShadow: "3px 3px 0 var(--ink)",
          }}>
            <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 10 }}>Your Wedding Grid</div>
            <div style={{ display: "grid", placeItems: "center" }}>
              <WeddingGrid cells={alex.grid} cellSize={156} showBonusLabels onZoom={onZoom} />
            </div>
          </div>

          <HandStrip cards={hand} width={716} cardW={124} selected={-1} onSelect={() => {}} onZoom={onZoom} />
          <ActionDock meepleAt={alex.meepleAt} available={["Research","Book","Plan","Help"]} active={null} />
        </div>

        {/* RIGHT column — scorecard */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <VisionBoard
            theme={showThemeOptions ? null : alex.theme}
            themeOptions={showThemeOptions ? [
              { name: "Bohemian", elements: ["nature","whimsy"] },
              { name: "Modern",   elements: ["edge","elegance"] },
            ] : null}
            goals={alex.goals}
            width={380}
            onZoom={onZoom}
          />
          <ThemeTrackerStack positions={alex.themePositions} width={380} />
          <TaskWorksheet
            taskStatus={alex.taskStatus}
            completedCount={alex.completedTasks}
            width={380}
          />
          <OpponentSummary state={sam} />
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { PageHeader, OpponentSummary, PlayScreenA, PlayScreenB });
