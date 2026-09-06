import { ArrowDownRight, ArrowUpRight, Receipt, ShieldAlert, Wallet } from 'lucide-react';
import { computeFinance, formatInr } from '../utils/finance.js';
import { useTrip } from '../context/TripContext.jsx';

function Stat({ icon: Icon, label, value, tone = 'navy', sub }) {
  const tones = {
    navy: 'text-navy',
    primary: 'text-primary',
    attention: 'text-attention',
    emerald: 'text-emerald',
    critical: 'text-critical',
  };
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-periwinkle">
        <Icon size={18} className={tones[tone]} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink-faint">{label}</p>
        <p className={`truncate text-lg font-extrabold ${tones[tone]}`}>{value}</p>
        {sub && <p className="truncate text-[11px] text-ink-faint">{sub}</p>}
      </div>
    </div>
  );
}

export default function FinancePanel() {
  const { state } = useTrip();
  const f = computeFinance(state);
  const recovered = state.phase === 'recovered';

  return (
    <section aria-label="Trip finances">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">Your money</h2>
        <span className="text-xs font-medium text-ink-faint">Trip budget in ₹</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Wallet} label="Budget" value={formatInr(f.budget)} sub="Total trip budget" />
        <Stat icon={Receipt} label="Spent so far" value={formatInr(f.spent)} sub={recovered ? 'Includes recovery cost' : 'All bookings paid'} />
        {recovered ? (
          <>
            <Stat icon={ArrowDownRight} label="Money lost" value={formatInr(f.lost)} tone="attention" sub={f.lost ? 'Recovery extra cost' : 'Nothing lost'} />
            <Stat icon={ArrowUpRight} label="Money saved" value={formatInr(f.saved)} tone="emerald" sub={f.saved ? 'Refund coming back' : 'No refund in this plan'} />
          </>
        ) : (
          <>
            <Stat
              icon={ShieldAlert}
              label="At risk"
              value={formatInr(f.atRisk)}
              tone={f.atRisk ? 'attention' : 'emerald'}
              sub={f.atRisk ? 'If you miss the refund deadline' : 'Nothing at risk'}
            />
            <Stat icon={Wallet} label="Left in budget" value={formatInr(f.remaining)} tone={f.remaining >= 0 ? 'emerald' : 'critical'} sub="After refunds & recovery" />
          </>
        )}
      </div>
    </section>
  );
}