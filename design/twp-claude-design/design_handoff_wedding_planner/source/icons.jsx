/* icons.jsx — The Wedding Planner icon set
   Re-drawn from user's source icons. Available as React components and exported to window.
   Each icon accepts: size (px), stroke (color), fill (color), bg (optional background tile).
   The 5 theme element icons keep the user's existing visual logic (solid silhouette).
*/

// Theme element icon — uses user's source PNG tiles directly.
// Each source is a 225x225 white-icon-on-color tile.
// Modes:
//   "stamp"  = full source tile (icon on its element color background)
//   "naked"  = source tile but rendered without its border, for nesting in headers
//   "ink"    = element-colored silhouette only — falls back to "stamp" since the
//              source PNGs include the background. Use ElementPip for tiny pips.
const ELEMENT_SRC = {
  whimsy:    "assets/icons/source/whimsy.png",
  edge:      "assets/icons/source/edge.png",
  nature:    "assets/icons/source/nature.png",
  tradition: "assets/icons/source/tradition.png",
  elegance:  "assets/icons/source/elegance.png",
  wild:      "assets/icons/source/wild.png",
};

const ELEMENT_TONE = {
  whimsy: "var(--el-whimsy)",
  edge: "var(--el-edge)",
  nature: "var(--el-nature)",
  tradition: "var(--el-tradition)",
  elegance: "var(--el-elegance)",
  wild: "var(--el-wild)",
};

const ElementIcon = ({ element, size = 24, mode = "stamp", className = "", style = {} }) => {
  const src = ELEMENT_SRC[element];
  return (
    <img
      src={src}
      alt={element}
      className={`el-icon el-icon-${element} el-icon-${mode} ${className}`}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flex: "0 0 auto",
        objectFit: "cover",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
};

// Compact element pip — small dot, used inline on cards
const ElementPip = ({ element, size = 14, withIcon = false }) => {
  const tone = {
    whimsy: "var(--el-whimsy)",
    edge: "var(--el-edge)",
    nature: "var(--el-nature)",
    tradition: "var(--el-tradition)",
    elegance: "var(--el-elegance)",
    wild: "var(--el-wild)",
  }[element];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        background: tone,
        border: "1.5px solid var(--ink)",
        flex: "0 0 auto",
      }}
    >
      {withIcon && (
        <ElementIcon element={element} size={size * 0.85} mode="stamp" style={{ background: "transparent" }} />
      )}
    </span>
  );
};

// Coin icon — circular gold token
const Coin = ({ size = 22, value = null, style = {} }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      background: "var(--coin)",
      border: "1.5px solid var(--ink)",
      borderRadius: "50%",
      color: "var(--ink)",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: size * 0.55,
      lineHeight: 1,
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}
  >
    {value !== null && value}
  </span>
);

// Gift icon — small wrapped present (used as currency for scoring)
const GiftIcon = ({ size = 18, color = "var(--gift)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "0 0 auto" }}>
    <g stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round">
      <rect x="4" y="9" width="16" height="12" />
      <path d="M 4 13 L 20 13" />
      <path d="M 12 9 L 12 21" />
      <path d="M 12 9 C 9 9, 7 7, 7 5.5 C 7 4, 9 3.5, 10 5 C 11 6.5, 12 9, 12 9 Z" fill={color} />
      <path d="M 12 9 C 15 9, 17 7, 17 5.5 C 17 4, 15 3.5, 14 5 C 13 6.5, 12 9, 12 9 Z" fill={color} />
    </g>
  </svg>
);

// Excitement spark icon
const Spark = ({ size = 18, color = "var(--accent)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "0 0 auto" }}>
    <path
      d="M 12 2 L 13.5 9.5 L 21 11 L 13.5 12.5 L 12 20 L 10.5 12.5 L 3 11 L 10.5 9.5 Z"
      fill={color}
      stroke={color}
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Meeple silhouette — used for player tokens
const Meeple = ({ size = 28, color = "var(--ink)", outline = null }) => (
  <svg width={size} height={size * 1.05} viewBox="0 0 24 25" style={{ flex: "0 0 auto" }}>
    <path
      d="M 12 2 C 13.8 2, 15 3.2, 15 5 C 15 6.4, 14.4 7.5, 13.5 8 C 16 8.5, 18 10, 19 12 C 20 14, 20 15, 19 16 C 18.4 16.5, 17.5 16.2, 17 15.5 L 16 14 L 16 23 L 13 23 L 12.5 17 L 11.5 17 L 11 23 L 8 23 L 8 14 L 7 15.5 C 6.5 16.2, 5.6 16.5, 5 16 C 4 15, 4 14, 5 12 C 6 10, 8 8.5, 10.5 8 C 9.6 7.5, 9 6.4, 9 5 C 9 3.2, 10.2 2, 12 2 Z"
      fill={color}
      stroke={outline || color}
      strokeWidth={outline ? 0.8 : 0}
      strokeLinejoin="round"
    />
  </svg>
);

// Effort / checkbox icon — square that fills when used
const EffortBox = ({ filled = false, size = 14 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      background: filled ? "var(--ink)" : "var(--paper-soft)",
      border: "1.5px solid var(--ink)",
      flex: "0 0 auto",
    }}
  >
    {filled && (
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24">
        <path d="M 4 12 L 10 18 L 20 6" stroke="var(--coin)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )}
  </span>
);

// Weather icon — for weather-sensitive cards
const WeatherIcon = ({ size = 16, color = "var(--ink)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "0 0 auto" }}>
    <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <circle cx="9" cy="11" r="3.5" fill={color} stroke="none" />
      <path d="M 12 11 C 16 9, 20 11, 20 14 C 20 17, 17 18, 14 18 L 8 18 C 5 18, 4 16, 5 14" fill="var(--paper)" />
    </g>
  </svg>
);

// Lock icon — for locked tasks
const LockIcon = ({ size = 14, color = "var(--ink-3)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "0 0 auto" }}>
    <g stroke={color} strokeWidth="1.6" fill="none">
      <rect x="5" y="11" width="14" height="10" />
      <path d="M 8 11 L 8 7 C 8 4, 10 3, 12 3 C 14 3, 16 4, 16 7 L 16 11" />
    </g>
  </svg>
);

// First-player token
const FirstPlayerToken = ({ size = 28 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      background: "var(--accent)",
      border: "2px solid var(--ink)",
      borderRadius: "50%",
      color: "var(--paper)",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: size * 0.4,
      lineHeight: 1,
      flex: "0 0 auto",
    }}
  >
    1ST
  </span>
);

// ——————————————————————————————————————————————————
// CATEGORY ICON — uses silhouettes extracted from the user's source backs.
// The 9 categories share a "stamp ink" color palette, set via --cat-* tokens.
// ——————————————————————————————————————————————————

const CATEGORY_SLUG = {
  "Photography":           "photography",
  "Ceremony":              "ceremony",
  "Stationery":            "stationery",
  "Food & Drink":          "food-drink",
  "Favors & Gifts":        "favors-gifts",
  "Flowers & Decorations": "flowers-decorations",
  "Attire & Accessories":  "attire-accessories",
  "Transportation":        "transportation",
  "Entertainment":         "entertainment",
};

const CATEGORY_TONE = {
  "Photography":           "var(--cat-photography)",
  "Ceremony":              "var(--cat-ceremony)",
  "Stationery":            "var(--cat-stationery)",
  "Food & Drink":          "var(--cat-food-drink)",
  "Favors & Gifts":        "var(--cat-favors-gifts)",
  "Flowers & Decorations": "var(--cat-flowers-decorations)",
  "Attire & Accessories":  "var(--cat-attire-accessories)",
  "Transportation":        "var(--cat-transportation)",
  "Entertainment":         "var(--cat-entertainment)",
};

// Render a category icon. Modes:
//   "tile"      — large solid tile with white icon (used on DIY backs)
//   "inline"    — silhouette only, inherits surrounding color (used inline)
//   "cap"       — small icon for use on card bottom caps (white icon)
const CategoryIcon = ({ category, size = 24, mode = "tile", tone = null, style = {} }) => {
  const slug = CATEGORY_SLUG[category];
  if (!slug) return null;
  const bgColor = tone || CATEGORY_TONE[category];
  const src = `assets/icons/category/${slug}.png`;

  if (mode === "inline") {
    // Mask-based rendering — colorable. The PNG silhouette is white-on-transparent,
    // so we use it as a CSS mask and let background-color do the work.
    return (
      <span
        style={{
          display: "inline-block",
          width: size,
          height: size,
          background: bgColor,
          WebkitMask: `url(${src}) center / contain no-repeat`,
          mask: `url(${src}) center / contain no-repeat`,
          flex: "0 0 auto",
          ...style,
        }}
        aria-label={category}
      />
    );
  }

  // tile / cap — silhouette on a colored backdrop
  const pad = mode === "tile" ? size * 0.16 : size * 0.10;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        background: bgColor,
        flex: "0 0 auto",
        ...style,
      }}
      aria-label={category}
    >
      <img
        src={src}
        alt=""
        style={{
          width: size - pad * 2,
          height: size - pad * 2,
          objectFit: "contain",
          display: "block",
        }}
      />
    </span>
  );
};

Object.assign(window, {
  ElementIcon, ElementPip, Coin, GiftIcon, Spark, Meeple, EffortBox, WeatherIcon, LockIcon, FirstPlayerToken,
  CategoryIcon, CATEGORY_SLUG, CATEGORY_TONE,
});
