import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { getInitialState, tripReducer } from '../utils/tripReducer.js';

const STORAGE_KEY = 'tripsync-state-v1';

/**
 * ONE shared trip state across all screens (per AGENTS.md).
 * Persisted to localStorage so offline mode and refreshes keep the trip.
 */
function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.phase && parsed.bookings) {
        return { ...parsed, toasts: [] };
      }
    }
  } catch (err) {
    // corrupted storage — start with a fresh demo trip
  }
  return getInitialState();
}

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, undefined, loadInitial);

  useEffect(() => {
    try {
      const { toasts, ...persisted } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (err) {
      // storage unavailable — app still works in-memory
    }
  }, [state]);

  const value = useMemo(() => ({
    state,
    dispatch,
    // Convenience selectors
    travelerName: state.travelerName || 'Tanvi',
    travelerId: state.travelerId || 'tanvi',
    tripTitle: state.tripTitle || 'Mumbai → Delhi → Manali',
    hotelLabel: state.hotelLabel || 'Mountain View Residency',
    hotelStatus: state.hotelStatus || 'Confirmed',
  }), [state]);
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside TripProvider');
  return ctx;
}