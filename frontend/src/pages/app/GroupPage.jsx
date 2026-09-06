import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Users, Siren } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { groupMembers } from '../../data/demoTrip.js';
import StatusChip from '../../components/StatusChip.jsx';
import GroupStatusBoard from '../../components/group/GroupStatusBoard.jsx';
import GroupRecoverySelector from '../../components/group/GroupRecoverySelector.jsx';
import GroupExpenseLedger from '../../components/expenses/GroupExpenseLedger.jsx';

function memberState(member, phase) {
  if (!member.affected) return { status: 'continuing', note: 'Can continue as planned' };
  if (phase === 'normal') return { status: 'continuing', note: 'On the trip · all set' };
  if (phase === 'recovered') return { status: 'recovered', note: 'Recovery plan applied' };
  return { status: 'recovery needed', note: 'On the cancelled booking — needs a separate recovery plan' };
}

const AVATAR_TONES = ['bg-primary-soft text-primary', 'bg-emerald-light text-emerald', 'bg-attention-light text-attention', 'bg-periwinkle text-navy-soft', 'bg-success-light text-success'];

export default function GroupPage() {
  const { state } = useTrip();
  const navigate = useNavigate();
  const phase = state.phase;
  const affectedCount = groupMembers.filter((m) => m.affected).length;
  const continuingCount = groupMembers.length - affectedCount;
  const disruptionActive = phase !== 'normal' && phase !== 'recovered';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Your group</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {groupMembers.length} travelers on the Mumbai → Delhi → Manali trip.
        </p>
      </header>

      {/* Group story */}
      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-light/60 p-4">
            <HeartHandshake size={20} className="mt-0.5 shrink-0 text-emerald" />
            <div>
              <p className="text-lg font-extrabold text-navy">{continuingCount} travelers can continue as planned</p>
              <p className="mt-0.5 text-sm text-navy-soft">
                {groupMembers.filter((m) => !m.affected).map((m) => m.name).join(', ')} — their bookings are unaffected.
              </p>
            </div>
          </div>
          <div className={`flex items-start gap-3 rounded-2xl p-4 ${disruptionActive ? 'bg-critical-light/60' : 'bg-primary-soft/60'}`}>
            <Users size={20} className={`mt-0.5 shrink-0 ${disruptionActive ? 'text-critical' : 'text-primary'}`} />
            <div>
              <p className="text-lg font-extrabold text-navy">
                {affectedCount} traveler {affectedCount > 1 ? 'needs' : 'needs'} a separate recovery plan
              </p>
              <p className="mt-0.5 text-sm text-navy-soft">
                {disruptionActive
                  ? 'One affected traveler does not have to stop the entire group.'
                  : 'If anything changes, only affected travelers get a recovery plan — the rest continue.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <section aria-label="Group members">
        <h2 className="section-title mb-3">Who's on this trip</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groupMembers.map((member, i) => {
            const m = memberState(member, phase);
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold ${AVATAR_TONES[i % AVATAR_TONES.length]}`}>
                    {member.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy">{member.name}</p>
                    <p className="truncate text-xs text-ink-soft">{m.note}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <StatusChip status={m.status} />
                  {member.affected && disruptionActive && (
                    <button
                      className="btn-primary px-3 py-1.5 text-xs"
                      onClick={() => navigate('/app/recovery')}
                    >
                      Fix {member.name.split(' ')[0]}'s trip <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SOS prompt */}
      <div className="rounded-xl border border-critical/20 bg-critical-light/40 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-critical text-white">
            <Siren size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy">Emergency assistance available</p>
            <p className="text-xs text-ink-soft">
              If you need immediate help, open the SOS panel from the sidebar or bottom nav.
            </p>
          </div>
        </div>
      </div>

      {/* Group recovery section */}
      <section aria-label="Group recovery">
        <h2 className="section-title mb-3">Group recovery</h2>
        <GroupRecoverySelector />
      </section>

      {/* Group status board */}
      <section aria-label="Group status">
        <h2 className="section-title mb-3">Group status</h2>
        <GroupStatusBoard />
      </section>

      {/* Group expense ledger */}
      <section aria-label="Group expenses">
        <h2 className="section-title mb-3">Group expenses</h2>
        <GroupExpenseLedger />
      </section>

      <p className="rounded-xl bg-periwinkle/70 p-3 text-xs text-ink-faint">
        Group recovery keeps everyone moving: only the traveler on the broken booking re-plans, while the rest of the group continues on schedule.
      </p>
    </div>
  );
}