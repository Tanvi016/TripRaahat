import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlarmClock,
  Bot,
  ChevronLeft,
  FileText,
  Home,
  LifeBuoy,
  List,
  Plane,
  Route,
  Users,
  Wallet,
  Wifi,
  WifiOff,
  Siren,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';

const SIDE_NAV = [
  { to: '/app/finance', label: 'Finance', Icon: Wallet },
  { to: '/app/trip', label: 'My Trip', Icon: Route },
  { to: '/app/recovery', label: 'Recovery', Icon: LifeBuoy },
  { to: '/app/group', label: 'Your Group', Icon: Users },
  { to: '/app/documents', label: 'Documents', Icon: FileText },
  { to: '/app/deadlines', label: 'Deadlines', Icon: AlarmClock },
  { to: '/app/assistant', label: 'Assistant', Icon: Bot },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { state, dispatch } = useTrip();
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!menuRef.current) return;
    const el = menuRef.current;
    const handleOutside = (e) => {
      if (!el.contains(e.target)) {
        setCollapsed(true);
      }
    };
    let raf;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(handleOutside);
    };
    window.addEventListener('pointerdown', schedule, true);
    return () => {
      window.removeEventListener('pointerdown', schedule, true);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Persistent mobile menu button */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="fixed bottom-20 left-4 z-40 lg:hidden rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
        aria-expanded={!collapsed}
        aria-label={!collapsed ? 'Close navigation menu' : 'Open navigation menu'}
      >
        <List size={16} className="inline mr-2" />
        {!collapsed ? 'Close' : 'Menu'}
      </button>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden lg:flex h-screen shrink-0 flex-col border-r border-navy/5 glass transition-[width] duration-300 ${
          collapsed ? 'w-[78px]' : 'w-64'
        }`}
        aria-label="Main navigation"
      >
        <NavLink
          to="/"
          title="Back to TripSync home"
          className={`flex items-center gap-2.5 px-5 py-5 ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Plane size={18} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-tight text-navy">TripSync</p>
              <p className="truncate text-[11px] text-ink-faint">One trip · every booking</p>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`mx-3 mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-ink-soft hover:bg-navy/5 transition-colors ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={15} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && 'Collapse'}
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {[
            { to: '/app', label: 'Home', Icon: Home, end: true },
            { to: '/app/finance', label: 'Finance', Icon: Wallet },
            { to: '/app/trip', label: 'My Trip', Icon: Route },
            { to: '/app/recovery', label: 'Recovery Center', Icon: LifeBuoy },
            { to: '/app/group', label: 'Your Group', Icon: Users },
            { to: '/app/documents', label: 'Documents', Icon: FileText },
            { to: '/app/deadlines', label: 'Deadlines', Icon: AlarmClock },
            { to: '/app/assistant', label: 'Assistant', Icon: Bot },
          ].map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  collapsed ? 'justify-center px-0' : ''
                } ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-navy-soft hover:bg-navy/5 hover:text-navy'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-b border-navy/5 p-3">
          <button
            onClick={() => dispatch({ type: 'REQUEST_SOS_OPEN' })}
            title="Open emergency assistance"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            } bg-critical text-white hover:bg-critical/90`}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-pulse-dot bg-white" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            {!collapsed && (
              <span className="flex-1 text-left">
                <Siren size={14} className="inline mr-1" />
                SOS Emergency
                <span className="block text-[10px] font-medium opacity-75">Emergency assistance</span>
              </span>
            )}
          </button>
        </div>

        <div className="border-t border-navy/5 p-3">
          <button
            onClick={() => dispatch({ type: 'SET_OFFLINE', offline: !state.offline })}
            title="Toggle simulated offline mode (demo)"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            } ${state.offline ? 'bg-critical-light text-critical' : 'bg-emerald-light text-emerald'}`}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-pulse-dot ${
                  state.offline ? 'bg-critical' : 'bg-emerald'
                }`}
              />
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${state.offline ? 'bg-critical' : 'bg-emerald'}`} />
            </span>
            {!collapsed && (
              <span className="flex-1 text-left">
                {state.offline ? 'Offline' : 'Online'}
                <span className="block text-[10px] font-medium opacity-70">
                  {state.offline ? 'Saved trip info' : 'Live updates on'}
                </span>
              </span>
            )}
          </button>
          {!collapsed && (
            <p className="mt-2 flex items-center gap-1.5 px-3 text-[10px] text-ink-faint">
              {state.offline ? <WifiOff size={11} /> : <Wifi size={11} />}
              Tap to {state.offline ? 'go online' : 'simulate offline'} (demo)
            </p>
          )}
        </div>

        <motion.div layout className="sr-only" />
      </aside>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {!collapsed && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-navy/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCollapsed(true)}
              aria-hidden="true"
            />
            <motion.nav
              ref={menuRef}
              className="fixed left-0 top-0 z-50 h-full w-72 max-w-full bg-white shadow-float lg:hidden"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              transition={{ type: 'tween', duration: 0.22 }}
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-navy/5 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                    <Plane size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold tracking-tight text-navy">TripSync</p>
                    <p className="truncate text-[11px] text-ink-faint">One trip · every booking</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="rounded-full p-2 text-ink-soft hover:bg-navy/5"
                  aria-label="Close navigation menu"
                >
                  <ChevronLeft size={18} className="rotate-180" />
                </button>
              </div>

              <div className="border-b border-navy/5 px-3 py-3">
                <NavLink
                  to="/app"
                  end
                  onClick={() => setCollapsed(true)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-primary text-white shadow-sm' : 'text-navy-soft hover:bg-navy/5 hover:text-navy'
                    }`
                  }
                >
                  <Home size={18} className="shrink-0" />
                  <span className="truncate">Home</span>
                </NavLink>
              </div>

              <div className="space-y-1 overflow-y-auto px-3 pb-4">
                {SIDE_NAV.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setCollapsed(true)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive ? 'bg-primary text-white shadow-sm' : 'text-navy-soft hover:bg-navy/5 hover:text-navy'
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="border-t border-navy/5 p-3">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'REQUEST_SOS_OPEN' });
                    setCollapsed(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl bg-critical px-3 py-2.5 text-sm font-semibold text-white hover:bg-critical/90"
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-pulse-dot bg-white" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                  <span className="flex-1 text-left">
                    <Siren size={14} className="inline mr-1" />
                    SOS Emergency
                    <span className="block text-[10px] font-medium opacity-75">Emergency assistance</span>
                  </span>
                </button>
              </div>

              <div className="border-t border-navy/5 p-3">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_OFFLINE', offline: !state.offline });
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    state.offline ? 'bg-critical-light text-critical' : 'bg-emerald-light text-emerald'
                  }`}
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-pulse-dot ${
                        state.offline ? 'bg-critical' : 'bg-emerald'
                      }`}
                    />
                    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${state.offline ? 'bg-critical' : 'bg-emerald'}`} />
                  </span>
                  <span className="flex-1 text-left">
                    {state.offline ? 'Offline' : 'Online'}
                    <span className="block text-[10px] font-medium opacity-70">
                      {state.offline ? 'Saved trip info' : 'Live updates on'}
                    </span>
                  </span>
                </button>
                <p className="mt-2 flex items-center gap-1.5 px-3 text-[10px] text-ink-faint">
                  {state.offline ? <WifiOff size={11} /> : <Wifi size={11} />}
                  Tap to {state.offline ? 'go online' : 'simulate offline'} (demo)
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
