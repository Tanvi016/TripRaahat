import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Compass, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext.jsx';
import { currentBookings } from '../data/demoTrip.js';
import { formatInr } from '../utils/finance.js';

export default function DisruptionBanner() {
  const { state, dispatch } = useTrip();
  const navigate = useNavigate();
  const phase = state.phase;

  if (phase === 'normal') return null;

  const findOptions = () => {
    dispatch({ type: 'FIND_OPTIONS' });
    navigate('/app/recovery');
  };

  if (phase === 'recovered') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald/25 bg-gradient-to-r from-emerald-light/80 to-white p-5 shadow-card"
        role="status"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald text-white">
            <CheckCircle2 size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-navy sm:text-lg">Your trip is recovered</h2>
            <p className="text-sm text-navy-soft">
              Your new plan is applied. Connected bookings are back on track.
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/app/trip')}>
            View updated trip <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-critical/25 bg-gradient-to-r from-critical-light/90 to-white p-5 shadow-card"
      role="alert"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-critical text-white">
          <XCircle size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold text-navy sm:text-lg">Your flight was cancelled</h2>
          <p className="text-sm text-navy-soft">{state.disruption?.message || 'One of your bookings was cancelled.'}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/70 p-3 sm:ml-14">
        <p className="text-sm text-navy-soft">
          Money you could lose:{' '}
          <span className="font-extrabold text-attention">
            {formatInr(currentBookings.hotel.refund.potential)}
          </span>
        </p>
        <button className="btn-primary" onClick={findOptions}>
          <Compass size={16} /> Find the best options
        </button>
      </div>
    </motion.div>
  );
}