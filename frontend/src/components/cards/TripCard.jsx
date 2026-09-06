import { useState } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import StatusChip from '../StatusChip.jsx';
import Modal from '../Modal.jsx';
import ExternalLink from '../ExternalLink.jsx';
import { formatInr } from '../../utils/finance.js';

export default function TripCard({ trip, highlight = false }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={`card p-5 ${highlight ? 'border-primary/20 shadow-glow' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-navy">{trip.title}</h3>
              <StatusChip status={trip.status} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
              <CalendarDays size={14} className="shrink-0" />
              {trip.datesLabel}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
              <MapPin size={14} className="shrink-0" />
              {trip.route.join(' → ')}
            </p>
          </div>
          <p className="shrink-0 rounded-xl bg-periwinkle px-3 py-1.5 text-sm font-bold text-navy">
            {formatInr(trip.amount)}
          </p>
        </div>
        {trip.detail && <p className="mt-3 text-sm text-ink-soft">{trip.detail}</p>}
        {trip.nextDeadline && (
          <div className="mt-3 rounded-xl bg-attention-light/70 p-3 text-sm">
            <span className="font-bold text-attention">Don't miss it: </span>
            <span className="text-navy-soft">
              {trip.nextDeadline.label} · {trip.nextDeadline.when} · {formatInr(trip.nextDeadline.amount)}
            </span>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <button className="btn-secondary flex-1 text-sm" onClick={() => setOpen(true)}>
            View trip
          </button>
          {trip.links?.map((l) => (
            <ExternalLink key={l.label} href={l.url} className="btn-ghost text-sm">
              {l.label}
            </ExternalLink>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={trip.title}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <CalendarDays size={15} /> {trip.datesLabel}
            <span className="mx-1">·</span>
            <MapPin size={15} /> {trip.route.join(' → ')}
          </div>
          {trip.detail && <p className="text-sm text-ink-soft">{trip.detail}</p>}
          {trip.nextDeadline && (
            <div className="rounded-xl bg-attention-light/70 p-3 text-sm">
              <p className="font-bold text-attention">{trip.nextDeadline.label}</p>
              <p className="text-navy-soft">
                {trip.nextDeadline.when} · {formatInr(trip.nextDeadline.amount)}
              </p>
            </div>
          )}
          <div className="rounded-xl bg-periwinkle p-3 text-sm">
            <p className="text-ink-faint">Amount</p>
            <p className="text-lg font-bold text-navy">{formatInr(trip.amount)}</p>
          </div>
          {trip.links?.map((l) => (
            <div key={l.label} className="flex items-center justify-between rounded-xl border border-navy/5 p-3 text-sm">
              <span className="font-semibold text-navy">{l.label}</span>
              <ExternalLink href={l.url}>Open</ExternalLink>
            </div>
          ))}
          {trip.status === 'upcoming' && (
            <p className="text-xs text-ink-faint">
              <Users size={12} className="mr-1 inline" />
              This trip appears here so you always know what's coming next.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}