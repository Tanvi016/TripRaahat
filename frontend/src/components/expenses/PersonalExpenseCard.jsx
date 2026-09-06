import { useState } from 'react';
import { Wallet, Receipt, ShieldAlert, ArrowDownRight, ArrowUpRight, Home, DollarSign } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { personalExpenses, settlementMatrix } from '../../utils/expenseCalculations.js';
import { INR } from '../../utils/finance.js';

function Stat({ icon: Icon, label, value, tone = 'navy', sub }) {
  const toneClass = {
    navy: 'text-navy',
    primary: 'text-primary',
    attention: 'text-attention',
    emerald: 'text-emerald',
    critical: 'text-critical',
  }[tone] || 'text-navy';

  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-periwinkle">
        <Icon size={18} className={toneClass} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink-faint">{label}</p>
        <p className={`truncate text-lg font-extrabold ${toneClass}`}>{value}</p>
        {sub && <p className="truncate text-[11px] text-ink-faint">{sub}</p>}
      </div>
    </div>
  );
}

export default function PersonalExpenseCard() {
  const { state } = useTrip();
  const [activeTab, setActiveTab] = useState('overview');
  const memberId = state.travelerId || 'tanvi';
  const expenses = personalExpenses(memberId, state);
  const settlement = settlementMatrix(state);
  const mySettlement = settlement.members.find((m) => m.id === memberId);

  if (!expenses) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-ink-soft">Personal expense data not available for this traveler.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'breakdown', label: 'Breakdown' },
    { id: 'settlement', label: 'Settlement' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Wallet size={16} className="text-primary" />
          Your expenses
        </h2>
        <p className="text-sm text-ink-soft">
          {expenses.memberName}'s personal financial overview for this trip.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-navy/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-faint hover:text-navy-soft'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={Wallet}
            label="Personal budget"
            value={INR(expenses.total)}
            sub="Your total trip cost"
          />
          <Stat
            icon={Receipt}
            label="Bookings (base)"
            value={INR(expenses.personalBase)}
            sub="Flight + activity share"
          />
          <Stat
            icon={Home}
            label="Room cost share"
            value={expenses.roomShare ? `+${INR(expenses.roomShare)}` : '₹0'}
            tone={expenses.roomShare > 0 ? 'primary' : 'emerald'}
            sub="Shared room split"
          />
          <Stat
            icon={DollarSign}
            label="Recovery cost"
            value={expenses.recoveryCost ? `+${INR(expenses.recoveryCost)}` : '₹0'}
            tone={expenses.recoveryCost > 0 ? 'attention' : 'emerald'}
            sub={expenses.recoveryCost > 0 ? 'Recovery extra cost' : 'No recovery cost'}
          />

          {/* Net position */}
          <div className="col-span-2 card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink-faint">Your net position</p>
                <p className={`text-3xl font-extrabold ${mySettlement && mySettlement.netBalance > 0 ? 'text-emerald' : mySettlement && mySettlement.netBalance < 0 ? 'text-attention' : 'text-navy'}`}>
                  {mySettlement && mySettlement.netBalance > 0
                    ? `+${INR(mySettlement.netBalance)}`
                    : mySettlement && mySettlement.netBalance < 0
                      ? `${INR(mySettlement.netBalance)}`
                      : '₹0'}
                </p>
                <p className="text-xs text-ink-soft mt-1">
                  {mySettlement && mySettlement.status === 'owed'
                    ? 'Others owe you — you overpaid'
                    : mySettlement && mySettlement.status === 'owes'
                      ? 'You owe others — you underpaid'
                      : 'Your share is exactly settled'}
                </p>
              </div>
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${mySettlement && mySettlement.netBalance > 0 ? 'bg-emerald-light text-emerald' : mySettlement && mySettlement.netBalance < 0 ? 'bg-attention-light text-attention' : 'bg-periwinkle text-navy'}`}>
                {mySettlement && mySettlement.netBalance > 0 ? <ArrowUpRight size={24} /> : mySettlement && mySettlement.netBalance < 0 ? <ArrowDownRight size={24} /> : <Wallet size={24} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div className="card p-5 space-y-4">
          <h3 className="text-base font-bold text-navy">Cost breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-navy/5">
              <span className="text-ink-soft">Base trip bookings (flight + activity share)</span>
              <span className="font-bold text-navy">{INR(expenses.personalBase)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-navy/5">
              <span className="text-ink-soft">Room cost share ({expenses.roomShare > 0 ? 'shared' : 'none'})</span>
              <span className="font-bold text-navy">{expenses.roomShare ? INR(expenses.roomShare) : '₹0'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-navy/5">
              <span className="text-ink-soft">
                Recovery extra cost
                {expenses.recoveryCost > 0 && <span className="text-attention ml-1 chip bg-attention-light text-attention text-[10px]">affected traveler</span>}
              </span>
              <span className={`font-bold ${expenses.recoveryCost > 0 ? 'text-attention' : 'text-emerald'}`}>
                {expenses.recoveryCost ? `+${INR(expenses.recoveryCost)}` : '₹0'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t border-navy/5 font-extrabold text-navy">
              <span className="text-base">Total personal cost</span>
              <span className="text-lg">{INR(expenses.total)}</span>
            </div>
          </div>

          {/* Mini pie visualization */}
          <div className="rounded-xl bg-periwinkle/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-3">Cost composition</p>
            <div className="flex h-3 w-full rounded-full overflow-hidden">
              {(() => {
                const base = expenses.personalBase;
                const room = expenses.roomShare;
                const recovery = expenses.recoveryCost;
                const total = base + room + recovery || 1;
                const p1 = (base / total) * 100;
                const p2 = (room / total) * 100;
                const p3 = (recovery / total) * 100;
                return (
                  <>
                    <div style={{ width: `${p1}%`, background: '#0c1f4a' }} title={`Base: ${INR(base)}`} />
                    <div style={{ width: `${p2}%`, background: '#0284c7' }} title={`Room: ${INR(room)}`} />
                    <div style={{ width: `${p3}%`, background: '#f59e0b' }} title={`Recovery: ${INR(recovery)}`} />
                  </>
                );
              })()}
            </div>
            <div className="mt-2 flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0c1f4a]" /> Base</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0284c7]" /> Room</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Recovery</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settlement' && (
        <div className="card p-5 space-y-4">
          <h3 className="text-base font-bold text-navy flex items-center gap-2">
            <DollarSign size={16} className="text-primary" /> Settlement
          </h3>

          {/* Your position */}
          <div className={`rounded-xl p-4 ${mySettlement && mySettlement.netBalance > 0 ? 'bg-emerald-light/60' : mySettlement && mySettlement.netBalance < 0 ? 'bg-attention-light/60' : 'bg-periwinkle/40'}`}>
            <p className="text-sm font-bold text-navy">Your position</p>
            <p className={`text-2xl font-extrabold mt-1 ${mySettlement && mySettlement.netBalance > 0 ? 'text-emerald' : mySettlement && mySettlement.netBalance < 0 ? 'text-attention' : 'text-navy'}`}>
              {mySettlement && mySettlement.netBalance > 0 ? `+${INR(mySettlement.netBalance)}` : mySettlement && mySettlement.netBalance < 0 ? `${INR(mySettlement.netBalance)}` : '₹0'}
            </p>
            <p className="text-xs text-ink-soft mt-0.5">
              {mySettlement && mySettlement.status === 'owed' ? 'Others owe you money' : mySettlement && mySettlement.status === 'owes' ? 'You owe others money' : 'You are settled'}
            </p>
          </div>

          {/* All members */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/5 text-xs font-bold uppercase tracking-wide text-ink-faint">
                  <th className="px-3 py-2">Traveler</th>
                  <th className="px-3 py-2">Paid</th>
                  <th className="px-3 py-2">Should pay</th>
                  <th className="px-3 py-2">Net</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {settlement.members.map((m) => (
                  <tr key={m.id} className={`border-b border-navy/5 last:border-0 ${m.id === memberId ? 'bg-primary-soft/30' : 'hover:bg-periwinkle/20'}`}>
                    <td className="px-3 py-2">
                      <span className={`font-bold ${m.id === memberId ? 'text-primary' : 'text-navy'}`}>
                        {m.name}{m.id === memberId && ' (you)'}
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums font-semibold text-navy">{INR(m.paid)}</td>
                    <td className="px-3 py-2 tabular-nums font-semibold text-navy">{INR(m.shouldPay)}</td>
                    <td className={`px-3 py-2 tabular-nums font-extrabold ${m.netBalance > 0 ? 'text-emerald' : m.netBalance < 0 ? 'text-attention' : 'text-navy'}`}>
                      {m.netBalance > 0 ? `+${INR(m.netBalance)}` : m.netBalance < 0 ? `${INR(m.netBalance)}` : '₹0'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`chip ${m.netBalance > 0 ? 'bg-emerald-light text-emerald' : m.netBalance < 0 ? 'bg-attention-light text-attention' : 'bg-emerald-light text-emerald'}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-ink-faint text-center">
            Net balances always sum to ₹0 — the ledger is fully reconciled.
          </p>
        </div>
      )}
    </div>
  );
}
