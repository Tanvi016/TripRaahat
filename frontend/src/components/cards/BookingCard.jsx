import { CalendarDays, Clock, MapPin, Plane, Bus, Hotel, Ticket, Car } from 'lucide-react';
import StatusChip from '../StatusChip.jsx';
import ExternalLink from '../ExternalLink.jsx';
import { formatInr } from '../../utils/finance.js';
import { shortDate, shortDateRange } from '../../utils/date.js';

const TYPE_ICON = {
  flight: { Icon: Plane, className: 'bg-primary-soft text-primary' },
  train: { Icon: Bus, className: 'bg-primary-soft text-primary' },
  transfer: { Icon: Car, className: 'bg-attention-light text-attention' },
  hotel: { Icon: Hotel, className: 'bg-success-light text-success' },
  activity: { Icon: Ticket, className: 'bg-emerald-light text-emerald' },
};

export default function BookingCard({ booking, replacement }) {
  const meta = TYPE_ICON[booking.type] || TYPE_ICON.activity;
  const { Icon } = meta;

  return (
    <div className="card flex gap-4 p-4 sm:p-5">
      <div className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${meta.className}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-bold text-navy sm:text-base">{booking.label}</h4>
          <StatusChip status={booking.status} />
          {replacement && (
            <span className="chip bg-primary-soft text-primary">
              <Plane size={12} /> Now {replacement}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-ink-soft">{booking.subtitle || booking.location || ''}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={13} /> {shortDateRange(booking.checkIn || booking.date, booking.checkOut)}
          </span>
          {booking.time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {booking.time}
            </span>
          )}
          {booking.origin && booking.destination && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} /> {booking.origin} → {booking.destination}
            </span>
          )}
          {booking.price && <span className="font-bold text-navy">{formatInr(booking.price)}</span>}
        </div>
        {booking.pnr && <p className="mt-1 text-xs text-ink-faint">PNR {booking.pnr}</p>}
        {(booking.links?.length > 0 || (booking.refund && booking.status !== 'confirmed')) && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {booking.links?.map((l) => (
              <ExternalLink key={l.label} href={l.url} className="text-xs">
                {l.label}
              </ExternalLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}