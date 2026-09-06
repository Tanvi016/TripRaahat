import { describe, it, expect } from 'vitest';
import { getAssistantReply, FALLBACK_TEXT } from './assistant.js';
import { getInitialState, tripReducer } from './tripReducer.js';

function disrupted() {
  let s = getInitialState(0);
  return tripReducer(s, { type: 'REPORT_DISRUPTION' });
}

const ctx = { msLeft: 10 * 3600 * 1000 + 42 * 60 * 1000 };

describe('getAssistantReply', () => {
  it('answers the demo question with current trip state', () => {
    const res = getAssistantReply(disrupted(), 'My flight was cancelled. What can I do?', ctx);
    expect(res.text).toContain('AI-123');
    expect(res.text).toContain('3 recovery options');
    expect(res.chips.some((c) => c.label === 'Compare options')).toBe(true);
  });

  it('uses current state: recovered trips say so', () => {
    let s = disrupted();
    s = tripReducer(s, { type: 'FIND_OPTIONS' });
    s = tripReducer(s, { type: 'SELECT_PLAN', planId: 'next-morning' });
    s = tripReducer(s, { type: 'APPLY_PLAN' });
    const res = getAssistantReply(s, 'how is my trip?', ctx);
    expect(res.text).toContain('recovered');
    expect(res.text).toContain('₹7,200');
  });

  it('normal trips report everything is set', () => {
    const res = getAssistantReply(getInitialState(0), 'how is my trip?', ctx);
    expect(res.text).toContain('all set');
  });

  it('group questions separate affected vs continuing', () => {
    const res = getAssistantReply(disrupted(), 'who is affected in my group?', ctx);
    expect(res.text).toContain('4 travelers');
    expect(res.text).toContain('Tanvi');
  });

  it('refund questions surface the deadline with text time', () => {
    const res = getAssistantReply(disrupted(), 'check my refund', ctx);
    expect(res.text).toContain('₹6,500');
    expect(res.text).toContain('left');
  });

  it('document questions list the vault', () => {
    const res = getAssistantReply(disrupted(), 'open my documents', ctx);
    expect(res.text).toContain('documents');
    expect(res.chips.some((c) => c.label === 'Open documents')).toBe(true);
  });

  it('travel-only scope: irrelevant questions get the fallback', () => {
    const res = getAssistantReply(getInitialState(0), 'tell me a joke about cricket', ctx);
    expect(res.text).toContain(FALLBACK_TEXT);
    expect(res.text).toContain("can't understand");
  });

  it('fallback never claims to have live info', () => {
    const res = getAssistantReply(getInitialState(0), 'what is the weather in Paris?', ctx);
    expect(res.text).not.toMatch(/live|real-?time/i);
  });

  it('offline mode adds truthful offline prefix', () => {
    let s = getInitialState(0);
    s = tripReducer(s, { type: 'SET_OFFLINE', offline: true });
    const res = getAssistantReply(s, 'how is my trip?', ctx);
    expect(res.text).toContain('Offline mode · Using saved trip information');
  });

  it('empty input falls back too', () => {
    const res = getAssistantReply(getInitialState(0), '   ', ctx);
    expect(res.text).toContain(FALLBACK_TEXT);
  });
});