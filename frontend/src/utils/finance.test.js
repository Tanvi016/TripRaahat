import { describe, it, expect } from 'vitest';
import { getInitialState, tripReducer } from './tripReducer.js';
import { computeFinance, INR } from './finance.js';
import { groupMasterLedger } from './expenseCalculations.js';
import { BUDGET } from '../data/demoTrip.js';

function toRecovered(planId) {
  let s = getInitialState(0);
  s = tripReducer(s, { type: 'REPORT_DISRUPTION' });
  s = tripReducer(s, { type: 'FIND_OPTIONS' });
  s = tripReducer(s, { type: 'SELECT_PLAN', planId });
  return tripReducer(s, { type: 'APPLY_PLAN' });
}

describe('computeFinance', () => {
  it('normal trip: budget − spent = remaining, nothing at risk', () => {
    const f = computeFinance(getInitialState(0));
    expect(f.budget).toBe(BUDGET);
    expect(f.spent).toBe(30700);
    expect(f.atRisk).toBe(0);
    expect(f.remaining).toBe(BUDGET - 30700);
  });

  it('disrupted trip: hotel refund is at risk', () => {
    let s = getInitialState(0);
    s = tripReducer(s, { type: 'REPORT_DISRUPTION' });
    const f = computeFinance(s);
    expect(f.atRisk).toBe(6500);
  });

  it('fastest plan: extra cost added to spent, remaining drops', () => {
    const f = computeFinance(toRecovered('fastest'));
    expect(f.extra).toBe(2400);
    expect(f.spent).toBe(30700 + 2400);
    expect(f.atRisk).toBe(0);
    expect(f.remaining).toBe(BUDGET - 30700 - 2400);
  });

  it('next-morning plan: refund counts as money saved', () => {
    const f = computeFinance(toRecovered('next-morning'));
    expect(f.extra).toBe(0);
    expect(f.refund).toBe(7200);
    expect(f.remaining).toBe(BUDGET - 30700 + 7200);
  });

  it('INR formats with the Indian numbering system', () => {
    expect(INR(6500)).toContain('₹6,500');
    expect(INR(1234567)).toContain('₹12,34,567');
  });
});

describe('groupMasterLedger', () => {
  it('returns valid arrays and numbers for rooms, members, and settlements', () => {
    const s = getInitialState(0);
    const ledger = groupMasterLedger(s);
    expect(Array.isArray(ledger.rooms)).toBe(true);
    expect(Array.isArray(ledger.members)).toBe(true);
    expect(Array.isArray(ledger.settlements)).toBe(true);
    expect(ledger.members.length).toBe(5);
    expect(ledger.rooms.length).toBe(3);
    expect(typeof ledger.totalRoomCost).toBe('number');
    expect(ledger.totalRoomCost).toBeGreaterThan(0);
  });
});