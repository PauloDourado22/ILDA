// Small pure helpers shared by the public homepage. Kept dependency-free
// (no date library) since the only things we ever need are "minutes since
// midnight" <-> "HH:MM" and "is this café open right now".

export const WEEKDAY_LABELS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Figures out whether the café is open right now from the `hours` rows
 * returned by GET /api/content, using the server's clock at render time.
 *
 * This runs inside a Server Component (see app/page.js) on an ISR page
 * revalidated every 60s — so "open now" is accurate to within a minute,
 * same as the rest of the content. It is not hardcoded, and it is not
 * computed client-side (no hydration mismatch risk from client/server
 * clock skew).
 *
 * `hours.weekday` is 0=Sunday..6=Saturday, which is exactly what
 * `Date.prototype.getDay()` returns — no remapping needed.
 */
export function computeOpenStatus(hours, now = new Date()) {
  const today = hours.find((row) => row.weekday === now.getDay());
  if (!today || today.closed) {
    return { isOpen: false, label: 'Closed today' };
  }

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const isOpen = minutesNow >= today.open_minute && minutesNow < today.close_minute;

  return isOpen
    ? { isOpen: true, label: `Open now · until ${formatMinutes(today.close_minute)}` }
    : { isOpen: false, label: `Closed · opens ${formatMinutes(today.open_minute)}` };
}

/** Splits "Coffee, made like it matters" into lead text + a final word to
 * italicize, matching the source design's `<em>` accent on the last word
 * of each headline. Falls back to no split for single-word strings. */
export function splitLastWord(text) {
  const trimmed = (text ?? '').trim();
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) return { lead: '', last: trimmed };
  return { lead: trimmed.slice(0, lastSpace + 1), last: trimmed.slice(lastSpace + 1) };
}

/** Google Maps search link built from a free-text address — works without
 * storing lat/lng, degrades gracefully if the owner hasn't set an address. */
export function directionsUrl(address) {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
