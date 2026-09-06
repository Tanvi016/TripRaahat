import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bus,
  CalendarDays,
  ChevronDown,
  Clock,
  Hotel,
  MapPin,
  Plane,
  Ticket,
  TrainFront,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react';
import ExternalLink from '../ExternalLink.jsx';
import { formatInr } from '../../utils/finance.js';
import { shortDate } from '../../utils/date.js';

const KIND_ICON = {
  flight: { Icon: Plane, className: 'bg-primary-soft text-primary' },
  train: { Icon: TrainFront, className: 'bg-primary-soft text-primary' },
  cab: { Icon: Bus, className: 'bg-attention-light text-attention' },
  hotel: { Icon: Hotel, className: 'bg-success-light text-success' },
  restaurant: { Icon: UtensilsCrossed, className: 'bg-attention-light text-attention' },
  activity: { Icon: Ticket, className: 'bg-emerald-light text-emerald' },
  place: { Icon: MapPin, className: 'bg-periwinkle text-primary' },
};

function moneySaved(plan) {
  return plan.refund - plan.extraCost;
}

export default function RecoveryPlanCard({ plan, selected = false, applied = false, onChoose }) {
  const [expanded, setExpanded] = useState(false);
  const saved = moneySaved(plan);
  const ModeIcon = plan.mode === 'train' ? TrainFront : Plane;

  return (
    <motion.div
      layout
      className={`card overflow-hidden transition-all ${
        applied ? 'border-emerald/40 ring-2 ring-emerald/15' : selected ? 'border-primary/40 ring-2 ring-primary/15' : ''
      }`}
    >
      <div className="p-5">
        {/* Tag + status */}
        <div className="flex items-center justify-between gap-2">
          <span className={`chip ${applied ? 'bg-emerald-light text-emerald' : selected ? 'bg-primary-soft text-primary' : 'bg-periwinkle text-primary'}`}>
            {applied ? <CheckCircle2 size={13} /> : null}
            {applied ? 'Applied to your trip' : plan.tag}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <ModeIcon size={14} />
            {plan.mode === 'train' ? 'Train' : 'Flight'}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-extrabold text-navy">{plan.title}</h3>
        <p className="text-sm text-ink-soft">{plan.headline}</p>

        {/* Departure summary */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl bg-periwinkle/70 p-3 text-sm">
          <span className="flex items-center gap-1.5 font-bold text-navy">
            <Clock size={14} className="text-primary" />
            {plan.depTime}
          </span>
          <span className="flex items-center gap-1.5 text-ink-soft">
            <CalendarDays size={14} /> {shortDate(plan.date)}
          </span>
          <span className="flex items-center gap-1.5 text-ink-soft">
            <MapPin size={14} /> {plan.route} · {plan.duration}
          </span>
        </div>

        {/* Money math */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-critical-light/60 p-2.5">
            <p className="text-[11px] font-medium text-ink-faint">Extra cost</p>
            <p className={`text-sm font-extrabold ${plan.extraCost ? 'text-critical' : 'text-emerald'}`}>
              {plan.extraCost ? `+${formatInr(plan.extraCost)}` : 'Free'}
            </p>
          </div>
          <div className="rounded-xl bg-attention-light/60 p-2.5">
            <p className="text-[11px] font-medium text-ink-faint">Refund</p>
            <p className="text-sm font-extrabold text-attention">
              {plan.refund ? formatInr(plan.refund) : '—'}
            </p>
          </div>
          <div className={`rounded-xl p-2.5 ${saved > 0 ? 'bg-emerald-light/60' : 'bg-navy/5'}`}>
            <p className="text-[11px] font-medium text-ink-faint">
              {saved > 0 ? 'Money saved' : saved < 0 ? 'Net extra cost' : 'Money saved'}
            </p>
            <p className={`flex items-center justify-center gap-0.5 text-sm font-extrabold ${saved > 0 ? 'text-emerald' : saved < 0 ? 'text-critical' : 'text-navy'}`}>
              {saved > 0 ? <ArrowUpRight size={13} /> : saved < 0 ? <ArrowDownRight size={13} /> : null}
              {saved === 0 ? '—' : `${saved > 0 ? '' : '−'}${formatInr(Math.abs(saved))}`}
            </p>
          </div>
        </div>

        {/* Hotel compatibility */}
        <div
          className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-sm ${
            plan.hotelStatus === 'works' ? 'bg-emerald-light/70 text-emerald' : 'bg-attention-light/70 text-attention'
          }`}
        >
          {plan.hotelStatus === 'works' ? <Hotel size={15} /> : <Hotel size={15} />}
          <span className="font-semibold">{plan.hotelNote}</span>
        </div>

        <p className="mt-3 text-sm text-navy-soft">{plan.summary}</p>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="btn-secondary flex-1 text-sm"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
          >
            <ChevronDown size={15} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide itinerary' : 'See full itinerary'}
          </button>
          {onChoose && (
            <button
              className={`${applied ? 'btn-secondary' : 'btn-primary'} flex-1 text-sm`}
              onClick={() => onChoose(plan)}
              disabled={applied}
            >
              {applied ? 'Applied ✓' : selected ? 'Update my trip' : 'Choose this'}
            </button>
          )}
        </div>
      </div>

      {/* Detailed itinerary */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-navy/5 bg-periwinkle/50"
          >
            <ol className="space-y-3 p-5">
              {plan.itinerary.map((step, i) => {
                const meta = KIND_ICON[step.kind] || KIND_ICON.place;
                const { Icon } = meta;
                return (
                  <motion.li
                    key={`${step.kind}-${i}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-3"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.className}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-navy">{step.title}</p>
                      <p className="text-xs font-medium text-ink-soft">{step.meta}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{step.details}</p>
                      {step.links?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                          {step.links.map((l) => (
                            <ExternalLink key={l.label} href={l.url} className="text-xs">
                              {l.label}
                            </ExternalLink>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}