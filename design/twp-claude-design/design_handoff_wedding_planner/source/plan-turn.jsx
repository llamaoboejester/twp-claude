/* plan-turn.jsx — The Plan action turn.
   A Plan action = apply 3 effort marks across any unlocked tasks on the
   worksheet. This modal makes that allocation interactive and shows a live
   readout of the consequences (gifts gained, slot hooks fired, tasks
   completed, and completed-tracker milestones crossed).

   Press direction. Reuses the shared <Modal> frame from flows.jsx.
*/

// Milestones on the Completed-Tasks tracker (mirror of tasks.jsx)
const PLAN_MILESTONES = [
  { at: 4, reward: "+1 effort" },
  { at: 8, reward: "+1 effort" },
  { at: 10, reward: "+1 exc" },
  { at: 12, reward: "+1 effort" },
  { at: 16, reward: "+1 effort" },
  { at: 20, reward: "+5 gifts" },
];

// Flatten TASK_DATA into a name→task lookup, keeping group order.
const PLAN_TASK_INDEX = (() => {
  const idx = {};
  Object.entries(window.TASK_DATA || {}).forEach(([group, tasks]) => {
    tasks.forEach(t => { idx[t.name] = { ...t, group }; });
  });
  return idx;
})();

// A single clickable effort box.
const PlanEffortBox = ({ state, onClick, interactive }) => {
  // state: "base" (pre-filled) | "new" (added this turn) | "empty" | "next" (the next clickable empty)
  const bg = state === "base" ? "var(--ink)"
    : state === "new" ? "var(--accent)"
    : "var(--paper-soft)";
  const border = state === "new" ? "var(--accent-deep)" : "var(--ink)";
  return (
    <span
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : undefined}
      style={{
        width: 18,
        height: 18,
        background: bg,
        border: `1.5px solid ${border}`,
        flex: "0 0 auto",
        cursor: interactive ? "pointer" : "default",
        position: "relative",
        boxShadow: state === "next" ? "inset 0 0 0 2px var(--accent-soft)" : "none",
        transition: "background 80ms ease",
      }}
    >
      {state === "next" && (
        <span style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          color: "var(--accent)", fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 13, lineHeight: 1,
        }}>+</span>
      )}
    </span>
  );
};

// One task row in the Plan worksheet.
const PlanTaskRow = ({ task, baseFilled, added, completedAlready, canAdd, onSetAdded }) => {
  const total = task.effort;
  const newFilled = baseFilled + added;
  const willComplete = newFilled >= total && !completedAlready;
  const isLocked = task.locked;

  const clickBox = (i) => {
    if (isLocked || completedAlready) return;
    // fill up to the clicked empty box, or unfill back to it
    if (i >= baseFilled + added) {
      // adding: only the immediate next box is addable (one at a time), gated by budget
      if (i === baseFilled + added && canAdd) onSetAdded(added + 1);
    } else if (i >= baseFilled) {
      // clicking a box added this turn → unfill everything after it (inclusive)
      onSetAdded(i - baseFilled);
    }
  };

  const boxState = (i) => {
    if (i < baseFilled) return "base";
    if (i < baseFilled + added) return "new";
    if (i === baseFilled + added && !completedAlready && !isLocked) return canAdd ? "next" : "empty";
    return "empty";
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "16px 1fr auto auto",
      gap: 10,
      alignItems: "center",
      padding: "7px 6px",
      background: willComplete ? "var(--accent-soft)" : (completedAlready ? "var(--paper-deep)" : "transparent"),
      opacity: isLocked ? 0.45 : 1,
      borderBottom: "1px solid var(--ink-line-2)",
    }}>
      {/* lock / key / done marker */}
      <span style={{ width: 16, display: "grid", placeItems: "center" }}>
        {isLocked && <LockIcon size={12} />}
        {!isLocked && completedAlready && <span style={{ color: "var(--gift)", fontSize: 13, lineHeight: 1 }}>✓</span>}
        {!isLocked && !completedAlready && task.key && (
          <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 11 }}>★</span>
        )}
      </span>

      {/* name + condition */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12.5,
          lineHeight: 1.2,
          color: isLocked ? "var(--ink-3)" : "var(--ink)",
          textDecoration: completedAlready ? "line-through" : "none",
        }}>
          {task.name.replace("★", "")}
        </div>
        {(task.lock || task.key || task.hook) && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.08em",
            color: isLocked ? "var(--warning)" : "var(--ink-3)", marginTop: 2,
            display: "flex", gap: 8, flexWrap: "wrap",
          }}>
            {task.lock && <span>{isLocked ? "🔒 " : ""}{task.lock}</span>}
            {task.key && !task.lock && <span>KEY · YOU ONLY</span>}
            {task.hook && Object.entries(task.hook).map(([slot, rw]) => (
              <span key={slot} style={{ color: "var(--accent)" }}>SLOT {slot}: {rw}</span>
            ))}
          </div>
        )}
      </div>

      {/* effort boxes */}
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: total }, (_, i) => (
          <PlanEffortBox
            key={i}
            state={completedAlready ? "base" : boxState(i)}
            interactive={!isLocked && !completedAlready}
            onClick={() => clickBox(i)}
          />
        ))}
      </div>

      {/* gift reward */}
      <div style={{
        width: 30, textAlign: "right",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
        color: willComplete ? "var(--gift)" : (completedAlready ? "var(--gift)" : "var(--ink-3)"),
        fontVariantNumeric: "tabular-nums",
      }}>
        +{task.gift}
      </div>
    </div>
  );
};

const PlanActionModal = ({ player, onClose, onConfirm, effortBudget = 3 }) => {
  const status = player.taskStatus || {};

  // working allocation: { taskName: addedEffortThisTurn }
  const [added, setAdded] = React.useState({});

  const spent = Object.values(added).reduce((a, b) => a + b, 0);
  const remaining = effortBudget - spent;

  // resolve lock state: a task is "locked" if its status says so, OR it isn't present in status (not yet unlocked)
  const taskRowProps = (name) => {
    const st = status[name] || {};
    const base = st.completed ? PLAN_TASK_INDEX[name].effort : (st.effortFilled || 0);
    return {
      baseFilled: base,
      completedAlready: !!st.completed,
      locked: st.unlocked === false,
    };
  };

  // ——— live consequence model ———
  const consequences = React.useMemo(() => {
    let gifts = 0;
    const completing = [];
    const hooks = [];
    Object.entries(added).forEach(([name, add]) => {
      if (!add) return;
      const task = PLAN_TASK_INDEX[name];
      const st = status[name] || {};
      const base = st.effortFilled || 0;
      const newFilled = base + add;
      // slot hooks fired this turn
      if (task.hook) {
        Object.entries(task.hook).forEach(([slot, rw]) => {
          const s = Number(slot);
          if (newFilled >= s && base < s) hooks.push({ task: name.replace("★",""), slot: s, reward: rw });
        });
      }
      // completion
      if (newFilled >= task.effort && !st.completed) {
        completing.push({ name: name.replace("★",""), gift: task.gift });
        gifts += task.gift;
      }
    });
    const startCompleted = player.completedTasks || 0;
    const endCompleted = startCompleted + completing.length;
    const crossed = PLAN_MILESTONES.filter(m => m.at > startCompleted && m.at <= endCompleted);
    return { gifts, completing, hooks, startCompleted, endCompleted, crossed };
  }, [added, status, player.completedTasks]);

  const setTaskAdded = (name, val) => {
    setAdded(prev => {
      const next = { ...prev };
      if (val <= 0) delete next[name]; else next[name] = val;
      return next;
    });
  };

  const reset = () => setAdded({});

  const groups = Object.keys(window.TASK_DATA || {});

  return (
    <Modal
      title="Apply Effort"
      eyebrow="Action · Plan"
      width={1000}
      padding={0}
      onClose={onClose}
      footer={
        <>
          <button onClick={reset} style={btnGhost}>Reset</button>
          <button
            onClick={() => onConfirm?.(added)}
            disabled={spent === 0}
            style={{ ...btnPrimary, opacity: spent === 0 ? 0.4 : 1, cursor: spent === 0 ? "not-allowed" : "pointer" }}
          >
            Confirm Plan · spend {spent} effort
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", alignItems: "stretch" }}>

        {/* ——— LEFT: interactive worksheet ——— */}
        <div style={{ borderRight: "2px solid var(--ink)" }}>
          <div style={{
            padding: "12px 20px",
            background: "var(--paper-deep)",
            borderBottom: "2px solid var(--ink)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>
              Click an effort box to assign · ★ = key (you only)
            </div>
            <div className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Gifts on completion →</div>
          </div>
          <div style={{ maxHeight: "60vh", overflow: "auto", padding: "4px 20px 16px" }}>
            {groups.map(group => (
              <div key={group} style={{ marginBottom: 6 }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                  letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)",
                  padding: "12px 4px 4px", borderBottom: "2px solid var(--ink)", marginBottom: 2,
                  position: "sticky", top: 0, background: "var(--paper-soft)", zIndex: 1,
                }}>{group}</div>
                {window.TASK_DATA[group].map(t => {
                  const rp = taskRowProps(t.name);
                  const add = added[t.name] || 0;
                  const canAdd = remaining > 0 && !rp.completedAlready && !rp.locked;
                  return (
                    <PlanTaskRow
                      key={t.name}
                      task={{ ...t, locked: rp.locked }}
                      baseFilled={rp.baseFilled}
                      added={add}
                      completedAlready={rp.completedAlready}
                      canAdd={canAdd}
                      onSetAdded={(v) => setTaskAdded(t.name, v)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ——— RIGHT: live "this turn" rail ——— */}
        <div style={{ background: "var(--paper-soft)", display: "flex", flexDirection: "column" }}>

          {/* effort budget */}
          <div style={{ padding: "18px 20px", borderBottom: "2px solid var(--ink)", background: "var(--ink)" }}>
            <div className="t-eyebrow" style={{ color: "var(--coin)", marginBottom: 10 }}>Effort this turn</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {Array.from({ length: effortBudget }, (_, i) => (
                <span key={i} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "2px solid var(--coin)",
                  background: i < spent ? "var(--accent)" : "transparent",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                  color: i < spent ? "var(--paper)" : "var(--coin)",
                  transition: "background 100ms ease",
                }}>{i < spent ? "✓" : i + 1}</span>
              ))}
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--paper)" }}>
              {remaining > 0
                ? <><strong style={{ color: "var(--coin)" }}>{remaining}</strong> effort left to assign</>
                : <span style={{ color: "var(--coin)" }}>All effort assigned</span>}
            </div>
          </div>

          {/* consequences */}
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

            {spent === 0 && (
              <div style={{
                fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15,
                color: "var(--ink-3)", lineHeight: 1.35,
              }}>
                Assign your effort on the left. The results of this turn will tally here.
              </div>
            )}

            {/* tasks completing */}
            {consequences.completing.length > 0 && (
              <div>
                <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 8 }}>
                  Completing ({consequences.completing.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {consequences.completing.map(c => (
                    <div key={c.name} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "baseline",
                      padding: "5px 8px", background: "var(--paper-deep)", border: "1px solid var(--ink-line-2)",
                    }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink)" }}>{c.name}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--gift)" }}>+{c.gift}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* slot hooks fired */}
            {consequences.hooks.length > 0 && (
              <div>
                <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 8 }}>Hooks fired</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {consequences.hooks.map((h, i) => (
                    <div key={i} style={{
                      fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-2)",
                      display: "flex", justifyContent: "space-between",
                    }}>
                      <span>{h.task} · slot {h.slot}</span>
                      <strong style={{ color: "var(--accent)" }}>{h.reward}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* milestone crossings */}
            {consequences.crossed.length > 0 && (
              <div>
                <div className="t-eyebrow t-eyebrow-accent" style={{ marginBottom: 8 }}>Tracker milestones</div>
                {consequences.crossed.map(m => (
                  <div key={m.at} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "baseline",
                    fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-2)",
                  }}>
                    <span>Reach {m.at} completed</span>
                    <strong style={{ color: "var(--accent)" }}>{m.reward}</strong>
                  </div>
                ))}
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* totals footer */}
            <div style={{ borderTop: "2px solid var(--ink)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Gifts gained</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--gift)", fontVariantNumeric: "tabular-nums" }}>
                  +{consequences.gifts}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="t-eyebrow" style={{ color: "var(--ink-3)" }}>Completed tasks</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                  {consequences.startCompleted}
                  <span style={{ color: "var(--ink-3)" }}> → </span>
                  <span style={{ color: consequences.endCompleted > consequences.startCompleted ? "var(--accent)" : "var(--ink)" }}>{consequences.endCompleted}</span>
                  <span style={{ fontSize: 10, color: "var(--ink-3)" }}> /28</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const btnGhost = {
  padding: "10px 18px",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  background: "var(--paper-soft)",
  color: "var(--ink)",
  border: "1.5px solid var(--ink)",
  cursor: "pointer",
};
const btnPrimary = {
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
};

Object.assign(window, { PlanActionModal });
