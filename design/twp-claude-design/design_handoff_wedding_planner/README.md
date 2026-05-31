# Handoff: The Wedding Planner — Digital Companion / Prototype

## Overview
This package documents the interactive UI for **The Wedding Planner**, a worker‑placement
board game. The prototype covers a full play session: the shared central board, a player's
own board (hand, wedding grid, theme/goal tracking, helpers), the opponent scorecard, and
the flow screens (lobby, check‑in scoring, wild pick, end‑of‑game).

The visual language is a committed **"Press" / letterpress** direction: cream paper stock,
heavy black ink rules, hard (offset, non‑blurred) drop shadows, condensed display caps,
an italic serif for proper nouns, and a single vermilion accent.

---

## About the design files
The files in this bundle are **design references built in HTML/React (via in‑browser Babel)** —
they show the intended look, layout, and behavior. They are **not production code to copy
verbatim.** The task is to **recreate these designs inside the target codebase's existing
environment** (React, Vue, SwiftUI, native, etc.) using its established components, state
patterns, and asset pipeline. If no environment exists yet, pick the most appropriate
framework and implement the designs there.

Everything is driven by static fixture data (`fixtures.jsx`) — there is no game engine,
networking, or persistence beyond a couple of `localStorage` conveniences (selected demo
screen, opponent‑panel collapse state). Wire the documented components to real game state
in the target app.

## Fidelity
**High‑fidelity.** Colors, typography, spacing, borders, and shadows are final and should be
reproduced precisely. All design values are tokenized in `source/tokens.css` (oklch color,
type roles, spacing, radii, shadow recipes) — port those tokens first, then build components
against them.

---

## How to view / screenshot the designs

**Easiest (no tools, works offline):** open the files in `standalone/` — just double‑click:
- `standalone/Prototype (standalone).html` — the full interactive prototype
- `standalone/Design System (standalone).html` — the design‑system / component reference

These are fully self‑contained single files (fonts, CSS, all scripts, and every image inlined
as data‑URIs). They open straight from the file system in any modern browser — ideal for
taking screenshots outside the design environment.

**For development (the real source):** the files in `source/` are the canonical, editable
source. Because the HTML loads the `.jsx` and image files at runtime, opening `source/Prototype.html`
directly from disk will **not** work — browsers block those local file reads. Run a tiny static
server from inside `source/` instead, e.g.:
```
cd source
python3 -m http.server 8000      # then open http://localhost:8000/Prototype.html
```
(Any static file server works.)

> Note: `source/asset-inline.js` is a small bundling helper that inlines images for the
> standalone build. It is harmless when served but is **not** part of the real design — ignore
> it when porting.

---

## Design tokens
All tokens live in `source/tokens.css`. Highlights (see file for the complete set, all in oklch):

**Paper (backgrounds)**
- `--paper` cream — the ground stock everything sits on
- `--paper-soft` raised surfaces · `--paper-deep` inset wells · `--paper-shade` dividers/step‑backs

**Ink (text & rules)**
- `--ink` primary text + heavy rules · `--ink-2/3/4` descending secondary→faint
- `--ink-line`, `--ink-line-2` hairline dividers

**Accent (the one loud voice)**
- `--accent` vermilion (active state, cursor, callouts) · `--accent-deep` hover/pressed · `--accent-soft` selected wash

**Theme element pigments (the 5 + Wild)** — loud / saturated, used ONLY for theme elements
- `--el-whimsy` pink · `--el-edge` plum · `--el-nature` moss · `--el-tradition` wine · `--el-elegance` brass · `--el-wild` graphite

**Category palette ("stamp ink")** — deliberately quieter/inkier than element pigments so the
eye never confuses a category with a theme element. 9 categories: photography (cobalt),
ceremony (sepia), stationery (slate), food‑drink (brick), favors‑gifts (berry),
flowers‑decorations (teal), attire‑accessories (mauve), transportation (navy),
entertainment (aubergine).

**Functional**
- `--coin` coin gold · `--coin-deep` · `--gift` (small red, distinct from accent) · `--excite` (= accent) · `--positive` (= nature green) · `--warning`

**Rules / shadows / radii**
- Rule weights: hair `1px`, default `2px`, bold `3px`
- Shadows are **HARD** (offset, zero‑blur): `--shadow-press-sm` `3px 3px 0 ink`, `-md` `6px 6px 0`, `-lg` `10px 10px 0`. Soft shadows are reserved for floating modals only.
- Radii: mostly square — `--r-1` 2px, `--r-2` 4px, `--r-pill` 999px (chips only)

**Spacing rhythm:** `--gut-xs 4 · sm 8 · md 16 · lg 24 · xl 40 · 2xl 64`

## Typography
- **Display** — `Antonio` (condensed grotesque), 700, UPPERCASE, tight tracking. Titles, numbers, caps labels.
- **Serif** — `Newsreader`, italic. Proper nouns: card names, venue names, helper names, theme names.
- **Sans** — `Geist`. Body / descriptive copy.
- **Mono** — `JetBrains Mono`, uppercase, wide tracking (`0.14–0.18em`). Eyebrows, labels, metadata.

Reusable type roles are defined as classes in `tokens.css`: `.t-display`, `.t-serif`,
`.t-eyebrow` (+`.t-eyebrow-accent`), `.t-label`, `.t-meta`, `.t-num` (tabular figures).

Minimum sizes observed: card body labels ~9–10px mono; never smaller. Numbers use
`font-variant-numeric: tabular-nums` everywhere they can change.

---

## Screens / Views
Switch screens via the top demo nav in the prototype. Each is a fixed 1440‑wide artboard.

1. **Lobby** — pre‑game setup / seating and game‑variant toggles.
2. **Mid‑Game** *(the primary screen)* — the full table. Three‑column layout (see below).
3. **Q1 · pre‑Check‑In** — the board before the first check‑in, theme not yet chosen (Vision Board shows theme options).
4. **Book Flow** — the full **3-step Book action** (`book-flow.jsx` → `BookCardFlow`): **Step 1 Choose Card** (pick from hand, affordability-gated), **Step 2 Choose Position** (place on the 3×3 grid; legal cells highlighted, venues centre-only), **Step 3 Confirm & Book** (the `BookCardModal`, a square 400px card preview beside the payment/resolution rail). A shared **stepper** strip ties the three together (and lets you click back).
5. **Plan Turn** — the **Plan action** modal (`plan-turn.jsx` → `PlanActionModal`). A Plan action applies **3 effort** across unlocked tasks; this is the interactive allocation view (see its own section below).
6. **Wild Pick** — choosing a Wild theme element (the "any of the above" element).
7. **Check‑In 1** — the scoring screen at a check‑in milestone (goals scored, coins/gifts awarded).
8. **End Game** — final scoring / winner.

   *Check-In is a **modal over the live board** (`check-in.jsx` → `CheckInModal`): Step 1 Set Theme
   (CI1 only), Step 2 Set a Goal, on a light scrim so the player reads their trackers / hand / FVR on
   the board behind it to decide. The goal step is a two-level pick — choose a goal **type** (Theme /
   Budget / Excitement / Guest), then its specific goal: tiers for Theme/Budget/Excitement (e.g. Budget →
   Extravagant +15 / Refined +10 / Modest +5) or a category for Guest (Admired…Spoiled, scaling +5/10/15).
   No board-state readouts embedded — just the choices.*

### Mid‑Game layout (the main screen)
Top to bottom: **Timeline** (12 months · 3 check‑ins · 4 quarters, full width) → **Excitement track**
(0–30 with milestone callouts) → **player chrome bar** (turn/seat). Below that a three‑column grid:

- **Left column (260px):** Help Decks (Money/Effort/Research counts) · Decks (vendor top‑category + venue remaining) · **Helpers** (taken helper cards, stacked).
- **Center column (716px):** Moments & Awards row · Featured Vendor Row (FVR) · the player's **Wedding Grid** (3×3) · **Your Hand** · **Action Dock** (Research / Book / Plan / Help worker placement).
- **Right column (380px):** Vision Board (theme + goals) · Theme element trackers · Task Worksheet · **Opponent Summary** scorecard.

---

## Key components

### Cards (`source/cards.jsx`)
- **VendorCard** (mini, square): top stat row = cost chip (gold, top‑left) + optional weather + excitement burst (red, top‑right); centered italic serif name; row of circular element chips; bottom **CategoryCap** (category‑colored bar with white icon + uppercase label, flush to bottom edge).
- **VenueCard** (mini, square): same structure but the bottom cap is the black **"THE VENUE"** bar (or "EXCLUSIVE VENUE"). No category color. Identical height/rows to vendor cards so they align in hand.
- **VendorCardDetail / VenueCardDetail** (zoom modal, **square 1:1**, 460×460): header stat row → photo well (`flex‑shrink:0` so it never collapses) → name → flavor → element chips → cap. `overflow:hidden` guards the cap.
- **MomentCard / AwardCard** (120×196, intentionally portrait): pattern grid + First/Others payouts + difficulty.
- **ElementChip** (cards) and **ElementIcon** (`icons.jsx`): circular theme‑element tokens backed by the PNGs in `assets/icons/source/` (whimsy, edge, nature, tradition, elegance, **wild**). Wild = white sparkle on coral.
- **CategoryCap / category icons**: `assets/icons/category/*.png`, one per of the 9 categories.

### Wedding Grid (`source/player-board.jsx` → `WeddingGrid`)
3×3 grid of placement cells. Center cell (index 4) is the **Venue** slot. Each numbered cell
shows its **1‑based** number and a `+bonus` (center shows `+Any`). The "active/next" cell gets a
2px ink outline. **Numbering is 1‑based throughout** (cell shows "5", filled‑count labels read
the count, not an index).

### Timeline (`source/central-board.jsx`)
Full‑width bar of 12 months with quarter labels. Three **check‑in markers**:
- Past/active → vermilion fill, cream "★ N" text, "Check‑In N" label below.
- Upcoming → **gold fill, dark ink text** (this contrast pairing is required for legibility — never red text on the dark fill).

### Opponent Summary scorecard (`source/screens.jsx` → `OpponentSummary`)
Collapsible. Header always shows all four stats in the **canonical order Excite · Coins · Gifts · Tasks**
(compact `e/c/g/t` chips when collapsed; four stat tiles when expanded). Expanded body, in order:
1. **Stat tiles** (Excite /30 · Coins · Gifts · Tasks /28)
2. **Theme & Goals** — dark theme bar (name + element icons) then one row per check‑in ("Check‑In N" label, goal type + tier, `+value`; unset check‑ins show a dashed "Not yet set" row)
3. **Theme Elements** — five icon+total tiles
4. **Mini Wedding Grid** — each filled cell shows its category icon + a cost ◈ / excitement ✦ footer; venue cell shows "V"; DIY cells get a "DIY" ribbon; empty cells "—" (center "Venue")
5. **Helpers Taken** — type chip + italic name + optional "Commit" flag, with an `N / 3` count

### Labels / copy rule
Check‑ins are always written out as **"Check‑In 1 / 2 / 3"** — never the "CI1" abbreviation.

### Book Flow (`source/book-flow.jsx` → `BookCardFlow`)
The full **3-step Book action**, built on the shared `<Modal>` frame + its `stepper` slot:
- **`BookStepper`** — a strip below the modal header showing the three steps (done = ink ✓, current =
  accent, upcoming = muted). Completed steps are clickable to jump back.
- **Step 1 `BookChooseCard`** — a dark "PAYMENT"-style subheader (hand count + coin balance) over a
  centered row of hand cards (real `VendorCard`/`VenueCard` minis at 172px). Each card hover-lifts with
  an accent outline + a "Select →" affordance; **unaffordable cards** (cost > coins) are dimmed and
  non-clickable. Clicking advances to step 2.
- **Step 2 `BookChoosePosition`** — divided two-column layout: left = the chosen card (200px) with a
  cost/excite summary and "Change card"; right = the 3×3 wedding grid. **Legal** cells get a 3px accent
  border, a large cell number, the `+BONUS` label, and a "Place here" hover cue; **occupied** cells show
  the booked vendor (category tone + icon + name) or a DIY tile; the **center is venue-only** (legal only
  for a venue card, otherwise shown muted "Venue only"). Clicking a legal cell advances to step 3.
- **Step 3** — the existing `BookCardModal`, now passed the stepper.

Cell legality rule (mirror in the target app): a cell is bookable if it's empty AND (it's the center and
the card is a venue, OR it's a non-center cell and the card is a vendor). The chosen cell's `GRID_BONUS`
resolves on placement.

### Plan Turn modal (`source/plan-turn.jsx` → `PlanActionModal`)
The interactive form of a **Plan** action: the player applies **3 effort** (the `effortBudget` prop;
the optional "Final Push" event would raise this to 4) across unlocked tasks. Built on the shared
`<Modal>` frame. Two columns:
- **Left — the worksheet.** All tasks, grouped, with clickable effort boxes. Pre‑filled boxes are
  solid ink; effort added *this turn* is accent‑colored; the next assignable box shows a `+`.
  Clicking the next empty box spends 1 effort; clicking the last box you added refunds it (fill/unfill
  is strictly sequential). Locked tasks are dimmed with their unlock condition; completed tasks are
  struck through; **key tasks** (★) are flagged "YOU ONLY"; slot hooks are labeled (e.g. "SLOT 3: +1 exc").
  A row about to complete is washed in accent.
- **Right — live "this turn" rail.** An effort budget meter (3 coin‑ringed dots that fill as spent,
  with "N effort left to assign"), then a live tally that updates as you allocate: **Completing (N)**
  tasks with their `+gifts`, **Hooks fired** (slot rewards triggered this turn), **Tracker milestones**
  crossed on the Completed‑Tasks tracker (4/8/10/12/16/20), and a totals footer (**Gifts gained**,
  **Completed tasks** `start → end /28`).
- **Footer:** Reset + primary "Confirm Plan · spend N effort" (disabled until ≥1 effort is assigned).

**Completion rules to mirror in the target app:** a task completes when its filled boxes reach its
required effort → award its gifts, mark it on the Completed‑Tasks tracker, then resolve any milestone
crossings. A slot hook fires the moment its specific box is filled. Key tasks can only be worked by the
player directly (not helpers / planner coordination). All 3 effort may stack on one task or split across
many.

---

## Interactions & behavior
- **Card zoom** — double‑click, ⌘/Ctrl‑click, or right‑click any card opens its detail in a centered modal over a dimmed backdrop; click backdrop to close.
- **Hand selection** — clicking a hand card selects it (lifts 12px). In the static demo the hand ships unselected (`selected={-1}`) so cards sit flush.
- **Opponent panel** — click the header to expand/collapse; state persists in `localStorage`.
- **Action Dock** — the four actions are worker‑placement spaces; the active player's meeple sits on its current space, others are selectable.
- **Demo nav** (top bar) — switches between the screens listed above; selected screen persists in `localStorage`.

## State (what the target app must model)
Per‑player: hand (vendor/venue cards), 3×3 wedding grid placements, excitement (0–30),
coins, gifts, completed tasks (/28), chosen theme + its elements, theme‑element totals
(0–9 each), per‑check‑in goals (type/tier/value), helpers taken (≤3). Shared: timeline /
current month, deck counts, moments & awards, featured vendor row. See `fixtures.jsx` for the
exact shapes used by the components.

## Assets
Only two icon sets are actually rendered (everything else under `assets/` is unused source art):
- `assets/icons/source/*.png` — the 6 theme‑element tokens (whimsy, edge, nature, tradition, elegance, wild)
- `assets/icons/category/*.png` — the 9 category icons

Provided by the user/game. In the standalone builds these are inlined as data‑URIs; in the
target app, move them into the asset pipeline and reference them through the element/category
components rather than hard‑coding paths.

## Files
```
README.md                              ← this document
standalone/
  Prototype (standalone).html          ← full prototype, self‑contained, double‑click to open
  Design System (standalone).html      ← component/token reference, self‑contained
source/
  Prototype.html                       ← demo shell + screen switcher (entry point)
  index.html                           ← design‑system / component gallery
  tokens.css                           ← ALL design tokens + type roles (port this first)
  icons.jsx                            ← ElementIcon, category icons, pips
  cards.jsx                            ← vendor/venue/moment/award/helper cards + zoom details
  player-board.jsx                     ← WeddingGrid, theme/excitement trackers, Hand, Helpers, Vision Board, Action Dock
  central-board.jsx                    ← Timeline, Excitement track, Moments & Awards, FVR
  screens.jsx                          ← Mid‑Game layouts + OpponentSummary scorecard
  flows.jsx                            ← lobby, check‑in, end‑game, modals (Modal frame, Book, Wild Pick)
  plan-turn.jsx                        ← PlanActionModal — the interactive Plan (apply‑effort) turn
  book-flow.jsx                        ← BookCardFlow — the 3-step Book action (choose card / position / confirm) + BookStepper
  check-in.jsx                         ← CheckInModal — Check-In as a modal (Set Theme / Set Goal) over the live board
  tasks.jsx                            ← task worksheet
  fixtures.jsx                         ← sample game state driving every screen
  design-canvas.jsx                    ← pan/zoom canvas used by index.html
  asset-inline.js                      ← bundling helper (ignore when porting)
  assets/                              ← icon PNGs (+ unused source art)
```
