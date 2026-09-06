import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useTrip } from '../context/TripContext.jsx';

const KIND_META = {
  success: { Icon: CheckCircle2, className: 'border-emerald/30 bg-white text-navy' },
  attention: { Icon: AlertTriangle, className: 'border-attention/40 bg-white text-navy' },
  critical: { Icon: XCircle, className: 'border-critical/40 bg-white text-navy' },
  info: { Icon: Info, className: 'border-primary/30 bg-white text-navy' },
};

function ToastItem({ toast, onDismiss }) {
  const { Icon, className } = KIND_META[toast.kind] || KIND_META.info;
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
      className={`pointer-events-auto relative flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border p-4 shadow-float ${className}`}
      role="status"
    >
      <Icon size={20} className={toast.kind === 'success' ? 'text-emerald' : toast.kind === 'critical' ? 'text-critical' : toast.kind === 'attention' ? 'text-attention' : 'text-primary'} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-sm text-ink-soft">{toast.message}</p>}
      </div>
      <button onClick={onDismiss} aria-label="Dismiss notification" className="rounded-full p-1 text-ink-faint hover:bg-navy/5">
        <X size={15} />
      </button>
    </motion.div>
  );
}

export default function Toasts() {
  const { state, dispatch } = useTrip();
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-3">
      <AnimatePresence>
        {state.toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dispatch({ type: 'DISMISS_TOAST', id: t.id })} />
        ))}
      </AnimatePresence>
    </div>
  );
}