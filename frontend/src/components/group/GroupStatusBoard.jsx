import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { groupMembers } from '../../data/demoTrip.js';
import { memberRecoveryStatus, STRATEGIES } from '../../utils/groupRecovery.js';
import StatusChip from '../StatusChip.jsx';

const STATUS_TONE = {
  continuing: 'emerald',
  paused: 'primary',
  recovered: 'emerald',
  'recovery needed': 'critical',
  waiting: 'attention',
  recovering: 'attention',
  independent: 'primary',
};

const STATUS_NOTE = {
  continuing: 'Bookings unaffected',
  paused: 'Group paused — waiting together',
  recovered: 'Recovery plan applied',
  'recovery needed': 'Needs a recovery plan',
  waiting: 'Waiting for recovery option',
  recovering: 'Taking earliest option',
  independent: 'Following own recovery path',
};

export default function GroupStatusBoard() {
  const { state } = useTrip();
  const phase = state.phase;
  const strategy = state.groupRecovery?.strategy;
  const strategyLabel = strategy ? (STRATEGIES[strategy]?.label ?? null) : null;

  const members = groupMembers.map((member) => ({
    ...member,
    statusObj: memberRecoveryStatus(member, state),
  }));

  const continuing = members.filter((m) => !m.affected);
  const affected = members.filter((m) => m.affected);
  const hasDisruption = phase !== 'normal' && phase !== 'recovered';

  return (
    <div className="space-y-5">
      {/* Strategy banner */}
      {hasDisruption && (
        <div className={`rounded-xl border p-4 ${strategy ? 'border-primary/20 bg-primary-soft/40' : 'border-attention/20 bg-attention-light/40'}`}>
          <div className="flex items-start gap-3">
            {strategy ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <Clock size={18} />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-attention text-white">
                <AlertTriangle size={18} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-navy">
                {strategy ? `Strategy: ${strategyLabel}` : 'No group strategy selected yet'}
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                {strategy
                  ? 'The group recovery strategy determines how costs are split and how travelers coordinate.'
                  : 'Select a strategy below to see how the group recovers together.'}
              </p>
            </div>
            {!strategy && hasDisruption && (
              <ArrowRight size={16} className="text-ink-faint" />
            )}
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-light text-emerald">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-lg font-extrabold text-navy">{continuing.length}</p>
            <p className="text-xs text-ink-soft">Continuing as planned</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-attention-light text-attention">
            <Users size={18} />
          </div>
          <div>
            <p className="text-lg font-extrabold text-navy">{affected.length}</p>
            <p className="text-xs text-ink-soft">Affected · need recovery</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-periwinkle text-navy">
            <Users size={18} />
          </div>
          <div>
            <p className="text-lg font-extrabold text-navy">{groupMembers.length}</p>
            <p className="text-xs text-ink-soft">Total travelers</p>
          </div>
        </div>
      </div>

      {/* Member cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, i) => {
          const status = member.statusObj.status;
          const tone = STATUS_TONE[status] || 'navy';
          const note = STATUS_NOTE[status] || member.statusObj.note;

          const toneMap = {
            emerald: 'bg-emerald-light text-emerald',
            primary: 'bg-primary-soft text-primary',
            critical: 'bg-critical-light text-critical',
            attention: 'bg-attention-light text-attention',
            navy: 'bg-periwinkle text-navy',
          };

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-extrabold text-sm ${toneMap[tone] || toneMap.navy}`}>
                  {member.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy">{member.name}</p>
                  <p className="text-xs text-ink-soft">{member.note || note}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <StatusChip status={status} />
                {member.affected && hasDisruption && !state.groupRecovery?.strategy && (
                  <span className="text-[11px] font-semibold text-attention">Needs strategy</span>
                )}
                {member.affected && state.groupRecovery?.strategy && (
                  <span className="text-[11px] font-semibold text-primary">
                    {strategy === 'catch-up' ? 'Catch-up' : strategy === 'wait-together' ? 'Waiting' : 'Independent'}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
