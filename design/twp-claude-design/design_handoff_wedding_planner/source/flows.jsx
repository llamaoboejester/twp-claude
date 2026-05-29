/* flows.jsx — non-play screens: lobby, check-in, end-of-game, modals */

// ——————————————————————————————————————————————————
// LOBBY / SETUP
// ——————————————————————————————————————————————————

const LobbyScreen = ({
  width = 1440,
  height = 900,
  players = [
    { name: "Alex", color: "var(--accent)", ready: true },
    { name: "Sam", color: "var(--el-edge)", ready: true },
  ],
  modules = {
    Personalities: false,
    "Wedding Planners": false,
    "Special Guests": false,
    "Check-In 3 Event": false,
    "Weather Die": false,
  },
}) => (
  <div style={{ width, minHeight: height, background: "var(--paper)", display: "flex", flexDirection: "column" }}>
    <PageHeader month={0} activePlayer="—" quarter={1} compact />
    <div style={{ padding: "48px 64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
      <div>
        <div className="t-eyebrow t-eyebrow-accent">New Game · invite code: WED-4271</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 88,
          lineHeight: 0.9,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          margin: "16px 0 24px",
          color: "var(--ink)",
        }}>
          The<br/>Wedding<br/><span style={{ color: "var(--accent)" }}>Planner.</span>
        </h1>
        <p style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1.35,
          color: "var(--ink-2)",
          maxWidth: 420,
          margin: 0,
        }}>
          Twelve months. Four actions. One ring. Plan a better wedding than your friends and collect more gifts than they do.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 12, alignItems: "center" }}>
          <input
            readOnly
            value="https://twp.app/game/WED-4271"
            style={{
              flex: 1,
              padding: "12px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              background: "var(--paper-soft)",
              border: "2px solid var(--ink)",
              color: "var(--ink)",
              boxShadow: "3px 3px 0 var(--ink)",
              maxWidth: 360,
            }}
          />
          <button style={{
            padding: "12px 20px",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            background: "var(--accent)",
            color: "var(--paper)",
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 var(--ink)",
            cursor: "pointer",
          }}>
            Copy Link
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 12 }}>Players · 2 of 5</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {players.map((p, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 14,
                alignItems: "center",
                padding: "12px 16px",
                background: "var(--paper-soft)",
                border: "2px solid var(--ink)",
                boxShadow: "3px 3px 0 var(--ink)",
              }}>
                <Meeple size={26} color={p.color} outline="var(--ink)" />
                <div>
                  <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Player {i+1}{i === 0 ? " · first" : ""}</div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 20,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    lineHeight: 1,
                  }}>
                    {p.name}
                  </div>
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: p.ready ? "var(--positive)" : "var(--ink-3)",
                  border: `1.5px solid ${p.ready ? "var(--positive)" : "var(--ink-line-2)"}`,
                  padding: "3px 8px",
                }}>
                  {p.ready ? "Ready" : "Waiting"}
                </div>
              </div>
            ))}
            <div style={{
              padding: "14px 16px",
              border: "2px dashed var(--ink-line-2)",
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textAlign: "center",
            }}>
              Up to 3 more players can join with the link.
            </div>
          </div>
        </div>

        <div>
          <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 12 }}>Optional Modules · 0 of 5 active</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(modules).map(([m, on]) => (
              <label key={m} style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "10px 14px",
                background: "var(--paper-soft)",
                border: "1.5px solid var(--ink-line-2)",
                cursor: "pointer",
              }}>
                <span style={{
                  width: 18, height: 18,
                  background: on ? "var(--ink)" : "var(--paper-soft)",
                  border: "1.5px solid var(--ink)",
                  display: "grid",
                  placeItems: "center",
                }}>
                  {on && <span style={{ color: "var(--coin)", fontSize: 12 }}>✓</span>}
                </span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                }}>{m}</span>
                <span className="t-eyebrow" style={{ color: "var(--ink-3)" }}>
                  {m === "Personalities" && "Asymmetric powers"}
                  {m === "Wedding Planners" && "Per-player contracts"}
                  {m === "Special Guests" && "Drawn at Check-In 2"}
                  {m === "Check-In 3 Event" && "Table-wide bonus"}
                  {m === "Weather Die" && "Endgame variance"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button style={{
          padding: "18px 32px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          background: "var(--ink)",
          color: "var(--coin)",
          border: "2px solid var(--ink)",
          boxShadow: "6px 6px 0 var(--accent)",
          cursor: "pointer",
        }}>
          Begin · Month 01
        </button>
      </div>
    </div>
  </div>
);

// ——————————————————————————————————————————————————
// CHECK-IN 1 SCREEN — theme reveal + goal set
// ——————————————————————————————————————————————————

const CheckInScreen = ({
  width = 1440,
  height = 900,
  number = 1,
  player = "Alex",
  themeOptions = [
    { name: "Bohemian", elements: ["nature","whimsy"] },
    { name: "Modern",   elements: ["edge","elegance"] },
  ],
  selectedTheme = 0,
}) => (
  <div style={{
    width, minHeight: height,
    background: "var(--ink)",
    color: "var(--paper)",
    display: "flex",
    flexDirection: "column",
  }}>
    {/* Top banner */}
    <div style={{
      padding: "28px 64px 24px",
      borderBottom: "2px solid var(--accent)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
    }}>
      <div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}>End of Q{number} · After Month {number*3} · Pause</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 72,
          lineHeight: 0.9,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          margin: "8px 0 0",
        }}>
          Check-In <span style={{ color: "var(--accent)" }}>{String(number).padStart(2, "0")}</span>
        </h1>
      </div>
      <div style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: 22,
        lineHeight: 1.3,
        color: "var(--coin)",
        textAlign: "right",
        maxWidth: 380,
      }}>
        “{number === 1 ? "What kind of wedding is this, anyway?" : number === 2 ? "Who's coming?" : "Quarter four — the home stretch."}”
      </div>
    </div>

    <div style={{ padding: "48px 64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, flex: 1 }}>

      {/* Theme reveal */}
      <div>
        <div className="t-eyebrow" style={{ color: "var(--accent)", marginBottom: 12 }}>Step 1 · Set Your Theme</div>
        <p style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 18,
          lineHeight: 1.4,
          color: "var(--coin)",
          maxWidth: 460,
          margin: "0 0 24px",
        }}>
          Choose 1 of the 2 themes you drew at setup. The other is discarded. Themes are public from this point on.
        </p>
        <div style={{ display: "flex", gap: 18 }}>
          {themeOptions.map((t, i) => (
            <div key={i} style={{
              padding: 0,
              outline: selectedTheme === i ? "4px solid var(--accent)" : "none",
              outlineOffset: 4,
              cursor: "pointer",
            }}>
              <ThemeCard {...t} width={200} height={240} />
              {selectedTheme === i && (
                <div style={{
                  marginTop: 16,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  textAlign: "center",
                }}>
                  ▼ Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Goal set */}
      <div>
        <div className="t-eyebrow" style={{ color: "var(--accent)", marginBottom: 12 }}>Step 2 · Set a Goal</div>
        <p style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 18,
          lineHeight: 1.4,
          color: "var(--coin)",
          maxWidth: 460,
          margin: "0 0 24px",
        }}>
          You'll set 3 of the 4 goal types — one per Check-In. Choose which type to commit to first. Goals are public for the rest of the game.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { type: "Theme",      desc: "Lean hard into your two theme elements.", max: 30 },
            { type: "Budget",     desc: "Distribute by face-up booked cost.",      max: 15 },
            { type: "Excitement", desc: "Distribute by face-up booked excitement.", max: 15 },
            { type: "Guest",      desc: "Stack one vendor category.",               max: 15 },
          ].map(g => (
            <div key={g.type} style={{
              padding: "16px 18px",
              background: "var(--paper-soft)",
              color: "var(--ink)",
              border: "2px solid var(--accent)",
              boxShadow: "4px 4px 0 var(--accent)",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                }}>{g.type}</div>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--gift)",
                }}>up to +{g.max}</div>
              </div>
              <div style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                lineHeight: 1.4,
                color: "var(--ink-2)",
                marginTop: 6,
              }}>{g.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Footer status */}
    <div style={{
      padding: "20px 64px",
      borderTop: "1px solid var(--accent)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--paper)",
        opacity: 0.7,
      }}>
        Alex · ready &nbsp;·&nbsp; Sam · choosing theme…
      </div>
      <button style={{
        padding: "14px 28px",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        background: "var(--accent)",
        color: "var(--paper)",
        border: "2px solid var(--paper)",
        cursor: "pointer",
      }}>
        Confirm · Begin Q{number + 1}
      </button>
    </div>
  </div>
);

// ——————————————————————————————————————————————————
// END-OF-GAME SCREEN — scoring breakdown
// ——————————————————————————————————————————————————

const EndGameScreen = ({
  width = 1440,
  height = 1100,
  players = [
    {
      name: "Alex", winner: true, hasVenue: true,
      breakdown: [
        { label: "In-play gifts",       sub: "from Moments, Tasks, Race Awards", value: 27 },
        { label: "Excitement",          sub: "1 gift per excitement, final 22",  value: 22 },
        { label: "Theme · Coordinated", sub: "both theme elements in top 2",     value: 15 },
        { label: "Balanced bonus",      sub: "theme elements equal",             value: 5 },
        { label: "Excitement · Spectacular", sub: "most cards grant 3+ excitement", value: 15 },
        { label: "Guest · Amazed",      sub: "3 Flowers & Decorations vendors",  value: 15 },
        { label: "Endgame · Well-Rounded", sub: "8 different categories booked",  value: 5 },
      ],
    },
    {
      name: "Sam", winner: false, hasVenue: true,
      breakdown: [
        { label: "In-play gifts",       sub: "from Moments, Tasks, Race Awards", value: 24 },
        { label: "Excitement",          sub: "final 18",                          value: 18 },
        { label: "Theme · Thematic",    sub: "the 2 theme elements are top 2",   value: 20 },
        { label: "Budget · Extravagant", sub: "most cards cost 3+ coins",         value: 15 },
        { label: "Helper penalty",      sub: "1 unfulfilled commitment",         value: -3 },
        { label: "Endgame · Most On-Theme Vendors", sub: "6 matching face-up", value: 5 },
      ],
    },
  ],
}) => {
  const totals = players.map(p => p.breakdown.reduce((s, b) => s + b.value, 0));
  return (
    <div style={{ width, minHeight: height, background: "var(--paper)", color: "var(--ink)" }}>
      <PageHeader month={12} activePlayer="—" quarter={4} />

      <div style={{ padding: "48px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div className="t-eyebrow t-eyebrow-accent">End of Month 12 · Final Scoring</div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 96,
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              margin: "12px 0 0",
              color: "var(--ink)",
            }}>
              The <span style={{ color: "var(--accent)" }}>Reception.</span>
            </h1>
          </div>
          <div style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 22,
            color: "var(--ink-2)",
            textAlign: "right",
            maxWidth: 360,
          }}>
            Gifts unwrapped. Photos in. Cake counted. The winner takes everything.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {players.map((p, i) => (
            <div key={i} style={{
              background: p.winner ? "var(--ink)" : "var(--paper-soft)",
              color: p.winner ? "var(--paper)" : "var(--ink)",
              border: "2px solid var(--ink)",
              boxShadow: p.winner ? "8px 8px 0 var(--accent)" : "4px 4px 0 var(--ink)",
            }}>
              <div style={{
                padding: "20px 24px",
                borderBottom: "2px solid var(--ink)",
                background: p.winner ? "var(--accent)" : "var(--paper-deep)",
                color: p.winner ? "var(--paper)" : "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}>
                    {p.winner ? "Winner · most gifts" : "Runner-up"}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 36,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    lineHeight: 1,
                    marginTop: 4,
                  }}>
                    {p.name}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}>
                    Total gifts
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 60,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {totals[i]}
                  </div>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                {p.breakdown.map((b, j) => (
                  <div key={j} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16,
                    alignItems: "baseline",
                    padding: "10px 0",
                    borderBottom: j < p.breakdown.length - 1 ? "1px solid var(--ink-line-2)" : 0,
                  }}>
                    <div>
                      <div style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        color: p.winner ? "var(--paper)" : "var(--ink)",
                      }}>{b.label}</div>
                      <div style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 11,
                        color: p.winner ? "var(--coin)" : "var(--ink-3)",
                        marginTop: 2,
                      }}>{b.sub}</div>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 22,
                      color: b.value < 0 ? "var(--gift)" : (p.winner ? "var(--coin)" : "var(--gift)"),
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {b.value > 0 ? "+" : ""}{b.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 32,
          padding: "20px 28px",
          background: "var(--paper-soft)",
          border: "2px solid var(--ink)",
          boxShadow: "3px 3px 0 var(--ink)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--ink-2)",
            flex: 1,
          }}>
            Alex wins by 7 gifts. Tiebreaker not needed.
          </div>
          <button style={{
            padding: "12px 24px",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            background: "var(--paper-soft)",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            cursor: "pointer",
          }}>
            Game log
          </button>
          <button style={{
            padding: "12px 24px",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            background: "var(--accent)",
            color: "var(--paper)",
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 var(--ink)",
            cursor: "pointer",
          }}>
            New game
          </button>
        </div>
      </div>
    </div>
  );
};

// ——————————————————————————————————————————————————
// CARD DETAIL MODAL — "full glory" zoom of any card
// ——————————————————————————————————————————————————

const CardDetailModal = ({ card, onClose }) => {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!card) return null;

  let content = null;
  if (card.kind === "vendor") {
    content = <VendorCardDetail {...card} width={460} height={460} />;
  } else if (card.kind === "venue") {
    content = <VenueCardDetail {...card} width={460} height={460} />;
  } else if (card.kind === "diy") {
    content = <DIYBack category={card.category} width={460} height={460} />;
  } else if (card.kind === "theme") {
    content = <ThemeCard name={card.name} elements={card.elements} width={320} height={400} />;
  } else if (card.kind === "moment") {
    content = <MomentCard {...card} width={320} height={440} />;
  } else if (card.kind === "award") {
    content = <AwardCard {...card} width={320} height={380} />;
  } else if (card.kind === "helper") {
    content = <HelperCard {...card} width={300} height={340} />;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 12, 8, 0.78)",
        display: "grid",
        placeItems: "center",
        padding: 48,
        zIndex: 200,
        cursor: "zoom-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--coin)",
          padding: "8px 18px",
          border: "1.5px solid var(--coin)",
          background: "rgba(20,12,8,0.5)",
        }}>
          Click anywhere · or press Esc to close
        </div>
      </div>
    </div>
  );
};

// ——————————————————————————————————————————————————
// useCardZoom — hook to manage zoom modal state
// ——————————————————————————————————————————————————

const useCardZoom = () => {
  const [card, setCard] = React.useState(null);
  const zoom = (c) => setCard(c);
  const close = () => setCard(null);
  const modal = <CardDetailModal card={card} onClose={close} />;
  return { zoom, close, modal };
};

// ——————————————————————————————————————————————————
// MODAL FRAME — used by all action modals
// ——————————————————————————————————————————————————

const Modal = ({ title, eyebrow, children, footer, width = 760, onClose, padding = 28 }) => (
  <div style={{
    position: "absolute",
    inset: 0,
    background: "rgba(20, 12, 8, 0.65)",
    display: "grid",
    placeItems: "center",
    padding: 48,
    zIndex: 100,
  }}>
    <div style={{
      width,
      background: "var(--paper-soft)",
      border: "3px solid var(--ink)",
      boxShadow: "10px 10px 0 var(--ink)",
      maxHeight: "92vh",
      overflow: "auto",
    }}>
      <div style={{
        padding: "16px 24px",
        background: "var(--ink)",
        color: "var(--paper)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        borderBottom: "2px solid var(--ink)",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}>{eyebrow}</div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--paper)",
            lineHeight: 1,
            marginTop: 4,
          }}>{title}</div>
        </div>
        <button onClick={onClose} style={{
          background: "transparent",
          border: "1.5px solid var(--paper)",
          color: "var(--paper)",
          padding: "4px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}>Cancel</button>
      </div>
      <div style={{ padding }}>
        {children}
      </div>
      {footer && (
        <div style={{
          padding: "16px 24px",
          background: "var(--paper-deep)",
          borderTop: "2px solid var(--ink)",
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
        }}>
          {footer}
        </div>
      )}
    </div>
  </div>
);

// ——————————————————————————————————————————————————
// BOOK CARD MODAL
// ——————————————————————————————————————————————————

const BookCardModal = ({ card, targetCell = 1, coins = 7, onClose }) => (
  <Modal
    title="Book This Card"
    eyebrow="Action · Book"
    width={880}
    onClose={onClose}
    footer={
      <>
        <button style={{
          padding: "10px 18px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          background: "var(--paper-soft)",
          color: "var(--ink)",
          border: "1.5px solid var(--ink)",
          cursor: "pointer",
        }}>
          DIY for free
        </button>
        <button style={{
          padding: "12px 24px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          background: "var(--accent)",
          color: "var(--paper)",
          border: "2px solid var(--ink)",
          boxShadow: "3px 3px 0 var(--ink)",
          cursor: "pointer",
        }}>
          Book · pay {card?.cost ?? 3} coins
        </button>
      </>
    }
  >
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "flex-start" }}>
      <VendorCardPhoto {...card} width={420} height={420} />
      <div>
        <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 8 }}>Booking into cell {targetCell + 1} · Bonus: {GRID_BONUS[targetCell]}</div>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 28,
          color: "var(--ink)",
          lineHeight: 1.1,
          marginBottom: 14,
        }}>
          You'll pay {card?.cost} coins, gain +{card?.excitement} excitement, and advance: {card?.elements.map(e => (
            <span key={e} style={{
              display: "inline-block",
              padding: "0 6px",
              border: `1.5px solid var(--ink)`,
              fontSize: 14,
              marginLeft: 4,
              background: `var(--el-${e})`,
              color: e === "elegance" ? "var(--ink)" : "var(--paper)",
              fontFamily: "var(--font-display)",
              fontStyle: "normal",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}>{e}</span>
          ))}
        </div>
        <hr className="rule-hair" />
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div className="t-eyebrow" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Cost</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CostChip cost={card?.cost ?? 3} size={36} />
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-2)" }}>
                You have {coins}. After: <strong style={{ color: "var(--ink)" }}>{coins - (card?.cost ?? 3)}</strong>
              </div>
            </div>
          </div>
          <div>
            <div className="t-eyebrow" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Triggered after booking</div>
            <ol style={{
              margin: 0,
              padding: "0 0 0 18px",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              lineHeight: 1.55,
              color: "var(--ink-2)",
            }}>
              <li>Advance theme element trackers</li>
              <li>Advance excitement (+{card?.excitement})</li>
              <li>Check all 3 active Moments</li>
              <li>Resolve When Booked effect (if any)</li>
              <li>Resolve grid bonus: <strong style={{ color: "var(--accent)" }}>{GRID_BONUS[targetCell]}</strong></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </Modal>
);

// ——————————————————————————————————————————————————
// WILD PICK MODAL
// ——————————————————————————————————————————————————

const WildPickModal = ({ onClose, onPick }) => (
  <Modal
    title="Choose Your Wild"
    eyebrow="Card triggered · Wild element"
    width={620}
    onClose={onClose}
  >
    <p style={{
      fontFamily: "var(--font-serif)",
      fontStyle: "italic",
      fontSize: 18,
      color: "var(--ink-2)",
      margin: "0 0 24px",
    }}>
      Your booking triggered a Wild element. Pick any one of the five to advance by 1.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
      {["whimsy","edge","nature","tradition","elegance"].map(el => (
        <button
          key={el}
          onClick={() => onPick?.(el)}
          style={{
            padding: 18,
            background: `var(--el-${el})`,
            color: el === "elegance" ? "var(--ink)" : "var(--paper)",
            border: "2px solid var(--ink)",
            boxShadow: "4px 4px 0 var(--ink)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img src={`assets/icons/source/${el}.png`} style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--ink)" }} alt="" />
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}>{el}</div>
        </button>
      ))}
    </div>
  </Modal>
);

Object.assign(window, {
  LobbyScreen, CheckInScreen, EndGameScreen,
  Modal, BookCardModal, WildPickModal,
  CardDetailModal, useCardZoom,
});
