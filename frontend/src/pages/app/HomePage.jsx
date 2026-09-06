import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlarmClock,
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarDays,
  FileText,
  FlaskConical,
  LifeBuoy,
  MapPin,
  RotateCcw,
  Users,
  Wrench,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { currentTripMeta, recoveryPlans, trips, traveler } from '../../data/demoTrip.js';
import { connectedChain } from '../../data/demoTrip.js';
import { whatChanged } from '../../utils/impact.js';
import DisruptionBanner from '../../components/DisruptionBanner.jsx';
import DisruptionModal from '../../components/DisruptionModal.jsx';
import FinancePanel from '../../components/FinancePanel.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import PersonalExpenseCard from '../../components/expenses/PersonalExpenseCard.jsx';
import { Receipt } from 'lucide-react';
import BookingCard from '../../components/cards/BookingCard.jsx';
import TripCard from '../../components/cards/TripCard.jsx';
import DeadlineCard from '../../components/cards/DeadlineCard.jsx';
import RefundModal from '../../components/RefundModal.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function TripStatusChip({ phase }) {
  const map = {
    normal: 'ongoing',
    recovered: 'recovered',
    disrupted: 'disrupted',
    'recovery-options': 'recovery-options',
    'plan-selected': 'plan-selected',
  };
  return <StatusChip status={map[phase] || 'ongoing'} />;
}

export default function HomePage() {
  const { state, dispatch } = useTrip();
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const disrupted = state.phase !== 'normal' && state.phase !== 'recovered';
  const changed = whatChanged(state);
  const bookings = connectedChain.map((key) => state.bookings[key]).filter(Boolean);
  const appliedPlan = recoveryPlans.find((p) => p.id === state.appliedPlanId) || null;
  const hotelReleased = state.phase === 'recovered' && appliedPlan?.hotelStatus === 'change';

  return (
    <div className="space-y-8">
      {/* Demo toolbar */}
      <div className="glass flex flex-wrap items-center gap-2 rounded-2xl border border-primary/15 p-3">
        <span className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-primary">
          <FlaskConical size={14} /> Demo controls
        </span>
        {state.phase === 'normal' ? (
          <button className="btn-danger ml-auto text-xs sm:text-sm" onClick={() => setDemoOpen(true)}>
            <Wrench size={15} /> Simulate a disruption
          </button>
        ) : (
          <>
            {state.phase !== 'recovered' && (
              <button
                className="btn-primary ml-auto text-xs sm:text-sm"
                onClick={() => {
                  dispatch({ type: 'FIND_OPTIONS' });
                  navigate('/app/recovery');
                }}
              >
                <LifeBuoy size={15} /> Find the best options
              </button>
            )}
            <button className="btn-secondary text-xs sm:text-sm" onClick={() => dispatch({ type: 'RESET_DEMO' })}>
              <RotateCcw size={15} /> Reset demo
            </button>
          </>
        )}
      </div>

      {/* Mobile quick links — everything reachable without the desktop sidebar */}
      <div className="flex flex-wrap gap-2 lg:hidden">
        {[
          { label: 'Your group', to: '/app/group', Icon: Users },
          { label: 'Deadlines', to: '/app/deadlines', Icon: AlarmClock },
          { label: 'Documents', to: '/app/documents', Icon: FileText },
          { label: 'Assistant', to: '/app/assistant', Icon: Bot },
        ].map(({ label, to, Icon }) => (
          <button key={to} onClick={() => navigate(to)} className="chip glass border border-navy/10 py-2 pl-2 pr-3 text-navy-soft hover:text-primary">
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Greeting + current trip */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            {greeting()}, {traveler.name} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · Here's your trip at a glance.
          </p>
        </div>
        <TripStatusChip phase={state.phase} />
      </header>

      {/* Current trip hero */}
      <section className="card relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-soft/60 blur-2xl" aria-hidden="true" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">Current trip</p>
            <h2 className="mt-1 text-xl font-extrabold text-navy sm:text-2xl">{currentTripMeta.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} /> {currentTripMeta.datesLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={15} /> {currentTripMeta.route.join(' → ')}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} /> {currentTripMeta.travelers} travelers
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => navigate('/app/trip')}>
              View trip <ArrowRight size={16} />
            </button>
          </div>
        </div>
        {state.disruption && state.phase !== 'recovered' && (
          <p className="mt-4 rounded-xl bg-critical-light/60 p-3 text-sm font-semibold text-critical">
            ⚠ {state.disruption.message}
          </p>
        )}
      </section>

      {/* Disruption / recovery banner */}
      <DisruptionBanner />

      {/* What changed */}
      {disrupted && changed.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} aria-label="What changed">
          <div className="mb-3">
            <h2 className="section-title">What changed?</h2>
            <p className="text-sm text-ink-soft">What should I do? Start with your recovery options.</p>
          </div>
          <div className="card divide-y divide-navy/5">
            {changed.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy">{item.label}</p>
                  <p className="truncate text-xs text-ink-soft">Connected to your cancelled flight</p>
                </div>
                <StatusChip status={item.status} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Finance */}
      <FinancePanel />

      {/* Personal expense detail — click through to Finance page for full breakdown */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <Receipt size={16} className="text-primary" />
            Your expenses
          </h2>
          <a href="/app/finance" className="btn-ghost text-xs">
            View full breakdown <ArrowRight size={13} />
          </a>
        </div>
        <PersonalExpenseCard />
      </div>

      {/* Deadline guard */}
      <section aria-label="Deadline guard">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Deadline guard</h2>
          <button className="btn-ghost text-sm" onClick={() => navigate('/app/deadlines')}>
            View all deadlines
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {hotelReleased ? (
            <div className="card flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-light text-emerald">
                    <BadgeCheck size={19} />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-faint">Deadline guard</p>
                    <p className="text-sm font-bold text-navy">Refund secured</p>
                  </div>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-emerald">
                  {appliedPlan.refund ? `₹${appliedPlan.refund.toLocaleString('en-IN')} refund on its way` : 'Refund protected'}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  Mountain View Residency was released as part of the {appliedPlan.tag} plan.
                </p>
              </div>
              <button className="btn-secondary mt-4 self-start text-sm" onClick={() => setRefundOpen(true)}>
                Review refund
              </button>
            </div>
          ) : (
            <DeadlineCard deadlineTs={state.deadlineTs} onReview={() => setRefundOpen(true)} />
          )}
          <div className="card hidden flex-col justify-between p-5 sm:flex">
            <div>
              <h3 className="text-base font-bold text-navy">Why this matters</h3>
              <p className="mt-2 text-sm text-ink-soft">
                {disrupted
                  ? 'If you switch to a recovery option before the deadline, the hotel refund stays protected.'
                  : 'Your hotel refund stays protected as long as you cancel or change before the deadline.'}
              </p>
            </div>
            <button className="btn-secondary mt-4 self-start text-sm" onClick={() => navigate('/app/trip')}>
              Review bookings <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Best options preview */}
      {disrupted && (
        <section aria-label="Best options for you">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Best options for you</h2>
            <button className="btn-ghost text-sm" onClick={() => navigate('/app/recovery')}>
              Compare all <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recoveryPlans.map((plan, i) => (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate('/app/recovery')}
                className="card group p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-float"
              >
                <span className="chip bg-primary-soft text-primary">{plan.tag}</span>
                <p className="mt-2.5 text-sm font-extrabold text-navy group-hover:text-primary">
                  {plan.transport} · {plan.depTime}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {plan.extraCost ? `+₹${plan.extraCost.toLocaleString('en-IN')}` : 'Free'} ·{' '}
                  {plan.refund ? `₹${plan.refund.toLocaleString('en-IN')} refund` : plan.duration}
                </p>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming itinerary */}
      <section aria-label="Upcoming itinerary">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Upcoming itinerary</h2>
          <span className="text-xs text-ink-faint">12 – 18 Sep 2026</span>
        </div>
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} replacement={b.replacement?.label} />
          ))}
        </div>
      </section>

      {/* Upcoming & completed trips */}
      <section aria-label="Your trips">
        <h2 className="section-title mb-3">Your trips</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {trips.upcoming.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
          {trips.completed.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </div>
      </section>

      <DisruptionModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      <RefundModal open={refundOpen} onClose={() => setRefundOpen(false)} deadlineTs={state.deadlineTs} />
    </div>
  );
}