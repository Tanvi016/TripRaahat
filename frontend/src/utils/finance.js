import { BUDGET, currentBookings, recoveryPlans } from '../data/demoTrip.js';

export const INR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export function formatInr(n) {
  return INR(n);
}

export { recoveryPlans };

/**
 * Finance dashboard: budget available / spent / at risk / remaining.
 * After recovery the chosen plan's extra cost is added to spent, its
 * refund counts as money saved, and the at-risk amount is resolved.
 */
export function computeFinance(state) {
  const baseSpent = Object.values(currentBookings).reduce((sum, b) => sum + (b.price || 0), 0);

  let spent = baseSpent;
  let refund = 0;
  let extra = 0;
  let atRisk = 0;

  const applied = recoveryPlans.find((p) => p.id === state.appliedPlanId);
  if (applied) {
    extra = applied.extraCost;
    refund = applied.refund;
    spent = baseSpent + extra;
  } else if (state.phase !== 'normal') {
    // disruption unresolved — the hotel refund is still at risk
    atRisk = currentBookings.hotel.refund?.potential ?? 0;
  }

  const remaining = BUDGET - spent + refund;

  return {
    budget: BUDGET,
    spent,
    atRisk,
    extra,
    refund,
    saved: refund,
    lost: extra,
    remaining,
  };
}