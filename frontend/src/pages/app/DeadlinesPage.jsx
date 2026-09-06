import { useState } from 'react';
import { AlarmClock, CalendarClock, ShieldCheck } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { trips } from '../../data/demoTrip.js';
import DeadlineCard from '../../components/cards/DeadlineCard.jsx';
import RefundModal from '../../components/RefundModal.jsx';
import { formatInr } from '../../utils/finance.js';
import Countdown from '../../components/Countdown.jsx';

const LEGEND = [
  { label: 'Safe', detail: 'More than 24 hours left', className: 'bg-emerald-light text-emerald', dot: 'bg-emerald' },
  { label: 'Attention', detail: '6 – 24 hours left', className: 'bg-attention-light text-attention', dot: 'bg-attention' },
  { label: 'Urgent', detail: 'Less than 6 hours left', className: 'bg-critical-light text-critical', dot: 'bg-critical' },
  { label: 'Expired', detail: 'Deadline has passed', className: 'bg-navy/10 text-navy-soft', dot: 'bg-navy/40' },
];

export default function DeadlinesPage() {
  const { state } = useTrip();
  const [refundOpen, setRefundOpen] = useState(false);
  const upcoming = trips.upcoming[0];
  const paymentTs = new Date('2026-09-20T18:00:00').getTime();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Deadline Guard</h1>
        <p className="mt-1 text-sm text-ink-soft">
          TripSync watches every refund and payment window so you don't lose money.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <DeadlineCard deadlineTs={state.deadlineTs} onReview={() => setRefundOpen(true)} />

        {/* Upcoming trip payment */}
        <div className="card p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-attention-light text-attention">
              <CalendarClock size={19} />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-faint">Don't miss it</p>
              <p className="text-sm font-bold text-navy">{upcoming.nextDeadline.label}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-navy-soft">
            For your upcoming <span className="font-bold text-navy">{upcoming.title}</span> trip ({upcoming.route.join(' → ')}).
          </p>
          <Countdown
            deadlineTs={paymentTs}
            render={({ text, sev }) => (
              <p className="mt-3 text-xl font-extrabold tabular-nums text-navy">{text}</p>
            )}
          />
          <div className="mt-3 flex items-center justify-between rounded-xl bg-periwinkle/70 p-3">
            <span className="text-sm text-navy-soft">Amount due</span>
            <span className="text-base font-extrabold text-navy">{formatInr(upcoming.nextDeadline.amount)}</span>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            Deadline Guard sends a notification as this window gets close — safe, attention, urgent.
          </p>
        </div>
      </div>

      {/* How it works */}
      <section aria-label="Severity guide">
        <div className="mb-3 flex items-center gap-2">
          <AlarmClock size={17} className="text-primary" />
          <h2 className="section-title">How we keep you safe</h2>
        </div>
        <div className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {LEGEND.map((item) => (
            <div key={item.label} className="rounded-2xl bg-periwinkle/50 p-4">
              <span className={`chip ${item.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                {item.label}
              </span>
              <p className="mt-2 text-xs text-ink-soft">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-xl bg-emerald-light/60 p-3 text-xs text-emerald">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <p>
          Deadlines always show remaining time as text, so you never have to decode a color. Act before the deadline to keep refunds protected.
        </p>
      </div>

      <RefundModal open={refundOpen} onClose={() => setRefundOpen(false)} deadlineTs={state.deadlineTs} />
    </div>
  );
}