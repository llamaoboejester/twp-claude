// All card stub data. Replace with real card content once digitized.
// Format is authoritative — the engine depends on these shapes.

const ELEMENTS = ['whimsy', 'edge', 'nature', 'tradition', 'elegance'];

const CATEGORIES = [
  'Photography',
  'Flowers & Decorations',
  'Entertainment',
  'Stationery',
  'Attire & Accessories',
  'Food & Drink',
  'Ceremony',
  'Favors & Gifts',
  'Transportation',
];

// Generate 12 vendor stubs per category with varied costs/excitement/elements
function makeVendors() {
  const cards = [];
  const patterns = [
    { cost: 1, excitement: 1, elemA: 0, elemB: -1, wild: 0 },
    { cost: 1, excitement: 1, elemA: 1, elemB: -1, wild: 0 },
    { cost: 1, excitement: 2, elemA: 2, elemB: -1, wild: 0 },
    { cost: 1, excitement: 1, elemA: 3, elemB: -1, wild: 1 },
    { cost: 2, excitement: 2, elemA: 0, elemB: 1,  wild: 0 },
    { cost: 2, excitement: 2, elemA: 1, elemB: 2,  wild: 0 },
    { cost: 2, excitement: 2, elemA: 2, elemB: 3,  wild: 0 },
    { cost: 2, excitement: 3, elemA: 3, elemB: 4,  wild: 0 },
    { cost: 3, excitement: 2, elemA: 0, elemB: 2,  wild: 0 },
    { cost: 3, excitement: 3, elemA: 1, elemB: 3,  wild: 0 },
    { cost: 3, excitement: 3, elemA: 2, elemB: 4,  wild: 0 },
    { cost: 3, excitement: 3, elemA: 4, elemB: -1, wild: 1 },
  ];

  CATEGORIES.forEach((category, ci) => {
    patterns.forEach((p, i) => {
      const elements = {};
      ELEMENTS.forEach(e => { elements[e] = 0; });
      elements[ELEMENTS[p.elemA]] = 1;
      if (p.elemB >= 0) elements[ELEMENTS[p.elemB]] = 1;

      cards.push({
        id: `vendor_${ci}_${i}`,
        type: 'vendor',
        category,
        name: `${category} ${i + 1}`,
        cost: p.cost,
        excitement: p.excitement,
        elements,
        wild: p.wild,
        whenBooked: null,
        weatherSensitive: i === 11,
        inHouse: false,
      });
    });
  });

  return cards;
}

const VENDOR_CARDS = makeVendors();

// 6 in-house vendors (referenced by venue When Booked effects)
const IN_HOUSE_VENDORS = [
  {
    id: 'inhouse_0', type: 'vendor', category: 'Ceremony', name: 'Church Pastor',
    cost: 0, excitement: 2,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 2, elegance: 0 },
    wild: 0, whenBooked: null, weatherSensitive: false, inHouse: true,
  },
  {
    id: 'inhouse_1', type: 'vendor', category: 'Food & Drink', name: 'In-House Caterer',
    cost: 0, excitement: 2,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 0, elegance: 2 },
    wild: 0, whenBooked: null, weatherSensitive: false, inHouse: true,
  },
  {
    id: 'inhouse_2', type: 'vendor', category: 'Entertainment', name: 'House DJ',
    cost: 0, excitement: 3,
    elements: { whimsy: 1, edge: 1, nature: 0, tradition: 0, elegance: 0 },
    wild: 0, whenBooked: null, weatherSensitive: false, inHouse: true,
  },
  {
    id: 'inhouse_3', type: 'vendor', category: 'Photography', name: 'Staff Photographer',
    cost: 0, excitement: 1,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 1, elegance: 1 },
    wild: 0, whenBooked: null, weatherSensitive: false, inHouse: true,
  },
  {
    id: 'inhouse_4', type: 'vendor', category: 'Flowers & Decorations', name: 'Garden Florist',
    cost: 0, excitement: 1,
    elements: { whimsy: 0, edge: 0, nature: 2, tradition: 0, elegance: 0 },
    wild: 0, whenBooked: null, weatherSensitive: true, inHouse: true,
  },
  {
    id: 'inhouse_5', type: 'vendor', category: 'Attire & Accessories', name: 'Boutique Stylist',
    cost: 0, excitement: 2,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 0, elegance: 2 },
    wild: 0, whenBooked: null, weatherSensitive: false, inHouse: true,
  },
];

// 12 standard venue stubs. Standard venues always have wild: 1.
const VENUE_CARDS = [
  {
    id: 'venue_0', type: 'venue', name: 'The Grand Ballroom',
    cost: 3, excitement: 3,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 1, elegance: 1 },
    wild: 1,
    whenBooked: { type: 'gain_coins', amount: 2 },
    weatherSensitive: false, exclusiveFor: null,
  },
  {
    id: 'venue_1', type: 'venue', name: 'Rustic Barn',
    cost: 2, excitement: 2,
    elements: { whimsy: 1, edge: 0, nature: 1, tradition: 0, elegance: 0 },
    wild: 1,
    whenBooked: { type: 'apply_effort', amount: 2, restriction: 'starred' },
    weatherSensitive: true, exclusiveFor: null,
  },
  {
    id: 'venue_2', type: 'venue', name: 'Rooftop Garden',
    cost: 2, excitement: 2,
    elements: { whimsy: 0, edge: 1, nature: 1, tradition: 0, elegance: 0 },
    wild: 1,
    whenBooked: { type: 'gain_cards', deckType: 'vendor', count: 2 },
    weatherSensitive: true, exclusiveFor: null,
  },
  {
    id: 'venue_3', type: 'venue', name: 'Neighborhood Church',
    cost: 1, excitement: 1,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 2, elegance: 0 },
    wild: 1,
    whenBooked: { type: 'gain_inhouse_vendor', vendorId: 'inhouse_0' },
    weatherSensitive: false, exclusiveFor: null,
  },
  {
    id: 'venue_4', type: 'venue', name: 'Vineyard Estate',
    cost: 3, excitement: 3,
    elements: { whimsy: 0, edge: 0, nature: 1, tradition: 0, elegance: 1 },
    wild: 1,
    whenBooked: { type: 'gain_inhouse_vendor', vendorId: 'inhouse_1' },
    weatherSensitive: true, exclusiveFor: null,
  },
  {
    id: 'venue_5', type: 'venue', name: 'Urban Loft',
    cost: 2, excitement: 2,
    elements: { whimsy: 0, edge: 2, nature: 0, tradition: 0, elegance: 0 },
    wild: 1,
    whenBooked: { type: 'gain_inhouse_vendor', vendorId: 'inhouse_2' },
    weatherSensitive: false, exclusiveFor: null,
  },
  {
    id: 'venue_6', type: 'venue', name: 'Botanical Garden',
    cost: 3, excitement: 2,
    elements: { whimsy: 1, edge: 0, nature: 2, tradition: 0, elegance: 0 },
    wild: 1,
    whenBooked: { type: 'gain_inhouse_vendor', vendorId: 'inhouse_4' },
    weatherSensitive: true, exclusiveFor: null,
  },
  {
    id: 'venue_7', type: 'venue', name: 'Historic Mansion',
    cost: 3, excitement: 2,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 2, elegance: 1 },
    wild: 1,
    whenBooked: { type: 'gain_inhouse_vendor', vendorId: 'inhouse_3' },
    weatherSensitive: false, exclusiveFor: null,
  },
  {
    id: 'venue_8', type: 'venue', name: 'Beachfront Pavilion',
    cost: 2, excitement: 3,
    elements: { whimsy: 1, edge: 0, nature: 1, tradition: 0, elegance: 0 },
    wild: 1,
    whenBooked: { type: 'gain_coins', amount: 1 },
    weatherSensitive: true, exclusiveFor: null,
  },
  {
    id: 'venue_9', type: 'venue', name: 'Art Gallery',
    cost: 2, excitement: 2,
    elements: { whimsy: 1, edge: 1, nature: 0, tradition: 0, elegance: 0 },
    wild: 1,
    whenBooked: { type: 'gain_cards', deckType: 'vendor', count: 1 },
    weatherSensitive: false, exclusiveFor: null,
  },
  {
    id: 'venue_10', type: 'venue', name: 'Country Club',
    cost: 3, excitement: 2,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 1, elegance: 2 },
    wild: 1,
    whenBooked: { type: 'gain_inhouse_vendor', vendorId: 'inhouse_5' },
    weatherSensitive: false, exclusiveFor: null,
  },
  {
    id: 'venue_11', type: 'venue', name: 'Mountain Lodge',
    cost: 2, excitement: 2,
    elements: { whimsy: 0, edge: 1, nature: 2, tradition: 0, elegance: 0 },
    wild: 1,
    whenBooked: { type: 'gain_coins', amount: 2 },
    weatherSensitive: true, exclusiveFor: null,
  },
];

// 10 theme cards (one per theme combination)
const THEME_CARDS = [
  { id: 'theme_0', type: 'theme', name: 'Bohemian',    elements: ['nature', 'whimsy']     },
  { id: 'theme_1', type: 'theme', name: 'Industrial',  elements: ['nature', 'edge']       },
  { id: 'theme_2', type: 'theme', name: 'Rustic',      elements: ['nature', 'tradition']  },
  { id: 'theme_3', type: 'theme', name: 'Garden',      elements: ['nature', 'elegance']   },
  { id: 'theme_4', type: 'theme', name: 'Avant-Garde', elements: ['edge', 'whimsy']       },
  { id: 'theme_5', type: 'theme', name: 'Gothic',      elements: ['edge', 'tradition']    },
  { id: 'theme_6', type: 'theme', name: 'Modern',      elements: ['edge', 'elegance']     },
  { id: 'theme_7', type: 'theme', name: 'Fairytale',   elements: ['whimsy', 'tradition']  },
  { id: 'theme_8', type: 'theme', name: 'Magical',     elements: ['whimsy', 'elegance']   },
  { id: 'theme_9', type: 'theme', name: 'Classic',     elements: ['tradition', 'elegance'] },
];

// All 16 moment cards with 0-indexed positions (PRD uses 1-indexed)
const MOMENT_CARDS = [
  { id: 'moment_0',  type: 'moment', name: 'The Aisle',       firstReward: 3, othersReward: 1, pattern: [1, 4, 7] },
  { id: 'moment_1',  type: 'moment', name: 'The Journey',     firstReward: 3, othersReward: 1, pattern: [3, 4, 5] },
  { id: 'moment_2',  type: 'moment', name: 'The Glance',      firstReward: 4, othersReward: 2, pattern: [2, 4, 6] },
  { id: 'moment_3',  type: 'moment', name: 'The Look',        firstReward: 4, othersReward: 2, pattern: [0, 4, 8] },
  { id: 'moment_4',  type: 'moment', name: 'The Giving',      firstReward: 5, othersReward: 2, pattern: [1, 3, 5, 7] },
  { id: 'moment_5',  type: 'moment', name: 'The Snapshot',    firstReward: 5, othersReward: 2, pattern: [0, 2, 6, 8] },
  { id: 'moment_6',  type: 'moment', name: 'The Spark',       firstReward: 5, othersReward: 2, pattern: [0, 2, 4, 6, 8] },
  { id: 'moment_7',  type: 'moment', name: 'The Threshold',   firstReward: 5, othersReward: 2, pattern: [0, 1, 2, 6, 7, 8] },
  { id: 'moment_8',  type: 'moment', name: 'The Vow',         firstReward: 5, othersReward: 2, pattern: [0, 2, 3, 5, 6, 8] },
  { id: 'moment_9',  type: 'moment', name: 'The Promise',     firstReward: 5, othersReward: 3, pattern: [1, 3, 4, 5, 7] },
  { id: 'moment_10', type: 'moment', name: 'The Dance',       firstReward: 6, othersReward: 3, pattern: [0, 1, 3, 5, 7, 8] },
  { id: 'moment_11', type: 'moment', name: 'The Kiss',        firstReward: 6, othersReward: 3, pattern: [1, 3, 5, 6, 8] },
  { id: 'moment_12', type: 'moment', name: 'The Processional',firstReward: 6, othersReward: 3, pattern: [0, 1, 2, 4, 6, 7, 8] },
  { id: 'moment_13', type: 'moment', name: 'The Rings',       firstReward: 6, othersReward: 3, pattern: [0, 2, 3, 4, 5, 6, 8] },
  { id: 'moment_14', type: 'moment', name: 'The Union',       firstReward: 7, othersReward: 4, pattern: [0,1,2,3,4,5,6,7,8] },
  { id: 'moment_15', type: 'moment', name: 'Forever',         firstReward: 9, othersReward: 6, pattern: [0,1,2,3,5,6,7,8] },
];

// 5 Race Awards (7 gifts each)
const RACE_AWARDS = [
  { id: 'race_0', type: 'race_award', name: 'First Spark',        gifts: 7, conditionType: 'excitement_gte', threshold: 12 },
  { id: 'race_1', type: 'race_award', name: 'Ahead of Schedule',  gifts: 7, conditionType: 'tasks_gte',      threshold: 8  },
  { id: 'race_2', type: 'race_award', name: 'Booking Momentum',   gifts: 7, conditionType: 'faceup_vendors_gte', threshold: 4 },
  { id: 'race_3', type: 'race_award', name: 'DIY Sprint',         gifts: 7, conditionType: 'diy_gte',        threshold: 3  },
  { id: 'race_4', type: 'race_award', name: 'Theme Breakthrough', gifts: 7, conditionType: 'any_element_gte', threshold: 5 },
];

// 5 Endgame Awards (5 gifts each)
const ENDGAME_AWARDS = [
  { id: 'end_0', type: 'endgame_award', name: 'Most Well-Rounded',     gifts: 5, conditionType: 'most_vendor_categories' },
  { id: 'end_1', type: 'endgame_award', name: 'Most On-Theme Vendors', gifts: 5, conditionType: 'most_on_theme_vendors'  },
  { id: 'end_2', type: 'endgame_award', name: 'Most Planned',          gifts: 5, conditionType: 'most_completed_tasks'   },
  { id: 'end_3', type: 'endgame_award', name: 'Most Balanced Theme',   gifts: 5, conditionType: 'strongest_weakest_element' },
  { id: 'end_4', type: 'endgame_award', name: 'Strongest Theme Element', gifts: 5, conditionType: 'strongest_element'   },
];

// 6 help cards per type (scaled at runtime by player count)
const HELP_CARDS = {
  money: [
    { id: 'help_money_0', type: 'help', helpType: 'money', name: 'Wedding Fund',       hasChoice: false, effect: { type: 'gain_coins', amount: 3 } },
    { id: 'help_money_1', type: 'help', helpType: 'money', name: 'Family Contribution', hasChoice: false, effect: { type: 'gain_coins', amount: 2 } },
    { id: 'help_money_2', type: 'help', helpType: 'money', name: 'Budget Boost',        hasChoice: true,
      choiceA: { type: 'gain_coins', amount: 4 },
      choiceB: { type: 'gain_gifts', amount: 1 },
      effect: null,
    },
    { id: 'help_money_3', type: 'help', helpType: 'money', name: 'Registry Haul',      hasChoice: false, effect: { type: 'gain_gifts', amount: 2 } },
    { id: 'help_money_4', type: 'help', helpType: 'money', name: 'Side Hustle',        hasChoice: false, effect: { type: 'gain_coins', amount: 2 } },
    { id: 'help_money_5', type: 'help', helpType: 'money', name: 'Anonymous Donor',    hasChoice: false, effect: { type: 'gain_coins', amount: 5 } },
  ],
  effort: [
    { id: 'help_effort_0', type: 'help', helpType: 'effort', name: 'Helping Hands',    hasChoice: false, effect: { type: 'apply_effort', amount: 2, restriction: 'starred' } },
    { id: 'help_effort_1', type: 'help', helpType: 'effort', name: 'Weekend Warriors', hasChoice: false, effect: { type: 'apply_effort', amount: 3, restriction: 'starred' } },
    { id: 'help_effort_2', type: 'help', helpType: 'effort', name: 'DIY Crew',         hasChoice: false, effect: { type: 'apply_effort', amount: 2, restriction: 'starred' } },
    { id: 'help_effort_3', type: 'help', helpType: 'effort', name: 'Organized Friend', hasChoice: false, effect: { type: 'apply_effort', amount: 2, restriction: 'starred' } },
    { id: 'help_effort_4', type: 'help', helpType: 'effort', name: 'Planning Party',   hasChoice: true,
      choiceA: { type: 'apply_effort', amount: 3, restriction: 'starred' },
      choiceB: { type: 'apply_effort', amount: 1, restriction: null },
      effect: null,
    },
    { id: 'help_effort_5', type: 'help', helpType: 'effort', name: 'All-Nighter',      hasChoice: false, effect: { type: 'apply_effort', amount: 4, restriction: 'starred' } },
  ],
  research: [
    { id: 'help_research_0', type: 'help', helpType: 'research', name: 'Vendor Fair',      hasChoice: false, effect: { type: 'gain_cards', deckType: 'vendor', count: 3 } },
    { id: 'help_research_1', type: 'help', helpType: 'research', name: 'Referral Network', hasChoice: false, effect: { type: 'gain_cards', deckType: 'vendor', count: 2 } },
    { id: 'help_research_2', type: 'help', helpType: 'research', name: 'Open House',       hasChoice: true,
      choiceA: { type: 'gain_cards', deckType: 'vendor', count: 2 },
      choiceB: { type: 'gain_cards', deckType: 'venue',  count: 1 },
      effect: null,
    },
    { id: 'help_research_3', type: 'help', helpType: 'research', name: 'Venue Tour',       hasChoice: false, effect: { type: 'gain_cards', deckType: 'venue',  count: 2 } },
    { id: 'help_research_4', type: 'help', helpType: 'research', name: 'Social Scroll',    hasChoice: false, effect: { type: 'gain_fvr_card' } },
    { id: 'help_research_5', type: 'help', helpType: 'research', name: 'Expert Advice',    hasChoice: false, effect: { type: 'gain_cards', deckType: 'vendor', count: 2 } },
  ],
};

// Check-In 3 events (fully defined in PRD)
const CHECKIN3_EVENTS = [
  {
    id: 'ci3_0', type: 'checkin3_event', name: 'Open Market',
    effect: { type: 'open_market' },
    description: 'On any Book action, you may choose your target card from the FVR instead of your hand.',
  },
  {
    id: 'ci3_1', type: 'checkin3_event', name: 'Budget Relief',
    effect: { type: 'cost_reduction', category: 'vendor', minCost: 3, reduceTo: 2 },
    description: 'All 3-cost vendors cost only 2 coins to book.',
  },
  {
    id: 'ci3_2', type: 'checkin3_event', name: 'Final Push',
    effect: { type: 'plan_bonus', extraEffort: 1 },
    description: 'All Plan actions grant 4 effort instead of 3.',
  },
];

// Task worksheet data — from PRD Section 7
const TASKS = [
  // Getting Started
  { id: 'task_marriage_license',  name: 'Apply for Marriage License',   section: 'getting_started', gifts: 1, effortRequired: 1, key: false, slotHooks: {}, lockConditions: [{ type: 'month_min', month: 10 }] },
  { id: 'task_hotel_rooms',       name: 'Block Out Guest Hotel Rooms',  section: 'getting_started', gifts: 1, effortRequired: 1, key: false, slotHooks: {}, lockConditions: [], starred: true },
  { id: 'task_gift_registry',     name: 'Create Gift Registry',         section: 'getting_started', gifts: 1, effortRequired: 1, key: false, slotHooks: {}, lockConditions: [] },
  { id: 'task_website',           name: 'Launch Wedding Website',       section: 'getting_started', gifts: 1, effortRequired: 1, key: false, slotHooks: { 0: { type: 'gain_excitement', amount: 1 } }, lockConditions: [] },
  // Making It Yours
  { id: 'task_rings',             name: 'Order Wedding Rings',          section: 'making_it_yours', gifts: 2, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [] },
  { id: 'task_bridal_shower',     name: 'Plan Bridal Shower',           section: 'making_it_yours', gifts: 2, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [], starred: true },
  { id: 'task_honeymoon',         name: 'Plan Honeymoon',               section: 'making_it_yours', gifts: 2, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [] },
  { id: 'task_vows',              name: 'Write Wedding Vows',           section: 'making_it_yours', gifts: 2, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [], starred: true },
  // Putting It Together (vendor-locked)
  { id: 'task_wedding_bags',      name: 'Assemble Guest Wedding Bags',  section: 'putting_together', gifts: 3, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'vendor_booked', category: 'Favors & Gifts' }], starred: true },
  { id: 'task_guest_arrivals',    name: 'Coordinate Guest Arrivals',    section: 'putting_together', gifts: 3, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'vendor_booked', category: 'Transportation' }], starred: true },
  { id: 'task_playlist',          name: 'Create Playlist',              section: 'putting_together', gifts: 3, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'vendor_booked', category: 'Entertainment' }] },
  { id: 'task_centerpieces',      name: 'Design Centerpieces',          section: 'putting_together', gifts: 3, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'vendor_booked', category: 'Flowers & Decorations' }] },
  { id: 'task_ceremony_structure',name: 'Plan Ceremony Structure',      section: 'putting_together', gifts: 3, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'vendor_booked', category: 'Ceremony' }], starred: true },
  { id: 'task_photoshoot',        name: 'Schedule Engagement Photoshoot', section: 'putting_together', gifts: 3, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'vendor_booked', category: 'Photography' }] },
  { id: 'task_fitting',           name: 'Schedule Fitting Session',     section: 'putting_together', gifts: 3, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'vendor_booked', category: 'Attire & Accessories' }] },
  { id: 'task_venue_setup',       name: 'Venue Setup / Teardown',       section: 'putting_together', gifts: 3, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'venue_booked' }], starred: true },
  // Locking It In
  { id: 'task_wedding_party',     name: 'Choose Wedding Party',         section: 'locking_in', gifts: 1, effortRequired: 3, key: true,  slotHooks: { 2: { type: 'gain_excitement', amount: 1 } }, lockConditions: [] },
  { id: 'task_post_brunch',       name: 'Host Post-Wedding Brunch',     section: 'locking_in', gifts: 2, effortRequired: 1, key: false, slotHooks: {}, lockConditions: [{ type: 'task_completed', taskId: 'task_wedding_party' }], starred: true },
  { id: 'task_rehearsal_dinner',  name: 'Host Rehearsal Dinner',        section: 'locking_in', gifts: 2, effortRequired: 1, key: false, slotHooks: {}, lockConditions: [{ type: 'task_completed', taskId: 'task_wedding_party' }], starred: true },
  { id: 'task_party_gifts',       name: 'Purchase Wedding Party Gifts', section: 'locking_in', gifts: 2, effortRequired: 1, key: false, slotHooks: {}, lockConditions: [{ type: 'task_completed', taskId: 'task_wedding_party' }] },
  { id: 'task_tastings',          name: 'Conduct Vendor Tastings',      section: 'locking_in', gifts: 2, effortRequired: 3, key: true,  slotHooks: { 2: { type: 'gain_excitement', amount: 1 } }, lockConditions: [] },
  { id: 'task_signature_drink',   name: 'Design Signature Drink',       section: 'locking_in', gifts: 2, effortRequired: 1, key: false, slotHooks: {}, lockConditions: [{ type: 'task_completed', taskId: 'task_tastings' }] },
  { id: 'task_menu',              name: 'Finalize Menu Selections',     section: 'locking_in', gifts: 4, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'task_completed', taskId: 'task_tastings' }, { type: 'vendor_booked', category: 'Food & Drink' }] },
  { id: 'task_cake',              name: 'Order Wedding Cake',           section: 'locking_in', gifts: 4, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'task_completed', taskId: 'task_tastings' }, { type: 'vendor_booked', category: 'Food & Drink' }] },
  { id: 'task_guest_list',        name: 'Create Guest List',            section: 'locking_in', gifts: 3, effortRequired: 4, key: true,  slotHooks: { 3: { type: 'gain_excitement', amount: 1 } }, lockConditions: [] },
  { id: 'task_save_dates',        name: 'Send Save-the-Dates',          section: 'locking_in', gifts: 4, effortRequired: 2, key: false, slotHooks: { 1: { type: 'gain_excitement', amount: 1 } }, lockConditions: [{ type: 'task_completed', taskId: 'task_guest_list' }, { type: 'vendor_booked', category: 'Stationery' }] },
  { id: 'task_invitations',       name: 'Mail Wedding Invitations',     section: 'locking_in', gifts: 4, effortRequired: 2, key: false, slotHooks: { 1: { type: 'gain_excitement', amount: 1 } }, lockConditions: [{ type: 'task_completed', taskId: 'task_guest_list' }, { type: 'vendor_booked', category: 'Stationery' }] },
  { id: 'task_seating_chart',     name: 'Create Seating Chart',        section: 'locking_in', gifts: 4, effortRequired: 2, key: false, slotHooks: {}, lockConditions: [{ type: 'task_completed', taskId: 'task_guest_list' }, { type: 'venue_booked' }] },
];

// Completed Tasks Tracker milestones
const TASK_MILESTONES = [
  { threshold: 4,  reward: { type: 'gain_effort', amount: 1 } },
  { threshold: 8,  reward: { type: 'gain_effort', amount: 1 } },
  { threshold: 10, reward: { type: 'gain_excitement', amount: 1 } },
  { threshold: 12, reward: { type: 'gain_effort', amount: 1 } },
  { threshold: 16, reward: { type: 'gain_effort', amount: 1 } },
  { threshold: 20, reward: { type: 'gain_gifts', amount: 5 } },
];

// Theme element milestones (per element)
const ELEMENT_MILESTONES = [
  { position: 2, reward: { type: 'gain_excitement', amount: 1 } },
  { position: 5, reward: { type: 'gain_excitement', amount: 1 } },
  { position: 8, reward: { type: 'gain_gifts', amount: 5 } },
];

// Excitement milestones (positions with player choice)
const EXCITEMENT_MILESTONES = [5, 15, 25];

// Grid bonus actions by position (0-indexed)
const GRID_BONUSES = [
  'research', // 0 top-left
  'plan',     // 1 top-center
  'book',     // 2 top-right
  'help',     // 3 middle-left
  'any',      // 4 center (venue)
  'help',     // 5 middle-right
  'book',     // 6 bottom-left
  'plan',     // 7 bottom-center
  'research', // 8 bottom-right
];

// Personality card stubs (content TBD — data-driven)
const PERSONALITY_CARDS = Array.from({ length: 10 }, (_, i) => ({
  id: `personality_${i}`,
  type: 'personality',
  name: `Personality ${i + 1}`,
  setupMods: {},
  ruleChanges: {},
  oneTimeAbility: null,
  description: '[Content TBD]',
}));

// Wedding Planner contract stubs (content TBD)
// Exclusive venues are in the VENUE_CARDS array; tie them to contracts here
const PLANNER_EXCLUSIVE_VENUES = [
  {
    id: 'excl_venue_0', type: 'venue', name: 'Chateau Reserve',
    cost: 3, excitement: 3,
    elements: { whimsy: 0, edge: 0, nature: 0, tradition: 1, elegance: 2 },
    wild: 0,
    whenBooked: { type: 'gain_coins', amount: 2 },
    weatherSensitive: false, exclusiveFor: 'planner_0',
  },
  {
    id: 'excl_venue_1', type: 'venue', name: 'The Greenhouse',
    cost: 2, excitement: 2,
    elements: { whimsy: 1, edge: 0, nature: 2, tradition: 0, elegance: 0 },
    wild: 0,
    whenBooked: { type: 'gain_cards', deckType: 'vendor', count: 2 },
    weatherSensitive: true, exclusiveFor: 'planner_1',
  },
];

const PLANNER_CONTRACTS = [
  { id: 'planner_0', type: 'planner_contract', name: 'Élégance & Co.',    exclusiveVenueId: 'excl_venue_0' },
  { id: 'planner_1', type: 'planner_contract', name: 'Garden Dreams',     exclusiveVenueId: 'excl_venue_1' },
  { id: 'planner_2', type: 'planner_contract', name: 'Urban Vows',        exclusiveVenueId: null },
  { id: 'planner_3', type: 'planner_contract', name: 'Rustic Romance',    exclusiveVenueId: null },
  { id: 'planner_4', type: 'planner_contract', name: 'Classic Events',    exclusiveVenueId: null },
  { id: 'planner_5', type: 'planner_contract', name: 'The Modern Affair', exclusiveVenueId: null },
  { id: 'planner_6', type: 'planner_contract', name: 'Whimsy & Wonder',   exclusiveVenueId: null },
  { id: 'planner_7', type: 'planner_contract', name: 'Edge Ceremonies',   exclusiveVenueId: null },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = {
  VENDOR_CARDS,
  IN_HOUSE_VENDORS,
  VENUE_CARDS,
  PLANNER_EXCLUSIVE_VENUES,
  THEME_CARDS,
  MOMENT_CARDS,
  RACE_AWARDS,
  ENDGAME_AWARDS,
  HELP_CARDS,
  CHECKIN3_EVENTS,
  TASKS,
  TASK_MILESTONES,
  ELEMENT_MILESTONES,
  EXCITEMENT_MILESTONES,
  GRID_BONUSES,
  PERSONALITY_CARDS,
  PLANNER_CONTRACTS,
  CATEGORIES,
  ELEMENTS,
  shuffle,
};
