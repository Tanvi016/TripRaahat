/**
 * groupRecovery.js — 3-way group disruption resolution engine.
 *
 * Strategies:
 *  1. wait-together  — affected traveler waits; group pauses plans.
 *  2. catch-up       — affected traveler takes earliest recovery; group continues
 *                       and meets at next common point.
 *  3. independent    — each traveler follows their own recovery path.
 *
 * All calculations are derived from demoTrip data + trip state. No hardcoded
 * financial totals where calculation is possible.
 */

import { groupMembers, currentBookings, recoveryPlans } from '../data/demoTrip.js';
import { INR } from '../utils/finance.js';

import { Clock, Users } from 'lucide-react';

export const STRATEGIES = {
  'wait-together': {
    id: 'wait-together',
    label: 'Wait Together',
    description: 'The affected traveler waits for the next available option. The rest of the group pauses plans — no one is left behind.',
    tone: 'primary',
    icon: Clock,
    costProfile: 'lowest-group-disruption',
    splitImpact: 'affected-only',
  },
  'catch-up': {
    id: 'catch-up',
    label: 'Catch-Up Rendezvous',
    description: 'The affected traveler takes the earliest recovery option. The group continues as planned and meets at the next common point (Manali hotel).',
    tone: 'attention',
    icon: Users,
    costProfile: 'balanced',
    splitImpact: 'affected-pays-extra',
  },
  'independent': {
    id: 'independent',
    label: 'Independent Split',
    description: 'Each traveler follows their own recovery path. Maximum flexibility — but requires individual tracking and coordination.',
    tone: 'primary',
    icon: Users,
    costProfile: 'highest-flexibility',
    splitImpact: 'individual',
  },
};

/** Which members are affected by the current disruption */
export function getAffectedMembers(state) {
  return groupMembers.filter((m) => m.affected);
}

/** Which members can continue as planned */
export function getContinuingMembers(state) {
  return groupMembers.filter((m) => !m.affected);
}

/** Human-readable status for a member given the current phase + strategy */
export function memberRecoveryStatus(member, state) {
  if (!member.affected) {
    // Continuing members are never "recovery needed" unless the strategy affects them
    const strategy = state.groupRecovery?.strategy;
    if (strategy === 'wait-together' && state.phase !== 'normal' && state.phase !== 'recovered') {
      return { status: 'paused', note: 'Group paused — waiting with affected traveler' };
    }
    if (strategy === 'catch-up' && state.phase !== 'normal' && state.phase !== 'recovered') {
      return { status: 'continuing', note: 'Continuing as planned — meeting at Manali' };
    }
    if (strategy === 'independent' && state.phase !== 'normal' && state.phase !== 'recovered') {
      return { status: 'independent', note: 'Following own recovery path' };
    }
    return { status: 'continuing', note: 'Bookings unaffected' };
  }

  // Affected member
  const phase = state.phase;
  const strategy = state.groupRecovery?.strategy;

  if (phase === 'normal') return { status: 'continuing', note: 'On the trip · all set' };
  if (phase === 'recovered') return { status: 'recovered', note: 'Recovery plan applied' };

  if (strategy === 'wait-together') {
    return { status: 'waiting', note: 'Waiting for recovery option — group paused' };
  }
  if (strategy === 'catch-up') {
    return { status: 'recovering', note: 'Taking earliest option — meeting at Manali' };
  }
  if (strategy === 'independent') {
    return { status: 'independent', note: 'Following own recovery path' };
  }

  // No strategy selected yet
  return { status: 'recovery needed', note: 'Needs a recovery plan' };
}

/** Estimate cost impact per member for a given strategy + plan */
export function estimateRecoveryCostImpact(planId, strategyId) {
  // Import dynamically to avoid circular deps at module load
  const plan = recoveryPlans.find((p) => p.id === planId);
  if (!plan) return { affectedExtra: 0, groupExtra: 0, perMember: {} };

  const affectedCount = getAffectedMembers({}).length || 1;
  const continuingCount = getContinuingMembers({}).length || 0;

  let affectedExtra = 0;
  let groupExtra = 0;

  switch (strategyId) {
    case 'wait-together':
      // Affected traveler pays the extra; group pays nothing extra (paused)
      affectedExtra = plan.extraCost;
      groupExtra = 0;
      break;
    case 'catch-up':
      // Affected traveler pays the extra; group continues (no extra for them)
      affectedExtra = plan.extraCost;
      groupExtra = 0;
      break;
    case 'independent':
      // In the demo, only the affected traveler rebooks — but the model supports
      // per-member costs. For now, affected pays the extra.
      affectedExtra = plan.extraCost;
      groupExtra = 0;
      break;
    default:
      affectedExtra = plan.extraCost;
      groupExtra = 0;
  }

  // Per-member breakdown
  const perMember = {};
  groupMembers.forEach((m) => {
    if (m.affected) {
      perMember[m.id] = { extra: affectedExtra, note: 'Recovery extra cost' };
    } else {
      perMember[m.id] = { extra: 0, note: 'No extra cost' };
    }
  });

  return {
    affectedExtra,
    groupExtra,
    perMember,
    planRefund: plan.refund || 0,
    planExtraCost: plan.extraCost || 0,
    planId: plan.id,
    planTag: plan.tag,
  };
}

/** Get the default strategy recommendation based on trip context */
export function recommendStrategy(state) {
  const phase = state.phase;
  if (phase === 'normal' || phase === 'recovered') return null;

  const affected = getAffectedMembers(state).length;
  const total = groupMembers.length;

  // If only 1 affected out of many, catch-up is the natural recommendation
  if (affected === 1 && total > 2) return 'catch-up';
  // If most are affected, wait-together keeps the group together
  if (affected >= total / 2) return 'wait-together';
  // Otherwise independent split gives flexibility
  return 'independent';
}
