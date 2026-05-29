const {
  VENDOR_CARDS, IN_HOUSE_VENDORS, VENUE_CARDS, PLANNER_EXCLUSIVE_VENUES,
  THEME_CARDS, MOMENT_CARDS, RACE_AWARDS, ENDGAME_AWARDS,
  HELP_CARDS, CHECKIN3_EVENTS, TASKS, TASK_MILESTONES,
  ELEMENT_MILESTONES, EXCITEMENT_MILESTONES, GRID_BONUSES,
  PERSONALITY_CARDS, PLANNER_CONTRACTS, ELEMENTS, shuffle,
} = require('../data/cards');

// ─── helpers ────────────────────────────────────────────────────────────────

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function makeTaskWorksheet() {
  const ws = {};
  TASKS.forEach(t => { ws[t.id] = { effortApplied: 0, completed: false }; });
  return ws;
}

function makeElements() {
  return { whimsy: 0, edge: 0, nature: 0, tradition: 0, elegance: 0 };
}

function isTaskUnlocked(taskDef, playerState, month) {
  for (const cond of taskDef.lockConditions) {
    if (cond.type === 'month_min' && month < cond.month) return false;
    if (cond.type === 'venue_booked' && !playerState.grid[4]) return false;
    if (cond.type === 'vendor_booked') {
      const booked = playerState.grid.some(
        c => c && c.type === 'vendor' && c.category === cond.category
      );
      if (!booked) return false;
    }
    if (cond.type === 'task_completed') {
      if (!playerState.completedTaskIds.includes(cond.taskId)) return false;
    }
  }
  return true;
}

function countFaceUpVendors(grid) {
  return grid.filter(c => c && c.type === 'vendor' && !c.diy).length;
}

function vendorCategoriesInGrid(grid) {
  return [...new Set(grid.filter(c => c && c.type === 'vendor').map(c => c.category))];
}

// ─── GameEngine ─────────────────────────────────────────────────────────────

class GameEngine {
  constructor(gameId, options = {}) {
    this.gameId = gameId;
    this.options = options;
    this._state = this._makeInitialState(options);
  }

  // ── State ──────────────────────────────────────────────────────────────────

  _makeInitialState(options) {
    return {
      gameId: this.gameId,
      phase: 'lobby',  // lobby | playing | checkin | scoring | done
      month: 1,
      quarter: 1,
      playerOrder: [],
      currentPlayerIndex: 0,
      pendingAction: null,  // what we're waiting on from the current player
      pendingActionSeq: 0, // increments each time pendingAction is set, used as React key
      executionStack: [],   // bonus actions to resolve (depth-first)
      deferredEfforts: [],  // pending effort grants waiting to be applied
      players: {},
      shared: {
        fvr: [],
        vendorDeck: [],
        vendorDeckDiscard: [],
        venueDeck: [],
        helpDecks: { money: [], effort: [], research: [] },
        inHouseVendors: [...IN_HOUSE_VENDORS],
        moments: [],
        momentStatus: {},
        raceAward: null,
        endgameAward: null,
        raceAwardWinners: [],
        raceAwardMonth: null,
        firstPlayerIndex: 0,
        checkin3Event: null,
        weatherDieResult: null,
        topVendorCategory: null,
      },
      modules: {
        personalities:   !!options.personalities,
        weddingPlanners: !!options.weddingPlanners,
        specialGuests:   !!options.specialGuests,
        checkin3Event:   !!options.checkin3Event,
        weatherDie:      !!options.weatherDie,
      },
      checkinState: null,
      log: [],
    };
  }

  // ── Players ────────────────────────────────────────────────────────────────

  addPlayer(id, name, socketId) {
    if (this._state.phase !== 'lobby') return { success: false, error: 'Game already started' };
    if (Object.keys(this._state.players).length >= 5) return { success: false, error: 'Game full' };

    this._state.players[id] = {
      id,
      name,
      socketId,
      hand: [],
      grid: Array(9).fill(null),
      themeElements: makeElements(),
      excitement: 0,
      coins: 12,
      gifts: 0,
      meeplePosition: 'vision',
      helpers: [],
      taskWorksheet: makeTaskWorksheet(),
      completedTasksCount: 0,
      completedTaskIds: [],
      goals: [],
      theme: null,
      themeCards: [],
      personality: null,
      specialGuest: null,
      plannerContract: null,
      plannerContracted: false,
      plannerEffortPool: 0,
      diyCount: 0,
      pendingEffort: 0,
      pendingEffortRestricted: 0,  // starred tasks only (from help/venue effects with restriction:'starred')
      pendingExcitementMilestones: [],
      justBookedVenue: false,
    };
    this._state.playerOrder.push(id);
    this._log(`${name} joined.`);
    return { success: true };
  }

  updateSocketId(playerId, socketId) {
    if (this._state.players[playerId]) {
      this._state.players[playerId].socketId = socketId;
    }
  }

  removePlayer(id) {
    if (this._state.phase !== 'lobby') return;
    delete this._state.players[id];
    this._state.playerOrder = this._state.playerOrder.filter(pid => pid !== id);
  }

  // ── Setup ──────────────────────────────────────────────────────────────────

  startGame() {
    const s = this._state;
    const playerIds = s.playerOrder;
    const count = playerIds.length;

    if (count < 2) return { success: false, error: 'Need at least 2 players' };
    if (s.phase !== 'lobby') return { success: false, error: 'Game already started' };

    const allVendors = shuffle([...VENDOR_CARDS]);
    const allVenues  = shuffle([...VENUE_CARDS]);
    const themes     = shuffle([...THEME_CARDS]);

    s.shared.vendorDeck = allVendors;
    s.shared.venueDeck  = allVenues;
    s.shared.vendorDeckDiscard = [];

    // Scale help decks: player count + 1 cards each
    const deckSize = count + 1;
    s.shared.helpDecks.money    = shuffle([...HELP_CARDS.money]).slice(0, deckSize);
    s.shared.helpDecks.effort   = shuffle([...HELP_CARDS.effort]).slice(0, deckSize);
    s.shared.helpDecks.research = shuffle([...HELP_CARDS.research]).slice(0, deckSize);

    // Select 3 moments and awards
    const momentPool = shuffle([...MOMENT_CARDS]);
    s.shared.moments = momentPool.slice(0, 3);
    s.shared.moments.forEach(m => {
      s.shared.momentStatus[m.id] = { firstCompletedMonth: null, completedBy: [] };
    });

    const racePool    = shuffle([...RACE_AWARDS]);
    const endgamePool = shuffle([...ENDGAME_AWARDS]);
    s.shared.raceAward    = racePool[0];
    s.shared.endgameAward = endgamePool[0];

    // Optional: personalities and planner contracts
    const personalityPool = shuffle([...PERSONALITY_CARDS]);
    const plannerPool = shuffle([...PLANNER_CONTRACTS]);

    // Per-player setup
    playerIds.forEach((pid, idx) => {
      const p = s.players[pid];
      p.themeCards = themes.splice(0, 2);

      if (s.modules.personalities) {
        const opts = personalityPool.splice(0, 2);
        p._personalityOptions = opts;
        // Player will choose at start; for now auto-assign first
        p.personality = opts[0];
      }

      if (s.modules.weddingPlanners) {
        const contract = plannerPool.splice(0, 1)[0];
        if (contract) {
          const excl = PLANNER_EXCLUSIVE_VENUES.find(v => v.id === contract.exclusiveVenueId);
          p.plannerContract = { ...contract, exclusiveVenue: excl || null };
        } else {
          console.warn(`[engine] Planner contract pool exhausted — player ${p.name} has no contract`);
        }
      }
    });

    // Seed FVR with player count + 1 cards
    s.shared.fvr = s.shared.vendorDeck.splice(0, count + 1);
    s.shared.topVendorCategory = s.shared.vendorDeck[0]?.category || null;

    s.phase = 'playing';
    s.month = 1;
    s.quarter = 1;
    s.currentPlayerIndex = 0;
    s.shared.firstPlayerIndex = 0;

    this._log('Game started! Month 1 begins.');
    return { success: true };
  }

  _setPending(pa) {
    const s = this._state;
    s.pendingActionSeq = (s.pendingActionSeq || 0) + 1;
    s.pendingAction = pa ? { ...pa, _seq: s.pendingActionSeq } : null;
  }

  // ── Action dispatch ────────────────────────────────────────────────────────

  handleAction(playerId, action) {
    const s = this._state;

    if (s.phase === 'checkin') return this._handleCheckinAction(playerId, action);
    if (s.phase === 'scoring' || s.phase === 'done') return { success: false, error: 'Game is over' };
    if (s.phase !== 'playing') return { success: false, error: 'Not in playing phase' };

    const currentPid = s.playerOrder[s.currentPlayerIndex];
    if (playerId !== currentPid) return { success: false, error: 'Not your turn' };

    const player = s.players[playerId];

    // Handle pending action resolution first
    if (s.pendingAction) {
      return this._resolvePendingAction(playerId, action, player);
    }

    // No pending action — player is choosing their main action or continuing stack
    return this._dispatchAction(playerId, action, player);
  }

  _dispatchAction(playerId, action, player) {
    const s = this._state;

    switch (action.type) {
      case 'SELECT_ACTION': return this._startMainAction(playerId, action.payload, player);
      case 'CONTRACT_PLANNER': return this._contractPlanner(playerId, player);
      default: return { success: false, error: `Unknown action: ${action.type}` };
    }
  }

  _resolvePendingAction(playerId, action, player) {
    const pa = this._state.pendingAction;

    switch (pa.type) {
      case 'CHOOSE_RESEARCH_SOURCE': return this._resolveResearchSource(playerId, action, player);
      case 'CHOOSE_FVR_CARD':        return this._resolveFvrPick(playerId, action, player);
      case 'CHOOSE_BOOK_TARGET':     return this._resolveBookTarget(playerId, action, player);
      case 'CHOOSE_PLAN_EFFORT':     return this._resolvePlanEffort(playerId, action, player);
      case 'CHOOSE_HELP_DECK':       return this._resolveHelpDeck(playerId, action, player);
      case 'CHOOSE_HELP_CHOICE':     return this._resolveHelpChoice(playerId, action, player);
      case 'CHOOSE_WILD':            return this._resolveWild(playerId, action, player);
      case 'CHOOSE_EXCITEMENT_MILESTONE': return this._resolveExcitementMilestone(playerId, action, player);
      case 'CHOOSE_BONUS_ANY_ACTION':return this._resolveBonusAnyAction(playerId, action, player);
      case 'CHOOSE_HAND_DISCARD':    return this._resolveHandDiscard(playerId, action, player);
      case 'APPLY_DEFERRED_EFFORT':  return this._resolveApplyDeferredEffort(playerId, action, player);
      default: return { success: false, error: `Unknown pending action: ${pa.type}` };
    }
  }

  // ── Main action selection ──────────────────────────────────────────────────

  _startMainAction(playerId, payload, player) {
    const { action } = payload;  // 'research' | 'book' | 'plan' | 'help'
    const s = this._state;

    if (!['research', 'book', 'plan', 'help'].includes(action)) {
      return { success: false, error: 'Invalid action' };
    }

    // Meeple must move to a different space
    if (player.meeplePosition === action) {
      return { success: false, error: 'You must move your meeple to a different action space' };
    }

    // Help is blocked if all 3 slots filled
    if (action === 'help' && player.helpers.length >= 3) {
      return { success: false, error: 'All helper slots are filled — Help action unavailable' };
    }

    player.meeplePosition = action;
    this._log(`${player.name} moves to ${action}.`);

    return this._beginAction(playerId, action, player, false);
  }

  _beginAction(playerId, action, player, isBonus) {
    const s = this._state;

    if (action === 'research') {
      // Ask: FVR, venue deck, or vendor deck
      s.pendingAction = {
        type: 'CHOOSE_RESEARCH_SOURCE',
        isBonus,
        choices: ['fvr', 'venue_deck', 'vendor_deck'],
      };
      return { success: true };
    }

    if (action === 'book') {
      const hasExclusiveVenue = player.plannerContracted && player.grid[4] === null
        && !!player.plannerContract?.exclusiveVenue;
      const openMarket = s.shared.checkin3Event?.effect?.type === 'open_market';
      const hasFvrCards = s.shared.fvr.length > 0;

      if (player.hand.length === 0 && !hasExclusiveVenue && !(openMarket && hasFvrCards)) {
        // Fallback: gain 1 excitement
        this._gainExcitement(player, 1);
        this._log(`${player.name} has no cards to book — fallback: +1 excitement.`);
        return this._continueStack(playerId, player);
      }
      s.pendingAction = {
        type: 'CHOOSE_BOOK_TARGET',
        isBonus,
        positions: this._availableBookPositions(player),
        exclusiveVenue: hasExclusiveVenue ? player.plannerContract.exclusiveVenue : null,
      };
      return { success: true };
    }

    if (action === 'plan') {
      const effortAmount = this._planEffortAmount(s);
      const unlocked = this._getUnlockedTasks(player, s.month);
      if (unlocked.length === 0) {
        this._gainExcitement(player, 1);
        this._log(`${player.name} has no unlocked tasks — fallback: +1 excitement.`);
        return this._continueStack(playerId, player);
      }
      s.pendingAction = {
        type: 'CHOOSE_PLAN_EFFORT',
        isBonus,
        effortAmount,
        plannerPoolAvailable: player.plannerContracted ? player.plannerEffortPool : 0,
        unlockedTasks: unlocked.map(t => t.id),
      };
      return { success: true };
    }

    if (action === 'help') {
      if (player.helpers.length >= 3) {
        // Fallback
        this._gainExcitement(player, 1);
        this._log(`${player.name} has no helper slots — fallback: +1 excitement.`);
        return this._continueStack(playerId, player);
      }
      const available = [];
      if (s.shared.helpDecks.money.length > 0)    available.push('money');
      if (s.shared.helpDecks.effort.length > 0)   available.push('effort');
      if (s.shared.helpDecks.research.length > 0) available.push('research');
      if (available.length === 0) {
        this._gainExcitement(player, 1);
        this._log(`${player.name}: all help decks empty — fallback: +1 excitement.`);
        return this._continueStack(playerId, player);
      }
      s.pendingAction = { type: 'CHOOSE_HELP_DECK', isBonus, available };
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  // ── Research ───────────────────────────────────────────────────────────────

  _resolveResearchSource(playerId, action, player) {
    const { source } = action.payload;  // 'fvr' | 'venue_deck' | 'vendor_deck'
    const s = this._state;

    if (!['fvr', 'venue_deck', 'vendor_deck'].includes(source)) {
      return { success: false, error: 'Invalid research source' };
    }

    if (source === 'fvr') {
      if (s.shared.fvr.length === 0) return { success: false, error: 'FVR is empty' };
      s.pendingAction = { type: 'CHOOSE_FVR_CARD' };
      return { success: true };
    }

    if (source === 'venue_deck') {
      const drawn = this._drawFromVenueDeck(2);
      player.hand.push(...drawn);
      this._log(`${player.name} researches venue deck, draws ${drawn.length} venue card(s).`);
    }

    if (source === 'vendor_deck') {
      const drawn = this._drawFromVendorDeck(3);
      player.hand.push(...drawn);
      this._log(`${player.name} researches vendor deck, draws ${drawn.length} vendor card(s).`);
    }

    s.pendingAction = null;
    return this._continueStack(playerId, player);
  }

  _resolveFvrPick(playerId, action, player) {
    const { cardId } = action.payload;
    const s = this._state;
    const idx = s.shared.fvr.findIndex(c => c.id === cardId);
    if (idx === -1) return { success: false, error: 'Card not in FVR' };

    const card = s.shared.fvr.splice(idx, 1)[0];
    player.hand.push(card);
    this._log(`${player.name} takes ${card.name} from FVR.`);

    s.pendingAction = null;
    return this._continueStack(playerId, player);
  }

  // ── Booking ────────────────────────────────────────────────────────────────

  _resolveBookTarget(playerId, action, player) {
    const { cardId, position, diy } = action.payload;
    const s = this._state;

    const cardIdx = player.hand.findIndex(c => c.id === cardId);
    let card;
    let fromFvr = false;

    if (cardIdx !== -1) {
      card = player.hand[cardIdx];
    } else {
      const openMarket = s.shared.checkin3Event?.effect?.type === 'open_market';
      if (openMarket) {
        const fvrIdx = s.shared.fvr.findIndex(c => c.id === cardId);
        if (fvrIdx !== -1) {
          card = s.shared.fvr.splice(fvrIdx, 1)[0];
          fromFvr = true;
        }
      }
      if (!card && player.plannerContracted && player.grid[4] === null
          && player.plannerContract?.exclusiveVenue?.id === cardId) {
        card = player.plannerContract.exclusiveVenue;
      }
      if (!card) return { success: false, error: 'Card not in hand or FVR' };
    }

    // Validate position
    const pos = parseInt(position, 10);
    if (pos < 0 || pos > 8) return { success: false, error: 'Invalid grid position' };
    if (player.grid[pos] !== null) return { success: false, error: 'Position already occupied' };
    if (card.type === 'venue' && pos !== 4) return { success: false, error: 'Venues go in center position only' };
    if (card.type === 'vendor' && pos === 4) return { success: false, error: 'Center position is for venues only' };
    if (card.type === 'venue' && diy) return { success: false, error: 'Venues cannot be DIY booked' };

    // DIY restriction with planner
    if (diy && player.plannerContracted && player.diyCount >= 1) {
      return { success: false, error: 'Contracted players may only have 1 DIY booking total' };
    }

    // Pay cost (face-up only)
    const cost = this._effectiveCost(card, s, player);
    if (!diy && player.coins < cost) return { success: false, error: `Not enough coins (need ${cost})` };

    if (!diy) player.coins -= cost;

    // Remove card from source (already removed from FVR above if fromFvr)
    if (!fromFvr) player.hand.splice(cardIdx, 1);

    // Place card
    const placedCard = { ...card, diy: !!diy };
    player.grid[pos] = placedCard;
    if (diy) player.diyCount++;
    if (card.type === 'venue') player.justBookedVenue = true;

    s.pendingAction = null;

    this._log(`${player.name} ${diy ? 'DIY books' : 'books'} ${card.name} at position ${pos + 1}.`);

    // Steps 4-8 of booking resolution
    return this._continueBooking(playerId, player, placedCard, pos, diy);
  }

  _continueBooking(playerId, player, card, pos, diy) {
    const s = this._state;

    if (!diy) {
      // Step 4: advance theme elements (and resolve milestones)
      const elementsToAdvance = [];
      ELEMENTS.forEach(el => {
        for (let i = 0; i < (card.elements[el] || 0); i++) {
          elementsToAdvance.push(el);
        }
      });
      // Wild icons: need player choice
      if (card.wild > 0) {
        // Push wild choices onto stack then continue
        for (let i = 0; i < card.wild; i++) {
          s.executionStack.unshift({ type: 'resolve_wild', cardId: card.id });
        }
      }

      elementsToAdvance.forEach(el => this._advanceElement(player, el));

      // Step 5: advance excitement
      this._gainExcitement(player, card.excitement || 0);
    }

    // Step 6: check moments
    this._checkMoments(player);

    // Step 7: When Booked effect (face-up only)
    if (!diy && card.whenBooked) {
      this._applyWhenBooked(playerId, player, card.whenBooked);
    }

    // Step 8: grid bonus action (push to stack)
    const bonus = GRID_BONUSES[pos];
    s.executionStack.push({ type: 'grid_bonus', action: bonus, position: pos });

    // Check race awards after booking
    this._checkRaceAwards(player);

    // If wilds need resolving, do that first
    if (s.executionStack.length > 0 && s.executionStack[0].type === 'resolve_wild') {
      return this._popAndStartWild(playerId, player);
    }

    return this._continueStack(playerId, player);
  }

  _applyWhenBooked(playerId, player, effect) {
    const s = this._state;
    if (!effect) return;

    switch (effect.type) {
      case 'gain_coins':
        player.coins += effect.amount;
        this._log(`${player.name} gains ${effect.amount} coin(s) from When Booked.`);
        break;
      case 'gain_gifts':
        player.gifts += effect.amount;
        this._log(`${player.name} gains ${effect.amount} gift(s) from When Booked.`);
        break;
      case 'gain_excitement':
        this._gainExcitement(player, effect.amount);
        break;
      case 'gain_cards': {
        const drawn = effect.deckType === 'venue'
          ? this._drawFromVenueDeck(effect.count)
          : this._drawFromVendorDeck(effect.count);
        player.hand.push(...drawn);
        this._log(`${player.name} draws ${drawn.length} ${effect.deckType} card(s) from When Booked.`);
        break;
      }
      case 'gain_inhouse_vendor': {
        const vendor = s.shared.inHouseVendors.find(v => v.id === effect.vendorId);
        if (vendor) {
          player.hand.push({ ...vendor });
          this._log(`${player.name} receives in-house vendor: ${vendor.name}.`);
        }
        break;
      }
      case 'apply_effort': {
        if (effect.restriction === 'starred') {
          player.pendingEffortRestricted += effect.amount;
        } else {
          player.pendingEffort += effect.amount;
        }
        this._log(`${player.name} gains ${effect.amount} effort from When Booked.`);
        break;
      }
      default:
        this._log(`[STUB] When Booked effect: ${effect.type} — not yet implemented.`);
    }
  }

  // ── Plan ───────────────────────────────────────────────────────────────────

  _resolvePlanEffort(playerId, action, player) {
    const { assignments, plannerAssignments } = action.payload;
    // assignments: { [taskId]: effortCount }
    // plannerAssignments: { [taskId]: effortCount } (optional, from planner pool)
    const s = this._state;

    const effortAmount = this._planEffortAmount(s);
    const totalAssigned = Object.values(assignments || {}).reduce((a, b) => a + b, 0);
    if (totalAssigned > effortAmount) {
      return { success: false, error: `Cannot apply more than ${effortAmount} effort` };
    }

    const unlocked = this._getUnlockedTasks(player, s.month);
    const unlockedIds = new Set(unlocked.map(t => t.id));

    for (const [taskId, count] of Object.entries(assignments || {})) {
      if (!unlockedIds.has(taskId)) return { success: false, error: `Task ${taskId} not unlocked` };
      const taskDef = TASKS.find(t => t.id === taskId);
      if (!taskDef) return { success: false, error: `Unknown task ${taskId}` };
      if (taskDef.key && count > 0) {
        // key tasks can only be worked by the player directly — allowed here (this IS the player)
      }
      this._applyEffortToTask(player, taskDef, count, s.month);
    }

    // Planner coordination effort (non-key tasks only)
    if (player.plannerContracted && plannerAssignments) {
      const plannerTotal = Object.values(plannerAssignments).reduce((a, b) => a + b, 0);
      if (plannerTotal > player.plannerEffortPool) {
        return { success: false, error: 'Not enough planner effort pool' };
      }
      for (const [taskId, count] of Object.entries(plannerAssignments)) {
        const taskDef = TASKS.find(t => t.id === taskId);
        if (!taskDef || taskDef.key) return { success: false, error: 'Planner cannot help with key tasks' };
        if (!unlockedIds.has(taskId)) return { success: false, error: `Task ${taskId} not unlocked` };
        this._applyEffortToTask(player, taskDef, count, s.month);
        player.plannerEffortPool -= count;
      }
    }

    s.pendingAction = null;
    this._log(`${player.name} applies effort to tasks.`);
    return this._continueStack(playerId, player);
  }

  _applyEffortToTask(player, taskDef, count, month) {
    const ws = player.taskWorksheet[taskDef.id];
    if (ws.completed) return;

    for (let i = 0; i < count; i++) {
      if (ws.effortApplied >= taskDef.effortRequired) break;
      const slotIndex = ws.effortApplied;
      ws.effortApplied++;

      // Slot-specific hook
      const hook = taskDef.slotHooks[slotIndex];
      if (hook) {
        this._applyReward(player, hook);
      }

      // Task completion
      if (ws.effortApplied >= taskDef.effortRequired) {
        ws.completed = true;
        player.completedTasksCount++;
        player.completedTaskIds.push(taskDef.id);
        player.gifts += taskDef.gifts;
        this._log(`${player.name} completes "${taskDef.name}" — +${taskDef.gifts} gifts.`);
        this._checkTaskMilestones(player);
      }
    }
  }

  _planEffortAmount(state) {
    let amount = 3;
    if (state.shared.checkin3Event?.effect?.type === 'plan_bonus') {
      amount += state.shared.checkin3Event.effect.extraEffort;
    }
    return amount;
  }

  _getUnlockedTasks(player, month) {
    return TASKS.filter(t => {
      const ws = player.taskWorksheet[t.id];
      if (!ws || ws.completed) return false;
      if (ws.effortApplied >= t.effortRequired) return false;
      return isTaskUnlocked(t, player, month);
    });
  }

  // ── Help ───────────────────────────────────────────────────────────────────

  _resolveHelpDeck(playerId, action, player) {
    const { deck } = action.payload;  // 'money' | 'effort' | 'research'
    const s = this._state;

    if (!['money', 'effort', 'research'].includes(deck)) {
      return { success: false, error: 'Invalid help deck' };
    }
    if (s.shared.helpDecks[deck].length === 0) {
      return { success: false, error: `${deck} deck is empty` };
    }

    const card = s.shared.helpDecks[deck].shift();
    this._log(`${player.name} draws help card: ${card.name}.`);

    if (card.hasChoice) {
      s.pendingAction = { type: 'CHOOSE_HELP_CHOICE', card };
      return { success: true };
    }

    this._addHelper(player, card);
    s.pendingAction = null;
    this._resolveHelpEffect(player, card.effect, card);
    if (s.pendingAction) return { success: true };
    return this._continueStack(playerId, player);
  }

  _resolveHelpChoice(playerId, action, player) {
    const { choice } = action.payload;  // 'A' | 'B'
    const s = this._state;
    const card = s.pendingAction.card;

    const effect = choice === 'A' ? card.choiceA : card.choiceB;
    this._addHelper(player, card);
    s.pendingAction = null;
    this._resolveHelpEffect(player, effect, card);
    if (s.pendingAction) return { success: true };
    return this._continueStack(playerId, player);
  }

  _resolveHelpEffect(player, effect, card) {
    if (!effect) return;
    switch (effect.type) {
      case 'gain_coins':
        player.coins += effect.amount;
        this._log(`${player.name} gains ${effect.amount} coin(s) from ${card.name}.`);
        break;
      case 'gain_gifts':
        player.gifts += effect.amount;
        this._log(`${player.name} gains ${effect.amount} gift(s) from ${card.name}.`);
        break;
      case 'gain_cards': {
        const drawn = effect.deckType === 'venue'
          ? this._drawFromVenueDeck(effect.count)
          : this._drawFromVendorDeck(effect.count);
        player.hand.push(...drawn);
        this._log(`${player.name} draws ${drawn.length} card(s) from ${card.name}.`);
        break;
      }
      case 'gain_fvr_card': {
        if (this._state.shared.fvr.length > 0) {
          this._state.pendingAction = { type: 'CHOOSE_FVR_CARD', fromHelp: true };
        }
        break;
      }
      case 'apply_effort':
        if (effect.restriction === 'starred') {
          player.pendingEffortRestricted += effect.amount;
        } else {
          player.pendingEffort += effect.amount;
        }
        this._log(`${player.name} gains ${effect.amount} effort from ${card.name}.`);
        break;
      default:
        this._log(`[STUB] Help effect: ${effect.type}`);
    }
  }

  _addHelper(player, card) {
    player.helpers.push({ ...card, faceUp: false, slotIndex: player.helpers.length });

    if (player.helpers.length === 3) {
      this._log(`${player.name} fills all 3 helper slots — bonus: any action (Research/Book/Plan)!`);
      // Push Any Action bonus (Help excluded) onto execution stack
      this._state.executionStack.push({ type: 'grid_bonus', action: 'any_no_help', position: null });
    }
  }

  // ── Wild resolution ────────────────────────────────────────────────────────

  _popAndStartWild(playerId, player) {
    const s = this._state;
    s.executionStack.shift();
    s.pendingAction = { type: 'CHOOSE_WILD', elements: ELEMENTS };
    return { success: true };
  }

  _resolveWild(playerId, action, player) {
    const { element } = action.payload;
    const s = this._state;

    if (!ELEMENTS.includes(element)) return { success: false, error: 'Invalid element' };

    this._advanceElement(player, element);
    this._log(`${player.name} chooses ${element} for wild icon.`);

    s.pendingAction = null;

    // More wilds on stack?
    if (s.executionStack.length > 0 && s.executionStack[0].type === 'resolve_wild') {
      return this._popAndStartWild(playerId, player);
    }

    return this._continueStack(playerId, player);
  }

  // ── Excitement milestone ───────────────────────────────────────────────────

  _resolveExcitementMilestone(playerId, action, player) {
    const { choice } = action.payload;  // 'coin' | 'vendor_card' | 'venue_card' | 'fvr_card'
    const s = this._state;

    if (choice === 'coin') {
      player.coins += 1;
      this._log(`${player.name} gains 1 coin from excitement milestone.`);
    } else if (choice === 'vendor_card') {
      const drawn = this._drawFromVendorDeck(1);
      player.hand.push(...drawn);
      this._log(`${player.name} draws 1 vendor card from excitement milestone.`);
    } else if (choice === 'venue_card') {
      const drawn = this._drawFromVenueDeck(1);
      player.hand.push(...drawn);
      this._log(`${player.name} draws 1 venue card from excitement milestone.`);
    } else if (choice === 'fvr_card' && player.plannerContracted) {
      if (s.shared.fvr.length > 0) {
        s.pendingAction = { type: 'CHOOSE_FVR_CARD', fromMilestone: true };
        return { success: true };
      }
    }

    s.pendingAction = null;
    return this._continueStack(playerId, player);
  }

  // ── Bonus stack resolution ─────────────────────────────────────────────────

  _continueStack(playerId, player) {
    const s = this._state;

    // Race award check — runs after every action (booking already checks this too)
    this._checkRaceAwards(player);

    // Drain excitement milestones first (queued by _gainExcitement)
    if (player.pendingExcitementMilestones.length > 0) {
      const pos = player.pendingExcitementMilestones.shift();
      s.pendingAction = {
        type: 'CHOOSE_EXCITEMENT_MILESTONE',
        position: pos,
        canFvr: player.plannerContracted,
        venueDeckEmpty: s.shared.venueDeck.length === 0,
        fvrEmpty: s.shared.fvr.length === 0,
      };
      return { success: true };
    }

    // Restricted effort (starred tasks only — from help cards / venue effects)
    if (player.pendingEffortRestricted > 0) {
      const unlocked = this._getUnlockedTasks(player, s.month).filter(t => t.starred);
      if (unlocked.length > 0) {
        this._setPending({
          type: 'APPLY_DEFERRED_EFFORT',
          effortAmount: player.pendingEffortRestricted,
          unlockedTasks: unlocked.map(t => t.id),
          starredOnly: true,
        });
        return { success: true };
      } else {
        player.pendingEffortRestricted = 0;
      }
    }

    // Unrestricted effort (from task milestones, planner, etc.)
    if (player.pendingEffort > 0) {
      const unlocked = this._getUnlockedTasks(player, s.month);
      if (unlocked.length > 0) {
        this._setPending({
          type: 'APPLY_DEFERRED_EFFORT',
          effortAmount: player.pendingEffort,
          unlockedTasks: unlocked.map(t => t.id),
          starredOnly: false,
        });
        return { success: true };
      } else {
        player.pendingEffort = 0;
      }
    }

    if (s.executionStack.length === 0) {
      // All done — run step 9: hand limit check
      return this._step9HandLimit(playerId, player);
    }

    const next = s.executionStack[s.executionStack.length - 1];
    s.executionStack.pop();

    if (next.type === 'grid_bonus') {
      return this._beginGridBonus(playerId, next, player);
    }

    return { success: true };
  }

  _resolveApplyDeferredEffort(playerId, action, player) {
    const { assignments } = action.payload;
    const s = this._state;
    const pa = s.pendingAction;
    const starredOnly = !!pa.starredOnly;
    const total = Object.values(assignments || {}).reduce((a, b) => a + b, 0);

    const pool = starredOnly ? player.pendingEffortRestricted : player.pendingEffort;
    if (total > pool) {
      return { success: false, error: 'Assigning more effort than available' };
    }

    const unlocked = this._getUnlockedTasks(player, s.month);
    const unlockedIds = new Set(unlocked.map(t => t.id));

    for (const [taskId, count] of Object.entries(assignments || {})) {
      if (!unlockedIds.has(taskId)) return { success: false, error: `Task ${taskId} not unlocked` };
      const taskDef = TASKS.find(t => t.id === taskId);
      if (!taskDef) continue;
      if (starredOnly && !taskDef.starred) {
        return { success: false, error: 'This effort can only be applied to starred tasks' };
      }
      this._applyEffortToTask(player, taskDef, count, s.month);
    }

    if (starredOnly) {
      player.pendingEffortRestricted -= total;
    } else {
      player.pendingEffort -= total;
    }
    s.pendingAction = null;
    return this._continueStack(playerId, player);
  }

  _beginGridBonus(playerId, bonusItem, player) {
    const s = this._state;
    const action = bonusItem.action;

    this._log(`${player.name} resolves grid bonus: ${action}.`);

    if (action === 'any') {
      s.pendingAction = {
        type: 'CHOOSE_BONUS_ANY_ACTION',
        choices: ['research', 'book', 'plan', 'help'],
        meeplePosition: player.meeplePosition,
      };
      return { success: true };
    }

    if (action === 'any_no_help') {
      s.pendingAction = {
        type: 'CHOOSE_BONUS_ANY_ACTION',
        choices: ['research', 'book', 'plan'],
        meeplePosition: player.meeplePosition,
      };
      return { success: true };
    }

    // Check legality before beginning bonus
    const canDo = this._canDoAction(action, player, s);
    if (!canDo) {
      this._gainExcitement(player, 1);
      this._log(`${player.name}: bonus ${action} not legal — fallback: +1 excitement.`);
      return this._continueStack(playerId, player);
    }

    return this._beginAction(playerId, action, player, true);
  }

  _resolveBonusAnyAction(playerId, action, player) {
    const { choice } = action.payload;  // 'research' | 'book' | 'plan' | 'help'
    const s = this._state;
    const pa = s.pendingAction;

    if (!pa.choices.includes(choice)) {
      return { success: false, error: `Choice ${choice} not available` };
    }

    const canDo = this._canDoAction(choice, player, s);
    if (!canDo) {
      this._gainExcitement(player, 1);
      this._log(`${player.name}: bonus ${choice} not legal — fallback: +1 excitement.`);
      s.pendingAction = null;
      return this._continueStack(playerId, player);
    }

    s.pendingAction = null;
    return this._beginAction(playerId, choice, player, true);
  }

  _canDoAction(action, player, state) {
    if (action === 'help' && player.helpers.length >= 3) return false;
    if (action === 'book') {
      const openMarket = state.shared.checkin3Event?.effect?.type === 'open_market';
      const hasExclusiveVenue = player.plannerContracted && player.grid[4] === null
        && !!player.plannerContract?.exclusiveVenue;
      if (player.hand.length === 0
          && !(openMarket && state.shared.fvr.length > 0)
          && !hasExclusiveVenue) return false;
    }
    if (action === 'plan' && this._getUnlockedTasks(player, state.month).length === 0) return false;
    return true;
  }

  // ── Step 9: hand limit ─────────────────────────────────────────────────────

  _step9HandLimit(playerId, player) {
    const s = this._state;

    // If player booked a venue this turn, discard remaining venues to FVR
    if (player.justBookedVenue) {
      const venuesInHand = player.hand.filter(c => c.type === 'venue');
      if (venuesInHand.length > 0) {
        venuesInHand.forEach(v => s.shared.fvr.push(v));
        player.hand = player.hand.filter(c => c.type !== 'venue');
        this._log(`${player.name}: remaining venue cards discarded to FVR.`);
      }
    }

    // Hand limit: 5 total, max 3 venues
    const venueCount = player.hand.filter(c => c.type === 'venue').length;
    const overLimit = player.hand.length > 5 || venueCount > 3;

    if (overLimit) {
      const mustDiscard = Math.max(0, player.hand.length - 5);
      const venueOverflow = Math.max(0, venueCount - 3);
      const totalDiscard = Math.max(mustDiscard, venueOverflow);
      s.pendingAction = {
        type: 'CHOOSE_HAND_DISCARD',
        required: totalDiscard,
        mustDiscardVenues: venueOverflow,
        handSize: player.hand.length,
        venueCount,
      };
      return { success: true };
    }

    return this._endTurn(playerId, player);
  }

  _resolveHandDiscard(playerId, action, player) {
    const { cardIds } = action.payload;  // array of card IDs to discard to FVR
    const s = this._state;
    const pa = s.pendingAction;

    if (cardIds.length !== pa.required) {
      return { success: false, error: `Must discard exactly ${pa.required} card(s)` };
    }

    if (pa.mustDiscardVenues > 0) {
      const venueDiscardCount = cardIds.filter(id => {
        const c = player.hand.find(c => c.id === id);
        return c && c.type === 'venue';
      }).length;
      if (venueDiscardCount < pa.mustDiscardVenues) {
        return { success: false, error: `Must discard at least ${pa.mustDiscardVenues} venue card(s)` };
      }
    }

    for (const id of cardIds) {
      const idx = player.hand.findIndex(c => c.id === id);
      if (idx === -1) return { success: false, error: `Card ${id} not in hand` };
      const card = player.hand.splice(idx, 1)[0];
      s.shared.fvr.push(card);
    }

    this._log(`${player.name} discards ${cardIds.length} card(s) to FVR.`);
    s.pendingAction = null;
    return this._endTurn(playerId, player);
  }

  // ── Turn end & month advance ───────────────────────────────────────────────

  _endTurn(playerId, player) {
    const s = this._state;
    player.justBookedVenue = false;
    this._log(`${player.name}'s turn ends.`);

    // Advance to next player
    s.currentPlayerIndex = (s.currentPlayerIndex + 1) % s.playerOrder.length;

    // If we've cycled back to the first player, the month is complete
    if (s.currentPlayerIndex === s.shared.firstPlayerIndex) {
      return this._advanceMonth();
    }

    const nextPlayer = s.players[s.playerOrder[s.currentPlayerIndex]];
    this._log(`It is now ${nextPlayer.name}'s turn (Month ${s.month}).`);
    return { success: true };
  }

  _advanceMonth() {
    const s = this._state;

    if (s.month >= 12) {
      return this._beginScoring();
    }

    // Check if this month ends a quarter (months 3, 6, 9)
    if (s.month % 3 === 0) {
      s.phase = 'checkin';
      const ci = s.month / 3;
      s.checkinState = {
        checkInNumber: ci,
        step: ci === 1 ? 'theme' : 'goal',
        pendingPlayers: [...s.playerOrder],
        themeChoices: {},
        goalChoices: {},
      };
      this._log(`Check-In ${ci} begins!`);
      return { success: true };
    }

    s.month++;
    this._log(`Month ${s.month} begins.`);
    return { success: true };
  }

  // ── Check-In ───────────────────────────────────────────────────────────────

  _handleCheckinAction(playerId, action) {
    const s = this._state;
    const ci = s.checkinState;

    if (!ci.pendingPlayers.includes(playerId)) {
      return { success: false, error: 'Already completed your check-in step' };
    }

    const player = s.players[playerId];

    if (action.type === 'CHOOSE_THEME' && ci.step === 'theme') {
      const { themeCardId } = action.payload;
      const chosen = player.themeCards.find(c => c.id === themeCardId);
      if (!chosen) return { success: false, error: 'Theme card not found in your hand' };
      player.theme = chosen;
      player.themeCards = [];
      ci.themeChoices[playerId] = themeCardId;
      ci.pendingPlayers = ci.pendingPlayers.filter(pid => pid !== playerId);
      this._log(`${player.name} chose theme: ${chosen.name}.`);

      if (ci.pendingPlayers.length === 0) {
        // All players chose themes — move to goal step
        ci.step = 'goal';
        ci.pendingPlayers = [...s.playerOrder];
        this._log('All players chose themes. Now set goals.');
      }
      return { success: true };
    }

    if (action.type === 'SET_GOAL') {
      const { goalType, tier, guestCategory } = action.payload;

      const validTypes = ['theme', 'budget', 'excitement', 'guest'];
      if (!validTypes.includes(goalType)) return { success: false, error: 'Invalid goal type' };
      if (player.goals.some(g => g.type === goalType)) {
        return { success: false, error: 'You already have a goal of this type' };
      }

      const goal = { type: goalType, tier: tier || null, guestCategory: guestCategory || null };
      player.goals.push(goal);
      ci.goalChoices[playerId] = goal;
      ci.pendingPlayers = ci.pendingPlayers.filter(pid => pid !== playerId);
      this._log(`${player.name} sets ${goalType} goal.`);

      if (ci.pendingPlayers.length === 0) {
        return this._completeCheckIn();
      }
      return { success: true };
    }

    return { success: false, error: 'Invalid check-in action' };
  }

  _completeCheckIn() {
    const s = this._state;
    const ci = s.checkinState;

    // Check-In 2: special guests (if module active)
    if (ci.checkInNumber === 2 && s.modules.specialGuests) {
      // Stub: no-op (content TBD)
      this._log('[Module] Special Guests drawn at Check-In 2 (content TBD).');
    }

    // Check-In 3: event card (if module active)
    if (ci.checkInNumber === 3 && s.modules.checkin3Event) {
      const events = shuffle([...CHECKIN3_EVENTS]);
      s.shared.checkin3Event = events[0];
      this._log(`Check-In 3 Event: ${events[0].name} — ${events[0].description}`);
    }

    // Pass first player token clockwise
    s.shared.firstPlayerIndex = (s.shared.firstPlayerIndex + 1) % s.playerOrder.length;

    // Clear FVR and reseed
    const fvrCount = s.playerOrder.length + 1;
    s.shared.fvr = s.shared.vendorDeck.splice(0, fvrCount);
    if (s.shared.fvr.length < fvrCount) {
      this._reshuffleVendorDeck();
      const needed = fvrCount - s.shared.fvr.length;
      s.shared.fvr.push(...s.shared.vendorDeck.splice(0, needed));
    }
    s.shared.topVendorCategory = s.shared.vendorDeck[0]?.category || null;

    // Reset meeples
    Object.values(s.players).forEach(p => { p.meeplePosition = 'vision'; });

    s.month++;
    s.quarter = Math.ceil(s.month / 3);
    s.currentPlayerIndex = s.shared.firstPlayerIndex;
    s.phase = 'playing';
    s.checkinState = null;

    this._log(`Check-In ${ci.checkInNumber} complete. Month ${s.month} begins.`);
    return { success: true };
  }

  // ── Scoring ────────────────────────────────────────────────────────────────

  _beginScoring() {
    const s = this._state;
    s.phase = 'scoring';
    this._log('Month 12 complete — scoring begins!');

    // Weather die (if active)
    if (s.modules.weatherDie) {
      s.shared.weatherDieResult = Math.floor(Math.random() * 6) + 1;
      this._log(`Weather die result: ${s.shared.weatherDieResult}.`);
    }

    const scores = {};
    s.playerOrder.forEach(pid => {
      scores[pid] = this._scorePlayer(pid);
    });

    // Race award — record how much each winner gained (applied during play)
    s.shared.raceAwardWinners.forEach(pid => {
      if (scores[pid]) scores[pid].raceAward = s.shared.raceAward?.gifts || 0;
    });

    // Endgame award
    const winner = this._resolveEndgameAward(s, scores);
    winner.forEach(pid => {
      s.players[pid].gifts += s.shared.endgameAward.gifts;
      if (scores[pid]) scores[pid].endgameAward = s.shared.endgameAward.gifts;
      this._log(`${s.players[pid].name} wins Endgame Award: ${s.shared.endgameAward.name} (+${s.shared.endgameAward.gifts} gifts).`);
    });

    s.scoring = scores;
    s.phase = 'done';
    this._log('Game over!');
    return { success: true };
  }

  _scorePlayer(pid) {
    const s = this._state;
    const p = s.players[pid];
    const breakdown = { balanced: 0 };

    // Excitement → gifts
    breakdown.excitement = p.excitement;
    p.gifts += p.excitement;

    // Goals
    breakdown.goals = {};
    p.goals.forEach(goal => {
      const giftAmount = this._evaluateGoal(p, goal);
      breakdown.goals[goal.type] = giftAmount;
      p.gifts += giftAmount;
      this._log(`${p.name} ${goal.type} goal: +${giftAmount} gifts.`);
    });

    // Balanced bonus (all players)
    if (p.theme) {
      const [e1, e2] = p.theme.elements;
      if (p.themeElements[e1] === p.themeElements[e2]) {
        breakdown.balanced = 5;
        p.gifts += 5;
        this._log(`${p.name} Balanced Bonus: +5 gifts.`);
      }
    }

    return breakdown;
  }

  _evaluateGoal(player, goal) {
    if (goal.type === 'theme') return this._evalThemeGoal(player);
    if (goal.type === 'budget') return this._evalBudgetGoal(player, goal.tier);
    if (goal.type === 'excitement') return this._evalExcitementGoal(player, goal.tier);
    if (goal.type === 'guest') return this._evalGuestGoal(player, goal.guestCategory);
    return 0;
  }

  _evalThemeGoal(player) {
    if (!player.theme) return 0;
    const [e1, e2] = player.theme.elements;
    const e1Val = player.themeElements[e1];
    const e2Val = player.themeElements[e2];
    const nonThemeEls = ELEMENTS.filter(el => el !== e1 && el !== e2);
    const allZero = nonThemeEls.every(el => player.themeElements[el] === 0);
    const themeMin = Math.min(e1Val, e2Val);

    // Unforgettable: only theme elements have progress
    if (allZero && themeMin > 0) return 30;

    // Use value threshold for top-2 check — avoids sort-order bias in ties
    const allVals = ELEMENTS.map(el => player.themeElements[el]).sort((a, b) => b - a);
    const top2Threshold = allVals[1] ?? 0;
    const e1InTop2 = e1Val >= top2Threshold && e1Val > 0;
    const e2InTop2 = e2Val >= top2Threshold && e2Val > 0;

    // Thematic / Coordinated: both theme elements qualify for top 2
    if (e1InTop2 && e2InTop2) {
      const nonThemeTop = nonThemeEls.some(el => player.themeElements[el] >= themeMin);
      return nonThemeTop ? 15 : 20;
    }

    // Subtle: at least 1 theme element in top 2
    if (e1InTop2 || e2InTop2) return 10;
    return 0;
  }

  _evalBudgetGoal(player, tier) {
    const faceUp = player.grid.filter(c => c && c.type === 'vendor' && !c.diy)
      .concat(player.grid[4] ? [player.grid[4]] : []);
    if (faceUp.length === 0) return 0;

    const tiers = { extravagant: 0, refined: 0, modest: 0 };
    faceUp.forEach(c => {
      if (c.cost >= 3) tiers.extravagant++;
      else if (c.cost === 2) tiers.refined++;
      else tiers.modest++;
    });

    const maxCount = Math.max(...Object.values(tiers));
    const tierRewards = { extravagant: 15, refined: 10, modest: 5 };

    // If chosen tier is among tied leaders
    if (tiers[tier] === maxCount) return tierRewards[tier] || 0;
    return 0;
  }

  _evalExcitementGoal(player, tier) {
    const faceUp = player.grid.filter(c => c && c.type === 'vendor' && !c.diy)
      .concat(player.grid[4] ? [player.grid[4]] : []);
    if (faceUp.length === 0) return 0;

    const tiers = { spectacular: 0, vibrant: 0, intimate: 0 };
    faceUp.forEach(c => {
      if ((c.excitement || 0) >= 3) tiers.spectacular++;
      else if ((c.excitement || 0) === 2) tiers.vibrant++;
      else tiers.intimate++;
    });

    const maxCount = Math.max(...Object.values(tiers));
    const tierRewards = { spectacular: 15, vibrant: 10, intimate: 5 };

    if (tiers[tier] === maxCount) return tierRewards[tier] || 0;
    return 0;
  }

  _evalGuestGoal(player, category) {
    const count = player.grid.filter(c => c && c.type === 'vendor' && c.category === category).length;
    if (count >= 3) return 15;
    if (count === 2) return 10;
    if (count === 1) return 5;
    return 0;
  }

  _resolveEndgameAward(state, scores) {
    const award = state.shared.endgameAward;
    if (!award) return [];

    const pids = state.playerOrder;

    if (award.conditionType === 'most_vendor_categories') {
      const counts = pids.map(pid => ({ pid, v: vendorCategoriesInGrid(state.players[pid].grid).length }));
      const max = Math.max(...counts.map(x => x.v));
      return counts.filter(x => x.v === max).map(x => x.pid);
    }
    if (award.conditionType === 'most_completed_tasks') {
      const counts = pids.map(pid => ({ pid, v: state.players[pid].completedTasksCount }));
      const max = Math.max(...counts.map(x => x.v));
      return counts.filter(x => x.v === max).map(x => x.pid);
    }
    if (award.conditionType === 'most_on_theme_vendors') {
      const counts = pids.map(pid => {
        const p = state.players[pid];
        if (!p.theme) return { pid, v: 0 };
        const [e1, e2] = p.theme.elements;
        const v = p.grid.filter(c => c && c.type === 'vendor' && !c.diy &&
          ((c.elements[e1] > 0) || (c.elements[e2] > 0))).length;
        return { pid, v };
      });
      const max = Math.max(...counts.map(x => x.v));
      return counts.filter(x => x.v === max).map(x => x.pid);
    }
    if (award.conditionType === 'strongest_element') {
      const counts = pids.map(pid => {
        const p = state.players[pid];
        return { pid, v: Math.max(...ELEMENTS.map(el => p.themeElements[el])) };
      });
      const max = Math.max(...counts.map(x => x.v));
      return counts.filter(x => x.v === max).map(x => x.pid);
    }
    if (award.conditionType === 'strongest_weakest_element') {
      const counts = pids.map(pid => {
        const p = state.players[pid];
        return { pid, v: Math.min(...ELEMENTS.map(el => p.themeElements[el])) };
      });
      const max = Math.max(...counts.map(x => x.v));
      return counts.filter(x => x.v === max).map(x => x.pid);
    }
    return [];
  }

  // ── Theme element & excitement helpers ────────────────────────────────────

  _advanceElement(player, element) {
    const cur = player.themeElements[element];
    if (cur >= 8) return;  // capped
    player.themeElements[element] = cur + 1;

    const milestone = ELEMENT_MILESTONES.find(m => m.position === player.themeElements[element]);
    if (milestone) {
      this._applyReward(player, milestone.reward);
      this._log(`${player.name} reaches element milestone ${element}@${player.themeElements[element]}.`);
    }
  }

  _gainExcitement(player, amount) {
    if (amount <= 0) return;
    const prev = player.excitement;
    player.excitement = clamp(player.excitement + amount, 0, 30);
    const gained = player.excitement - prev;
    if (gained <= 0) return;

    this._log(`${player.name} gains ${gained} excitement (${prev} → ${player.excitement}).`);

    // Queue all milestones crossed (handled in _continueStack)
    for (const pos of EXCITEMENT_MILESTONES) {
      if (prev < pos && player.excitement >= pos) {
        player.pendingExcitementMilestones.push(pos);
        this._log(`${player.name} hits excitement milestone at ${pos}!`);
      }
    }
  }

  _applyReward(player, reward) {
    if (!reward) return;
    switch (reward.type) {
      case 'gain_excitement': this._gainExcitement(player, reward.amount); break;
      case 'gain_gifts':      player.gifts += reward.amount; break;
      case 'gain_effort':     player.pendingEffort += reward.amount; break;
      case 'gain_coins':      player.coins += reward.amount; break;
    }
  }

  // ── Moments ───────────────────────────────────────────────────────────────

  _checkMoments(player) {
    const s = this._state;
    const grid = player.grid;

    s.shared.moments.forEach(moment => {
      const status = s.shared.momentStatus[moment.id];
      if (status.completedBy.includes(player.id)) return;

      // Pattern check: all pattern positions filled
      const patternMet = moment.pattern.every(pos => grid[pos] !== null);

      if (patternMet) {
        status.completedBy.push(player.id);
        const isFirst = status.firstCompletedMonth === null || status.firstCompletedMonth === s.month;

        let reward;
        if (isFirst) {
          if (status.firstCompletedMonth === null) status.firstCompletedMonth = s.month;
          reward = moment.firstReward;
        } else {
          reward = moment.othersReward;
        }

        player.gifts += reward;
        this._log(`${player.name} completes Moment "${moment.name}" — +${reward} gifts!`);
      }
    });
  }

  // ── Race Awards ───────────────────────────────────────────────────────────

  _checkRaceAwards(player) {
    const s = this._state;
    const award = s.shared.raceAward;
    if (!award) return;
    if (s.shared.raceAwardWinners.includes(player.id)) return;
    // Award locked to first-win month — no winners in later months
    if (s.shared.raceAwardMonth !== null && s.shared.raceAwardMonth !== s.month) return;
    if (!this._meetsRaceCondition(player, award)) return;

    if (s.shared.raceAwardMonth === null) s.shared.raceAwardMonth = s.month;
    s.shared.raceAwardWinners.push(player.id);
    player.gifts += award.gifts;
    this._log(`${player.name} wins Race Award "${award.name}" — +${award.gifts} gifts!`);
  }

  _meetsRaceCondition(player, award) {
    if (award.conditionType === 'excitement_gte') return player.excitement >= award.threshold;
    if (award.conditionType === 'tasks_gte') return player.completedTasksCount >= award.threshold;
    if (award.conditionType === 'faceup_vendors_gte') return countFaceUpVendors(player.grid) >= award.threshold;
    if (award.conditionType === 'diy_gte') return player.diyCount >= award.threshold;
    if (award.conditionType === 'any_element_gte') {
      return ELEMENTS.some(el => player.themeElements[el] >= award.threshold);
    }
    return false;
  }

  // ── Task milestones ───────────────────────────────────────────────────────

  _checkTaskMilestones(player) {
    TASK_MILESTONES.forEach(m => {
      if (player.completedTasksCount === m.threshold) {
        this._applyReward(player, m.reward);
        this._log(`${player.name} hits task milestone at ${m.threshold} tasks!`);
      }
    });
  }

  // ── Card costs ─────────────────────────────────────────────────────────────

  _effectiveCost(card, state, player) {
    let cost = card.cost;
    if (state.shared.checkin3Event?.effect?.type === 'cost_reduction') {
      const e = state.shared.checkin3Event.effect;
      if (card.type === 'vendor' && card.cost >= e.minCost) {
        cost = Math.min(cost, e.reduceTo);
      }
    }
    return cost;
  }

  // ── Card drawing ──────────────────────────────────────────────────────────

  _drawFromVendorDeck(count) {
    const s = this._state;
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (s.shared.vendorDeck.length === 0) this._reshuffleVendorDeck();
      if (s.shared.vendorDeck.length > 0) drawn.push(s.shared.vendorDeck.shift());
    }
    s.shared.topVendorCategory = s.shared.vendorDeck[0]?.category || null;
    return drawn;
  }

  _drawFromVenueDeck(count) {
    const s = this._state;
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (s.shared.venueDeck.length === 0) {
        this._log('Venue deck is empty — no venue card drawn.');
        break;
      }
      drawn.push(s.shared.venueDeck.shift());
    }
    return drawn;
  }

  _reshuffleVendorDeck() {
    const s = this._state;
    s.shared.vendorDeck = shuffle([...s.shared.vendorDeckDiscard]);
    s.shared.vendorDeckDiscard = [];
    this._log('Vendor deck reshuffled from discard.');
  }

  // ── Planner contracting ───────────────────────────────────────────────────

  _contractPlanner(playerId, player) {
    const s = this._state;
    if (!s.modules.weddingPlanners) return { success: false, error: 'Wedding Planners module not active' };
    if (player.plannerContracted) return { success: false, error: 'Already contracted' };
    if (!player.plannerContract) return { success: false, error: 'No planner contract assigned' };
    if (player.coins < 3) return { success: false, error: 'Not enough coins (need 3)' };
    if (player.diyCount >= 2) return { success: false, error: 'Cannot contract with 2+ DIY bookings' };

    player.coins -= 3;
    player.plannerContracted = true;
    player.plannerEffortPool = 3;
    this._log(`${player.name} contracts with ${player.plannerContract.name}!`);
    return { success: true };
  }

  // ── Grid helpers ──────────────────────────────────────────────────────────

  _availableBookPositions(player) {
    return player.grid.reduce((acc, cell, pos) => {
      if (cell === null) acc.push(pos);
      return acc;
    }, []);
  }

  // ── Logging ───────────────────────────────────────────────────────────────

  _log(message) {
    this._state.log.push({ timestamp: Date.now(), message });
    if (this._state.log.length > 500) {
      this._state.log.shift();
      this._state.log[0] = { timestamp: Date.now(), message: '— older entries removed —' };
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  getPhase() {
    return this._state.phase;
  }

  getState() {
    return deepClone(this._state);
  }

  getStateForPlayer(playerId) {
    const full = deepClone(this._state);
    // Sanitize other players' hands and theme cards
    Object.values(full.players).forEach(p => {
      if (p.id !== playerId) {
        p.hand = p.hand.map(() => ({ hidden: true }));
        p.themeCards = p.themeCards.map(() => ({ hidden: true }));
      }
    });
    return full;
  }
}

module.exports = { GameEngine };
