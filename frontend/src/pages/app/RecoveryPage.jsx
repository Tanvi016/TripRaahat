import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCcw, Sparkles, Users } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { recoveryPlans, groupMembers } from '../../data/demoTrip.js';
import RecoveryPlanCard from '../../components/cards/RecoveryPlanCard.jsx';
import RecoveryCompareTable from '../../components/RecoveryCompareTable.jsx';
import ConfirmPlanModal from '../../components/ConfirmPlanModal.jsx';
import DisruptionBanner from '../../components/DisruptionBanner.jsx';
import GroupRecoverySelector from '../../components/group/GroupRecoverySelector.jsx';

export default function RecoveryPage() {
  const { state, dispatch } = useTrip();
  const navigate = useNavigate();
  const [confirmPlan, setConfirmPlan] = useState(null);

  const recovered = state.phase === 'recovered';
  const planInProgress = state.phase !== 'normal' && !recovered;
  const selected = recoveryPlans.find((p) => p.id === state.selectedPlanId) || null;
  const applied = recoveryPlans.find((p) => p.id === state.appliedPlanId) || null;

  const choose = (plan) => {
    dispatch({ type: 'SELECT_PLAN', planId: plan.id });
    setConfirmPlan(plan);
  };

  const apply = () => {
    dispatch({ type: 'APPLY_PLAN' });
    setConfirmPlan(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            {recovered ? 'Recovery complete' : 'Best options for you'}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {recovered
              ? 'Your chosen plan has been applied to your trip.'
              : state.phase === 'normal'
                ? 'Your trip is running smoothly right now.'
                : 'We found recovery plans that fit your trip.'}
          </p>
        </div>
        {(planInProgress || recovered) && (
          <button className="btn-secondary text-sm" onClick={() => dispatch({ type: 'RESET_DEMO' })}>
            <RotateCcw size={15} /> Reset demo
          </button>
        )}
      </header>

      {recovered && <DisruptionBanner />}

      {state.phase === 'normal' && (
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-light text-emerald">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-navy">No disruption right now</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
              When a booking breaks, TripSync finds realistic options here — fastest, cheapest, or best refund.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => navigate('/app/trip')}>
              View my trip
            </button>
            <button className="btn-secondary" onClick={() => navigate('/app')}>
              Back home
            </button>
          </div>
        </div>
      )}

      {planInProgress && (
        <>
          {selected && (
            <div className="glass flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 p-4">
              <Sparkles size={18} className="text-primary" />
              <p className="flex-1 text-sm font-semibold text-navy">
                {selected.tag} plan chosen — review the details, then update your trip to apply it.
              </p>
              <button className="btn-primary text-sm" onClick={() => setConfirmPlan(selected)}>
                Update my trip
              </button>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-3">
            {recoveryPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <RecoveryPlanCard
                  plan={plan}
                  selected={state.selectedPlanId === plan.id}
                  applied={false}
                  onChoose={choose}
                />
              </motion.div>
            ))}
          </div>

          <section aria-label="Compare options">
            <h2 className="section-title mb-3">Compare options</h2>
            <RecoveryCompareTable />
          </section>
        </>
      )}

      {recovered && applied && (
        <>
          <div className="grid gap-5 xl:grid-cols-3">
            {recoveryPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <RecoveryPlanCard plan={plan} applied={applied.id === plan.id} />
              </motion.div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => navigate('/app/trip')}>
              View updated trip
            </button>
            <button className="btn-secondary" onClick={() => navigate('/app')}>
              Back home
            </button>
          </div>
        </>
      )}

      {/* Group recovery section — visible when disruption is active and group members are affected */}
      {state.phase !== 'normal' && state.phase !== 'recovered' && groupMembers.some((m) => m.affected) && (
        <section aria-label="Group recovery" className="pt-4">
          <div className="mb-4 flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h2 className="section-title">Group recovery</h2>
            <span className="chip bg-attention-light text-attention text-xs">
              {groupMembers.filter((m) => m.affected).length} traveler{groupMembers.filter((m) => m.affected).length !== 1 ? 's' : ''} affected
            </span>
          </div>
          <p className="text-sm text-ink-soft mb-4">
            The recovery strategy you choose affects how costs are split among the group. Select a strategy that works for everyone.
          </p>
          <GroupRecoverySelector />
        </section>
      )}

      <ConfirmPlanModal plan={confirmPlan} open={!!confirmPlan} onClose={() => setConfirmPlan(null)} onConfirm={apply} />
    </div>
  );
}