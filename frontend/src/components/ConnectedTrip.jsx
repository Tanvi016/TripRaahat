import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Bus, Hotel, Plane, Ticket, Car } from 'lucide-react';
import { computeImpact } from '../utils/impact.js';
import { useTrip } from '../context/TripContext.jsx';
import StatusChip from './StatusChip.jsx';

const TYPE_ICON = {
  flight: Plane,
  train: Bus,
  transfer: Car,
  hotel: Hotel,
  activity: Ticket,
};

const NODE_TONE = {
  confirmed: 'bg-emerald-light text-emerald',
  recovered: 'bg-emerald-light text-emerald',
  'at-risk': 'bg-attention-light text-attention',
  affected: 'bg-attention-light text-attention',
  cancelled: 'bg-critical-light text-critical',
  changed: 'bg-primary-soft text-primary',
};

function Node({ node, index, horizontal }) {
  const Icon = TYPE_ICON[node.booking.type] || Plane;
  const tone = NODE_TONE[node.status] || NODE_TONE.confirmed;
  const Connector = horizontal ? ArrowRight : ArrowDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-2"
    >
      <div className="card flex-1 p-4 min-w-0 sm:min-w-[168px]">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={19} />
        </div>
        <h4 className="mt-2.5 truncate text-sm font-bold text-navy" title={node.booking.label}>
          {node.booking.label}
        </h4>
        <p className="truncate text-xs text-ink-soft">{node.booking.subtitle}</p>
        {node.replacement && (
          <p className="mt-1 rounded-lg bg-primary-soft px-2 py-1 text-[11px] font-semibold text-primary">
            Now: {node.replacement.label}
          </p>
        )}
        <div className="mt-2">
          <StatusChip status={node.status} />
        </div>
      </div>
      {index < 4 && (
        <span className="shrink-0 text-ink-faint">
          <Connector size={horizontal ? 18 : 16} />
        </span>
      )}
    </motion.div>
  );
}

export default function ConnectedTrip({ title = 'What does this affect?' }) {
  const { state } = useTrip();
  const nodes = computeImpact(state);
  const horizontal = true;

  return (
    <section aria-label="Connected bookings">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="section-title">{title}</h2>
        <span className="hidden text-xs text-ink-faint sm:block">
          One cancellation can touch the whole trip
        </span>
      </div>

      {/* Wide screens: horizontal chain (needs ≥ ~1120px of content) */}
      <div className="hidden xl:flex xl:items-stretch xl:justify-between xl:gap-1">
        {nodes.map((node, i) => (
          <Node key={node.booking.id} node={node} index={i} horizontal />
        ))}
      </div>

      {/* Everything below xl: vertical chain — never overflows */}
      <div className="flex flex-col items-stretch xl:hidden">
        {nodes.map((node, i) => (
          <Node key={node.booking.id} node={node} index={i} horizontal={false} />
        ))}
      </div>
    </section>
  );
}