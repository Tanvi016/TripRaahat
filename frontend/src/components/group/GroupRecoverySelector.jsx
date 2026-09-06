import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, CheckCircle2, ArrowRight, ArrowLeft, DollarSign } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { STRATEGIES, getAffectedMembers, getContinuingMembers, estimateRecoveryCostImpact } from '../../utils/groupRecovery.js';
import { groupMembers } from '../../data/demoTrip.js';

const TONE_CLASS = {
  critical: 'border-critical/20 bg-critical-light/40',
  attention: 'border-attention/20 bg-attention-light/40',
  primary: 'border-primary/20 bg-primary-soft/40',
};

const STRATEGY_DETAILS = {
  'wait-together': {
    pros: [
      'No one gets left behind',
      'Group stays together',
      'Simplest coordination',
    ],
    cons: [
      'Group travel may pause',
      'Extra accommodation possible',
      'Meal timing delays',
    ],
    icon: Clock,
  },
  'catch-up': {
    pros: [
      'Affected traveler moves fast',
      'Group continues as planned',
      'Meet at next common point',
    ],
    cons: [
      'Requires coordination',
      'Split travel for a day',
      'Recovery traveler bears extra cost',
    ],
    icon: Users,
  },
  'independent': {
    pros: [
      'Maximum flexibility',
      'Each traveler optimizes own trip',
      'No group coordination overhead',
    ],
    cons: [
      'Individual tracking needed',
      'Meeting point must be agreed',
      'May fragment the group',
    ],
    icon: Users,
  },
};

export default function GroupRecoverySelector({ onStrategySelected }) {
  const { state, dispatch } = useTrip();
  const [selected, setSelected] = useState(state.groupRecovery?.strategy || null);
  const [reviewing, setReviewing] = useState(null);

  const phase = state.phase;
  const hasDisruption = phase !== 'normal' && phase !== 'recovered';
  const affected = getAffectedMembers(state);
  const continuing = getContinuingMembers(state);
  const existingStrategy = state.groupRecovery?.strategy;

  // Sync local state with reducer if reducer was updated externally
  useEffect(() => {
    if (state.groupRecovery?.strategy && state.groupRecovery?.strategy !== selected) {
      setSelected(state.groupRecovery.strategy);
    }
  }, [state.groupRecovery?.strategy, selected]);

  const selectStrategy = useCallback((strategyId) => {
    setSelected(strategyId);
    dispatch({
      type: 'SELECT_GROUP_STRATEGY',
      strategy: strategyId,
    });
    if (onStrategySelected) onStrategySelected(strategyId);
  }, [dispatch, onStrategySelected]);

  const openReview = useCallback((strategyId) => {
    setReviewing(strategyId);
  }, []);

  const closeReview = useCallback(() => {
    setReviewing(null);
  }, []);

  const confirmStrategy = useCallback(() => {
    if (reviewing) {
      dispatch({
        type: 'SELECT_GROUP_STRATEGY',
        strategy: reviewing,
      });
      setSelected(reviewing);
      setReviewing(null);
      if (onStrategySelected) onStrategySelected(reviewing);
    }
  }, [dispatch, reviewing, onStrategySelected]);

  // Estimate costs for the selected strategy
  const activePlanId = state.appliedPlanId || state.selectedPlanId || 'fastest';
  const costEstimate = selected ? estimateRecoveryCostImpact(activePlanId, selected) : null;
  const strategyLabel = selected ? (STRATEGIES[selected]?.label || selected) : '';

  if (!hasDisruption) {
    return (
      <div className="card p-6 text-center">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-emerald-light text-emerald">
          <CheckCircle2 size={26} />
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-navy">No group recovery needed</h3>
        <p className="mt-1 text-sm text-ink-soft max-w-sm mx-auto">
          All travelers are on track. When a disruption affects one or more members, the group recovery selector appears here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="section-title">Group recovery strategy</h3>
        <p className="text-sm text-ink-soft">
          {affected.length} traveler{affected.length > 1 ? 's' : ''} affected · {continuing.length} can continue as planned.
          Choose how the group recovers together.
        </p>
      </div>

      {/* Strategy cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(STRATEGIES).map(([id, strategy]) => {
          const Icon = strategy.icon;
          const isSelected = selected === id || existingStrategy === id;
          const borderClass = isSelected ? `ring-2 ring-offset-2 ${strategy.tone === 'critical' ? 'ring-critical' : strategy.tone === 'attention' ? 'ring-attention' : 'ring-primary'}` : 'border-navy/10';

          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-float ${borderClass} ${isSelected ? TONE_CLASS[strategy.tone] : 'bg-white'}`}
              style={{ ringColor: isSelected ? (strategy.tone === 'critical' ? '#dc2626' : strategy.tone === 'attention' ? '#f59e0b' : '#0284c7') : undefined }}
              onClick={() => selectStrategy(id)}
            >
              {/* Selected badge */}
              {isSelected && (
                <div className="absolute -top-2 right-4 chip bg-emerald text-white text-[10px]">
                  Selected
                </div>
              )}

              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSelected ? 'bg-white text-primary' : 'bg-periwinkle text-primary'}`}>
                <Icon size={20} />
              </div>

              <div className="min-w-0">
                <p className={`font-extrabold ${isSelected ? (strategy.tone === 'critical' ? 'text-critical' : strategy.tone === 'attention' ? 'text-attention' : 'text-primary') : 'text-navy'}`}>
                  {strategy.label}
                </p>
                <p className="mt-1 text-xs text-ink-soft leading-relaxed">{strategy.description}</p>
              </div>

              <div className="flex gap-2">
                <button
                  className={`text-xs font-semibold ${isSelected ? 'text-emerald' : 'text-ink-faint group-hover:text-navy-soft'}`}
                  onClick={(e) => { e.stopPropagation(); openReview(id); }}
                >
                  Review details
                </button>
                {isSelected && (
                  <span className="text-[10px] font-bold text-emerald">
                    <CheckCircle2 size={11} className="inline mr-0.5" /> Applied
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Cost impact preview */}
      {costEstimate && (
        <div className="rounded-xl border border-navy/5 bg-periwinkle/40 p-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-navy">
            <DollarSign size={14} className="text-primary" /> Cost impact
          </h4>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-ink-soft">Affected traveler extra cost</span>
              <span className="font-bold text-navy">{costEstimate.affectedExtra ? `+${costEstimate.affectedExtra.toLocaleString('en-IN')}` : 'No extra cost'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Group extra cost</span>
              <span className="font-bold text-navy">{costEstimate.groupExtra ? `+${costEstimate.groupExtra.toLocaleString('en-IN')}` : 'No extra cost'}</span>
            </div>
            <div className="flex justify-between border-t border-navy/5 pt-2">
              <span className="text-ink-soft">Plan refund (if any)</span>
              <span className="font-bold text-emerald">{costEstimate.planRefund ? costEstimate.planRefund.toLocaleString('en-IN') : '—'}</span>
            </div>
            <div className="flex justify-between border-t border-navy/5 pt-2">
              <span className="text-ink-soft">Strategy</span>
              <span className="font-bold text-navy">{strategyLabel}</span>
            </div>
          </div>

          {/* Per-member breakdown */}
          <div className="mt-3 rounded-xl bg-white border border-navy/5 p-3">
            <p className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-2">Per traveler</p>
            <div className="space-y-1.5">
              {groupMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <span className="text-ink-soft">{m.name}</span>
                  <span className={`font-semibold ${costEstimate.perMember[m.id]?.extra ? 'text-attention' : 'text-emerald'}`}>
                    {costEstimate.perMember[m.id]?.extra ? `+${costEstimate.perMember[m.id].extra.toLocaleString('en-IN')}` : 'No extra'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      <AnimatePresence>
        {reviewing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]" onClick={closeReview} aria-hidden="true" />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-float bg-white"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy/10 bg-white px-5 py-4 rounded-t-3xl">
                <h3 className="text-base font-bold text-navy flex items-center gap-2">
                  <Clock size={16} className="text-primary" /> Review: {STRATEGIES[reviewing]?.label}
                </h3>
                <button onClick={closeReview} className="rounded-full p-2 text-ink-soft hover:bg-navy/5">
                  <ArrowLeft size={16} />
                </button>
              </div>

              <div className="px-5 py-5 space-y-4">
                <p className="text-sm text-ink-soft">{STRATEGIES[reviewing].description}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-light/60 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-emerald mb-2">Pros</p>
                    <ul className="space-y-1.5">
                      {STRATEGY_DETAILS[reviewing].pros.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-navy">
                          <CheckCircle2 size={14} className="shrink-0 text-emerald mt-0.5" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-attention-light/60 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-attention mb-2">Cons</p>
                    <ul className="space-y-1.5">
                      {STRATEGY_DETAILS[reviewing].cons.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-sm text-navy">
                          <ArrowRight size={14} className="shrink-0 text-attention mt-0.5" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={closeReview} className="btn-secondary flex-1">
                    Keep exploring
                  </button>
                  <button onClick={confirmStrategy} className="btn-primary flex-1">
                    Apply this strategy <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
