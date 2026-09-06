import { CalendarDays, MapPin, Phone } from 'lucide-react';
import Modal from './Modal.jsx';
import Countdown from './Countdown.jsx';
import ExternalLink from './ExternalLink.jsx';
import { currentBookings } from '../data/demoTrip.js';
import { formatInr } from '../utils/finance.js';
import { SEVERITY_LABEL } from '../utils/deadlines.js';
import { shortDateRange } from '../utils/date.js';

export default function RefundModal({ open, onClose, deadlineTs }) {
  const hotel = currentBookings.hotel;

  return (
    <Modal open={open} onClose={onClose} title="Hotel booking">
      <div className="space-y-4">
        <div className="rounded-2xl bg-periwinkle/70 p-4">
          <h4 className="text-base font-bold text-navy">{hotel.label}</h4>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
            <MapPin size={14} /> {hotel.location} · Old Manali Road
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <CalendarDays size={14} /> {shortDateRange(hotel.checkIn, hotel.checkOut)} · {hotel.nights} nights
          </p>
          <p className="mt-2 text-lg font-extrabold text-navy">{formatInr(hotel.price)} total</p>
        </div>

        <div className="rounded-2xl border border-attention/25 bg-attention-light/50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-attention">
            Don't miss your refund
          </p>
          <Countdown
            deadlineTs={deadlineTs}
            render={({ text, sev }) => (
              <p className="mt-1 text-xl font-extrabold tabular-nums text-navy">
                {text} <span className="chip ml-1 bg-white text-attention align-middle">{SEVERITY_LABEL[sev]}</span>
              </p>
            )}
          />
          <p className="mt-1 text-sm text-navy-soft">
            Potential refund: <span className="font-extrabold text-attention">{formatInr(hotel.refund.potential)}</span>
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            If you need to cancel or change this booking before the deadline, the refund is protected.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {hotel.links.map((l) => (
            <ExternalLink key={l.label} href={l.url} className="btn-secondary text-sm">
              {l.label}
            </ExternalLink>
          ))}
          <ExternalLink href="tel:+911900123456" className="btn-secondary text-sm">
            <Phone size={14} /> Call hotel
          </ExternalLink>
        </div>

        <p className="text-xs text-ink-faint">
          All refund figures are demo values for the showcase.
        </p>
      </div>
    </Modal>
  );
}