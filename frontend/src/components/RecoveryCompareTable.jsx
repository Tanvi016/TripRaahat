import { recoveryPlans } from '../data/demoTrip.js';
import { formatInr } from '../utils/finance.js';
import StatusChip from './StatusChip.jsx';

export default function RecoveryCompareTable() {
  return (
    <div className="card overflow-x-auto p-2">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-navy/5 text-xs font-bold uppercase tracking-wide text-ink-faint">
            <th className="px-3 py-3">Option</th>
            <th className="px-3 py-3">Leaves</th>
            <th className="px-3 py-3">Arrives</th>
            <th className="px-3 py-3">Duration</th>
            <th className="px-3 py-3">Extra cost</th>
            <th className="px-3 py-3">Refund</th>
            <th className="px-3 py-3">Hotel</th>
            <th className="px-3 py-3">Convenience</th>
          </tr>
        </thead>
        <tbody>
          {recoveryPlans.map((p) => (
            <tr key={p.id} className="border-b border-navy/5 last:border-0 hover:bg-periwinkle/50">
              <td className="px-3 py-3 font-bold text-navy">{p.tag}</td>
              <td className="px-3 py-3 tabular-nums text-navy-soft">{p.depTime}</td>
              <td className="px-3 py-3 tabular-nums text-navy-soft">{p.arrTime}</td>
              <td className="px-3 py-3 text-navy-soft">{p.duration}</td>
              <td className="px-3 py-3 tabular-nums font-semibold text-navy">
                {p.extraCost ? `+${formatInr(p.extraCost)}` : 'Free'}
              </td>
              <td className="px-3 py-3 tabular-nums text-navy">
                {p.refund ? formatInr(p.refund) : '—'}
              </td>
              <td className="px-3 py-3">
                <StatusChip status={p.hotelStatus === 'works' ? 'confirmed' : 'changed'} />
              </td>
              <td className="px-3 py-3 text-navy-soft">{p.convenience}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}