# The Wedding Planner — Digital Prototype PRD

**Version:** 1.5
**Status:** Approved for Implementation
**Purpose:** Full-featured browser-based digital prototype for remote playtesting with complete rule enforcement
**Hosting:** Railway
**Players:** 2–5
**Target Play Time:** 60–90 minutes

---

## 1. Overview

The Wedding Planner is a medium-weight competitive euro game for 2–5 players. Each player plans their own wedding over 12 months, organized into 4 quarters punctuated by 3 Check-Ins. Players take turns choosing one of four actions per month. The game ends after Month 12. The player with the most gifts wins. A player who has not booked a venue cannot win regardless of gift total and does not participate in tiebreaker resolution.

---

## Information Visibility

All game information is public except the fronts of cards in player hands.

### Public Information
- Themes (always public once set at Check-In 1)
- Goals (always public once set)
- Special Guests
- Wedding grids (including the public category identity, color, and icon shown on the card backs of DIY face-down bookings)
- Coins
- Gifts
- Meeple positions
- Tasks and helpers
- Awards and Moments
- Excitement and theme element progression
- Featured Vendor Row (FVR) contents
- All booked and DIY'd cards
- Category of the top card of the vendor deck (visible on card back at all times)
- Number of cards in each player's hand (card backs visible)

### Private Information
- Card fronts in player hands only

---

## 2. Scope

### 2.1 In Scope (Base Game)

- Full turn-based multiplayer with rule enforcement
- All four actions: Research, Book, Plan, Help
- 3×3 vendor grid with grid bonus actions
- Venue booking (center position only)
- Theme element tracking (5 elements, 0–8 each)
- Excitement tracking (0–30)
- Task worksheet with dependencies and milestones
- Completed tasks tracker with milestone rewards
- Moment cards (3 active per game, shared, First/Others scoring)
- Check-In structure (after months 3, 6, 9)
- Goal system (Theme, Budget, Excitement, Guest — 3 of 4 set across Check-Ins)
- Theme card selection (Choose 1 of 2 at Check-In 1)
- Featured Vendor Row (FVR) — seeding, drafting, clearing
- Helper system (3 decks, scaled by player count)
- DIY bookings
- Award cards (1 Race Award, 1 Endgame Award per game)
- End of game scoring
- Tiebreaker resolution
- Action restriction (must move meeple to a different action space each main action)
- Hand limit enforcement (5 cards total, max 3 venues; discard venues after booking one)

### 2.2 Optional Modules (Included but Togglable at Setup)

- **Personalities** — asymmetric player powers
- **Wedding Planners** — per-player contracts with exclusive venues and services
- **Special Guests** — drawn individually at Check-In 2 (deck of 8–12 cards, content TBD)
- **Check-In 3 Event** — table-wide bonus drawn randomly from 3 options at Check-In 3
- **Weather Die** — rolled just before final scoring; affects weather-sensitive cards only

### 2.3 Out of Scope (This Version)

- Solo mode
- Stolen Venue variant
- Signature Moments variant
- In-game chat
- Spectator mode
- Persistent accounts or leaderboards
- Mobile-native app

---

## 3. Game Structure

### 3.1 Turn Order & Asynchronous Play Flow

- Asynchronous play respects strict turn order. Play proceeds clockwise linearly (Player A → Player B → Player C).
- On a player's turn, they must move their meeple to a different action space than where it currently is, then resolve the action associated with that space. There is no pass or fallback movement action option.
- Bonus actions do not move the meeple.
- After all players complete their turn, the timeline advances by 1 month.
- After months 3, 6, and 9, a Check-In occurs before advancing to the next month.
- After month 12, proceed directly to end-of-game scoring (no Check-In).
- At each Check-In, all meeples reset to the Vision board. On the first turn of the next quarter, each player may choose any of the four action spaces freely.

### 3.2 Quarters

| Quarter | Months | Ends With |
|---------|--------|-----------|
| Q1 | 1–3 | Check-In 1 |
| Q2 | 4–6 | Check-In 2 |
| Q3 | 7–9 | Check-In 3 |
| Q4 | 10–12 | End of Game |

---

## 4. Setup

### 4.1 Shared Setup

1. Shuffle all vendor cards into a single vendor deck (108 cards, 9 categories, 12 each)
2. Shuffle all venue cards into a separate venue deck (12 cards)
3. Place In-House Vendor Sheet with all 6 in-house vendors available
4. Prepare 3 Help decks by type: Money, Effort, Research
   - Scale each deck to player count + 1 cards
   - e.g., 2 players = 3 cards of each type; 5 players = 6 cards of each type
5. Shuffle and draw 3 Moment cards (or use a recommended set — see Section 9)
6. Shuffle and draw 1 Race Award and 1 Endgame Award (or use a recommended set)
7. Seed the Featured Vendor Row (FVR): First player reveals player count + 1 cards from the vendor deck, one at a time, placing each face-up in the FVR
8. Set Timeline token to Month 1
9. Place shared token supply (gifts, coins) in accessible pool

### 4.2 Per-Player Setup

1. Take player board
2. Take task worksheet
3. Take complete goal set (Theme, Budget, Excitement, Guest goals + Balanced bonus)
4. Draw 2 Personality cards, choose 1, discard the other *(if Personalities module is active)*
5. Receive 12 starting coins *(modified by Personality if active)*
6. Draw 2 Theme cards — keep both hidden until Check-In 1
7. Draw 1 Wedding Planner contract *(if Wedding Planners module is active)*
   - The exclusive venue is visible from the contract sleeve from the start
   - Does not count toward hand limit
8. Place all Theme Element Trackers at position 0
9. Place Excitement Tracker at position 0
10. Place Meeple on Vision board area (starting position)
11. Apply any Personality setup instructions *(if active)*

### 4.3 First Player Determination

- The player whose real-life wedding is soonest (past or future)
- Or randomly determined
- First player receives the First Player token

---

## Featured Vendor Row (FVR) Lifecycle

- At the beginning of each quarter, the Featured Vendor Row (FVR) is seeded with player count + 1 cards drawn from the vendor deck, revealed one at a time face-up.
- Cards removed from the FVR are not replaced during the quarter.
- Player hand discards (including venue cards) are added to the FVR.
- Because play is strictly sequential, the FVR status is completely locked for the active player during their turn window; concurrent modifications by other players are impossible.
- At each Check-In, all remaining FVR cards are discarded out of play (not returned to any deck).
- The FVR is then reseeded for the next quarter.
- There is only one shared vendor deck. If the vendor deck runs out, reshuffle discarded cards to form a new deck.

---

## 5. Actions

On each turn a player must:
1. Move their meeple to a different action space than where it currently is.
2. Resolve the action.
3. Resolve any bonus actions using a depth-first stack pattern (meeple does not move for bonus actions).
4. Check hand limit as the final, absolute gate of the turn lifecycle.

An action may only be selected if the player can legally resolve it. Research and Plan are almost always available.

### 5.1 Research

Take one of three options:

| Option | What You Get |
|--------|-------------|
| FVR | Take 1 face-up card (vendor or venue) from the Featured Vendor Row |
| Venue Deck | Draw 2 cards from the venue deck |
| Vendor Deck | Draw 3 cards from the vendor deck |

The category of the top card of the vendor deck is visible on the card back at all times. After any draw from the vendor deck, the new top card's category is immediately displayed.

### 5.2 Book

Place a vendor or venue from hand into the 3×3 grid.

Vendors may be booked into any non-center empty position. The center position accepts venues only. A player may fill any or all of the 8 surrounding positions before booking a venue. There is no timing restriction on venue placement other than the center position being empty.

#### Booking Resolution Order

Booking actions resolve using a depth-first stack structure. Steps 1–8 execute atomically. Step 9 is deferred to the end of the entire turn.

1. Choose card from hand
2. Pay the coin cost shown on the card
3. Place card into the grid
4. Advance theme element trackers for each element shown on the card
   - For each Wild icon, choose any tracker to advance by 1
   - Resolve theme element milestones immediately as each tracker advances
   - Trackers cap at position 8; no further progress or bonuses beyond 8
5. Advance excitement tracker by the amount shown on the card
   - Resolve excitement milestones immediately
   - Excitement caps at position 30; gains beyond 30 are ignored
6. Check all 3 active Moment cards for completion — score immediately if matched. Bookings are permanent; once placed, a card can never be moved, rotated, removed, or flipped. Moments evaluate the frozen snapshotted state of the grid precisely at this step. Subsequent grid state modifications from stacked bonus actions later in the turn do not retroactively revoke or modify earned points.
7. Resolve any "When Booked" effect on the card
   - Cards received or generated during When Booked resolution (including In-House Vendors drawn from the supply) are added directly to the player's private hand array before proceeding to step 8.
8. Resolve the grid bonus action for the position booked (see Section 5.5)
   - Bonus bookings triggered here are pushed onto the execution stack as full independent bookings, recursively running their own steps 1–8 before the parent action proceeds.
9. **Global Turn Gate:** Check hand limits. (This occurs exactly once per turn, strictly after the main action and all recursive bonus actions on the stack are fully finished. Hand limits are permitted to be temporarily broken during intermediate stack steps.)

#### DIY Booking

Instead of paying cost and booking face-up, any vendor (not exclusive venues) may be booked face-down for free.

DIY bookings:
- Still complete Moments
- Still trigger grid bonus actions
- Still unlock task dependencies
- Still contribute to Guest Goals
- **Information Visibility:** Retain their category identity. The card is placed face-down exposing its standard card back (displaying category name, icon, and color) which remains public information to all players.

DIY bookings do NOT:
- Trigger When Booked effects
- Grant theme elements
- Grant excitement

**Wedding Planner DIY restriction:** If contracted with a Wedding Planner, a player may have a maximum of 1 DIY booking total for the entire game — regardless of when the DIY occurred relative to contracting. A player cannot contract if they already have 2 or more DIY bookings at the time of contracting.

### 5.3 Plan

Apply 3 effort marks across any unlocked tasks on the task worksheet.

- All 3 effort may go to a single task or be split across multiple tasks.
- A task is unlocked when all of its lock conditions are met (see Section 7).
- When a point of effort is applied and fills a box:
  1. If that specific effort slot maps to an immediate reward (such as the final boxes of Key or notification tasks which feature a *Gain 1 Excitement* hook), resolve that reward immediately by pushing it to the execution stack.
  2. If that filled box completes the final required effort slot for the task, the task transitions to completed: gain the listed gifts, mark the task on the Completed Tasks Tracker, and immediately check tracker milestones (see Section 7.2) using depth-first stack ordering.

**Wedding Planner Coordination (if contracted):**
- Separate pool of 3 effort tracked on the Wedding Planner contract
- During any Plan action, may spend 1 or more of this effort on any unlocked, non-key task in addition to the normal 3 effort
- Remove a tracker each time effort is spent from this pool
- Once all 3 trackers are spent, this service is exhausted
- This pool is only available on Plan actions taken after contracting

**Key Tasks:**
- Key tasks are marked on the worksheet
- Key tasks can only be worked on by the player directly (not by helpers or Wedding Planner coordination)

### 5.4 Help

Draw from one of three Help decks and resolve the card.

1. Choose a deck: Money, Effort, or Research
2. Draw the top card
3. Read the card and resolve (some present a choice)
4. Place card in next available helper slot on player board:
   - Face-down if fully resolved
   - Face-up if effect is delayed or commitment is still pending
   - The system automatically flips a face-up helper face-down when its commitment is met
5. Helper limit: maximum 3 helpers total
6. When the third helper slot is filled: immediately take an Any Action bonus (Research, Book, or Plan) after the Help card's effect is fully resolved.
7. Once all 3 slots are filled, the Help action cannot be taken again. (Determined strictly by `helper_slots.length === 3`).
8. Empty decks remain empty for the rest of the game

**Helper Deck Sizes (by player count):**

| Players | Cards per deck |
|---------|---------------|
| 2 | 3 |
| 3 | 4 |
| 4 | 5 |
| 5 | 6 |

### 5.5 Grid Bonus Actions

Each grid position grants a bonus action immediately after booking. Bonus actions do not move the meeple. The bonus action is always the last step (Step 8) of the active booking resolution sequence.

| Position | Bonus Action |
|----------|-------------|
| 1 (top-left) | Research |
| 2 (top-center) | Plan |
| 3 (top-right) | Book |
| 4 (middle-left) | Help |
| 5 (center — venue only) | Any Action |
| 6 (middle-right) | Help |
| 7 (bottom-left) | Book |
| 8 (bottom-center) | Plan |
| 9 (bottom-right) | Research |

**Any Action** removes the meeple-location restriction for that one bonus action only. Any of the four actions may be taken, subject to normal legality rules. Help may not be taken as an Any Action if all 3 helper slots are already filled (i.e., `helper_slots.length === 3`).

**Fallback:** If the bonus action cannot be legally resolved, gain 1 excitement instead (capped at 30).

---

## Grid Invariants

The wedding grid changes only through Book actions.

Booked cards:
- Never move
- Never rotate
- Never leave the grid
- Never flip face-up after being DIY'd

The center space accepts only venues. Venue cards may only be placed in the center space.

A venue may be booked at any time if:
- The center space is empty
- The player has legal access to the venue
- The player can pay the cost

There is no timing restriction on venue placement.

---

## 6. Theme System

### 6.1 The Five Elements

| Element | Color | Icon |
|---------|-------|------|
| Whimsy | Pink | Spiral |
| Edge | Purple | Lightning bolt |
| Nature | Green | Leaf |
| Tradition | Maroon | Rings |
| Elegance | Gold | Diamond |

A **Wild** icon may appear on any card. Standard venue cards always include exactly one Wild icon. Exclusive venue cards may or may not include a Wild icon. At least one vendor card includes a Wild icon. When a Wild icon is gained, the player immediately chooses any one theme element tracker to advance by 1.

### 6.2 Theme Element Trackers

- Each element has a track from 0–8 on the player board
- Trackers cap at position 8; no further progress or bonuses beyond 8
- Milestones (resolved immediately when reached):
  - Position 2: Gain 1 excitement
  - Position 5: Gain 1 excitement
  - Position 8: Gain 5 gifts

### 6.3 Theme Cards

- Each player draws 2 Theme cards at setup (kept hidden until Check-In 1)
- Each Theme card combines 2 elements (e.g., Nature + Whimsy = Bohemian)
- At Check-In 1, each player must choose 1 of their 2 Theme cards and place it face-up on their Vision board. Themes are always public once set. There is no private option and no excitement bonus for revealing.
- Chosen theme determines the 2 "theme elements" used for Theme Goal scoring
- Unchosen Theme card is discarded face-down

### 6.4 Ten Themes

| Theme | Elements |
|-------|---------|
| Bohemian | Nature + Whimsy |
| Industrial | Nature + Edge |
| Rustic | Nature + Tradition |
| Garden | Nature + Elegance |
| Avant-Garde | Edge + Whimsy |
| Gothic | Edge + Tradition |
| Modern | Edge + Elegance |
| Fairytale | Whimsy + Tradition |
| Magical | Whimsy + Elegance |
| Classic | Tradition + Elegance |

---

## 7. Task System

### 7.1 Task Worksheet Data Configuration

Every box on the task worksheet represents an explicit required effort slot. Specific slots feature custom trigger behaviors that run immediately upon being filled.

**Getting Started**

| Gift Reward | Task Name | Required Effort Slots | Slot-Specific Hook Triggers | Lock Condition |
|:---:|---|:---:|---|---|
| 1 | Apply for Marriage License | 1 | None | Locked until Month 10 (available for Plan in Month 10+) |
| 1 | Block Out Guest Hotel Rooms* | 1 | None | None |
| 1 | Create Gift Registry | 1 | None | None |
| 1 | Launch Wedding Website | 1 | Slot 1: Gain 1 Excitement | None |

**Making It Yours**

| Gift Reward | Task Name | Required Effort Slots | Slot-Specific Hook Triggers | Lock Condition |
|:---:|---|:---:|---|---|
| 2 | Order Wedding Rings | 2 | None | None |
| 2 | Plan Bridal Shower* | 2 | None | None |
| 2 | Plan Honeymoon | 2 | None | None |
| 2 | Write Wedding Vows* | 2 | None | None |

**Putting It Together (Vendor-Locked)**

| Gift Reward | Task Name | Required Effort Slots | Slot-Specific Hook Triggers | Lock Condition |
|:---:|---|:---:|---|---|
| 3 | Assemble Guest Wedding Bags* | 2 | None | Favors & Gifts vendor booked |
| 3 | Coordinate Guest Arrivals* | 2 | None | Transportation vendor booked |
| 3 | Create Playlist | 2 | None | Entertainment vendor booked |
| 3 | Design Centerpieces | 2 | None | Flowers & Decorations vendor booked |
| 3 | Plan Ceremony Structure* | 2 | None | Ceremony vendor booked |
| 3 | Schedule Engagement Photoshoot | 2 | None | Photography vendor booked |
| 3 | Schedule Fitting Session | 2 | None | Attire & Accessories vendor booked |
| 3 | Venue Setup / Teardown* | 2 | None | Venue booked |

**Locking It In (Key & Dependent Tasks)**

| Gift Reward | Task Name | Required Effort Slots | Slot-Specific Hook Triggers | Lock Condition |
|:---:|---|:---:|---|---|
| 1 | **Choose Wedding Party** *(key)* | 3 | Slot 3: Gain 1 Excitement | None |
| 2 | Host Post-Wedding Brunch* | 1 | None | Choose Wedding Party completed |
| 2 | Host Rehearsal Dinner* | 1 | None | Choose Wedding Party completed |
| 2 | Purchase Wedding Party Gifts | 1 | None | Choose Wedding Party completed |
| 2 | **Conduct Vendor Tastings** *(key)* | 3 | Slot 3: Gain 1 Excitement | None |
| 2 | Design Signature Drink | 1 | None | Conduct Vendor Tastings completed |
| 4 | Finalize Menu Selections | 2 | None | Conduct Vendor Tastings completed AND Food & Drink booked |
| 4 | Order Wedding Cake | 2 | None | Conduct Vendor Tastings completed AND Food & Drink booked |
| 3 | **Create Guest List** *(key)* | 4 | Slot 4: Gain 1 Excitement | None |
| 4 | Send Save-the-Dates | 2 | Slot 2: Gain 1 Excitement | Create Guest List completed AND Stationery booked |
| 4 | Mail Wedding Invitations | 2 | Slot 2: Gain 1 Excitement | Create Guest List completed AND Stationery booked |
| 4 | Create Seating Chart | 2 | None | Create Guest List completed AND Venue booked |

*Tasks marked with * can have effort applied by helpers or venues/vendors when directed by a card effect.*
*Key tasks can only be worked on by the player directly.*
*Tasks with multiple lock conditions require ALL conditions to be met before the task unlocks.*

### 7.2 Completed Tasks Tracker Milestones

| Tasks Completed | Reward |
|----------------|--------|
| 4 | +1 effort immediately |
| 8 | +1 effort immediately |
| 10 | +1 excitement |
| 12 | +1 effort immediately |
| 16 | +1 effort immediately |
| 20 | +5 gifts |

Milestone rewards resolve immediately when the threshold is crossed. Effort granted by milestones may be applied to any unlocked task immediately.

---

## 8. Excitement System

- Track runs 0–30; caps at 30. Excitement gains beyond 30 are ignored.
- Gained from bookings, task completions, theme element milestones, and other effects
- DIY bookings grant no excitement.
- At positions 5, 15, and 25 only: choose either gain 1 coin OR draw 1 card (player's choice of venue deck or vendor deck)
  - If contracted with Wedding Planner: may instead take 1 card from the FVR
- At end of game: excitement position converts directly to gifts (1 excitement = 1 gift)

---

## 9. Moments

### 9.1 Overview

- 3 Moment cards are active per game, revealed at setup.
- All players compete toward the same 3 Moments.
- Check for completion after every booking (including bonus bookings) at Step 6 of the resolution loop.
- A Moment is complete when the player's grid exactly matches the pattern:
  - Filled positions must have booked cards (face-up or DIY)
  - Empty positions must be empty

### 9.2 Scoring

- All players who complete a Moment within the same calendar month receive the **First** value, regardless of when their individual asynchronous turns are submitted during that month.
- After that month ends, all subsequent monthly completers receive the **Others** value.
- Race Award gifts (7 gifts) are taken from the supply immediately when earned during play.

### 9.3 Recommended Sets

| Set | Name | Moments | Difficulty |
|-----|------|---------|------------|
| The Rehearsal | Introductory | The Aisle, The Promise, The Union | Easy |
| The Ceremony | Intermediate | The Glance, The Spark, The Rings | Medium |
| The Reception | Challenging | The Giving, The Dance, Forever | Hard |

### 9.4 All 16 Moments

| Moment | First | Others | Pattern |
|--------|-------|--------|---------|
| The Aisle | 3 | 1 | Center column (2, 5, 8) |
| The Journey | 3 | 1 | Center row (4, 5, 6) |
| The Glance | 4 | 2 | Rising diagonal (3, 5, 7) |
| The Look | 4 | 2 | Falling diagonal (1, 5, 9) |
| The Giving | 5 | 2 | Diamond — no center (2, 4, 6, 8) |
| The Snapshot | 5 | 2 | Four corners (1, 3, 7, 9) |
| The Spark | 5 | 2 | Four corners + center (1, 3, 5, 7, 9) |
| The Threshold | 5 | 2 | Top + bottom rows (1, 2, 3, 7, 8, 9) |
| The Vow | 5 | 2 | Left + right columns (1, 3, 4, 6, 7, 9) |
| The Promise | 5 | 3 | Plus sign (2, 4, 5, 6, 8) |
| The Dance | 6 | 3 | S-pattern (1, 2, 4, 6, 8, 9) |
| The Kiss | 6 | 3 | Asymmetric lower (2, 4, 6, 7, 9) |
| The Processional | 6 | 3 | Top row + center + bottom row (1, 2, 3, 5, 7, 8, 9) |
| The Rings | 6 | 3 | All except top/bottom center (1, 3, 4, 5, 6, 7, 9) |
| The Union | 7 | 4 | Full grid (1–9) |
| Forever | 9 | 6 | Full outer ring — no center (1, 2, 3, 4, 6, 7, 8, 9) |

---

## 10. Check-Ins

Check-Ins occur after months 3, 6, and 9. No Check-In after month 12.

### 10.1 Check-In Structure (All Check-Ins)

1. Move all meeples to Vision boards
2. Perform Check-In specific steps (see below)
3. Set a new Goal (see Section 11) — goals are always placed publicly
4. Clear FVR — discard all remaining face-up cards out of play
5. Pass First Player token clockwise
6. New first player seeds FVR with player count + 1 cards from vendor deck, one at a time face-up

### 10.2 Check-In 1 Specific Steps (after Month 3)

- **Set Theme:** Each player must choose 1 of their 2 Theme cards and place it face-up on their Vision board. Themes are always public. There is no private option and no excitement bonus. Discard the unchosen Theme card face-down.

### 10.3 Check-In 2 Specific Steps (after Month 6)

- **Special Guests (if module active):** Each player draws 1 Special Guest card individually from the Special Guest deck. Special Guest cards are public information.

### 10.4 Check-In 3 Specific Steps (after Month 9)

- **Check-In 3 Event (if active):** Draw 1 card randomly from the 3-card Check-In 3 Event deck. Apply the effect to all players for Q4 only.

---

## 11. Goals

Over 3 Check-Ins, each player sets 3 of the 4 goal types (one per Check-In). One goal type is left out entirely. Goals are always set publicly and remain visible for the entire game. A player may not set the same goal type twice.

### 11.1 Theme Goals

Evaluated based on the 2 chosen theme elements vs the 3 non-theme elements at end of game.

| Tier | Gifts | Condition |
|------|-------|-----------|
| Unforgettable | 30 | Only the 2 theme elements have any progress. All 3 non-theme elements are at position 0. |
| Thematic | 20 | The 2 theme elements are the only top 2 elements. No ties with non-theme elements for top 2. |
| Coordinated | 15 | Both theme elements are in the top 2 positions. Ties allowed. |
| Subtle | 10 | At least 1 theme element is in the top 2 positions. |

**Balanced Bonus:** Every player has this regardless of whether they set a Theme Goal. At end of game, if both theme elements are at exactly equal positions, gain 5 additional gifts. Stacks with any theme tier above.

### 11.2 Budget Goals

Evaluated based on cost distribution of face-up booked cards (DIY not counted). The venue counts as a face-up booked card.

| Tier | Gifts | Condition |
|------|-------|-----------|
| Extravagant | 15 | Most booked cards cost 3+ coins |
| Refined | 10 | Most booked cards cost 2 coins |
| Modest | 5 | Most booked cards cost 1 coin |

**Multi-Tie / Distribution Resolution:** Ties are perfectly valid. If two or more tiers are tied for the highest frequency count, the player scores points as long as their chosen tier is one of those tied leaders. The absolute minimum requirement to score is **at least 1** face-up booked card in the entire grid; if a player has 0 face-up booked cards, they fail the goal completely.

### 11.3 Excitement Goals

Evaluated based on excitement value distribution of face-up booked cards (DIY not counted).

| Tier | Gifts | Condition |
|------|-------|-----------|
| Spectacular | 15 | Most booked cards grant 3+ excitement |
| Vibrant | 10 | Most booked cards grant 2 excitement |
| Intimate | 5 | Most booked cards grant 1 excitement |

**Multi-Tie / Distribution Resolution:** Ties are perfectly valid. If two or more tiers are tied for the highest frequency count, the player scores points as long as their chosen tier is one of those tied leaders. The absolute minimum requirement to score is **at least 1** face-up booked card in the entire grid; if a player has 0 face-up booked cards, they fail the goal completely.

### 11.4 Guest Goals

Evaluated based on number of vendors booked in a chosen category. DIY bookings count toward this total.

| Goal | Category |
|------|---------|
| Admired | Photography |
| Amazed | Flowers & Decorations |
| Captivated | Entertainment |
| Honored | Stationery |
| Impressed | Attire & Accessories |
| Indulged | Food & Drink |
| Moved | Ceremony |
| Pampered | Favors & Gifts |
| Spoiled | Transportation |

| Vendors in Category | Gifts |
|--------------------|-------|
| 3+ | 15 |
| 2 | 10 |
| 1 | 5 |

---

## 12. Awards

One Race Award and one Endgame Award are active per game, revealed at setup.

### 12.1 Race Awards (7 gifts)

| Award | Condition |
|-------|-----------|
| First Spark | First player to reach 12 excitement |
| Ahead of Schedule | First player to complete 8 tasks |
| Booking Momentum | First player to book 4 vendors face-up |
| DIY Sprint | First player to DIY 3 vendors |
| Theme Breakthrough | First player to reach position 5 on any one theme element track |

- Check immediately after any relevant action.
- **Simultaneous Race Window:** If multiple players reach the milestone condition within the same calendar month, all of them receive the full award reward, regardless of their chronological turn submission order in asynchronous networking.
- Gifts are taken from the supply immediately when the award is earned.

### 12.2 Endgame Awards (5 gifts)

| Award | Condition |
|-------|-----------|
| Most Well-Rounded | Most different vendor categories among booked vendors (including DIY) |
| Most On-Theme Vendors | Most face-up vendors matching at least one chosen theme element (DIY excluded — theme elements unknown) |
| Most Planned | Highest number of completed tasks |
| Most Balanced Theme | Weakest theme element is stronger than every other player's weakest theme element |
| Strongest Theme Element | Strongest theme element is stronger than every other player's strongest theme element |

- Evaluated at end of game
- Ties: all tied players receive the award

---

## 13. Venues

- Venues must be booked in the center position (position 5) of the 3×3 grid.
- Exactly 1 venue must be booked per wedding.
- A player without a booked venue cannot win and does not participate in tiebreaker resolution.
- The center position bonus action is Any Action — any of the four actions may be taken, subject to normal legality rules.
- All venues have a "When Booked" effect that triggers at step 7 of the booking resolution sequence.
- When Booked effects that impose constraints are permanent for the remainder of the game.
- **Venue Purge Rule:** When a venue card is booked, all remaining venue cards in that player's hand are discarded to the FVR during Step 9 (the final turn-end hand limit check). Booking a standard *vendor* does not trigger this venue purge.
- Standard venue cards always include exactly one Wild element icon.

### 13.1 In-House Vendors

- Stored on the In-House Vendor Sheet in sleeves and do not appear in the regular vendor deck. Identified by asterisk (✱) on card back.
- **Pipeline:** Drawn from the supply pool and added directly into the player's private hand array when triggered by specific venue "When Booked" card text (e.g., *Neighborhood Church* adding the *Church Pastor* vendor to hand).
- Once added to hand, they are subject to standard hand-limit evaluations and require a separate, standard future **Book** action to place them into the grid.

---

## 14. Wedding Planners (Optional Module)

### 14.1 Setup

- Each player receives 1 randomly drawn Wedding Planner contract at setup
- The exclusive venue is visible in the contract sleeve from the start (does not count toward hand limit)

### 14.2 Contracting

- At any point during a player's turn — before, during, or after any action or bonus action — pay 3 coins to contract
- Take 3 effort trackers from shared supply and place on contract
- Contracting does not consume the turn action
- Contracting is permanent
- Cannot contract if player already has 2 or more DIY bookings at the moment of contracting
- While contracted: maximum 1 DIY booking total for the entire game (regardless of when DIY bookings occurred relative to contracting)

### 14.3 Services

**Service 1 — Access**
When reaching excitement milestones (5, 15, 25) and choosing to draw a card, may instead take a card from the FVR.

**Service 2 — Coordination**
Pool of 3 effort tracked on the contract. During any Plan action taken after contracting, spend 1 or more from this pool on any unlocked, non-key tasks in addition to normal 3 effort. Effort from this pool may be split across multiple tasks. Remove a tracker per effort spent. Once all 3 are spent, this service is exhausted.

**Service 3 — Exclusive Access**
The exclusive venue on the contract may be booked at any time by taking it from the sleeve and booking normally. The exclusive venue may not be booked as DIY.

---

## 15. Special Guests (Optional Module — Content TBD)

### 15.1 Overview

- Small deck of 8–12 Special Guest cards
- At Check-In 2 (after month 6), each player draws 1 public Special Guest card individually
- Cards represent emotionally significant people in the couple's life

### 15.2 Architecture Rule

Mechanics, thresholds, requirements, and gift rewards are evaluated dynamically based on individual card text content strings provided in the external data payload. The framework parses requirements and maps them to end-of-game evaluations.

---

## 16. Check-In 3 Event (Optional Module)

### 16.1 Overview

- Small deck of 3 event cards
- At Check-In 3 (after month 9), draw 1 card randomly
- Effect applies to all players for Q4 only

### 16.2 Events

| Card | Effect |
|------|--------|
| Open Market | Any time a player executes a **Book action** (including standard main actions, bonus bookings triggered by grid milestones, or external event rewards), they may choose to select their target card directly from the face-up Featured Vendor Row (FVR) pool instead of from their private hand. All standard cost evaluations and placement rules apply. Sequential async turn order is strictly preserved. |
| Budget Relief | All 3-cost vendors cost only 2 coins to book |
| Final Push | All Plan actions grant 4 effort instead of 3 |

---

## 17. Weather Die (Optional Module)

### 17.1 Overview

- A 6-sided die rolled by the first player just before final scoring (after month 12, before scoring begins)
- Affects only cards with the weather-sensitive icon
- Weather-sensitive cards grant additional excitement at time of booking (amount TBD)
- The die result modifies the end-of-game gift value of all weather-sensitive cards across all players
- Die results produce gift outcomes (positive or negative). Specific face values TBD.

### 17.2 Architecture Requirement

The engine must implement a Weather Die hook from the start. At every point where a weather-sensitive card's value could be modified, the engine must check the weather die result before applying the final value. This must be designed into the architecture before die face values are finalized.

### 17.3 Weather Icon

- Prominently displayed on all applicable vendor and venue cards
- Players choosing weather-sensitive cards knowingly accept variance in exchange for booking-time benefits

---

## 18. Personalities (Optional Module — Content TBD)

### 18.1 Overview

- 10 Personality tent cards
- At setup, each player draws 2, chooses 1, discards the other
- Chosen Personality is active for the entire game
- Personality is visible to all other players

### 18.2 Architecture Rule

Mechanics, rule changes, starting component modifications, and one-time abilities are evaluated dynamically based on individual card text strings provided in the data payload. The game engine must implement a Personality hook system from the start to check the active player's profile data properties before resolving default rules.

---

## 19. End of Game

### 19.1 Trigger

After all players complete Month 12. No Check-In occurs.

### 19.2 Weather Die (if module active)

The first player rolls the weather die. Apply result to all weather-sensitive cards across all players.

### 19.3 Scoring Order

Begin with all gifts already accumulated during play (from Moments, completed tasks, Race Awards, and other in-game effects), then proceed in order:

1. **Convert Excitement** — Gain gifts equal to final excitement position
2. **Resolve Pending Helpers** — Evaluate unfulfilled commitments on face-up helper cards dynamically per card data strings
3. **Evaluate Goals** — Check each of the 3 set goals; check Balanced bonus for all players
4. **Evaluate Endgame Award** — Determine recipient(s); each receives 5 gifts
5. **Special Guests (if active)** — Evaluate fulfillment; award gifts per card-specific data rules

### 19.4 Tiebreaker (in order, applied only among players who have booked a venue)

1. Most vendors booked (including DIY)
2. Most tasks completed
3. Highest excitement position
4. Shared victory

### 19.5 Cannot Win Condition

A player who has not booked a venue cannot win regardless of gift total and does not participate in tiebreaker resolution.

---

## 20. UI Requirements

### 20.1 Player View

Each player sees:
- Their own player board (grid, trackers, task worksheet, vision board, helper slots)
- Shared central board (FVR, active Moments, active Awards, timeline, help decks)
- Other players' grids and public information (excitement position, completed task count, public goals, theme, meeple position, coin count, gift count)

### 20.2 Game State Visibility

| Information | Visibility |
|-------------|-----------|
| Card fronts in hand | Private (owner only) |
| Card backs in hand (count) | Public |
| Grid contents | Public (Face-up contents or DIY category identities explicitly shown via card back color/icon) |
| Theme card | Public once set at Check-In 1 |
| Goals | Always public once set |
| Special Guest card | Public |
| Excitement position | Public |
| Completed task count | Public |
| Coin count | Public |
| Meeple position | Public |
| Helper cards (face-down) | Private |
| Helper cards (face-up) | Public |
| Top card of vendor deck (category) | Public |

### 20.3 Rule Enforcement Requirements

The system must enforce:
- Action restriction (meeple must move to a different action space each main action)
- Hand limit (5 total, max 3 venues; discard all remaining venues from hand to FVR at step 9 strictly after a venue booking turn finishes)
- Venue placement (center only)
- Task unlock conditions (all conditions must be met)
- Key task restriction (player only, no helpers or Wedding Planner coordination)
- Helper limit (max 3; Help action unavailable once all 3 slots filled, verified strictly by counter size `slots.length === 3`)
- DIY restrictions when contracted with Wedding Planner (1 total for entire game)
- Moment completion detection after every booking including bonus bookings (evaluated instantly at step 6)
- Goal type uniqueness (cannot set same goal type twice)
- Cannot win without venue; no tiebreaker participation without venue
- Excitement track cap at 30 (gains beyond 30 ignored)
- Theme element track cap at 8 (gains beyond 8 ignored)
- Apply for Marriage License locked until Month 10
- Any Action bonus from center position: any action subject to normal legality rules
- Any Action bonus from 3rd helper slot: Research, Book, or Plan only (Help excluded because slots are full)

### 20.4 Turn Flow

- System enforces turn order
- Active player is clearly indicated
- Actions unavailable on current turn are visually disabled
- All bonus actions and nested stack components are resolved completely before the hand limit check triggers at step 9
- Other players may observe but not interact during another player's turn
- All "immediate" effects are resolved atomically server-side before game state is committed and sent to clients. No partial states are ever emitted.

---

## 21. Data Architecture

### 21.1 Card Data Structures

The following card sets require complete structured data before implementation:

- Vendor cards (108 total — 9 categories × 12 cards each): name, category, cost, excitement, theme elements (including Wild flag)
- Venue cards (12): name, cost, excitement, theme elements, Wild element (always present on standard venues; may or may not be present on exclusive venues), When Booked effect, exclusive venue link (for Wedding Planner contracts), weather-sensitive flag
- In-House Vendor cards (6): name, category, cost, excitement, theme elements, When Booked effect (if any), weather-sensitive flag
- Help cards (18 — 6 per type, scaled at runtime): name, type, offer text, choice A, choice B, operational mechanics / endgame penalty data string
- Personality cards (10): name, setup modifications, rule changes, restrictions, one-time ability data string
- Wedding Planner contracts (8): name, exclusive venue reference
- Special Guest cards (8–12 — content TBD): name, description, requirement verification rules, gift value data string
- Award cards (5 Race, 5 Endgame): name, condition, value

### 21.2 Game State

The server must maintain a single shared game state object including:

- Current month
- Current player index
- Per Moment: first_completed_month (null until completed), completed_by (list of player IDs)
- Each player's: hand (fronts private, count public), grid, theme element trackers, excitement tracker, coins, gifts, goals (type + tier chosen), helpers (face-up/face-down state + commitment status), completed tasks count, current meeple position, Personality (if active), Special Guest (if active), contracted planner status, DIY booking count, Wedding Planner effort trackers remaining
- Shared: FVR contents, active Moments, active Awards, help deck states, Check-In 3 event drawn (if active), weather die result (if active)
- Module flags: which optional modules are active

---

## 22. Technical Notes

- Browser-based web application managed server-side hosted on Railway.
- No persistent accounts required; players join via shared URL.
- Personality, Special Guest, Helper commitment, and Weather Die systems are built using decoupled data-driven architecture strings to ensure implementation content safety before asset values are fully finalized.
- All rule enforcement server-side to prevent client-side manipulation. Support turn-based sequential async play.
- All "immediate" effects resolve atomically server-side before state is committed using a depth-first stack execution tree.

---

*Document prepared for use with Claude Code implementation. Card data to be added as separate structured files once content is digitized.*
