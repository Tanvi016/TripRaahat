/**
 * emergencyData.js — demo emergency contacts and destination info.
 *
 * These are DEMO / CONFIGURABLE values. They are not real-time emergency
 * service integrations. In production this data comes from the backend per
 * destination / trip context.
 *
 * 112 is the universal emergency number valid across the EU and many countries
 * including India (alongside 100/101/102). It is used here as a safe,
 * well-known default rather than a fabricated local number.
 */

/** National / regional emergency contacts shown in SOS modal */
export const emergencyContacts = [
  {
    id: 'emergency-112',
    label: 'National Emergency',
    phone: '112',
    note: 'Police · Ambulance · Fire',
    tone: 'critical',
  },
  {
    id: 'police-112',
    label: 'Police',
    phone: '112',
    note: 'Select "Police" when prompted',
    tone: 'critical',
  },
  {
    id: 'ambulance-112',
    label: 'Ambulance',
    phone: '112',
    note: 'Select "Ambulance" when prompted',
    tone: 'critical',
  },
  {
    id: 'airindia-t3',
    label: 'Air India — Delhi T3 Desk',
    phone: '1800-266-8202',
    note: 'Air India enquiry · Delhi Terminal 3',
    tone: 'primary',
  },
  {
    id: 'tourist-police',
    label: 'Tourist Police / Tourism Helpline',
    phone: '1363',
    note: 'India tourism helpline · demo contact',
    tone: 'primary',
  },
];

/** Destination-specific context used to enrich SOS location fallback.
 *  This is derived from the active itinerary node when GPS is unavailable. */
export const destinationContext = {
  delhi: {
    label: 'Delhi Airport T3',
    note: 'Indira Gandhi International Airport · Terminal 3',
    fallbackLabel: 'Delhi Airport T3',
  },
  manali: {
    label: 'Manali',
    note: 'Old Manali Road · Himachal Pradesh',
    fallbackLabel: 'Manali',
  },
  mumbai: {
    label: 'Mumbai',
    note: 'Home city · departure point',
    fallbackLabel: 'Mumbai',
  },
};

/** Emergency document types that the offline vault can surface */
export const emergencyDocTypes = [
  { id: 'passport', label: 'Passport', icon: 'PassportControl', description: 'Government-issued ID for travel' },
  { id: 'government-id', label: 'Government ID', icon: 'IdBadge', description: 'Aadhaar / PAN / driver licence' },
  { id: 'insurance', label: 'Insurance Policy', icon: 'ShieldCheck', description: 'Travel insurance cover details' },
  { id: 'emergency-travel-doc', label: 'Emergency Travel Document', icon: 'FileText', description: 'In case of passport loss/theft' },
];

/** Map icon ID to a Lucide icon name — used by the document vault panel */
export const emergencyDocIcons = {
  PassportControl: 'MapPin',
  IdBadge: 'ShieldCheck',
  ShieldCheck: 'ShieldCheck',
  FileText: 'FileText',
};
