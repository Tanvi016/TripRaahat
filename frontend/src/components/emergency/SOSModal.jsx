import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Clock,
  FileText,
  WifiOff,
  Wifi,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PhoneCall,
} from 'lucide-react';
import { useEmergencySOS } from '../../hooks/useEmergencySOS.js';
import {
  locationAge,
  isLocationStale,
  locationSourceLabel,
} from '../../utils/emergencyUtils.js';
import { emergencyDocIcons } from '../../data/emergencyData.js';
import { documents } from '../../data/demoTrip.js';

const EMERGENCY_TYPES = [
  {
    id: 'medical',
    label: 'Medical Emergency',
    description: 'Injury, illness, or urgent medical help needed',
    tone: 'critical',
    icon: 'heart-pulse',
  },
  {
    id: 'stranded',
    label: 'Stranded / Severe Delay',
    description: 'Flight cancelled, miss connection, stuck without transport',
    tone: 'attention',
    icon: 'plane-slash',
  },
  {
    id: 'documents',
    label: 'Lost Documents / Theft',
    description: 'Passport, wallet, or ID lost or stolen',
    tone: 'attention',
    icon: 'id-badge',
  },
  {
    id: 'police',
    label: 'Local Police / Tourist Security',
    description: 'Safety concern, harassment, theft in progress',
    tone: 'primary',
    icon: 'shield',
  },
];

const EMOJI_MAP = {
  'heart-pulse': '❤️',
 'plane-slash': '✈️',
  'id-badge': '🪪',
  'shield': '🛡️',
};

function LocationDisplay({ location, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    onRefresh().finally(() => setLoading(false));
  };

  if (!location) {
    return (
      <div className="rounded-xl bg-periwinkle/60 p-4 text-sm text-ink-soft">
        <div className="flex items-center gap-2">
          <Clock size={14} className="shrink-0 text-ink-faint" />
          <span>Determining location…</span>
        </div>
      </div>
    );
  }

  const sourceLabel = locationSourceLabel(location.source);
  const ageText = locationAge(location.ageMs);
  const stale = isLocationStale(location.ageMs);
  const showCoords = location.latitude != null && location.longitude != null;

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: stale ? 'var(--attention, #f59e0b)' : 'var(--emerald, #10b981)', borderWidth: '2px', background: stale ? 'var(--attention-light, #fef3c7)' : 'var(--emerald-light, #d1fae5)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {showCoords ? (
              <MapPin size={15} className={stale ? 'text-attention' : 'text-emerald'} />
            ) : (
              <MapPin size={15} className="text-ink-faint" />
            )}
            <span className={`font-bold ${stale ? 'text-attention' : 'text-emerald'}`}>{sourceLabel}</span>
            {stale && <span className="chip bg-attention-light text-attention text-[10px]">Unverified</span>}
          </div>
          <p className="mt-1 font-semibold text-navy">{location.label}</p>
          {location.note && <p className="mt-0.5 text-xs text-ink-soft">{location.note}</p>}
          {ageText && (
            <p className={`mt-1.5 text-xs ${stale ? 'text-attention' : 'text-ink-faint'}`}>
              {ageText}
              {stale && ' · Your current location could not be verified.'}
            </p>
          )}
          {showCoords && (
            <p className="mt-1 font-mono text-[11px] text-ink-faint">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              {location.accuracy != null ? ` · ±${Math.round(location.accuracy)}m` : ''}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || !window.navigator?.geolocation}
          className="shrink-0 rounded-lg p-2 text-ink-soft hover:bg-navy/5 disabled:opacity-40"
          aria-label="Refresh location"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <MapPin size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

function EmergencyContactCard({ contact }) {
  const isCritical = contact.tone === 'critical';

  return (
    <a
      href={`tel:${contact.phone}`}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors hover:bg-navy/5 ${isCritical ? 'border-critical/20 bg-critical-light/40' : 'border-primary/20 bg-primary-soft/40'}`}
    >
      <div className={`mt-0.5 shrink-0 rounded-lg p-2 ${isCritical ? 'bg-critical text-white' : 'bg-primary text-white'}`}>
        <PhoneCall size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-navy">{contact.label}</p>
        <p className="mt-0.5 text-sm font-mono font-semibold text-navy">{contact.phone}</p>
        {contact.note && <p className="mt-0.5 text-xs text-ink-soft">{contact.note}</p>}
      </div>
      <Phone size={14} className={isCritical ? 'text-critical' : 'text-primary'} />
    </a>
  );
}

function DocumentVaultPanel({ isOpen, onToggle }) {
  const demoDocs = documents.filter((d) => d.relevantOnDisruption || d.kind === 'passport');

  return (
    <div className="rounded-xl border border-navy/5 bg-white p-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-navy hover:bg-navy/5"
      >
        <span className="flex items-center gap-2">
          <FileText size={15} className="text-emerald" />
          Offline Document Vault
          <span className="chip bg-emerald-light text-emerald text-[10px]">Stored on this device</span>
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {demoDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl bg-periwinkle/40 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy">{doc.title}</p>
                    <p className="text-xs text-ink-soft">{doc.subtitle}</p>
                    <p className="mt-1 text-[10px] text-ink-faint">{doc.file.name} · {doc.file.size} · {doc.file.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip bg-emerald-light text-emerald text-[10px]">Offline</span>
                    <button className="chip bg-white text-navy border border-navy/10 text-xs">View</button>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-ink-faint text-center pt-1">
                Demo documents shown. In production, your uploaded documents are cached locally and available without internet.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BroadcastPanel({ message, onShareWhatsApp, onShareSMS }) {
  return (
    <div className="rounded-xl border border-emerald/20 bg-emerald-light/40 p-4">
      <h4 className="text-sm font-extrabold text-emerald">Broadcast to group</h4>
      <p className="mt-1 text-xs text-ink-soft">
        Share your location and status with the group. You must confirm before anything is sent — no silent sharing.
      </p>

      <div className="mt-3 max-h-40 overflow-y-auto rounded-xl bg-white p-3 text-xs font-mono text-ink-soft">
        <pre className="whitespace-pre-wrap">{message}</pre>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onShareWhatsApp}
          className="btn-primary flex-1 px-3 py-2 text-xs"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.042 1.03 6.954 2.898a9.825 9.825 0 012.893 6.954c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share on WhatsApp
        </button>
        <button
          onClick={onShareSMS}
          className="btn-secondary flex-1 px-3 py-2 text-xs"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5 22.5 17.799 22.5 12 17.799 1.5 12 1.5zm0 10.5c1.933 0 3.5-1.567 3.5-3.5s-1.567-3.5-3.5-3.5S8.5 4.933 8.5 6.867 10.067 10.5 12 10.5zm0 5a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5zM5.75 5h2.25v2.25H5.75V5zm7.5 0h2.5v2.25h-2.5V5zM5.75 12h2.25v2.25H5.75V12zm7.5 0h2.5v2.25h-2.5V12zM5.75 19h2.25v2.25H5.75V19zm7.5 0h2.5v2.25h-2.5V19z"/></svg>
          Send SMS
        </button>
      </div>
    </div>
  );
}

export default function SOSModal({ open, onClose }) {
  const { getLocation, contacts, generateMessage, gpsSupported } = useEmergencySOS();
  const [activeType, setActiveType] = useState(null);
  const [location, setLocation] = useState(null);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [broadcastReady, setBroadcastReady] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastUrls, setBroadcastUrls] = useState({ whatsappUrl: '', smsUrl: '' });
  const [mounted, setMounted] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    setMounted(true);
    if (open) {
      setActiveType(null);
      setLocation(null);
      setBroadcastReady(false);
      loadLocation();
    }
  }, [open]);

  const loadLocation = useCallback(async () => {
    const loc = await getLocation();
    setLocation(loc);
    return loc;
  }, [getLocation]);

  // Auto-load location on first mount
  useEffect(() => {
    if (mounted && open && !location) {
      loadLocation();
    }
  }, [mounted, open, location, loadLocation]);

  const handleSelectType = (typeId) => {
    setActiveType(typeId);
    loadLocation();
  };

  const prepareBroadcast = useCallback(() => {
    const { message, whatsappUrl, smsUrl } = generateMessage();
    setBroadcastMsg(message);
    setBroadcastUrls({ whatsappUrl, smsUrl });
    setBroadcastReady(true);
  }, [generateMessage]);

  const handleShareWhatsApp = () => {
    if (broadcastUrls.whatsappUrl) {
      window.open(broadcastUrls.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareSMS = () => {
    if (broadcastUrls.smsUrl) {
      window.location.href = broadcastUrls.smsUrl;
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-critical/30 backdrop-blur-[3px] sm:bg-navy/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Emergency Assistance"
            className="relative w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-float"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{ background: 'var(--white, #fff)' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy/10 bg-white px-5 py-4 sm:rounded-t-3xl">
              <div>
                <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
                  <span className="text-critical text-xl">🚨</span> Emergency Assistance
                </h2>
                <p className="text-xs text-ink-soft">
                  Get help using your location, trip context, and saved emergency information.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close emergency panel"
                className="rounded-full p-2 text-ink-soft hover:bg-navy/5 transition-colors"
              >
                <span className="text-lg leading-none">✕</span>
              </button>
            </div>

            <div className="px-5 py-5 space-y-5">
              {/* GPS status banner */}
              {gpsSupported ? (
                <div className="flex items-center gap-2 rounded-xl bg-periwinkle/60 p-3 text-xs font-semibold text-ink-soft">
                  <MapPin size={13} className="text-primary" />
                  Location services available. TripSync will use your GPS, last known location, or trip fallback.
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-attention-light/60 p-3 text-xs font-semibold text-attention">
                  <WifiOff size={13} />
                  Geolocation is not supported on this device. Using trip location fallback.
                </div>
              )}

              {/* Emergency type selector */}
              <div>
                <h3 className="text-sm font-bold text-navy mb-2">What kind of emergency?</h3>
                <div className="space-y-2">
                  {EMERGENCY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleSelectType(type.id)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${activeType === type.id ? 'ring-2 ring-offset-2' : 'border-navy/10 hover:border-navy/20'} ${activeType === type.id ? (type.tone === 'critical' ? 'ring-critical bg-critical-light/30' : type.tone === 'attention' ? 'ring-attention bg-attention-light/30' : 'ring-primary bg-primary-soft/30') : 'bg-white'}`}
                      style={{ ringColor: activeType === type.id ? (type.tone === 'critical' ? '#dc2626' : type.tone === 'attention' ? '#f59e0b' : '#0284c7') : undefined }}
                    >
                      <span className="text-xl">{EMOJI_MAP[type.icon] || '⚠️'}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold ${activeType === type.id ? 'text-critical' : 'text-navy'}`}>{type.label}</p>
                        <p className="text-xs text-ink-soft">{type.description}</p>
                      </div>
                      {activeType === type.id && (
                        <span className={`shrink-0 text-xs font-bold ${type.tone === 'critical' ? 'text-critical' : type.tone === 'attention' ? 'text-attention' : 'text-primary'}`}>Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location display */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <MapPin size={14} className="text-primary" /> Your location
                </h3>
                <LocationDisplay location={location} onRefresh={loadLocation} />
              </div>

              {/* Emergency contacts */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <Phone size={14} className="text-primary" /> Emergency contacts
                </h3>
                <div className="grid gap-2">
                  {contacts.map((contact) => (
                    <EmergencyContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
                <p className="text-[10px] text-ink-faint text-center pt-1">
                  Demo / configurable contacts. In production, these are destination-specific and backed by your trip data.
                </p>
              </div>

              {/* Document vault */}
              <DocumentVaultPanel isOpen={vaultOpen} onToggle={() => setVaultOpen(!vaultOpen)} />

              {/* Broadcast panel */}
              {broadcastReady && broadcastMsg && (
                <BroadcastPanel
                  message={broadcastMsg}
                  onShareWhatsApp={handleShareWhatsApp}
                  onShareSMS={handleShareSMS}
                />
              )}

              {/* Broadcast CTA */}
              {!broadcastReady && (
                <button
                  onClick={prepareBroadcast}
                  disabled={!location}
                  className="btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone size={16} className="shrink-0" />
                  Broadcast Location & Status to Group
                  {!location && <span className="block text-[10px] font-normal opacity-70">Load location first</span>}
                </button>
              )}

              {/* Footer note */}
              <p className="text-[10px] text-ink-faint text-center leading-relaxed">
                TripSync does not send messages automatically. You must explicitly confirm every broadcast.
                {!gpsSupported && ' Location is based on your trip itinerary, not live GPS.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
