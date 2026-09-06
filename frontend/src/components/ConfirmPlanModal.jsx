import { CheckCircle2, Clock, Hotel, MapPin, Plane, TrainFront } from 'lucide-react';
import Modal from './Modal.jsx';
import { formatInr } from '../utils/finance.js';
import { shortDate } from '../utils/date.js';

export default function ConfirmPlanModal({ plan, open, onClose, onConfirm }) {
  if (!plan) return null;
  const ModeIcon = plan.mode === 'train' ? TrainFront : Plane;

  return (
    <Modal open={open} onClose={onClose} title="Update my trip">
      <div className="space-y-4">
        <div className="rounded-2xl bg-primary-soft/80 p-4">
          <div className="flex items-center gap-2">
            <span className="chip bg-white text-primary">{plan.tag}</span>
            <span className="text-xs font-semibold text-ink-soft">{plan.title}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
              <ModeIcon size={20} />
            </div>
            <div>
              <p className="text-base font-extrabold text-navy">{plan.transport}</p>
              <p className="text-sm text-ink-soft">{plan.route}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <p className="flex items-center gap-1.5 text-navy-soft">
              <Clock size={14} className="text-primary" /> {shortDate(plan.date)} · {plan.depTime}
            </p>
            <p className="flex items-center gap-1.5 text-navy-soft">
              <MapPin size={14} className="text-primary" /> Arrives {plan.arrTime}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-navy/5 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Extra cost</span>
            <span className="font-bold text-navy">{plan.extraCost ? `+${formatInr(plan.extraCost)}` : 'Free'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Refund</span>
            <span className="font-bold text-navy">{plan.refund ? formatInr(plan.refund) : '—'}</span>
          </div>
          <div className="flex justify-between border-t border-navy/5 pt-2">
            <span className="font-semibold text-navy">Your money</span>
            <span className={`font-extrabold ${plan.refund - plan.extraCost >= 0 ? 'text-emerald' : 'text-critical'}`}>
              {plan.refund - plan.extraCost >= 0 ? 'You save ' : ''}
              {formatInr(Math.abs(plan.refund - plan.extraCost))}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 rounded-2xl p-3.5 text-sm font-semibold ${
            plan.hotelStatus === 'works' ? 'bg-emerald-light/70 text-emerald' : 'bg-attention-light/70 text-attention'
          }`}
        >
          <Hotel size={16} />
          {plan.hotelNote}
        </div>

        <div className="rounded-xl bg-periwinkle/70 p-3 text-xs text-ink-soft">
          <CheckCircle2 size={13} className="mr-1 inline text-emerald" />
          Choosing this updates your flight, transfer and hotel bookings everywhere in TripSync.
        </div>

        <div className="flex gap-2">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Keep exploring
          </button>
          <button className="btn-primary flex-1" onClick={onConfirm}>
            Update my trip
          </button>
        </div>
      </div>
    </Modal>
  );
}