import { describe, it, expect } from 'vitest';
import { getInitialState, tripReducer } from './tripReducer.js';
import { computeImpact, whatChanged } from './impact.js';

function disrupted() {
  let s = getInitialState(0);
  return tripReducer(s, { type: 'REPORT_DISRUPTION' });
}

function recovered(planId = 'fastest') {
  let s = disrupted();
  s = tripReducer(s, { type: 'FIND_OPTIONS' });
  s = tripReducer(s, { type: 'SELECT_PLAN', planId });
  return tripReducer(s, { type: 'APPLY_PLAN' });
}

describe('computeImpact — connected bookings', () => {
  it('normal trip: every node confirmed', () => {
    const nodes = computeImpact(getInitialState(0));
    expect(nodes.every((n) => n.status === 'confirmed')).toBe(true);
  });

  it('disrupted trip: flight cancelled, transfer+hotel at risk, activity affected', () => {
    const nodes = computeImpact(disrupted());
    const byId = Object.fromEntries(nodes.map((n) => [n.booking.id, n.status]));
    expect(byId['outbound-flight']).toBe('cancelled');
    expect(byId['delhi-transfer']).toBe('at-risk');
    expect(byId['mountain-view']).toBe('at-risk');
    expect(byId['solang-activity']).toBe('affected');
    expect(byId['return-flight']).toBe('confirmed');
  });

  it('recovered trip: affected nodes return to green, hotel changes on next-morning plan', () => {
    const nodes = computeImpact(recovered('fastest'));
    expect(nodes.every((n) => n.status === 'recovered' || n.status === 'confirmed')).toBe(true);
    expect(nodes.find((n) => n.booking.id === 'outbound-flight').replacement.label).toContain('2:15 PM');

    const changed = computeImpact(recovered('next-morning'));
    expect(changed.find((n) => n.booking.id === 'mountain-view').status).toBe('changed');
  });

  it('whatChanged lists only impacted bookings', () => {
    expect(whatChanged(getInitialState(0))).toHaveLength(0);
    const changed = whatChanged(disrupted());
    expect(changed.map((c) => c.id)).toContain('outbound-flight');
    expect(changed.some((c) => c.id === 'return-flight')).toBe(false);
  });
});