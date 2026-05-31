/* tasks.jsx — task worksheet component
   The worksheet has 4 groups, ~28 tasks total, with effort boxes,
   lock conditions, and milestone rewards.
*/

const TASK_DATA = {
  "Getting Started": [
    { name: "Apply for Marriage License", effort: 1, gift: 1, lock: "Month 10+", key: false },
    { name: "Block Out Guest Hotel Rooms★", effort: 1, gift: 1, key: false },
    { name: "Create Gift Registry", effort: 1, gift: 1, key: false },
    { name: "Launch Wedding Website", effort: 1, gift: 1, hook: { 1: "+1 exc" }, key: false },
  ],
  "Making It Yours": [
    { name: "Order Wedding Rings", effort: 2, gift: 2, key: false },
    { name: "Plan Bridal Shower★", effort: 2, gift: 2, key: false },
    { name: "Plan Honeymoon", effort: 2, gift: 2, key: false },
    { name: "Write Wedding Vows★", effort: 2, gift: 2, key: false },
  ],
  "Putting It Together": [
    { name: "Assemble Guest Bags★", effort: 2, gift: 3, lock: "Favors & Gifts" },
    { name: "Coordinate Guest Arrivals★", effort: 2, gift: 3, lock: "Transportation" },
    { name: "Create Playlist", effort: 2, gift: 3, lock: "Entertainment" },
    { name: "Design Centerpieces", effort: 2, gift: 3, lock: "Flowers & Decorations" },
    { name: "Plan Ceremony Structure★", effort: 2, gift: 3, lock: "Ceremony" },
    { name: "Schedule Engagement Shoot", effort: 2, gift: 3, lock: "Photography" },
    { name: "Schedule Fitting Session", effort: 2, gift: 3, lock: "Attire & Accessories" },
    { name: "Venue Setup / Teardown★", effort: 2, gift: 3, lock: "Venue" },
  ],
  "Locking It In": [
    { name: "Choose Wedding Party", effort: 3, gift: 1, hook: { 3: "+1 exc" }, key: true },
    { name: "Host Post-Wedding Brunch★", effort: 1, gift: 2, lock: "Wedding Party done" },
    { name: "Host Rehearsal Dinner★", effort: 1, gift: 2, lock: "Wedding Party done" },
    { name: "Purchase Wedding Party Gifts", effort: 1, gift: 2, lock: "Wedding Party done" },
    { name: "Conduct Vendor Tastings", effort: 3, gift: 2, hook: { 3: "+1 exc" }, key: true },
    { name: "Design Signature Drink", effort: 1, gift: 2, lock: "Vendor Tastings done" },
    { name: "Finalize Menu Selections", effort: 2, gift: 4, lock: "Tastings + Food & Drink" },
    { name: "Order Wedding Cake", effort: 2, gift: 4, lock: "Tastings + Food & Drink" },
    { name: "Create Guest List", effort: 4, gift: 3, hook: { 4: "+1 exc" }, key: true },
    { name: "Send Save-the-Dates", effort: 2, gift: 4, hook: { 2: "+1 exc" }, lock: "Guest List + Stationery" },
    { name: "Mail Wedding Invitations", effort: 2, gift: 4, hook: { 2: "+1 exc" }, lock: "Guest List + Stationery" },
    { name: "Create Seating Chart", effort: 2, gift: 4, lock: "Guest List + Venue" },
  ],
};

const TaskRow = ({ task, status = {} }) => {
  // status: { unlocked:bool, effortFilled:number, completed:bool }
  const isLocked = !status.unlocked;
  const isCompleted = status.completed;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr auto auto",
      gap: 8,
      alignItems: "center",
      padding: "5px 6px",
      background: isCompleted ? "var(--paper-deep)" : "transparent",
      opacity: isLocked ? 0.5 : 1,
      borderBottom: "1px solid var(--ink-line-2)",
    }}>
      {/* Lock icon or key indicator */}
      <span style={{ width: 14, display: "grid", placeItems: "center" }}>
        {isLocked && <LockIcon size={12} />}
        {task.key && !isLocked && <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--accent)",
        }}>★</span>}
      </span>
      {/* Name */}
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        lineHeight: 1.2,
        color: isLocked ? "var(--ink-3)" : "var(--ink-2)",
        textDecoration: isCompleted ? "line-through" : "none",
      }}>
        {task.name}
        {task.lock && (
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--ink-3)",
            letterSpacing: "0.08em",
            marginLeft: 4,
          }}>
            · {task.lock}
          </span>
        )}
      </div>
      {/* Effort boxes */}
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: task.effort }, (_, i) => (
          <EffortBox key={i} filled={i < (status.effortFilled ?? 0) || isCompleted} size={12} />
        ))}
      </div>
      {/* Gift reward */}
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 13,
        color: isCompleted ? "var(--gift)" : "var(--ink-3)",
        width: 24,
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
      }}>
        +{task.gift}
      </div>
    </div>
  );
};

const TaskWorksheet = ({
  taskStatus = {},   // { "taskName": {unlocked, effortFilled, completed} }
  completedCount = 0,
  width = 420,
  expanded = true,
}) => {
  const milestones = [
    { at: 4, reward: "+1 effort" },
    { at: 8, reward: "+1 effort" },
    { at: 10, reward: "+1 exc" },
    { at: 12, reward: "+1 effort" },
    { at: 16, reward: "+1 effort" },
    { at: 20, reward: "+5 gifts" },
  ];
  return (
    <div style={{
      background: "var(--paper-soft)",
      border: "2px solid var(--ink)",
      padding: 0,
      boxShadow: "3px 3px 0 var(--ink)",
      width,
    }}>
      <div style={{
        padding: "10px 14px 8px",
        borderBottom: "2px solid var(--ink)",
        background: "var(--ink)",
        color: "var(--paper)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div className="t-eyebrow" style={{ color: "var(--coin)" }}>Task Worksheet</div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--coin)",
        }}>
          {completedCount} completed
        </div>
      </div>

      {/* Completion track */}
      <div style={{ padding: "10px 14px", borderBottom: "2px solid var(--ink)", background: "var(--paper-deep)" }}>
        <div className="t-eyebrow" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Completed track</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: 1.5, border: "1.5px solid var(--ink)" }}>
          {Array.from({ length: 20 }, (_, i) => {
            const filled = i < completedCount;
            const ms = milestones.find(m => m.at === i + 1);
            return (
              <div key={i} style={{
                position: "relative",
                height: 14,
                background: filled ? "var(--ink)" : "var(--paper-soft)",
                borderRight: i === completedCount - 1 ? "2px solid var(--accent)" : 0,
              }}>
                {ms && (
                  <span style={{
                    position: "absolute",
                    bottom: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 7,
                    color: "var(--ink-3)",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}>
                    {ms.at}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
          {milestones.map(m => (
            <span key={m.at} style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: completedCount >= m.at ? "var(--accent)" : "var(--ink-3)",
              letterSpacing: "0.08em",
            }}>
              {m.reward}
            </span>
          ))}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "8px 12px 12px" }}>
          {Object.entries(TASK_DATA).map(([group, tasks]) => (
            <div key={group} style={{ marginBottom: 10 }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--accent)",
                padding: "8px 4px 4px",
                borderBottom: "2px solid var(--ink)",
                marginBottom: 2,
              }}>
                {group}
              </div>
              {tasks.map(t => (
                <TaskRow key={t.name} task={t} status={taskStatus[t.name] || {}} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { TaskRow, TaskWorksheet, TASK_DATA });
