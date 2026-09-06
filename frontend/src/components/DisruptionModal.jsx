import { useState } from 'react';
import { AlertTriangle, Bus, Plane, TrainFront } from 'lucide-react';
import Modal from './Modal.jsx';
import { useTrip } from '../context/TripContext.jsx';
import { disruptionPresets } from '../data/demoTrip.js';

const PRESET_ICON = { 'flight-cancelled': Plane, 'train-cancelled': TrainFront, 'bus-cancelled': Bus };

export default function DisruptionModal({ open, onClose }) {
  const { dispatch } = useTrip();
  const [selected, setSelected] = useState(disruptionPresets[0].id);

  const report = () => {
    dispatch({ type: 'REPORT_DISRUPTION', presetId: selected });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Simulate a disruption (demo)">
      <p className="text-sm text-ink-soft">
        Choose what went wrong. TripSync will work out everything it affects and find recovery options.
      </p>
      <div className="mt-4 space-y-2" role="radiogroup" aria-label="Disruption type">
        {disruptionPresets.map((preset) => {
          const Icon = PRESET_ICON[preset.id];
          const active = selected === preset.id;
          return (
            <button
              key={preset.id}
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(preset.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                active
                  ? 'border-critical/40 bg-critical-light/60 ring-2 ring-critical/20'
                  : 'border-navy/10 bg-white hover:border-navy/20'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-critical text-white' : 'bg-periwinkle text-navy-soft'}`}>
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-navy">{preset.label}</span>
                <span className="block text-xs text-ink-soft">{preset.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-attention-light/70 p-3 text-xs text-attention">
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        This is a demo control — it simulates the scenario used at the hackathon showcase.
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn-secondary flex-1" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-danger flex-1" onClick={report}>
          Report disruption
        </button>
      </div>
    </Modal>
  );
}