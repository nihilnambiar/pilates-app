// Simple mutual exclusion so independent marketing popups (quiz nudge,
// festive offer, any future one) never show at the same time and stack on
// top of each other — each has its own trigger timer, so without this two
// could both decide to open within moments of each other.
let openCount = 0;

export function claimPopupSlot() {
  if (openCount > 0) return false;
  openCount += 1;
  return true;
}

export function releasePopupSlot() {
  openCount = Math.max(0, openCount - 1);
}
