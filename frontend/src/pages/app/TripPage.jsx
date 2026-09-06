import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LifeBuoy } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { currentTripMeta } from '../../data/demoTrip.js';
import { connectedChain } from '../../data/demoTrip.js';
import ConnectedTrip from '../../components/ConnectedTrip.jsx';
import BookingCard from '../../components/cards/BookingCard.jsx';
import DisruptionBanner from '../../components/DisruptionBanner.jsx';
import RefundModal from '../../components/RefundModal.jsx';
import DisruptionModal from '../../components/DisruptionModal.jsx';

export default function TripPage() {
  const { state, dispatch } = useTrip();
  const navigate = useNavigate();
  const [refundOpen, setRefundOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const disrupted = state.phase !== 'normal' && state.phase !== 'recovered';
  const bookings = connectedChain.map((key) => state.bookings[key]).filter(Boolean);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{currentTripMeta.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {currentTripMeta.datesLabel} · All connected bookings in one place.
          </p>
        </div>
        {state.phase === 'normal' && (
          <button className="btn-secondary text-sm" onClick={() => setDemoOpen(true)}>
            Simulate a disruption
          </button>
        )}
      </header>

      <DisruptionBanner />

      {/* Connected trip */}
      <ConnectedTrip title={disrupted ? 'What does this affect?' : 'Your connected trip'} />

      {disrupted && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-attention/25 bg-attention-light/60 p-4">
          <p className="text-sm text-navy-soft">
            <span className="font-bold text-attention">One cancellation, five connected bookings.</span>{' '}
            Recovery can fix them all at once.
          </p>
          <button
            className="btn-primary text-sm"
            onClick={() => {
              dispatch({ type: 'FIND_OPTIONS' });
              navigate('/app/recovery');
            }}
          >
            <LifeBuoy size={16} /> Find the best options
          </button>
        </div>
      )}

      {/* All bookings */}
      <section aria-label="All bookings">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Your bookings</h2>
          {!disrupted && state.phase === 'normal' && (
            <span className="text-xs font-medium text-emerald">All confirmed</span>
          )}
        </div>
        <div className="space-y-3">
          {bookings.map((b, i) => (
            <div key={b.id}>
              <BookingCard booking={b} replacement={b.replacement?.label} />
              {b.id === 'mountain-view' && b.refund && b.status !== 'changed' && (
                <div className="mt-2 flex justify-end">
                  <button className="btn-ghost text-xs" onClick={() => setRefundOpen(true)}>
                    <ArrowRight size={13} /> Review hotel refund deadline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <RefundModal open={refundOpen} onClose={() => setRefundOpen(false)} deadlineTs={state.deadlineTs} />
      <DisruptionModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}