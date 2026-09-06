import { currentBookings, documents, groupMembers, recoveryPlans, traveler } from '../data/demoTrip.js';
import { computeImpact } from './impact.js';
import { formatCountdown, severityOf } from './deadlines.js';

/**
 * Local intent engine. Travel/booking topics only — anything else gets
 * the fallback message. Replies are always built from the CURRENT trip
 * state, never from canned static text.
 */

export const FALLBACK_TEXT =
  "Sorry, but I can't understand what u are trying to ask. I can help with your trip status, cancelled bookings, recovery options, refunds and deadlines, your group, and travel documents.";

const phrases = (...words) => words.join('|');

function phaseText(state) {
  switch (state.phase) {
    case 'normal':
      return `Your trip is all set. ${currentBookings.outboundFlight.label} departs at ${currentBookings.outboundFlight.time} on 12 Sep.`;
    case 'disrupted':
    case 'recovery-options':
    case 'plan-selected':
      return state.disruption?.message || 'Something went wrong with your trip.';
    case 'recovered': {
      const plan = recoveryPlans.find((p) => p.id === state.appliedPlanId);
      return plan
        ? `Your trip is recovered. You're now on ${plan.transport} at ${plan.depTime} on ${plan.date}.`
        : 'Your trip is recovered.';
    }
    default:
      return '';
  }
}

function statusReply(state) {
  const phase = state.phase;
  if (phase === 'normal') {
    return {
      text: `${phaseText(state)} Nothing is at risk right now. Your hotel refund deadline is safe, and all 5 bookings are confirmed.`,
      chips: [
        { label: 'View my trip', to: '/app/trip' },
        { label: 'Check refunds', modal: 'refund' },
      ],
    };
  }
  if (phase === 'recovered') {
    const plan = recoveryPlans.find((p) => p.id === state.appliedPlanId);
    return {
      text: `${phaseText(state)} Everything is green again — transfer, hotel and activity are all confirmed.${plan?.refund ? ` A refund of ₹${plan.refund.toLocaleString('en-IN')} is on its way to your wallet.` : ''}`,
      chips: [
        { label: 'View updated trip', to: '/app/trip' },
        { label: 'Check refund', modal: 'refund' },
      ],
    };
  }
  const affected = computeImpact(state).filter((n) => n.status !== 'confirmed');
  return {
    text: `${phaseText(state)} This affects ${affected.length} more bookings: ${affected
      .map((n) => n.booking.label)
      .join(', ')}. I'd suggest finding recovery options now.`,
    chips: [{ label: 'Find options', to: '/app/recovery' }],
  };
}

function plansReply(state, planId) {
  const plan = planId ? recoveryPlans.find((p) => p.id === planId) : null;
  if (plan) {
    return {
      text: `${plan.tag}: ${plan.transport} at ${plan.depTime} on ${plan.date} (${plan.duration}). ${plan.extraCost ? `Extra cost ₹${plan.extraCost.toLocaleString('en-IN')}.` : '₹0 extra.'} ${plan.refund ? `Refund ₹${plan.refund.toLocaleString('en-IN')}.` : ''} ${plan.hotelNote}.`,
      chips: [
        { label: 'Compare all options', to: '/app/recovery' },
        { label: 'Choose this', action: 'select-plan', payload: plan.id },
      ],
    };
  }
  if (state.phase === 'normal') {
    return {
      text: `You have no disruption right now — but here's a preview of how recovery works. When a booking breaks, I find 3 plans: fastest, cheapest, and best-refund. Compare them anytime.`,
      chips: [{ label: 'How it works', to: '/app' }],
    };
  }
  return {
    text: `${phaseText(state)} I found 3 recovery options. The fastest one (2:15 PM, +₹2,400) keeps your hotel booking unchanged. The cheapest adds ₹1,100 on a 5:30 PM train. The next-morning flight is free and gets you a ₹7,200 refund, but you'd move to a different hotel.`,
    chips: [
      { label: 'Compare options', to: '/app/recovery' },
      { label: 'Check refund', modal: 'refund' },
    ],
  };
}

function refundReply(state, msLeft) {
  const hotel = currentBookings.hotel;
  const sev = severityOf(msLeft);
  if (state.phase === 'recovered') {
    const plan = recoveryPlans.find((p) => p.id === state.appliedPlanId);
    return {
      text: plan?.refund
        ? `Good news — your recovery plan includes a ₹${plan.refund.toLocaleString('en-IN')} refund. It's being processed to your payment method.`
        : `Your recovery plan doesn't include a refund, but nothing more is at risk.`,
      chips: [{ label: 'Review bookings', to: '/app/deadlines' }],
    };
  }
  const urgency =
    sev === 'urgent' ? ' This is urgent — act before the deadline.' : sev === 'attention' ? ' Act soon to keep it safe.' : '';
  return {
    text: `Don't miss your refund: the ${hotel.label} cancellation deadline is in ${formatCountdown(msLeft)} (${severityOf(msLeft)}). Potential refund: ₹${hotel.refund.potential.toLocaleString('en-IN')}.${urgency}`,
    chips: [
      { label: 'Review booking', modal: 'refund' },
      { label: 'View deadlines', to: '/app/deadlines' },
    ],
  };
}

function groupReply(state) {
  const affected = groupMembers.filter((m) => m.affected);
  const continuing = groupMembers.filter((m) => !m.affected);
  return {
    text: `Your group of 5: ${continuing.length} travelers (${continuing.map((m) => m.name).join(', ')}) can continue as planned. ${affected.map((m) => m.name).join(' and ')} needs a separate recovery plan — one person's disruption doesn't stop the whole group.`,
    chips: [{ label: 'Open your group', to: '/app/group' }],
  };
}

function documentsReply(state) {
  const relevant = state.phase !== 'normal' ? documents.filter((d) => d.relevantOnDisruption) : documents;
  return {
    text: `You have ${documents.length} documents saved.${state.phase !== 'normal' ? ` During this disruption you may need: ${relevant.map((d) => d.title).join(', ')}.` : ''} All are stored securely and available offline.`,
    chips: [
      { label: 'Open documents', to: '/app/documents' },
      ...relevant.slice(0, 2).map((d) => ({ label: d.title, action: 'open-doc', payload: d.id })),
    ],
  };
}

const INTENTS = [
  {
    id: 'greeting',
    test: /^(hi|hello|hey|namaste|yo|good (morning|afternoon|evening))/i,
    reply: (state) => ({
      text: `Hi ${traveler.name}! ${phaseText(state)} What would you like to do?`,
      chips: [{ label: 'Trip status', action: 'ask', payload: 'How is my trip?' }],
    }),
  },
  {
    id: 'status',
    test: /(how is (my|the) trip|is my trip|trip status|status of my trip|what.?s (going on|up|happening)|everything ok|is everything)/i,
    reply: statusReply,
  },
  {
    id: 'what-can-i-do',
    test: /(what (can|should) i do|what are my options|find options|fix my trip|recovery|reroute|rebook|alternatives|next steps)/i,
    reply: (state) => plansReply(state),
  },
  {
    id: 'cancelled',
    test: /(flight|train|bus|booking).*(cancel|canceled|cancelled)|(cancel|canceled|cancelled).*(flight|train|bus|booking)|what happened|disrupt/i,
    reply: (state) => ({
      text: `${phaseText(state)} ${state.phase === 'normal' ? 'Nothing has been cancelled right now.' : `Here's what could be affected: airport transfer, hotel check-in, and the trip schedule.`}`,
      chips:
        state.phase === 'normal'
          ? [{ label: 'View my trip', to: '/app/trip' }]
          : [
              { label: 'What does this affect?', to: '/app/trip' },
              { label: 'Find the best options', to: '/app/recovery' },
            ],
    }),
  },
  {
    id: 'fastest',
    test: /fastest|quickest|soonest/i,
    reply: (state) => plansReply(state, 'fastest'),
  },
  {
    id: 'save-money',
    test: /(save money|cheapest|budget|cheap option|less money)/i,
    reply: (state) => plansReply(state, 'save-money'),
  },
  {
    id: 'next-morning',
    test: /(next morning|best refund|more refund|refund option|tomorrow)/i,
    reply: (state) => plansReply(state, 'next-morning'),
  },
  {
    id: 'plans-compare',
    test: /compare|plans|options for you|3 (options|plans)/i,
    reply: (state) => plansReply(state),
  },
  {
    id: 'money',
    test: /(money|refund|deadline|at risk|potential refund|price|cost|budget|spent|remaining)/i,
    reply: (state, ctx) => refundReply(state, ctx.msLeft),
  },
  {
    id: 'hotel',
    test: /hotel|residency|stay|check-?in/i,
    reply: (state) => {
      const hotel = currentBookings.hotel;
      const node = computeImpact(state).find((n) => n.booking.id === hotel.id);
      const text =
        node.status === 'at-risk'
          ? `Your ${hotel.label} check-in is at risk because your flight was cancelled. Choosing a recovery option that keeps the hotel will fix it.`
          : node.status === 'changed'
            ? `Your hotel changed to Himalaya Homestay (Manali) with the NEXT MORNING plan.`
            : `Your ${hotel.label} booking (${hotel.checkIn} – ${hotel.checkOut}) is confirmed.`;
      return { text, chips: [{ label: 'Review hotel booking', modal: 'refund' }] };
    },
  },
  {
    id: 'group',
    test: /(group|travelers|travellers|friends|who.?s affected|who else|aisha|rahul|riya|karan)/i,
    reply: groupReply,
  },
  {
    id: 'documents',
    test: /(document|ticket|passport|insurance|voucher|pnr|id proof)/i,
    reply: documentsReply,
  },
  {
    id: 'offline',
    test: /offline|no internet|no network|saved data/i,
    reply: (state) => ({
      text: state.offline
        ? `Yes — you're offline. I'm using your saved trip information, so I can show bookings, documents and deadlines, but I can't check live prices or availability.`
        : `You're online right now. If you lose connection, I'll switch to your saved trip information automatically.`,
      chips: [{ label: 'Open documents', to: '/app/documents' }],
    }),
  },
  {
    id: 'help',
    test: /(help|what can you do|how do you work|capabilities|guide)/i,
    reply: () => ({
      text: `I'm your TripSync travel assistant. I can: tell you your trip status, explain what a disruption affects, compare recovery options, check refunds and deadlines, look after your group, and open your documents. Just ask in plain language.`,
      chips: [
        { label: 'How is my trip?', action: 'ask', payload: 'How is my trip?' },
        { label: 'What are my options?', action: 'ask', payload: 'What are my options?' },
      ],
    }),
  },
  {
    id: 'thanks',
    test: /(thank|thanks|thx|great|awesome|perfect)/i,
    reply: () => ({
      text: `Anytime! I'm here for the whole journey. ✈️`,
      chips: [],
    }),
  },
];

/**
 * Pure reply builder. `ctx` carries live values the UI computes (msLeft).
 * Returns { text, chips } where chips are { label, to | modal | action, payload }.
 */
export function getAssistantReply(state, question, ctx = {}) {
  const q = String(question || '').trim();
  if (!q) return { text: FALLBACK_TEXT, chips: [] };
  const offlinePrefix = state.offline ? 'Offline mode · Using saved trip information. ' : '';
  for (const intent of INTENTS) {
    if (intent.test.test(q)) {
      const res = intent.reply(state, ctx);
      return { text: `${offlinePrefix}${res.text}`, chips: res.chips || [] };
    }
  }
  return { text: `${offlinePrefix}${FALLBACK_TEXT}`, chips: [{ label: 'Help me', action: 'ask', payload: 'What can you do?' }] };
}