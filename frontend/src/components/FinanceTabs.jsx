import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CalendarDays, CheckCircle2, Clock, Receipt, ArrowUpRight } from 'lucide-react';
import { INR } from '../utils/finance.js';

const TABS = [
  { id: 'ongoing', label: 'Ongoing', icon: Wallet, tone: 'primary' },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarDays, tone: 'attention' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, tone: 'emerald' },
];

export default function FinanceTabs({ children, trips, activeTab, onTabChange }) {
  const [internalActive, setInternalActive] = useState('ongoing');
  const active = activeTab !== undefined ? activeTab : internalActive;

  const handleTabClick = (id) => {
    if (onTabChange) onTabChange(id);
    setInternalActive(id);
  };

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-navy/10">
        {TABS.map((t) => {
          const isActive = active === t.id;
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                isActive
                  ? `border-${t.tone} text-${t.tone}`
                  : 'border-transparent text-ink-faint hover:text-navy-soft'
              }`}
            >
              <TabIcon size={15} />
              {t.label}
              {t.id === 'ongoing' && trips?.ongoingTotal !== undefined && (
                <span className="chip bg-white text-ink-faint text-[10px] border border-navy/10">
                  {trips.ongoingTotal}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {children && typeof children === 'object' && !Array.isArray(children) && !children.$$typeof
          ? children[active] || children.ongoing || children.overview
          : children}
      </div>
    </div>
  );
}

/** Stat card used across finance tabs */
export function FinanceStat({ icon: Icon, label, value, sub, tone = 'navy', delay = 0 }) {
  const toneClass = {
    navy: 'text-navy',
    primary: 'text-primary',
    attention: 'text-attention',
    emerald: 'text-emerald',
    critical: 'text-critical',
  }[tone] || 'text-navy';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card flex items-center gap-3 p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-periwinkle">
        <Icon size={18} className={toneClass} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink-faint">{label}</p>
        <p className={`truncate text-lg font-extrabold ${toneClass}`}>{value}</p>
        {sub && <p className="truncate text-[11px] text-ink-soft">{sub}</p>}
      </div>
    </motion.div>
  );
}

/** A trip row for upcoming/completed lists */
export function TripFinanceRow({
  trip,
  tone = 'navy',
  delay = 0,
  showDeadline = false,
}) {
  const isUpcoming = trip.status === 'upcoming';
  const isCompleted = trip.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-navy">{trip.title}</h3>
            <span className={`chip ${isUpcoming ? 'bg-primary-soft text-primary' : isCompleted ? 'bg-emerald-light text-emerald' : 'bg-periwinkle text-navy-soft'}`}>
              {trip.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">
            {trip.route.join(' → ')} · {trip.datesLabel}
          </p>
          <p className="mt-1 text-xs text-ink-faint">{trip.detail}</p>
          {trip.nextDeadline && showDeadline && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-attention-light/60 px-3 py-2 text-xs">
              <Clock size={12} className="shrink-0 text-attention" />
              <span className="font-semibold text-attention">{trip.nextDeadline.label}</span>
              <span className="text-ink-soft"> · {trip.nextDeadline.when}</span>
              <span className="font-bold text-attention ml-auto">{INR(trip.nextDeadline.amount)}</span>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-extrabold text-navy">{INR(trip.amount)}</p>
          <p className="text-[10px] text-ink-faint">total trip cost</p>
        </div>
      </div>

      {/* Links */}
      {trip.links && trip.links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {trip.links.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="chip bg-white text-navy border border-navy/10 text-xs hover:border-primary/30"
            >
              {l.label}
              <ArrowUpRight size={10} className="ml-0.5 inline" />
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
