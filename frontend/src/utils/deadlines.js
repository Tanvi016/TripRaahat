const HOUR = 60 * 60 * 1000;

/** Severity buckets per DESIGN.md §9 — always paired with text/icon, never color alone. */
export function severityOf(msLeft) {
  if (msLeft <= 0) return 'expired';
  if (msLeft < 6 * HOUR) return 'urgent';
  if (msLeft < 24 * HOUR) return 'attention';
  return 'safe';
}

export const SEVERITY_LABEL = {
  safe: 'Safe',
  attention: 'Attention',
  urgent: 'Urgent',
  expired: 'Expired',
};

/** "10h 42m left", "2d 5h left", "Expired" — always remaining time as text. */
export function formatCountdown(msLeft) {
  if (msLeft <= 0) return 'Expired';
  const totalMinutes = Math.max(0, Math.floor(msLeft / 60000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function formatDeadlineDate(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}