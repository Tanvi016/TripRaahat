import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  FileText,
  Home,
  LifeBuoy,
  Route,
  Settings,
  Siren,
  Users as UsersNav,
  Wallet,
  AlarmClock,
} from 'lucide-react';

const PRIMARY = [
  { to: '/app', label: 'Home', Icon: Home, end: true },
  { to: '/app/recovery', label: 'Recovery', Icon: LifeBuoy },
  { to: '/app/group', label: 'Group', Icon: UsersNav, end: false },
];

const MORE = [
  { to: '/app/finance', label: 'Finance', Icon: Wallet },
  { to: '/app/trip', label: 'My Trip', Icon: Route },
  { to: '/app/deadlines', label: 'Deadlines', Icon: AlarmClock },
  { to: '/app/documents', label: 'Documents', Icon: FileText },
  { to: '/app/assistant', label: 'Assistant', Icon: Bot },
];

export default function BottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const isActive = (to, end = false) => {
    if (end) return location.pathname === '/app';
    return location.pathname.startsWith(to);
  };

  useEffect(() => {
    const h1 = window.matchMedia('(min-width: 1024px)');
    if (h1.matches) {
      setMoreOpen(false);
    }
  }, []);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden glass-strong border-t border-navy/5 pb-[env(safe-area-inset-bottom)]"
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around">
          {PRIMARY.map(({ to, label, Icon, end }) => (
            <button
              key={to}
              type="button"
              onClick={() => {
                window.location.href = to;
              }}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                isActive(to, end)
                  ? 'text-primary'
                  : 'text-ink-faint hover:text-navy-soft'
              }`}
            >
              <Icon size={20} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
              moreOpen ? 'text-primary' : 'text-ink-faint hover:text-navy-soft'
            }`}
            aria-expanded={moreOpen}
            aria-label="More navigation options"
          >
            <Settings size={20} />
            <span className="whitespace-nowrap">More</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed inset-x-0 z-50 overflow-hidden rounded-t-3xl border-t border-navy/5 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur-xl shadow-float lg:hidden"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label="More navigation"
          >
            <div className="flex flex-col min-h-[280px]">
              <div className="border-b border-navy/10 px-1 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  More
                </p>
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto">
                {MORE.map(({ to, label, Icon }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => {
                      window.location.href = to;
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive(to)
                        ? 'bg-primary-soft/40 text-primary'
                        : 'text-navy-soft hover:bg-navy/5 hover:text-navy'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-navy/10 px-1 py-3 text-center">
                <button
                  type="button"
                  onClick={() => setSosOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-critical px-3 py-2.5 text-sm font-semibold text-white hover:bg-critical/90"
                >
                  <Siren size={16} className="shrink-0" />
                  SOS Emergency
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sosOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-critical/30 backdrop-blur-[3px] sm:bg-navy/60"
              onClick={() => setSosOpen(false)}
              aria-hidden="true"
            />
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
                  type="button"
                  onClick={() => setSosOpen(false)}
                  aria-label="Close emergency panel"
                  className="rounded-full p-2 text-ink-soft hover:bg-navy/5 transition-colors"
                >
                  <span className="leading-none text-lg">✕</span>
                </button>
              </div>

              <div className="px-5 py-5 space-y-5">
                <div className="rounded-xl bg-periwinkle/60 p-3 text-xs font-semibold text-ink-soft">
                  <Route size={13} className="inline mr-2 text-primary" />
                  TripSync uses your GPS, last known location, or trip fallback.
                </div>
                <div className="rounded-xl border border-critical/20 bg-critical-light/40 p-4 text-sm font-bold text-navy text-center">
                  SOS demonstrations are wired for the mobile navigation.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
