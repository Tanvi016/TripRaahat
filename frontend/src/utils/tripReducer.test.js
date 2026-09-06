import { describe, it, expect } from 'vitest';
import { getInitialState, tripReducer } from './tripReducer.js';
import { recoveryPlans } from '../data/demoTrip.js';

describe('tripReducer state machine', () => {
  it('starts in normal phase with all bookings confirmed', () => {
    const s = getInitialState(0);
    expect(s.phase).toBe('normal');
    expect(Object.values(s.bookings).every((b) => b.status === 'confirmed')).toBe(true);
  });

  it('REPORT_DISRUPTION → disrupted, flight cancelled, connected bookings at risk', () => {
    let s = getInitialState(0);
    s = tripReducer(s, { type: 'REPORT_DISRUPTION', presetId: 'flight-cancelled' });
    expect(s.phase).toBe('disrupted');
    expect(s.bookings.outboundFlight.status).toBe('cancelled');
    expect(s.bookings.transfer.status).toBe('at-risk');
    expect(s.bookings.hotel.status).toBe('at-risk');
    expect(s.bookings.activity.status).toBe('affected');
    expect(s.bookings.returnFlight.status).toBe('confirmed');
    expect(s.disruption.message).toContain('AI-123');
  });

  it('walks the full chain normal → disrupted → recovery-options → plan-selected → recovered', () => {
    let s = getInitialState(0);
    s = tripReducer(s, { type: 'REPORT_DISRUPTION' });
    s = tripReducer(s, { type: 'FIND_OPTIONS' });
    expect(s.phase).toBe('recovery-options');
    s = tripReducer(s, { type: 'SELECT_PLAN', planId: 'fastest' });
    expect(s.phase).toBe('plan-selected');
    expect(s.selectedPlanId).toBe('fastest');
    s = tripReducer(s, { type: 'APPLY_PLAN' });
    expect(s.phase).toBe('recovered');
    expect(s.appliedPlanId).toBe('fastest');
    expect(s.bookings.outboundFlight.status).toBe('recovered');
    expect(s.bookings.hotel.status).toBe('recovered');
  });

  it('applies hotel change when the NEXT MORNING plan is selected', () => {
    let s = getInitialState(0);
    s = tripReducer(s, { type: 'REPORT_DISRUPTION' });
    s = tripReducer(s, { type: 'FIND_OPTIONS' });
    s = tripReducer(s, { type: 'SELECT_PLAN', planId: 'next-morning' });
    s = tripReducer(s, { type: 'APPLY_PLAN' });
    expect(s.bookings.hotel.status).toBe('changed');
    expect(s.bookings.hotel.label).toContain('Himalaya Homestay');
  });

  it('RESET_DEMO returns to normal while keeping the deadline stable', () => {
    const original = getInitialState(1234567890);
    let s = original;
    s = tripReducer(s, { type: 'REPORT_DISRUPTION' });
    s = tripReducer(s, { type: 'RESET_DEMO' });
    expect(s.phase).toBe('normal');
    expect(s.deadlineTs).toBe(original.deadlineTs);
  });

  it('SET_OFFLINE toggles the offline flag and warns', () => {
    let s = getInitialState(0);
    s = tripReducer(s, { type: 'SET_OFFLINE', offline: true });
    expect(s.offline).toBe(true);
    expect(s.toasts.some((t) => t.kind === 'attention')).toBe(true);
  });

  it('unknown actions are ignored', () => {
    const s = getInitialState(0);
    expect(tripReducer(s, { type: 'NOPE' })).toBe(s);
  });

  it('APPLY_PLAN requires a known plan', () => {
    let s = getInitialState(0);
    s = tripReducer(s, { type: 'APPLY_PLAN', planId: 'nope' });
    expect(s.phase).toBe('normal');
  });

  it('all three demo plans are valid', () => {
    expect(recoveryPlans).toHaveLength(3);
    for (const p of recoveryPlans) {
      expect(p.itinerary.length).toBeGreaterThanOrEqual(5);
      expect(p.itinerary.some((i) => i.kind === 'hotel')).toBe(true);
      expect(p.itinerary.some((i) => i.kind === 'restaurant')).toBe(true);
      expect(p.itinerary.some((i) => i.kind === 'activity')).toBe(true);
      expect(p.itinerary.flatMap((i) => i.links || []).length).toBeGreaterThan(0);
    }
  });
});