/** Human-friendly dates ("12 Sep") for traveler-facing UI. */
export function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function shortDateRange(fromIso, toIso) {
  if (!fromIso) return '';
  if (!toIso) return shortDate(fromIso);
  const f = shortDate(fromIso);
  const t = shortDate(toIso);
  // drop the duplicated month when the range spans months, keep it when crossing
  const fParts = f.split(' ');
  const tParts = t.split(' ');
  return fParts[1] === tParts[1] ? `${fParts[0]} – ${t}` : `${f} – ${t}`;
}