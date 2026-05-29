// Bridge between existing game engine state shapes and design component props.

export function adaptElements(elementsObj) {
  if (!elementsObj) return [];
  if (Array.isArray(elementsObj)) return elementsObj;
  return Object.entries(elementsObj).filter(([, v]) => v > 0).map(([k]) => k);
}

export function adaptCard(card) {
  if (!card) return null;
  const elements = adaptElements(card.elements);
  for (let i = 0; i < (card.wild || 0); i++) elements.push('wild');
  return { ...card, elements };
}

// Grid cell: flat { type, name, category, ... } → { type, card: {...} } or { type:"diy", category }
export function adaptGridCell(cell) {
  if (!cell) return null;
  if (cell.type === 'diy' || cell.diy) {
    return { type: 'diy', category: cell.category };
  }
  const { type, ...rest } = cell;
  return { type, card: adaptCard(rest) };
}

// "research" → "Research"
export function adaptMeepleAt(pos) {
  if (!pos) return null;
  return pos.charAt(0).toUpperCase() + pos.slice(1);
}

// Normalize helper: helpType → type
export function adaptHelper(h) {
  if (!h) return null;
  return { ...h, type: h.helpType || h.type };
}

export function adaptHelpers(helpers) {
  if (!helpers) return [null, null, null];
  const slots = [null, null, null];
  helpers.forEach((h, i) => { slots[i] = h ? adaptHelper(h) : null; });
  return slots;
}

// themeElements obj → themePositions obj (same shape, different key name)
export function adaptThemePositions(themeElements) {
  return themeElements || { whimsy: 0, edge: 0, nature: 0, tradition: 0, elegance: 0 };
}
