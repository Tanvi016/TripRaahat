/**
 * emergencyUtils.js — pure utility functions for the SOS engine.
 * No React, no side effects. Pure data transformation.
 */

/** Build a Google Maps URL from coordinates */
export function mapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/** Build a WhatsApp share URL (no silent sending — user must confirm) */
export function whatsappShareUrl(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/?text=${encoded}`;
}

/** Build an SMS share URL (opens the device SMS composer) */
export function smsShareUrl(phone, message) {
  const encoded = encodeURIComponent(message);
  const target = phone ? `${encodeURIComponent(phone)}` : '';
  return target ? `sms:${target}?body=${encoded}` : `sms:?body=${encoded}`;
}

/** Format a phone number for display */
export function formatPhone(phone) {
  if (!phone) return '—';
  // If it's a numeric string like "112", keep it as-is
  if (/^\d+$/.test(phone)) return phone;
  return phone;
}

/** Human-readable location age */
export function locationAge(ageMs) {
  if (ageMs == null || isNaN(ageMs)) return 'unknown';
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return `Location recorded ${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Location recorded ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last known location from ${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `Last known location from ${days} day${days !== 1 ? 's' : ''} ago`;
}

/** Whether a location is considered stale enough to warn about */
export function isLocationStale(ageMs) {
  if (ageMs == null || isNaN(ageMs)) return true;
  // Warn if older than 1 hour
  return ageMs > 60 * 60 * 1000;
}

/** Status label for a location source */
export function locationSourceLabel(source) {
  switch (source) {
    case 'gps-fresh':
      return 'Current GPS location';
    case 'gps-cache':
      return 'Last known location';
    case 'itinerary':
      return 'Trip location fallback';
    default:
      return 'Unknown location source';
  }
}

/** Generate the emergency broadcast message */
export function generateBroadcastMessage({
  travelerName,
  locationLabel,
  latitude,
  longitude,
  tripTitle,
  disruptionMessage,
  hotelLabel,
  hotelStatus,
  timestamp,
}) {
  const lines = [
    '🚨 TripSync Emergency Alert',
    '',
    `${travelerName} needs assistance.`,
    '',
    `Location:`,
    `  ${locationLabel}`,
  ];

  if (latitude != null && longitude != null) {
    lines.push(`Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    lines.push(`Maps: ${mapsUrl(latitude, longitude)}`);
  }

  if (tripTitle) {
    lines.push('');
    lines.push(`Trip: ${tripTitle}`);
  }

  if (disruptionMessage) {
    lines.push(`Status: ${disruptionMessage}`);
  }

  if (hotelLabel) {
    lines.push('');
    lines.push(`Hotel:`);
    lines.push(`  ${hotelLabel}${hotelStatus ? ` · ${hotelStatus}` : ''}`);
  }

  if (timestamp) {
    lines.push('');
    lines.push(`Time: ${timestamp}`);
  }

  lines.push('');
  lines.push('Please contact me immediately.');

  return lines.join('\n');
}
