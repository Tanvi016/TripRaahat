/**
 * locationService.js — geolocation wrapper with last-known-location caching.
 *
 * Strategy:
 *  1. While online and permission granted, capture fresh GPS occasionally.
 *  2. Persist the latest verified location to localStorage (lastKnownLocation).
 *  3. On SOS: try fresh GPS → if fail, use cached lastKnown → if none, fallback
 *     to the active itinerary node from TripContext.
 *
 * This is OFFLINE-FIRST. Cached location is readable without network.
 */

const STORAGE_KEY = 'tripsync-last-known-location';
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours — stale locations expire

/** Check whether the browser supports geolocation */
export function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/** Check online/offline status (demo-aware: respects navigator.onLine) */
export function isOnline() {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/** Read the cached last-known-location from localStorage */
export function getLastKnownLocation() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.latitude !== 'number') return null;
    // Treat as fresh if within MAX_CACHE_AGE_MS; otherwise mark stale
    const ageMs = Date.now() - (parsed.timestamp || Date.now());
    return { ...parsed, stale: ageMs > MAX_CACHE_AGE_MS, ageMs };
  } catch (err) {
    return null;
  }
}

/** Persist a verified location to localStorage */
export function cacheLocation(location) {
  if (typeof window === 'undefined') return;
  try {
    const entry = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy || null,
      timestamp: new Date().toISOString(),
      source: 'gps',
      connectivity: isOnline() ? 'online' : 'offline',
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch (err) {
    // localStorage unavailable — location is still usable in-memory
  }
}

/** Clear the cached location (e.g. on logout / trip change) */
export function clearCachedLocation() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

/**
 * Request a fresh GPS position.
 * Returns a promise that resolves with { latitude, longitude, accuracy } or
 * rejects with a descriptive error code string.
 */
export function requestFreshLocation(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject('unsupported');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 30000, // allow up to 30s cached position for fresh request
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let code = 'unknown';
        if (err.code === 1) code = 'denied';
        else if (err.code === 2) code = 'unavailable';
        else if (err.code === 3) code = 'timeout';
        reject(code);
      },
      options
    );
  });
}

/**
 * Location update strategy while connected:
 *  - Start a watch if permission is granted.
 *  - Update cache on each success.
 *  - Stop the watch when offline or when explicitly torn down.
 *
 * Returns { watchId, cancel } so the caller can stop updates.
 */
export function startLocationTracking(updateCache = true) {
  let watchId = null;

  if (!isGeolocationSupported()) {
    return { watchId: null, cancel: () => {} };
  }

  if (!isOnline()) {
    return { watchId: null, cancel: () => {} };
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const location = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      if (updateCache) cacheLocation(location);
    },
    (err) => {
      // Silently handle per-position errors — the next request will retry.
      // Common: permission revoked mid-session, signal lost temporarily.
    },
    {
      enableHighAccuracy: false, // balance battery / accuracy for periodic updates
      timeout: 10000,
      maximumAge: 60000, // accept up to 1 minute old position for periodic updates
    }
  );

  return {
    watchId,
    cancel: () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    },
  };
}
