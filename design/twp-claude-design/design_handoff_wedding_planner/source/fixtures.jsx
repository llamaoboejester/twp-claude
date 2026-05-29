/* fixtures.jsx — sample game state for the design canvas */

const SAMPLE_HAND = [
  { type: "vendor", name: "Velvet Hour Quartet", category: "Entertainment", cost: 3, excitement: 3, elements: ["edge","elegance"], flavor: "Smooth jazz drifts across candlelit tables." },
  { type: "vendor", name: "Wildflower Mercantile", category: "Flowers & Decorations", cost: 2, excitement: 2, elements: ["nature","whimsy"], flavor: "Hand-tied stems brought in from the meadow at dawn." },
  { type: "venue", name: "Glasshouse Atrium", cost: 4, excitement: 3, elements: ["elegance","nature","wild"], flavor: "Walls of glass, ceiling of leaves.", whenBooked: "Draw 2 from the vendor deck." },
  { type: "vendor", name: "Letterpress & Co.", category: "Stationery", cost: 2, excitement: 1, elements: ["tradition"], flavor: "Hand-set type pressed deep into cotton paper." },
];

const SAMPLE_FVR = [
  { type: "vendor", name: "Aerial Drone Photography", category: "Photography", cost: 3, excitement: 2, elements: ["whimsy","edge","nature"], flavor: "Sweeping aerial views in breathtaking perspective." },
  { type: "vendor", name: "Crystal Keepsake Figures", category: "Favors & Gifts", cost: 2, excitement: 2, elements: ["whimsy","elegance"], flavor: "Tiny faceted mementos for every seat." },
  { type: "vendor", name: "Hearthsmoke Catering", category: "Food & Drink", cost: 3, excitement: 3, elements: ["tradition","nature"], flavor: "Wood-fired suppers from the harvest." },
  null, // already drafted
  { type: "vendor", name: "Marigold Motor Co.", category: "Transportation", cost: 2, excitement: 2, elements: ["edge"], weather: true, flavor: "Vintage convertibles, polished to a mirror." },
];

const SAMPLE_MOMENTS = [
  { name: "The Aisle", pattern: [0,1,0,0,1,0,0,1,0], first: 3, others: 1, difficulty: "Easy", flavor: "Down the long quiet of expectation." },
  { name: "The Promise", pattern: [0,1,0,1,1,1,0,1,0], first: 5, others: 3, difficulty: "Medium", flavor: "Five hands, one circle, said aloud." },
  { name: "The Union", pattern: [1,1,1,1,1,1,1,1,1], first: 7, others: 4, difficulty: "Hard", flavor: "Everything in its place." },
];

const SAMPLE_AWARDS = {
  race: { name: "First Spark", condition: "First player to reach 12 excitement.", value: 7 },
  endgame: { name: "Most Well-Rounded", condition: "Most different vendor categories among booked vendors (DIY included).", value: 5 },
};

// A sample mid-game state for the active player ("Alex")
const SAMPLE_ALEX_STATE = {
  name: "Alex",
  isYou: true,
  isActive: true,
  isFirstPlayer: true,
  coins: 7,
  gifts: 11,
  meepleAt: "Vision",
  theme: { name: "Bohemian", elements: ["nature","whimsy"] },
  themePositions: { whimsy: 5, edge: 2, nature: 6, tradition: 0, elegance: 3 },
  excitement: 13,
  goals: [
    { checkIn: 1, type: "Excitement", tier: "Vibrant", value: 10 },
  ],
  helpers: [
    { name: "Aunt Margaret", type: "Money", offer: "Receive 4 coins now." },
    { name: "Best Friend", type: "Effort", offer: "Apply 2 effort to a starred task now.", commitment: "Apply 1 more effort to a starred task after Month 9." },
    null,
  ],
  taskStatus: {
    "Apply for Marriage License": { unlocked: false },
    "Block Out Guest Hotel Rooms★": { unlocked: true, effortFilled: 1, completed: true },
    "Create Gift Registry": { unlocked: true, effortFilled: 1, completed: true },
    "Launch Wedding Website": { unlocked: true, effortFilled: 1, completed: true },
    "Order Wedding Rings": { unlocked: true, effortFilled: 2, completed: true },
    "Plan Bridal Shower★": { unlocked: true, effortFilled: 0 },
    "Plan Honeymoon": { unlocked: true, effortFilled: 1 },
    "Write Wedding Vows★": { unlocked: true, effortFilled: 0 },
    "Design Centerpieces": { unlocked: true, effortFilled: 1 },
    "Choose Wedding Party": { unlocked: true, effortFilled: 3, completed: true },
    "Host Post-Wedding Brunch★": { unlocked: true, effortFilled: 0 },
    "Host Rehearsal Dinner★": { unlocked: true, effortFilled: 0 },
    "Purchase Wedding Party Gifts": { unlocked: true, effortFilled: 0 },
    "Conduct Vendor Tastings": { unlocked: true, effortFilled: 1 },
    "Create Guest List": { unlocked: true, effortFilled: 2 },
  },
  completedTasks: 5,
  grid: [
    null,
    { type: "vendor", card: { name: "Wildflower Mercantile", category: "Flowers & Decorations", cost: 2, excitement: 2, elements: ["nature","whimsy"], flavor: "Hand-tied stems." } },
    null,
    { type: "diy", category: "Stationery" },
    null, // venue slot, empty
    null,
    null,
    { type: "vendor", card: { name: "Officiant Marlowe Hart", category: "Ceremony", cost: 1, excitement: 1, elements: ["tradition"], flavor: "Soft-spoken and certain." } },
    null,
  ],
};

const SAMPLE_SAM_STATE = {
  name: "Sam",
  isYou: false,
  isActive: false,
  isFirstPlayer: false,
  coins: 5,
  gifts: 9,
  meepleAt: "Plan",
  theme: { name: "Modern", elements: ["edge","elegance"] },
  themePositions: { whimsy: 2, edge: 5, nature: 2, tradition: 0, elegance: 4 },
  excitement: 9,
  goals: [
    { checkIn: 1, type: "Theme", tier: "Coordinated", value: 15 },
  ],
  helpers: [
    { name: "College Roommate", type: "Research", offer: "Look at top 3 of vendor deck." },
    null, null,
  ],
  taskStatus: {
    "Create Gift Registry": { unlocked: true, effortFilled: 1, completed: true },
    "Order Wedding Rings": { unlocked: true, effortFilled: 2, completed: true },
    "Choose Wedding Party": { unlocked: true, effortFilled: 3, completed: true },
    "Plan Honeymoon": { unlocked: true, effortFilled: 1 },
  },
  completedTasks: 3,
  grid: [
    null,
    null,
    { type: "vendor", card: { name: "Velvet Hour Quartet", category: "Entertainment", cost: 3, excitement: 3, elements: ["edge","elegance"], flavor: "Smooth jazz drifts." } },
    null,
    { type: "venue", card: { name: "The Brass & Black Club", cost: 4, excitement: 3, elements: ["edge","elegance","wild"], whenBooked: "Add Maitre d' to hand.", flavor: "Velvet rope, white tablecloth." } },
    null,
    { type: "diy", category: "Attire & Accessories" },
    null,
    null,
  ],
};

Object.assign(window, {
  SAMPLE_HAND, SAMPLE_FVR, SAMPLE_MOMENTS, SAMPLE_AWARDS,
  SAMPLE_ALEX_STATE, SAMPLE_SAM_STATE,
});
