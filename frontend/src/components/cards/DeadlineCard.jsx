import { AlarmClock, Banknote } from 'lucide-react';
import Countdown from '../Countdown.jsx';
import { SEVERITY_LABEL } from '../../utils/deadlines.js';
import { formatInr } from '../../utils/finance.js';
import { currentBookings } from '../../data/demoTrip.js';

const SEVERITY_STYLE = {
  safe: { chip: 'bg-emerald-light text-emerald', bar: 'bg-emerald', ring: 'border-emerald/25' },
  attention: { chip: 'bg-attention-light text-attention', bar: 'bg-attention', ring: 'border-attention/30' },
  urgent: { chip: 'bg-critical-light text-critical', bar: 'bg-critical', ring: 'border-critical/30' },
  expired: { chip: 'bg-navy/10 text-navy-soft', bar: 'bg-navy/40', ring: 'border-navy/10' },
};

export default function DeadlineCard({ deadlineTs, onReview, compact = false }) {
  const hotel = currentBookings.hotel;

  return (
    <div className={`card overflow-hidden ${compact ? '' : 'p-5'}`}>
      <Countdown
        deadlineTs={deadlineTs}
        render={({ text, sev }) => {
          const style = SEVERITY_STYLE[sev];
          return (
            <div className={compact ? '' : ''}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.chip}`}>
                    <AlarmClock size={19} />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-faint">
                      Don't miss your refund
                    </p>
                    <p className="text-sm font-bold text-navy">Hotel cancellation deadline</p>
                  </div>
                </div>
                <span className={`chip ${style.chip}`}>{SEVERITY_LABEL[sev]}</span>
              </div>

              <div className={`${compact ? 'mt-3' : 'mt-4'}`}>
                <p className="text-2xl font-extrabold tabular-nums text-navy" aria-live="off">
                  {text}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/5">
                  <div className={`h-full ${style.bar}`} style={{ width: '62%' }} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-periwinkle/70 p-3">
                <p className="flex items-center gap-2 text-sm text-navy-soft">
                  <Banknote size={15} className="text-attention" />
                  Potential refund
                </p>
                <p className="text-base font-extrabold text-navy">{formatInr(hotel.refund.potential)}</p>
              </div>

              {onReview && (
                <button className="btn-primary mt-4 w-full" onClick={onReview}>
                  Review booking
                </button>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}