import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FilePlus2, FileText, FolderLock, HardDriveDownload, ShieldCheck, UploadCloud } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { documents } from '../../data/demoTrip.js';
import Modal from '../../components/Modal.jsx';
import ExternalLink from '../../components/ExternalLink.jsx';
import StatusChip from '../../components/StatusChip.jsx';

function fileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocModal({ doc, open, onClose }) {
  if (!doc) return null;
  const isUpload = doc.kind === 'upload';
  return (
    <Modal open={open} onClose={onClose} title={isUpload ? 'Uploaded document' : doc.title}>
      <div className="space-y-4">
        {!isUpload ? (
          <>
            <div className="rounded-2xl bg-periwinkle/70 p-4">
              <h4 className="text-base font-bold text-navy">{doc.title}</h4>
              <p className="mt-0.5 text-sm text-ink-soft">{doc.subtitle}</p>
            </div>
            <p className="text-sm leading-relaxed text-navy-soft">{doc.content}</p>
            <div className="flex flex-wrap gap-2">
              {doc.links?.map((l) => (
                <ExternalLink key={l.label} href={l.url} className="btn-secondary text-sm">
                  {l.label}
                </ExternalLink>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-navy/10 bg-white p-4 text-center">
            <FileText size={36} className="mx-auto text-ink-faint" />
            <p className="mt-2 break-all text-sm font-bold text-navy">{doc.title}</p>
            <p className="mt-1 text-xs text-ink-faint">
              {doc.file?.type || 'Document'} · {doc.file?.size} · Uploaded {doc.file?.date}
            </p>
            <p className="mt-3 text-xs text-ink-soft">
              Your upload is stored securely in this device's vault and is available offline.
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-emerald-light/60 p-3 text-xs text-emerald">
          <ShieldCheck size={14} /> Stored securely · available offline on this device
        </div>
      </div>
    </Modal>
  );
}

function DocumentCard({ doc, delay, onOpen, highlighted = false }) {
  const secure = doc.secure !== false;
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => onOpen(doc)}
      className={`card group relative p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-float ${
        highlighted ? 'ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
          {doc.kind === 'upload' ? <UploadCloud size={20} /> : <FileText size={20} />}
        </div>
        <div className="flex gap-1.5">
          {secure && (
            <span className="chip bg-success-light text-success" title="Stored securely">
              <FolderLock size={11} /> Secure
            </span>
          )}
          {doc.offline && (
            <span className="chip bg-periwinkle text-navy-soft" title="Available offline">
              <HardDriveDownload size={11} /> Offline
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-3 truncate text-sm font-bold text-navy group-hover:text-primary" title={doc.title}>
        {doc.title}
      </h3>
      {doc.subtitle && <p className="mt-0.5 truncate text-xs text-ink-soft">{doc.subtitle}</p>}
      {doc.file && (
        <p className="mt-2 text-[11px] text-ink-faint">
          {doc.file.name} · {doc.file.size}
          {doc.file.date ? ` · ${doc.file.date}` : ''}
        </p>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
        Open document →
      </span>
    </motion.button>
  );
}

export default function DocumentsPage() {
  const { state, dispatch } = useTrip();
  const fileRef = useRef(null);
  const [activeDoc, setActiveDoc] = useState(null);

  const disruptionActive = state.phase !== 'normal' && state.phase !== 'recovered';
  const needed = documents.filter((d) => d.relevantOnDisruption);
  const uploads = state.uploads.map((u) => ({
    ...u,
    kind: 'upload',
    secure: true,
    offline: true,
    relevantOnDisruption: false,
  }));
  const all = [...uploads, ...documents];

  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({
      type: 'ADD_UPLOAD',
      upload: {
        id: `up-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, ''),
        subtitle: file.type || 'Document',
        file: {
          name: file.name,
          type: file.type || 'Unknown type',
          size: fileSize(file.size),
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        },
      },
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Travel Documents</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Stored securely · available offline · everything your trip needs.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary text-sm" onClick={() => fileRef.current?.click()}>
            <FilePlus2 size={16} /> Upload document
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={onUpload} aria-label="Upload a document" />
        </div>
      </header>

      {disruptionActive && (
        <section aria-label="Documents you may need">
          <div className="mb-3">
            <h2 className="section-title">Documents you may need</h2>
            <p className="text-sm text-ink-soft">
              With {state.disruption?.label?.toLowerCase() || 'a disruption'}, these documents help with rebooking and refunds.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {needed.map((doc, i) => (
              <DocumentCard key={doc.id} doc={doc} delay={i * 0.05} onOpen={setActiveDoc} highlighted />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Document vault">
        <h2 className="section-title mb-3">Your vault</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((doc, i) => (
            <DocumentCard key={doc.id} doc={doc} delay={i * 0.04} onOpen={setActiveDoc} />
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy/15 p-5 text-ink-faint transition-colors hover:border-primary/40 hover:text-primary"
          >
            <UploadCloud size={26} />
            <span className="text-sm font-bold">Upload a document</span>
            <span className="text-xs">PNG, JPG, PDF — stored locally</span>
          </button>
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-xl bg-periwinkle/70 p-3 text-xs text-ink-faint">
        <StatusChip status="online" className="shrink-0" />
        <p>
          Everything here is saved on your device (demo build). In the full product, documents sync through your secure TripSync account.
        </p>
      </div>

      {/* SOS document vault note */}
      <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-4">
        <div className="flex items-start gap-3">
          <FileText size={16} className="shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold text-navy">Available in SOS mode</p>
            <p className="text-xs text-ink-soft">
              Your most important documents — passport, insurance, tickets — are also accessible from the emergency SOS panel,
              even when you're offline. Tap the SOS button in the sidebar or bottom nav to access them.
            </p>
          </div>
        </div>
      </div>

      <DocModal doc={activeDoc} open={!!activeDoc} onClose={() => setActiveDoc(null)} />
    </div>
  );
}