import { describe, it, expect } from 'vitest';
import { formatCountdown, severityOf, SEVERITY_LABEL } from './deadlines.js';

const HOUR = 3600 * 1000;
const MIN = 60 * 1000;

describe('severityOf', () => {
  it('buckets: safe > 24h, attention 6–24h, urgent < 6h, expired ≤ 0', () => {
    expect(severityOf(48 * HOUR)).toBe('safe');
    expect(severityOf(10 * HOUR + 42 * MIN)).toBe('attention');
    expect(severityOf(5 * HOUR)).toBe('urgent');
    expect(severityOf(0)).toBe('expired');
    expect(severityOf(-1000)).toBe('expired');
  });
});

describe('formatCountdown', () => {
  it('formats hours and minutes as text', () => {
    expect(formatCountdown(10 * HOUR + 42 * MIN)).toBe('10h 42m left');
  });
  it('formats days', () => {
    expect(formatCountdown(2 * 24 * HOUR + 5 * HOUR)).toBe('2d 5h left');
  });
  it('expired when time is up', () => {
    expect(formatCountdown(0)).toBe('Expired');
  });
  it('every severity has a text label', () => {
    expect(SEVERITY_LABEL.safe).toBe('Safe');
    expect(SEVERITY_LABEL.urgent).toBe('Urgent');
  });
});