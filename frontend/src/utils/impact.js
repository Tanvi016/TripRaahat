import { connectedChain, currentBookings, recoveryPlans } from '../data/demoTrip.js';

/**
 * Impact model for the "What does this affect?" connected-trip view.
 * A cancellation never affects just one booking — the chain is:
 * Flight → Transfer → Hotel → Activity (+ return flight).
 *
 * Statuses used across the app:
 *  confirmed  (teal/green) — safe
 *  at-risk    (amber)      — could be affected
 *  affected   (amber)      — definitely affected
 *  cancelled  (red)        — cancelled
 *  recovered  (teal/green) — fixed by the chosen recovery plan
 *  changed    (blue)       — replaced by the chosen recovery plan
 */

const FLIGHT_NODE_STATUS = {
  normal: 'confirmed',
  disrupted: 'cancelled',
  'recovery-options': 'cancelled',
  'plan-selected': 'cancelled',
  recovered: 'recovered',
};

const HOTEL_NODE_STATUS = {
  normal: 'confirmed',
  disrupted: 'at-risk',
  'recovery-options': 'at-risk',
  'plan-selected': 'at-risk',
  recovered: 'recovered', // or 'changed' when the plan moves you to a new hotel
};

export function computeImpact(state) {
  const phase = state.phase;
  const applied = recoveryPlans.find((p) => p.id === state.appliedPlanId);
  const selected = recoveryPlans.find((p) => p.id === state.selectedPlanId);
  const plan = applied || selected;

  const statuses = {};
  for (const key of connectedChain) {
    const booking = currentBookings[key];
    if (key === 'outboundFlight') statuses[key] = FLIGHT_NODE_STATUS[phase] ?? 'confirmed';
    else if (key === 'transfer') {
      statuses[key] = phase === 'normal' ? 'confirmed' : phase === 'recovered' ? 'recovered' : 'at-risk';
    } else if (key === 'hotel') {
      statuses[key] = HOTEL_NODE_STATUS[phase] ?? 'confirmed';
      if (phase === 'recovered' && applied && applied.hotelStatus === 'change') statuses[key] = 'changed';
    } else if (key === 'activity') {
      statuses[key] = phase === 'normal' ? 'confirmed' : phase === 'recovered' ? 'recovered' : 'affected';
    } else if (key === 'returnFlight') {
      statuses[key] = 'confirmed';
    }
    // store node info
    statuses[key] = { booking, status: statuses[key] };
  }

  // If a recovery plan replaced the flight, surface the new transport on the flight node.
  if (phase === 'recovered' && applied) {
    statuses.outboundFlight = {
      ...statuses.outboundFlight,
      replacement: {
        label: `${applied.transport} · ${applied.depTime}`,
        route: applied.route,
        date: applied.date,
        links: applied.itinerary[0]?.links || [],
      },
    };
  }

  return connectedChain.map((key) => statuses[key]);
}

/** Short human summary of what changed, e.g. for the Home "What changed?" list. */
export function whatChanged(state) {
  if (state.phase === 'normal') return [];
  const items = [
    { id: 'outbound-flight', label: 'Your flight was cancelled' },
    { id: 'delhi-transfer', label: 'Airport transfer needs rebooking' },
    { id: 'mountain-view', label: 'Hotel check-in is at risk' },
    { id: 'solang-activity', label: 'Activity date may slip' },
  ];
  return items
    .map((i) => {
      const node = computeImpact(state).find((n) => n.booking.id === i.id);
      return node ? { ...i, status: node.status } : null;
    })
    .filter((i) => i && i.status !== 'confirmed');
}