import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTrip } from '../../context/TripContext.jsx';
import { trips, BUDGET, traveler } from '../../data/demoTrip.js';
import { computeFinance } from '../../utils/finance.js';
import { getAffectedMembers, getContinuingMembers } from '../../utils/groupRecovery.js';
import FinanceTabs, { FinanceStat, TripFinanceRow } from '../../components/FinanceTabs.jsx';
import PersonalExpenseCard from '../../components/expenses/PersonalExpenseCard.jsx';
import GroupExpenseLedger from '../../components/expenses/GroupExpenseLedger.jsx';
import FinancePanel from '../../components/FinancePanel.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import { formatInr, formatInr as INR } from '../../utils/finance.js';

export default function FinancePage() {
  const { state } = useTrip();
  const [tab, setTab] = useState('ongoing');
  const f = computeFinance(state);

  const affected = getAffectedMembers(state);
  const continuing = getContinuingMembers(state);

  // Count how many trips in each category
  const ongoingCount = 1; // the current trip
  const upcomingCount = trips.upcoming.length;
  const completedCount = trips.completed.length;

  const tabContent = {
    ongoing: (
      <div className="space-y-6">
        {/* Traveler quick view */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white font-extrabold text-lg">
              {traveler.name[0]}
            </div>
            <div>
              <p className="text-base font-extrabold text-navy">{traveler.name}</p>
              <p className="text-xs text-ink-soft">Current trip · Budget: {INR(BUDGET)}</p>
            </div>
          </div>
        </div>

        {/* Personal expense overview */}
        <PersonalExpenseCard />

        {/* Group expense overview (visible when group context is active) */}
        <GroupExpenseLedger />

        {/* Financial summary */}
        <div className="card p-5">
          <h3 className="text-base font-bold text-navy mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-primary" />
            Trip financial summary
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FinanceStat
              icon={(props) => <span className="text-xl font-extrabold text-primary">₹</span>}
              label="Total budget"
              value={formatInr(f.budget)}
              sub="Approved trip budget"
              tone="navy"
              delay={0}
            />
            <FinanceStat
              icon={(props) => <span className="text-xl font-extrabold text-ink-soft">↓</span>}
              label="Spent so far"
              value={INR(f.spent)}
              sub={state.phase === 'recovered' ? 'Includes recovery cost' : 'All bookings paid'}
              tone={f.spent > BUDGET * 0.8 ? 'attention' : 'navy'}
              delay={0.05}
            />
            <FinanceStat
              icon={(props) => <span className="text-xl font-extrabold text-emerald">↑</span>}
              label="Money saved"
              value={f.saved ? INR(f.saved) : '₹0'}
              sub="Refund from recovery"
              tone={f.saved > 0 ? 'emerald' : 'navy'}
              delay={0.1}
            />
            <FinanceStat
              icon={(props) => <span className="text-xl font-extrabold text-attention">↑</span>}
              label="Money lost"
              value={f.lost ? INR(f.lost) : '₹0'}
              sub={f.lost > 0 ? 'Recovery extra cost' : 'No extra cost'}
              tone={f.lost > 0 ? 'attention' : 'emerald'}
              delay={0.15}
            />
          </div>

          {/* Budget bar */}
          <div className="mt-4 rounded-xl bg-white border border-navy/5 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-ink-faint mb-2">
              <span>Budget usage</span>
              <span>{INR(f.spent)} of {INR(f.budget)} spent ({Math.round((f.spent / f.budget) * 100)}%)</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-periwinkle">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (f.spent / f.budget) > 0.8 ? 'bg-attention' : (f.spent / f.budget) > 0.5 ? 'bg-primary' : 'bg-emerald'
                }`}
                style={{ width: `${Math.min(100, (f.spent / f.budget) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-ink-faint">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    ),
    upcoming: (
      <div className="space-y-4">
        <p className="text-sm text-ink-soft">
          Trips you're planning. Track payment deadlines and total costs before you go.
        </p>
        {trips.upcoming.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-soft">No upcoming trips.</p>
          </div>
        ) : (
          trips.upcoming.map((t, i) => (
            <TripFinanceRow
              key={t.id}
              trip={t}
              showDeadline
              delay={i * 0.05}
            />
          ))
        )}
      </div>
    ),
    completed: (
      <div className="space-y-4">
        <p className="text-sm text-ink-soft">
          Past trips. Review what you spent and access invoices.
        </p>
        {trips.completed.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-soft">No completed trips yet.</p>
          </div>
        ) : (
          trips.completed.map((t, i) => (
            <TripFinanceRow
              key={t.id}
              trip={t}
              delay={i * 0.05}
            />
          ))
        )}
      </div>
    ),
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Finance</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Track your trip spending — ongoing, upcoming, and completed.
        </p>
      </header>

      {/* Tab switcher */}
      <FinanceTabs trips={{ ongoingTotal: ongoingCount }} activeTab={tab} onTabChange={setTab}>
        {tabContent[tab]}
      </FinanceTabs>

      {/* Quick navigation */}
      <div className="flex flex-wrap gap-2">
        <a href="/app" className="btn-secondary text-sm">
          ← Back to dashboard
        </a>
        <a href="/app/group" className="btn-secondary text-sm">
          Group expenses →
        </a>
      </div>
    </div>
  );
}
