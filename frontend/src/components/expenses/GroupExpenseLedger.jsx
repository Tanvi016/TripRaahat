import { motion } from 'framer-motion';
import { DollarSign, Users, ArrowRight, ArrowLeft, Receipt, Home, CreditCard } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { groupMasterLedger } from '../../utils/expenseCalculations.js';
import { INR, recoveryPlans } from '../../utils/finance.js';

function LedgerRow({ label, value, sub, tone = 'navy' }) {
  const toneClass = {
    navy: 'text-navy',
    primary: 'text-primary',
    attention: 'text-attention',
    emerald: 'text-emerald',
    critical: 'text-critical',
  }[tone] || 'text-navy';

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-navy/5 p-3">
      <span className="text-sm text-ink-soft">{label}</span>
      <div className="text-right">
        <span className={`font-extrabold ${toneClass}`}>{value}</span>
        {sub && <span className="block text-[10px] text-ink-faint">{sub}</span>}
      </div>
    </div>
  );
}

export default function GroupExpenseLedger() {
  const { state } = useTrip();
  const ledger = groupMasterLedger(state);
  const phase = state.phase;
  const hasRecovery = state.appliedPlanId != null;

  const members = ledger.members || ledger.settlement?.members || [];
  const roomsList = Array.isArray(ledger.rooms)
    ? ledger.rooms
    : ledger.rooms?.rooms || ledger.roomSummary?.rooms || [];
  const totalRoomCost = ledger.totalRoomCost ?? ledger.rooms?.totalRoomCost ?? ledger.roomSummary?.totalRoomCost ?? 0;
  const settlements = ledger.settlements || ledger.settlement?.settlements || [];
  const settlement = ledger.settlement || { totalPaid: 0, totalShouldPay: 0, sumNet: 0 };

  const toneMap = {
    emerald: 'bg-emerald-light text-emerald',
    primary: 'bg-primary-soft text-primary',
    attention: 'bg-attention-light text-attention',
    critical: 'bg-critical-light text-critical',
    periwinkle: 'bg-periwinkle text-navy-soft',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="section-title">Group expense ledger</h2>
          <p className="text-sm text-ink-soft">
            {members.length} travelers · {roomsList.length} room{roomsList.length !== 1 ? 's' : ''} ·
            {(ledger.totalBookings || 0).toLocaleString('en-IN')} total bookings
          </p>
        </div>
        {hasRecovery && (
          <span className="chip bg-primary-soft text-primary">
            <DollarSign size={11} /> Recovery cost applied
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald mb-1">
            <Home size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Room cost</span>
          </div>
          <p className="text-2xl font-extrabold text-navy">{INR(totalRoomCost)}</p>
          <p className="text-xs text-ink-soft">
            {roomsList.length} room{roomsList.length !== 1 ? 's' : ''} · {roomsList.reduce((s, r) => s + (r.occupants?.length || 0), 0)} occupants
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-primary mb-1">
            <CreditCard size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Recovery extra</span>
          </div>
          <p className="text-2xl font-extrabold text-navy">
            {hasRecovery
              ? `+${INR(state.appliedPlanId ? (recoveryPlans.find(r => r.id === state.appliedPlanId)?.extraCost || 0) : 0)}`
              : '₹0'}
          </p>
          <p className="text-xs text-ink-soft">
            {ledger.affectedCount} traveler{ledger.affectedCount !== 1 ? 's' : ''} affected
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald mb-1">
            <Receipt size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Total paid</span>
          </div>
          <p className="text-2xl font-extrabold text-navy">{INR(settlement.totalPaid)}</p>
          <p className="text-xs text-ink-soft">
            By {members.length} travelers
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-attention mb-1">
            <DollarSign size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Total should pay</span>
          </div>
          <p className="text-2xl font-extrabold text-navy">{INR(settlement.totalShouldPay)}</p>
          <p className="text-xs text-ink-soft">
            Including recovery costs
          </p>
        </div>
      </div>

      {/* Settlement reconciliation badge */}
      {settlement.sumNet === 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-light/60 p-3 text-sm font-semibold text-emerald">
          <Receipt size={15} />
          Ledger reconciled · Net balance = ₹0 · All settlements add up
        </div>
      )}

      {/* Settlement matrix */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-navy flex items-center gap-2">
            <ArrowLeft size={16} className="text-primary" /> Settlement matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy/5 text-xs font-bold uppercase tracking-wide text-ink-faint">
                <th className="px-3 py-2">Who</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Should pay</th>
                <th className="px-3 py-2">Net balance</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isOwed = m.status === 'owed';
                const isOwes = m.status === 'owes';
                const isSettled = m.status === 'settled';

                return (
                  <tr key={m.id} className="border-b border-navy/5 last:border-0 hover:bg-periwinkle/30">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${m.affected ? 'bg-attention-light text-attention' : 'bg-primary-soft text-primary'}`}>
                          {m.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-navy text-sm">{m.name}</p>
                          {m.affected && <p className="text-[10px] text-attention">Affected · recovery cost</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums font-semibold text-navy">
                      {INR(m.paid)}
                    </td>
                    <td className="px-3 py-3 tabular-nums font-semibold text-navy">
                      {INR(m.shouldPay)}
                    </td>
                    <td className={`px-3 py-3 tabular-nums font-extrabold ${isOwed ? 'text-emerald' : isOwes ? 'text-attention' : 'text-emerald'}`}>
                      {m.netBalance > 0 ? `+${INR(m.netBalance)}` : m.netBalance < 0 ? `${INR(m.netBalance)}` : '₹0'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`chip ${isOwed ? 'bg-emerald-light text-emerald' : isOwes ? 'bg-attention-light text-attention' : 'bg-emerald-light text-emerald'}`}>
                        {isOwed ? 'Others owe them' : isOwes ? 'They owe others' : 'Settled'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Settlement arrows */}
        {settlements && settlements.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Settlements</p>
            <div className="grid gap-2">
              {settlements.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-navy/5 p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold text-navy">{s.fromName}</span>
                    <ArrowRight size={12} className="text-ink-faint shrink-0" />
                    <span className="text-sm font-bold text-navy">{s.toName}</span>
                  </div>
                  <span className="font-extrabold text-attention tabular-nums">
                    {INR(s.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Room assignments */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Home size={16} className="text-success" />
          <h3 className="text-base font-bold text-navy">Room assignments</h3>
        </div>

        <div className="space-y-3">
          {roomsList.map((room) => (
            <div key={room.roomId} className="rounded-xl border border-navy/5 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-navy">{room.roomId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h4>
                    <span className="chip bg-primary-soft text-primary text-[10px]">
                      {room.splitCount} occupant{room.splitCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {room.occupants.map((name) => (
                      <span key={name} className="chip bg-periwinkle text-navy-soft text-xs">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-navy">{INR(room.totalCost)}</p>
                  <p className="text-[10px] text-ink-faint">
                    {INR(room.perPerson)} per person
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {roomsList.length === 0 && (
          <p className="text-sm text-ink-soft text-center py-4">
            No room assignments configured for this trip.
          </p>
        )}
      </section>
    </div>
  );
}
