import { useEffect, useState } from 'react';
import { formatCountdown, severityOf } from '../utils/deadlines.js';

/** Live countdown from a deadline timestamp; always shows remaining time as text. */
export default function Countdown({ deadlineTs, className = '', render }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const msLeft = deadlineTs - now;
  const sev = severityOf(msLeft);

  if (render) return render({ msLeft, sev, text: formatCountdown(msLeft) });
  return <span className={className} aria-live="off">{formatCountdown(msLeft)}</span>;
}