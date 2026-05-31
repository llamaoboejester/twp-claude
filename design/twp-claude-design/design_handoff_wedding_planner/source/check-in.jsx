/* check-in.jsx — Check-In as a modal over the live board.
   Step 1 Set Theme (CI1 only) · Step 2 Set a Goal.
   Deliberately minimal: just the choices. The player reads their trackers,
   hand, and FVR on the board BEHIND the modal (light scrim) to decide.

   Press direction. Built on the shared <Modal> frame + `stepper`/`scrim` slots.
*/

const CI_SCRIM = "rgba(20, 12, 8, 0.4)";

// shared small stepper
const CheckInStepper = ({ steps, current, onJump }) => (
  <div style={{ display: "flex", alignItems: "center", padding: "12px 24px", background: "var(--paper-deep)", borderBottom: "2px solid var(--ink)" }}>
    {steps.map((s, i) => {
      const done = s.n < current, active = s.n === current, clickable = done && !!onJump;
      return (
        <React.Fragment key={s.n}>
          <div onClick={clickable ? () => onJump(s.n) : undefined} style={{ display: "flex", alignItems: "center", gap: 8, cursor: clickable ? "pointer" : "default" }}>
            <span style={{
              width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", flex: "0 0 auto",
              background: active ? "var(--accent)" : done ? "var(--ink)" : "transparent",
              border: `2px solid ${active ? "var(--accent)" : done ? "var(--ink)" : "var(--ink-line-2)"}`,
              color: (active || done) ? "var(--paper)" : "var(--ink-3)",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, lineHeight: 1,
            }}>{done ? "✓" : s.n}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: active ? "var(--ink)" : "var(--ink-3)", fontWeight: active ? 700 : 400 }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 2, margin: "0 14px", background: s.n < current ? "var(--ink)" : "var(--ink-line-2)" }} />}
        </React.Fragment>
      );
    })}
  </div>
);

// ——————————————————————————————————————————————————
// STEP 1 — SET THEME
// ——————————————————————————————————————————————————
const CheckInTheme = ({ number, themeOptions, selected, onSelect, onNext, onClose, stepper }) => {
  const [hover, setHover] = React.useState(null);
  return (
    <Modal title="Set Your Theme" eyebrow={`Check-In ${number} · Step 1 of 2`} width={640} padding={0} onClose={onClose} stepper={stepper} scrim={CI_SCRIM}
      footer={
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)" }}>Public for the rest of the game.</span>
          <button onClick={onNext} disabled={selected == null} style={{ ...ciPrimary, opacity: selected == null ? 0.4 : 1, cursor: selected == null ? "not-allowed" : "pointer" }}>Next · Set a goal →</button>
        </div>
      }>
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.4, marginBottom: 20 }}>
          Keep 1 of the 2 themes you drew at setup — the other is discarded.
        </div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          {themeOptions.map((t, i) => (
            <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => onSelect(i)}
              style={{ cursor: "pointer", outline: selected === i ? "4px solid var(--accent)" : "none", outlineOffset: 4, transform: (hover === i && selected !== i) ? "translateY(-6px)" : "none", transition: "transform 120ms ease" }}>
              <ThemeCard {...t} width={200} height={240} />
              <div style={{ marginTop: 12, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: selected === i ? "var(--accent)" : "transparent" }}>▼ Selected</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

// ——————————————————————————————————————————————————
// STEP 2 — SET A GOAL  (pick a type → pick its specific goal/tier)
// ——————————————————————————————————————————————————
const CI_GOAL_TYPES = [
  { type: "Theme", desc: "Lean into your two theme elements.", range: "+10 – 30", kind: "tier",
    options: [
      { name: "Unforgettable", value: 30, cond: "Only your 2 theme elements have any progress." },
      { name: "Thematic",      value: 20, cond: "Your 2 theme elements are the only top 2." },
      { name: "Coordinated",   value: 15, cond: "Both theme elements in the top 2 (ties OK)." },
      { name: "Subtle",        value: 10, cond: "At least 1 theme element in the top 2." },
    ] },
  { type: "Budget", desc: "By cost of your booked cards.", range: "+5 – 15", kind: "tier",
    options: [
      { name: "Extravagant", value: 15, cond: "Most booked cards cost 3+ coins." },
      { name: "Refined",     value: 10, cond: "Most booked cards cost 2 coins." },
      { name: "Modest",      value: 5,  cond: "Most booked cards cost 1 coin." },
    ] },
  { type: "Excitement", desc: "By excitement of your booked cards.", range: "+5 – 15", kind: "tier",
    options: [
      { name: "Spectacular", value: 15, cond: "Most booked cards grant 3+ excitement." },
      { name: "Vibrant",     value: 10, cond: "Most booked cards grant 2 excitement." },
      { name: "Intimate",    value: 5,  cond: "Most booked cards grant 1 excitement." },
    ] },
  { type: "Guest", desc: "Stack one vendor category.", range: "+5 – 15", kind: "category",
    scale: "1 vendor → +5 · 2 → +10 · 3+ → +15",
    options: [
      { name: "Admired",    cat: "Photography" },
      { name: "Amazed",     cat: "Flowers & Decorations" },
      { name: "Captivated", cat: "Entertainment" },
      { name: "Honored",    cat: "Stationery" },
      { name: "Impressed",  cat: "Attire & Accessories" },
      { name: "Indulged",   cat: "Food & Drink" },
      { name: "Moved",      cat: "Ceremony" },
      { name: "Pampered",   cat: "Favors & Gifts" },
      { name: "Spoiled",    cat: "Transportation" },
    ] },
];

const CheckInGoal = ({ number, selType, selOpt, onSelectType, onSelectOpt, onBack, onConfirm, onClose, stepper }) => {
  const type = selType != null ? CI_GOAL_TYPES[selType] : null;
  const ready = selType != null && selOpt != null;
  return (
    <Modal title="Set a Goal" eyebrow={`Check-In ${number} · Step 2 of 2`} width={840} padding={0} onClose={onClose} stepper={stepper} scrim={CI_SCRIM}
      footer={
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onBack} style={{ ...ciGhost, visibility: onBack ? "visible" : "hidden" }}>← Back to theme</button>
          <button onClick={() => onConfirm && onConfirm(selType, selOpt)} disabled={!ready} style={{ ...ciPrimary, opacity: ready ? 1 : 0.4, cursor: ready ? "pointer" : "not-allowed" }}>Confirm · Begin Q{number + 1}</button>
        </div>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "288px 1fr", alignItems: "stretch", height: 392 }}>

        {/* LEFT — goal type */}
        <div style={{ borderRight: "2px solid var(--ink)", padding: 18, background: "var(--paper-soft)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>1 · Goal type</div>
          {CI_GOAL_TYPES.map((g, i) => {
            const on = selType === i;
            return (
              <div key={g.type} onClick={() => onSelectType(i)} style={{
                padding: "11px 13px", cursor: "pointer",
                background: on ? "var(--accent-soft)" : "var(--paper)",
                border: `2px solid ${on ? "var(--accent)" : "var(--ink)"}`,
                boxShadow: on ? "3px 3px 0 var(--accent)" : "2px 2px 0 var(--ink)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink)" }}>{g.type}</span>
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, lineHeight: 1.3, color: "var(--ink-2)", marginTop: 3 }}>{g.desc}</div>
              </div>
            );
          })}
        </div>

        {/* RIGHT — the specific goal within that type */}
        <div style={{ padding: 18, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {!type && (
            <div style={{ flex: 1, display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16, color: "var(--ink-3)", lineHeight: 1.4 }}>
                Pick a goal type on the left, then choose the specific goal you'll commit to.
              </div>
            </div>
          )}
          {type && (
            <>
              <div className="t-eyebrow" style={{ color: "var(--ink-3)", marginBottom: 10 }}>2 · Choose your {type.type} goal</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minHeight: 0, overflow: "auto" }}>
                {type.options.map((o, j) => {
                  const on = selOpt === j;
                  if (type.kind === "category") {
                    return (
                      <div key={o.name} onClick={() => onSelectOpt(j)} style={{
                        display: "grid", gridTemplateColumns: "16px 1fr", gap: 10, alignItems: "center",
                        padding: "9px 12px", cursor: "pointer",
                        background: on ? "var(--accent-soft)" : "var(--paper-soft)",
                        border: `2px solid ${on ? "var(--accent)" : "var(--ink-line-2)"}`,
                      }}>
                        <span style={{ width: 14, height: 14, background: CATEGORY_TONE[o.cat], display: "block" }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink)" }}>{o.name}</div>
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, lineHeight: 1.3, color: "var(--ink-2)", marginTop: 2 }}>
                            <strong style={{ color: "var(--ink)" }}>{o.cat}</strong> — 5 gifts per vendor booked, up to 15.
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={o.name} onClick={() => onSelectOpt(j)} style={{
                      display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center",
                      padding: "9px 12px", cursor: "pointer",
                      background: on ? "var(--accent-soft)" : "var(--paper-soft)",
                      border: `2px solid ${on ? "var(--accent)" : "var(--ink-line-2)"}`,
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink)" }}>{o.name}</div>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, lineHeight: 1.3, color: "var(--ink-2)", marginTop: 2 }}>{o.cond}</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gift)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        +{o.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ——————————————————————————————————————————————————
// ORCHESTRATOR
// ——————————————————————————————————————————————————
const CheckInModal = ({ number = 1, themeOptions, onClose, onConfirm, needsTheme }) => {
  const opts = themeOptions || [
    { name: "Bohemian", elements: ["nature", "whimsy"] },
    { name: "Modern", elements: ["edge", "elegance"] },
  ];
  const wantsTheme = needsTheme != null ? needsTheme : number === 1;
  const [step, setStep] = React.useState(wantsTheme ? 1 : 2);
  const [theme, setTheme] = React.useState(null);
  const [goalType, setGoalType] = React.useState(null);
  const [goalOpt, setGoalOpt] = React.useState(null);

  const steps = wantsTheme
    ? [{ n: 1, label: "Set Theme" }, { n: 2, label: "Set Goal" }]
    : [{ n: 2, label: "Set Goal" }];
  const stepper = (cur) => <CheckInStepper steps={steps} current={cur} onJump={(n) => n === 1 && setStep(1)} />;

  if (step === 1 && wantsTheme) {
    return <CheckInTheme number={number} themeOptions={opts} selected={theme} onSelect={setTheme} onNext={() => setStep(2)} onClose={onClose} stepper={stepper(1)} />;
  }
  return (
    <CheckInGoal
      number={number}
      selType={goalType}
      selOpt={goalOpt}
      onSelectType={(i) => { setGoalType(i); setGoalOpt(null); }}
      onSelectOpt={setGoalOpt}
      onBack={wantsTheme ? () => setStep(1) : null}
      onConfirm={onConfirm}
      onClose={onClose}
      stepper={stepper(2)}
    />
  );
};

const ciPrimary = {
  padding: "12px 22px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
  letterSpacing: "0.14em", textTransform: "uppercase", background: "var(--accent)", color: "var(--paper)",
  border: "2px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)",
};
const ciGhost = {
  padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em",
  textTransform: "uppercase", background: "var(--paper-soft)", color: "var(--ink)",
  border: "1.5px solid var(--ink)", cursor: "pointer",
};

Object.assign(window, { CheckInModal, CheckInTheme, CheckInGoal });
