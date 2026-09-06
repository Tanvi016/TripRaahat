import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  AlarmClock,
  ArrowRight,
  CheckCircle2,
  Compass,
  FileText,
  Hotel,
  LifeBuoy,
  Plane,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { useTrip } from '../context/TripContext.jsx';
import { currentTripMeta } from '../data/demoTrip.js';

/* ---------------------------- helpers ---------------------------- */

function Section({ id, children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id={id} ref={ref} className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </section>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const STEPS = [
  { Icon: Route, title: 'Understand trip', text: 'Every booking you made — connected in one view.' },
  { Icon: Plane, title: 'Detect change', text: 'The moment a flight or train changes, you know.' },
  { Icon: Compass, title: 'Find options', text: 'Recovery plans across flights, trains and hotels.' },
  { Icon: ShieldCheck, title: 'Protect money', text: 'Deadline Guard saves your refunds automatically.' },
  { Icon: CheckCircle2, title: 'Rebuild itinerary', text: 'One tap updates the whole journey.' },
];

const DIFFERENTIATORS = [
  { Icon: Route, title: 'Connected recovery', text: 'Fix every booking a cancellation touches — not just the flight.' },
  { Icon: AlarmClock, title: 'Deadline protection', text: "Don't miss your refund — we watch every window for you." },
  { Icon: Users, title: 'Group recovery', text: 'One traveler re-plans while the rest of the group continues.' },
  { Icon: FileText, title: 'Secure documents', text: 'Tickets, hotels, insurance — safe and ready when you need them.' },
  { Icon: WifiOff, title: 'Offline support', text: 'Saved trip info keeps working without a signal.' },
];

/* ------------------------- mini demo state ------------------------- */

const DEMO_STAGES = [
  { id: 'confirmed', label: 'Bookings confirmed', tone: 'bg-emerald-light text-emerald' },
  { id: 'cancelled', label: 'Flight cancelled', tone: 'bg-critical-light text-critical' },
  { id: 'affected', label: 'Connected bookings at risk', tone: 'bg-attention-light text-attention' },
  { id: 'options', label: '3 recovery options found', tone: 'bg-primary-soft text-primary' },
  { id: 'recovered', label: 'Trip recovered', tone: 'bg-emerald-light text-emerald' },
];

function DemoStage({ stage }) {
  if (stage === 'confirmed' || stage === 'recovered') {
    return (
      <div className="space-y-2">
        {[
          { Icon: Plane, label: 'AI-123 · 8:30 AM', sub: 'Mumbai → Delhi' },
          { Icon: Hotel, label: 'Mountain View Residency', sub: '12–16 Sep' },
          { Icon: Ticket, label: 'Solang Valley Adventure', sub: '14 Sep' },
        ].map((b) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-light text-emerald">
              <b.Icon size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-navy">{b.label}</span>
              <span className="block text-[11px] text-ink-soft">{b.sub}</span>
            </span>
            <CheckCircle2 size={15} className="text-emerald" />
          </motion.div>
        ))}
      </div>
    );
  }
  if (stage === 'cancelled') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl bg-critical-light/70 p-4">
        <p className="flex items-center gap-2 text-sm font-extrabold text-critical">
          <XCircle size={17} /> Your flight was cancelled
        </p>
        <p className="mt-1 text-xs text-navy-soft">AI-123 from Mumbai to Delhi was cancelled.</p>
      </motion.div>
    );
  }
  if (stage === 'affected') {
    return (
      <div className="space-y-2">
        {[
          { Icon: Route, label: 'Airport transfer', sub: 'At risk' },
          { Icon: Hotel, label: 'Hotel check-in', sub: 'At risk' },
          { Icon: AlarmClock, label: 'Refund deadline · 10h 42m', sub: '₹6,500' },
        ].map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-attention-light text-attention">
              <b.Icon size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-navy">{b.label}</span>
              <span className="block text-[11px] text-ink-soft">{b.sub}</span>
            </span>
            <span className="chip bg-attention-light text-attention">Watch</span>
          </motion.div>
        ))}
      </div>
    );
  }
  // options
  return (
    <div className="space-y-2">
      {[
        { tag: 'FASTEST', text: '2:15 PM flight · +₹2,400 · hotel works' },
        { tag: 'SAVE MONEY', text: '5:30 PM train · +₹1,100 · hotel works' },
        { tag: 'NEXT MORNING', text: '6:00 AM · free · ₹7,200 refund' },
      ].map((p, i) => (
        <motion.div
          key={p.tag}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
          className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card"
        >
          <span className="chip shrink-0 bg-primary-soft text-primary">{p.tag}</span>
          <span className="text-[11px] font-semibold text-navy-soft">{p.text}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------------------- page ---------------------------- */

export default function Landing() {
  const navigate = useNavigate();
  const { dispatch } = useTrip();
  const reduced = useReducedMotion();
  const [stage, setStage] = useState('confirmed');
  const [playing, setPlaying] = useState(false);
  const demoRef = useRef(null);
  const demoInView = useInView(demoRef, { once: true, margin: '-120px' });

  const stageIndex = DEMO_STAGES.findIndex((s) => s.id === stage);

  const play = () => {
    setStage('confirmed');
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    const order = ['confirmed', 'cancelled', 'affected', 'options', 'recovered'];
    const timers = order.map((s, i) =>
      setTimeout(() => {
        setStage(s);
        if (i === order.length - 1) setPlaying(false);
      }, reduced ? 300 : 1400 + i * 1900)
    );
    return () => timers.forEach(clearTimeout);
  }, [playing, reduced]);

  const startInApp = () => {
    dispatch({ type: 'REPORT_DISRUPTION' });
    navigate('/app');
  };

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Nav */}
      <header className="glass sticky top-0 z-40 border-b border-navy/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Plane size={17} />
            </span>
            <span className="text-base font-extrabold text-navy">TripSync</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-navy-soft md:flex">
            <a href="#how" className="hover:text-primary">How it works</a>
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#demo" className="hover:text-primary">See the demo</a>
          </nav>
          <Link to="/app" className="btn-primary px-4 py-2 text-sm">
            Open TripSync <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <Section className="pt-14 pb-10 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
            <motion.span variants={fadeUp} className="chip bg-primary-soft text-primary">
              <Sparkles size={12} /> One trip · every booking · one recovery
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-6xl"
            >
              When travel changes,
              <span className="text-primary"> TripSync </span>
              changes with you.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 max-w-md text-base text-ink-soft sm:text-lg">
              Recover your entire journey — not just the booking that went wrong.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
              <Link to="/app" className="btn-primary px-6 py-3 text-base">
                Explore TripSync <ArrowRight size={17} />
              </Link>
              <a href="#demo" className="btn-secondary px-6 py-3 text-base">
                See how it works
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-ink-soft">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald" /> Free rebooking</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald" /> Refund protection</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald" /> Group aware</span>
            </motion.div>
          </motion.div>

          {/* Trip preview card — mobile-native vertical stack on small screens, 3D phone on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto w-full max-w-md"
            aria-hidden="true"
          >
            {/* Mobile: vertical card stack — no 3D transform, no fixed width, no absolute floating cards */}
            <div className="lg:hidden space-y-3">
              {[
                { Icon: Plane, label: 'Flight AI-123', sub: 'Mumbai → Delhi · 8:30 AM', tone: 'bg-primary-soft text-primary' },
                { Icon: Hotel, label: 'Mountain View Residency', sub: 'Manali · 12–16 Sep', tone: 'bg-success-light text-success' },
                { Icon: Ticket, label: 'Solang Valley Adventure', sub: 'Paragliding + zipline · 14 Sep', tone: 'bg-emerald-light text-emerald' },
              ].map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-card"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${b.tone}`}>
                    <b.Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-navy">{b.label}</span>
                    <span className="block text-[11px] text-ink-soft">{b.sub}</span>
                  </span>
                  <CheckCircle2 size={15} className="shrink-0 text-emerald" />
                </motion.div>
              ))}
              <div className="rounded-xl bg-periwinkle/60 p-3 text-xs font-semibold text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald" />
                  All {currentTripMeta.travelers} bookings confirmed · {currentTripMeta.datesLabel}
                </span>
              </div>
            </div>

            {/* Desktop: 3D phone mockup + floating cards — unchanged from original */}
            <div className="hidden lg:block relative mx-auto w-full max-w-md [perspective:1200px]">
              <motion.div
                animate={reduced ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto w-[240px] rounded-[2.4rem] border-[6px] border-navy bg-white shadow-float sm:w-[260px]"
                style={{ transform: 'rotateY(-8deg) rotateX(4deg)' }}
              >
                <div className="rounded-[2rem] bg-gradient-to-b from-primary to-primary-light p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Current trip</p>
                  <p className="mt-1 text-lg font-extrabold">{currentTripMeta.title}</p>
                  <p className="text-[11px] opacity-90">{currentTripMeta.datesLabel}</p>
                  <div className="mt-3 space-y-1.5 rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
                    <p className="flex justify-between text-[11px] font-semibold"><span>AI-123</span><span>8:30 AM ✓</span></p>
                    <p className="flex justify-between text-[11px] font-semibold"><span>Mountain View Residency</span><span>✓</span></p>
                    <p className="flex justify-between text-[11px] font-semibold"><span>Solang Adventure</span><span>✓</span></p>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-white/15 p-2.5 text-[10px] font-bold">
                    <span>All bookings confirmed</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse-dot" />
                  </div>
                </div>
              </motion.div>

              {[
                { Icon: Plane, label: 'Flight AI-123', cls: 'bg-white text-primary', pos: 'left-0 top-6 -rotate-6' },
                { Icon: Hotel, label: 'Hotel booking', cls: 'bg-white text-success', pos: 'right-0 top-0 rotate-6' },
                { Icon: AlarmClock, label: 'Refund deadline', cls: 'bg-white text-attention', pos: 'left-2 bottom-16 -rotate-3' },
                { Icon: Ticket, label: 'Solang Valley', cls: 'bg-white text-emerald', pos: 'right-2 bottom-4 rotate-2' },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className={`absolute ${c.pos}`}
                >
                  <motion.div
                    animate={reduced ? {} : { y: [0, -8, 0] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow-float backdrop-blur-md"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.cls.split(' ').slice(1).join(' ')}`}>
                      <c.Icon size={15} />
                    </span>
                    <span className="text-xs font-bold text-navy">{c.label}</span>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Problem */}
      <Section className="py-14">
        <div className="card mx-auto max-w-3xl p-8 text-center">
          <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">
            Travel disruptions rarely affect just one booking.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            A cancelled flight doesn't stop at the airport. It hits your transfer, your hotel check-in,
            your activities — and your money. TripSync sees the whole journey and recovers it together.
          </p>
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" className="py-10">
        <h2 className="text-center text-2xl font-extrabold text-navy sm:text-3xl">How TripSync works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(({ Icon, title, text }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              custom={i}
              viewport={{ once: true, margin: '-60px' }}
              className="card relative p-5"
            >
              <span className="absolute right-4 top-4 text-2xl font-extrabold text-periwinkle-deep">0{i + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 text-sm font-extrabold text-navy">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Differentiators */}
      <Section id="features" className="py-10">
        <h2 className="text-center text-2xl font-extrabold text-navy sm:text-3xl">
          Built for the whole journey
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map(({ Icon, title, text }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              custom={i}
              viewport={{ once: true, margin: '-60px' }}
              className="card p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-light text-success">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-base font-extrabold text-navy">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</p>
            </motion.div>
          ))}
          <div className="card flex flex-col items-start justify-center bg-gradient-to-br from-primary to-primary-light p-6 text-white">
            <LifeBuoy size={24} />
            <h3 className="mt-3 text-base font-extrabold">Recover the journey, not just the booking.</h3>
            <Link to="/app" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-primary">
              Explore TripSync <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </Section>

      {/* Interactive demo */}
      <Section id="demo" className="py-10">
        <div ref={demoRef} className="card overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold sm:text-3xl">See it recover</h2>
                <p className="mt-1 text-sm text-white/85">
                  Watch a cancellation ripple through Tanvi's trip — and TripSync rebuild it.
                </p>
              </div>
              <button
                onClick={play}
                disabled={playing}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-primary disabled:opacity-70"
              >
                {playing ? <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> : <Play size={15} />}
                {playing ? 'Playing…' : 'Play the demo'}
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[220px_1fr]">
            {/* Timeline */}
            <div className="relative space-y-0 border-l-2 border-navy/10 pl-5">
              {DEMO_STAGES.map((s, i) => (
                <div key={s.id} className="relative pb-5 last:pb-0">
                  <span
                    className={`absolute -left-[27px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white shadow ${
                      i <= stageIndex ? 'bg-primary' : 'bg-navy/15'
                    }`}
                  />
                  <p className={`text-xs font-bold ${i <= stageIndex ? 'text-navy' : 'text-ink-faint'}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Stage panel */}
            <div className="min-h-[240px] rounded-2xl bg-periwinkle/60 p-4 sm:p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <DemoStage stage={stage} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/5 bg-periwinkle/40 px-6 py-4 sm:px-8">
            <p className="text-xs text-ink-soft">
              {stage === 'recovered'
                ? "That's the whole demo — a cancelled flight, three options, one tap, trip recovered."
                : demoInView && !playing
                  ? 'Press play — or jump straight into the working app with the demo scenario loaded.'
                  : 'This is the same flow that runs in the real TripSync app.'}
            </p>
            <button onClick={startInApp} className="btn-primary text-sm">
              Start the demo in TripSync <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="py-16">
        <div className="relative overflow-hidden rounded-3xl bg-navy p-10 text-center text-white sm:p-14">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-emerald/30 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">
            Recover the journey, not just the booking.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/75">
            One trip. Every booking. One intelligent recovery.
          </p>
          <Link to="/app" className="btn-primary relative mt-7 px-7 py-3 text-base !bg-white !text-primary hover:!bg-periwinkle">
            Explore TripSync <ArrowRight size={17} />
          </Link>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-navy/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-xs text-ink-faint sm:px-8">
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white"><Plane size={12} /></span>
            TripSync · HackCelestial 2026 · Demo build
          </span>
          <span>One trip. Every booking. One intelligent recovery.</span>
        </div>
      </footer>
    </div>
  );
}