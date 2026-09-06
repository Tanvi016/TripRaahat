import { currentBookings, disruptionPresets, recoveryPlans } from '../data/demoTrip.js';

export const PHASES = ['normal', 'disrupted', 'recovery-options', 'plan-selected', 'recovered'];

/**
 * Core shared state machine (per AGENTS.md):
 *   normal → disrupted → recovery-options → plan-selected → recovered
 * plus the `offline` flag, deadline timestamp, uploaded docs and toasts.
 */
export function getInitialState(now = Date.now()) {
  const bookings = {};
  for (const [key, b] of Object.entries(currentBookings)) {
    bookings[key] = { ...b, status: 'confirmed' };
  }
  return {
    phase: 'normal',
    offline: false,
    bookings,
    disruption: null,
    selectedPlanId: null,
    appliedPlanId: null,
    deadlineTs: now + (currentBookings.hotel.refund.deadlineOffsetMs || 0),
    uploads: [],
    toasts: [],
    // SOS engine state
    sos: {
      lastKnownLocation: null,
      gpsStatus: 'idle',
      emergencyDocuments: [],
      broadcastStatus: 'idle',
      activeEmergencyType: null,
      lastKnownLocationLabel: null,
    },
    // Group recovery state
    groupRecovery: {
      strategy: null,
      memberAssignments: {},
      recoveryCosts: {},
    },
    // Expense state (derived from data; cached for UI)
    expenses: {
      roomAssignments: {},
      personalExpenses: {},
      settlement: {},
    },
    // Finance page preferences
    financeTab: 'overview',
  };
}

export function pushToast(state, toast) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return { ...state, toasts: [...state.toasts, { id, ...toast }] };
}

function withDisruptionState(state, disruption) {
  const bookings = { ...state.bookings };
  bookings.outboundFlight = { ...bookings.outboundFlight, status: 'cancelled' };
  bookings.transfer = { ...bookings.transfer, status: 'at-risk' };
  bookings.hotel = { ...bookings.hotel, status: 'at-risk' };
  bookings.activity = { ...bookings.activity, status: 'affected' };
  bookings.returnFlight = { ...bookings.returnFlight, status: 'confirmed' };
  return { ...state, phase: 'disrupted', disruption, bookings };
}

function withRecoveredState(state, plan) {
  const bookings = { ...state.bookings };
  bookings.outboundFlight = {
    ...bookings.outboundFlight,
    status: 'recovered',
    replacement: { label: `${plan.transport} · ${plan.depTime}`, route: plan.route, date: plan.date },
  };
  bookings.transfer = { ...bookings.transfer, status: 'recovered' };
  bookings.hotel =
    plan.hotelStatus === 'change'
      ? { ...bookings.hotel, status: 'changed', label: 'Himalaya Homestay (new)', subtitle: 'Manali · Old Manali Road' }
      : { ...bookings.hotel, status: 'recovered' };
  bookings.activity = { ...bookings.activity, status: 'recovered' };
  bookings.returnFlight = { ...bookings.returnFlight, status: 'confirmed' };
  return { ...state, phase: 'recovered', appliedPlanId: plan.id, bookings };
}

export function tripReducer(state, action) {
  switch (action.type) {
    case 'REPORT_DISRUPTION': {
      const preset =
        disruptionPresets.find((d) => d.id === action.presetId) || disruptionPresets[0];
      const disruption = {
        presetId: preset.id,
        label: preset.label,
        message: action.message || preset.message,
        detail: preset.detail,
      };
      let next = withDisruptionState(state, disruption);
      next = pushToast(next, { kind: 'critical', title: 'Disruption detected', message: preset.message });
      return next;
    }

    case 'FIND_OPTIONS': {
      if (state.phase !== 'disrupted' && state.phase !== 'recovery-options') return state;
      let next = { ...state, phase: 'recovery-options' };
      next = pushToast(next, {
        kind: 'info',
        title: 'Recovery plans ready',
        message: `We found ${recoveryPlans.length} options for you.`,
      });
      return next;
    }

    case 'SELECT_PLAN': {
      const plan = recoveryPlans.find((p) => p.id === action.planId);
      if (!plan) return state;
      return { ...state, phase: 'plan-selected', selectedPlanId: plan.id };
    }

    case 'APPLY_PLAN': {
      const plan = recoveryPlans.find((p) => p.id === (action.planId || state.selectedPlanId));
      if (!plan) return state;
      let next = withRecoveredState(state, plan);
      next = pushToast(next, { kind: 'success', title: 'Your trip is recovered 🎉', message: `${plan.tag} plan applied.` });
      return next;
    }

    case 'RESET_DEMO': {
      // fresh normal trip, but keep the original deadline so the demo timer stays stable
      return { ...getInitialState(), deadlineTs: state.deadlineTs };
    }

    case 'SET_OFFLINE': {
      const offline = !!action.offline;
      let next = { ...state, offline };
      if (offline) {
        next = pushToast(next, {
          kind: 'attention',
          title: 'Offline mode',
          message: 'Using saved trip information. Live updates are unavailable.',
        });
      }
      return next;
    }

    case 'ADD_UPLOAD': {
      return { ...state, uploads: [action.upload, ...state.uploads] };
    }

    case 'REMOVE_UPLOAD': {
      return { ...state, uploads: state.uploads.filter((u) => u.id !== action.id) };
    }

    case 'PUSH_TOAST': {
      return pushToast(state, action.toast);
    }

    case 'DISMISS_TOAST': {
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    }

    // ---- SOS engine actions ----
    case 'CAPTURE_LOCATION': {
      return {
        ...state,
        sos: {
          ...state.sos,
          lastKnownLocation: action.location,
          gpsStatus: action.gpsStatus || state.sos.gpsStatus,
          lastKnownLocationLabel: action.location?.label || state.sos.lastKnownLocationLabel,
        },
      };
    }

    case 'SET_SOS_STATUS': {
      return {
        ...state,
        sos: {
          ...state.sos,
          gpsStatus: action.gpsStatus,
          activeEmergencyType: action.activeEmergencyType != null ? action.activeEmergencyType : state.sos.activeEmergencyType,
        },
      };
    }

    case 'REQUEST_SOS_OPEN': {
      return {
        ...state,
        sos: {
          ...state.sos,
          gpsStatus: 'searching',
        },
      };
    }

    case 'SET_BROADCAST_STATUS': {
      return {
        ...state,
        sos: {
          ...state.sos,
          broadcastStatus: action.status,
        },
      };
    }

    // ---- Group recovery actions ----
    case 'SELECT_GROUP_STRATEGY': {
      const strategy = action.strategy;
      return {
        ...state,
        groupRecovery: {
          strategy,
          memberAssignments: state.groupRecovery?.memberAssignments || {},
          recoveryCosts: state.groupRecovery?.recoveryCosts || {},
        },
      };
    }

    case 'UPDATE_MEMBER_STATUS': {
      const { memberId, status, note } = action;
      return {
        ...state,
        groupRecovery: {
          ...state.groupRecovery,
          memberAssignments: {
            ...state.groupRecovery?.memberAssignments,
            [memberId]: { status, note },
          },
        },
      };
    }

    case 'SET_GROUP_ASSIGNMENT': {
      const { memberId, assignment } = action;
      return {
        ...state,
        groupRecovery: {
          ...state.groupRecovery,
          memberAssignments: {
            ...state.groupRecovery?.memberAssignments,
            [memberId]: assignment,
          },
        },
      };
    }

    // ---- Expense actions ----
    case 'SET_FINANCE_TAB': {
      return { ...state, financeTab: action.tab };
    }

    default:
      return state;
  }
}