# TWP Prototype — Full Codebase Audit
Date: 2026-05-28 | Audited by: Claude Code
Last updated: 2026-05-29

Issues are in priority order (highest impact / most frequently hit first).
✅ = Fixed | open items have no marker.

---

## CRITICAL — Game-Breaking

### ✅ 1. `_checkRaceAwards` only called after booking; plan/task/help triggers never fire
**Fixed 2026-05-28** — Added `_checkRaceAwards(player)` at the top of `_continueStack` so it
fires after every action resolution, not just booking.

---

### ✅ 2. Exclusive venue booking is missing — contracted players can never book their exclusive venue
**Fixed 2026-05-28** — `_beginAction` now includes `exclusiveVenue` in the `CHOOSE_BOOK_TARGET`
pendingAction when the player is contracted and center is empty. `_resolveBookTarget` accepts it
as a third card source. `BookTarget` client shows it in a labeled section with auto-position 4.

---

### ✅ 3. Open Market: `_canDoAction` rejects 'book' when hand is empty, ignoring FVR
**Fixed 2026-05-28** — `_canDoAction` now allows `book` when Open Market is active and FVR has
cards, or when the player has an exclusive venue available to book.

---

### ✅ 4. Open Market: `BookTarget` resolves `card` from player.hand only — FVR selection is broken
**Fixed 2026-05-28** — `card` lookup now falls through hand → FVR → exclusive venue. `isVenue`,
position filtering, and coin check all work correctly for FVR and exclusive venue selections.

---

## HIGH — Wrong Behavior, Frequently Encountered

### ✅ 5. Theme goal tier is ignored in scoring — player always receives the best achievable tier
**Fixed (prior session)** — `_evalThemeGoal` now receives `goal.tier` and caps scoring at the
chosen tier. Also fixed sort-order tiebreaking bias in top-2 element detection.

---

### ✅ 6. Venue deck never reshuffles when empty; research silently returns 0 cards
**Fixed 2026-05-28 (partial)** — `_drawFromVenueDeck` now logs "Venue deck is empty — no
venue card drawn." when depleted, making the failure visible. A full reshuffle is not
implemented (no PRD guidance on whether venues should recycle).

---

### ✅ 7. Key tasks included in `APPLY_DEFERRED_EFFORT` unlocked list; engine rejects them with error
**Fixed 2026-05-28** — Removed the key-task restriction from `_resolveApplyDeferredEffort`
entirely. Task-milestone effort is the player's own earned resource and may go to key tasks,
consistent with the Plan action.

---

### ✅ 8. Client `BookTarget` doesn't apply Budget Relief cost reduction; player may be blocked from affordable cards
**Fixed 2026-05-28** — Added `effectiveCost(card)` helper in `BookTarget` that mirrors the
engine's `_effectiveCost`. Used in `canBook()`, the "not enough coins" warning, and the button
label so all three show the reduced cost when Budget Relief is active.

---

### ✅ 9. Excitement milestone 'venue_card' always shown as available; venue deck can be empty
**Fixed 2026-05-28** — Engine now exposes `venueDeckEmpty` and `fvrEmpty` in the
`CHOOSE_EXCITEMENT_MILESTONE` pendingAction. Client hides the venue card option when the deck
is empty, and the FVR option when FVR is empty (also resolves #14 for this code path).

---

## MEDIUM — Incorrect in Edge Cases or Notable Design Gaps

### ✅ 10. Theme goal tier descriptions in CheckIn.jsx don't align with engine scoring logic
**Fixed 2026-05-28** — Rewrote Thematic and Coordinated descriptions to precisely match the
engine: Thematic = "both in top 2, no other element as high as the lower one"; Coordinated =
"both in top 2, another element may tie the lower one".

---

### ✅ 11. Budget and excitement goals include the venue (grid[4]) in the face-up card pool
**By design** — Venue counts toward budget, excitement, and theme goals. No code change needed.

---

### ✅ 12. Race award ties: only one player can ever win; same-month tie logic is dead code
**Fixed 2026-05-29** — PRD: tied players share the award. Added `raceAwardMonth` to shared
state. `_checkRaceAwards` now allows any player to win if they meet the condition in the same
month as the first winner. Players in later months cannot win. Dead code removed.

---

### ✅ 13. `topVendorCategory` not updated after check-in FVR reseed
**Already correct** — `s.shared.topVendorCategory` is updated immediately after the reseed
at the end of `_completeCheckIn`. No change needed.

---

### ✅ 14. Excitement milestone FVR choice (`canFvr`) available even when FVR is empty
**Fixed as part of #9** — `fvrEmpty` included in `CHOOSE_EXCITEMENT_MILESTONE` pendingAction;
client disables the FVR option when empty.

---

### ✅ 15. Wrong error message: "Exclusive venues cannot be DIY booked" applies to ALL venues
**Fixed 2026-05-29** — message changed to "Venues cannot be DIY booked".

---

### ✅ 16. `_scorePlayer` doesn't initialize `breakdown.balanced = 0`
**Fixed 2026-05-29** — `breakdown` initialised as `{ balanced: 0 }`.

---

### ✅ 17. `_step9HandLimit` auto-discards all remaining venue cards when `justBookedVenue` is true — no player choice
**By design** — confirmed: all remaining venue cards auto-discard to FVR after booking. No change needed.

---

## LOW — Minor, Polish, Design Debt

### 18. `isUnlocked` / `getLockReason` in Game.jsx duplicates engine's `isTaskUnlocked`
**File:** `client/src/components/Game.jsx:172-200`

Lock condition logic appears twice — once client-side for display, once server-side for
enforcement. If a lock condition is added or changed on the server, the client display won't
update without a matching change here. Currently in sync but structurally fragile.

---

### ✅ 19. `reconnect_game` server callback omits `playerName`; `state.playerName` is undefined post-reconnect
**Fixed 2026-05-29** — `playerName` now included in reconnect callback response.

---

### ✅ 20. Personality cards module can be enabled in Lobby but has zero mechanical effect
**Fixed 2026-05-29** — Lobby description updated to "coming soon — no effect yet" so playtesters aren't misled.

---

### ✅ 21. FVR double-assignment in `_completeCheckIn`
**Fixed 2026-05-29** — dead `s.shared.fvr = []` line removed.

---

### ✅ 22. `broadcastState` called on every action, including failures
**Fixed 2026-05-29** — broadcast now skipped when `result.success === false`.

---

### ✅ 23. `getState()` returns a full deepClone; only used for `.phase` checks in index.js
**Fixed 2026-05-29** — added `getPhase()` method; `join_game` handler uses it instead of `getState()`.

---

### 24. TASK_DEFS client copy must stay in sync with server `TASKS` in cards.js manually
**File:** `client/src/data/taskDefs.js`, `server/data/cards.js:316-349`

The client TASK_DEFS (`taskDefs.js`) is now the single client-side source of truth (ActionPanel
and Game both import from it), but it's still a separate copy from the server's TASKS array.
Key fields (gifts, effortRequired, lockConditions) are currently in sync but will drift over
time if either side is edited without updating the other.
Ideal fix: a shared JSON file committed once, or a `/api/tasks` endpoint the client fetches
at startup.

---

### 25. `_scorePlayer` mutates `p.gifts` directly as a side effect
**File:** `server/game/engine.js:1226-1235`

`_scorePlayer` both computes the breakdown AND modifies `p.gifts`. Calling it twice would
double-count all scoring. This pattern makes testing and potential replay/review logic fragile.
Better to return a delta and apply it separately.

---

### ✅ 26. Log buffer silently truncates after 200 entries with no indicator to players
**Fixed 2026-05-29** — limit raised to 500; when entries are dropped, oldest entry replaced with "— older entries removed —" sentinel.

---

### ✅ 27. No validation that `PLANNER_CONTRACTS` has enough entries for all players
**Fixed 2026-05-29** — server logs a `console.warn` if the pool is exhausted so the gap doesn't go unnoticed.

---

### ✅ 28. Scoring.jsx tiebreaker sorts by "most vendors booked" including DIY; may not match PRD
**By design** — confirmed: DIY vendors count in the tiebreaker. Current behavior is correct.

---

### ✅ 29. `_addHelper` `wasFull` variable is computed but never used
**Fixed 2026-05-29** — dead variable removed.

---

### ✅ 30. Scoring breakdown `raceAward` retroactively populated but race award gifts were already in `p.gifts` throughout the game
**Fixed 2026-05-29** — `breakdown.total` was set but never read (Scoring.jsx uses `p.gifts`
directly). Removed the field to eliminate the misleading mismatch.
