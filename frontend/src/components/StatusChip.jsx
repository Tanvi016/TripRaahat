import { AlertCircle, AlertTriangle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

const META = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-light text-emerald', Icon: CheckCircle2 },
  recovered: { label: 'Recovered', className: 'bg-emerald-light text-emerald', Icon: CheckCircle2 },
  atrisk: { label: 'At risk', className: 'bg-attention-light text-attention', Icon: AlertTriangle },
  'at-risk': { label: 'At risk', className: 'bg-attention-light text-attention', Icon: AlertTriangle },
  affected: { label: 'Affected', className: 'bg-attention-light text-attention', Icon: AlertCircle },
  cancelled: { label: 'Cancelled', className: 'bg-critical-light text-critical', Icon: XCircle },
  changed: { label: 'Changed', className: 'bg-primary-soft text-primary', Icon: RefreshCw },
  safe: { label: 'Safe', className: 'bg-emerald-light text-emerald', Icon: CheckCircle2 },
  attention: { label: 'Attention', className: 'bg-attention-light text-attention', Icon: AlertTriangle },
  urgent: { label: 'Urgent', className: 'bg-critical-light text-critical', Icon: AlertCircle },
  expired: { label: 'Expired', className: 'bg-navy/10 text-navy-soft', Icon: XCircle },
  ongoing: { label: 'Ongoing', className: 'bg-primary-soft text-primary', Icon: CheckCircle2 },
  upcoming: { label: 'Upcoming', className: 'bg-primary-soft text-primary', Icon: AlertCircle },
  completed: { label: 'Completed', className: 'bg-emerald-light text-emerald', Icon: CheckCircle2 },
  online: { label: 'Online', className: 'bg-emerald-light text-emerald', Icon: CheckCircle2 },
  offline: { label: 'Offline', className: 'bg-navy/10 text-navy-soft', Icon: AlertCircle },
  'recovery needed': { label: 'Recovery needed', className: 'bg-critical-light text-critical', Icon: AlertCircle },
  continuing: { label: 'Continuing', className: 'bg-emerald-light text-emerald', Icon: CheckCircle2 },
  disrupted: { label: 'Disrupted', className: 'bg-critical-light text-critical', Icon: XCircle },
  'recovery-options': { label: 'Options found', className: 'bg-attention-light text-attention', Icon: AlertCircle },
  'plan-selected': { label: 'Plan chosen', className: 'bg-primary-soft text-primary', Icon: RefreshCw },
};

export default function StatusChip({ status, className = '' }) {
  const meta = META[String(status).toLowerCase()] || META.confirmed;
  const { label, className: chipClass, Icon } = meta;
  return (
    <span className={`chip ${chipClass} ${className}`}>
      <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
      {label}
    </span>
  );
}