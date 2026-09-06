/**
 * useEmergencySOS.js — hook for the SOS engine.
 *
 * Responsibilities:
 *  - Location acquisition: fresh GPS → cached lastKnown → itinerary fallback
 *  - Emergency contacts (from emergencyData)
 *  - Broadcast message generation + share URLs (WhatsApp / SMS)
 *  - Offline document vault access (currently in-memory from demoTrip docs;
 *    IndexedDB integration is pending)
 */

import { useCallback, useMemo } from 'react';
import { useTrip } from '../context/TripContext.jsx';
import { requestFreshLocation, getLastKnownLocation, isGeolocationSupported, cacheLocation } from '../services/locationService.js';
import { emergencyContacts, destinationContext, emergencyDocTypes } from '../data/emergencyData.js';
import {
  mapsUrl,
  whatsappShareUrl,
  smsShareUrl,
  formatPhone,
  locationAge,
  isLocationStale,
  locationSourceLabel,
  generateBroadcastMessage,
} from '../utils/emergencyUtils.js';

/** Resolve the best available location for SOS */
function resolveLocation(state, getItineraryFallback) {
  const { latitude, longitude, accuracy, timestamp, source, ageMs, stale } =
    state.sos.lastKnownLocation || {};

  // STEP 1: try fresh GPS
  // (done in the hook body, not here)

  // STEP 2: cached last-known location
  if (latitude != null && longitude != null) {
    return {
      latitude,
      longitude,
      accuracy: accuracy ?? null,
      source: stale ? 'gps-cache-stale' : 'gps-cache',
      label: state.sos.lastKnownLocationLabel || 'Last known location',
      ageMs,
      stale,
    };
  }

  // STEP 3: itinerary fallback — always available from trip state
  const fallback = getItineraryFallback(state);
  return {
    latitude: null,
    longitude: null,
    accuracy: null,
    source: 'itinerary',
    label: fallback.label,
    note: fallback.note,
    ageMs: null,
    stale: false,
  };
}

/** Derive an itinerary-based fallback label from the current trip state */
function getItineraryFallback(state) {
  // The active itinerary node is the outbound flight destination (Delhi)
  // when the trip is in transit. After recovery, use the hotel location.
  const bookings = state.bookings;
  const phase = state.phase;

  if (phase === 'recovered' || phase === 'normal') {
    // Trip is stable — use hotel location as primary fallback
    const hotel = bookings.hotel;
    if (hotel?.location) {
      return destinationContext[hotel.location] || { label: hotel.location, note: hotel.location };
    }
  }

  // In transit / disrupted: Delhi Airport T3 is the primary fallback
  // (the outbound flight destination)
  return destinationContext.delhi || { label: 'Delhi Airport T3', note: 'Delhi Airport T3' };
}

export function useEmergencySOS() {
  const { state, dispatch } = useTrip();

  /** Try to get the best location: fresh GPS → cache → fallback */
  const getLocation = useCallback(async () => {
    // STEP 1: attempt fresh GPS
    if (isGeolocationSupported()) {
      try {
        const fresh = await requestFreshLocation(8000);
        // Cache it for future use
        cacheLocation(fresh);
        dispatch({
          type: 'CAPTURE_LOCATION',
          location: {
            ...fresh,
            source: 'gps-fresh',
            connectivity: 'online',
            timestamp: new Date().toISOString(),
          },
        });
        return { ...fresh, source: 'gps-fresh', label: 'Current GPS location' };
      } catch (err) {
        // Fresh GPS failed — fall through to cache / fallback
      }
    }

    // STEP 2 + 3: resolve from cache or fallback
    const resolved = resolveLocation(state, getItineraryFallback);
    if (resolved.source === 'gps-cache' || resolved.source === 'gps-cache-stale') {
      dispatch({
        type: 'CAPTURE_LOCATION',
        location: {
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          accuracy: resolved.accuracy,
          source: resolved.source,
          connectivity: 'offline',
          timestamp: new Date().toISOString(),
        },
      });
    }
    return resolved;
  }, [state, dispatch]);

  /** Open SOS: dispatch the request and return the current location */
  const openSOS = useCallback(() => {
    dispatch({ type: 'REQUEST_SOS_OPEN' });
    return getLocation();
  }, [dispatch, getLocation]);

  /** Emergency contacts (demo / configurable) */
  const contacts = useMemo(() => emergencyContacts, []);

  /** Destination fallback context */
  const destination = useMemo(() => destinationContext, []);

  /** Generate broadcast message from current state */
  const generateMessage = useCallback(() => {
    const location = state.sos.lastKnownLocation;
    const fallback = getItineraryFallback(state);

    const message = generateBroadcastMessage({
      travelerName: state.travelerName || 'Tanvi',
      locationLabel: location?.label || fallback.label,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      tripTitle: state.tripTitle || 'Mumbai → Delhi → Manali',
      disruptionMessage: state.disruption?.message || null,
      hotelLabel: state.hotelLabel || 'Mountain View Residency',
      hotelStatus: state.hotelStatus || 'Confirmed',
      timestamp: new Date().toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    return {
      message,
      whatsappUrl: whatsappShareUrl(message),
      smsUrl: smsShareUrl(null, message),
    };
  }, [state]);

  /** Emergency document types (for vault panel) */
  const docTypes = useMemo(() => emergencyDocTypes, []);

  return {
    getLocation,
    openSOS,
    contacts,
    destination,
    generateMessage,
    docTypes,
    isGeolocationSupported,
    gpsSupported: isGeolocationSupported(),
  };
}
