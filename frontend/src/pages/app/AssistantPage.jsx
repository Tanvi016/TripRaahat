import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, WifiOff } from 'lucide-react';
import { useTrip } from '../../context/TripContext.jsx';
import { getAssistantReply } from '../../utils/assistant.js';
import { currentBookings, recoveryPlans } from '../../data/demoTrip.js';
import TypingIndicator from '../../components/assistant/TypingIndicator.jsx';
import RefundModal from '../../components/RefundModal.jsx';

function welcomeText(state) {
  if (state.phase === 'recovered') {
    const plan = recoveryPlans.find((p) => p.id === state.appliedPlanId);
    return `Your trip is recovered! You're now on ${plan?.transport} at ${plan?.depTime} on ${plan?.date}. Ask me anything about your new plan, refunds or documents.`;
  }
  if (state.phase !== 'normal') {
    return `${state.disruption?.message || 'Something disrupted your trip.'} I found 3 recovery options for you — compare them and pick what fits best.`;
  }
  return `Your Mumbai → Delhi → Manali trip is all set — ${currentBookings.outboundFlight.label} leaves ${currentBookings.outboundFlight.time} on 12 Sep. How can I help?`;
}

export default function AssistantPage() {
  const { state, dispatch } = useTrip();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [modal, setModal] = useState(null);
  const scrollRef = useRef(null);
  const booted = useRef(false);

  const msLeft = state.deadlineTs - Date.now();

  // Welcome message once per trip phase change
  useEffect(() => {
    if (booted.current && messages.length > 0) return;
    booted.current = true;
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `Hi Tanvi! I'm your TripSync travel assistant. ${welcomeText(state)}`,
        chips: [
          { label: 'How is my trip?', action: 'ask', payload: 'How is my trip?' },
          { label: 'What are my options?', action: 'ask', payload: 'What are my options?' },
          { label: 'Check my refund', action: 'ask', payload: 'Check my refund' },
        ],
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const q = String(text || '').trim();
    if (!q || typing) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: q };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    const reply = getAssistantReply(state, q, { msLeft });
    setTimeout(() => {
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply.text, chips: reply.chips }]);
      setTyping(false);
    }, 900 + Math.random() * 500);
  };

  const handleChip = (chip) => {
    if (chip.to) navigate(chip.to);
    else if (chip.modal) setModal(chip.modal);
    else if (chip.action === 'select-plan') {
      dispatch({ type: 'SELECT_PLAN', planId: chip.payload });
      navigate('/app/recovery');
    } else if (chip.action === 'open-doc') {
      navigate('/app/documents');
    } else if (chip.action === 'ask' && chip.payload) {
      send(chip.payload);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col lg:h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 rounded-t-2xl border-b border-navy/5 glass p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
          TS
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-navy">TripSync Assistant</h1>
          <p className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Sparkles size={12} className="text-primary" /> Travel & booking questions only
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_OFFLINE', offline: !state.offline })}
          title="Simulate going offline (demo)"
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
            state.offline ? 'bg-critical-light text-critical' : 'bg-emerald-light text-emerald'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`absolute h-full w-full rounded-full opacity-60 animate-pulse-dot ${state.offline ? 'bg-critical' : 'bg-emerald'}`} />
            <span className={`relative h-2 w-2 rounded-full ${state.offline ? 'bg-critical' : 'bg-emerald'}`} />
          </span>
          {state.offline ? 'Offline' : 'Online'}
        </button>
      </div>

      {/* Offline banner — truthful */}
      {state.offline && (
        <div className="flex items-center gap-2 border-b border-navy/5 bg-attention-light/80 px-4 py-2 text-xs font-semibold text-attention">
          <WifiOff size={14} />
          Offline mode · Using saved trip information — live prices and availability are unavailable.
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-periwinkle/40 p-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                  TS
                </div>
              )}
              <div className={`max-w-[82%] sm:max-w-[70%] ${m.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block rounded-2xl px-4 py-3 text-left text-sm leading-relaxed shadow-card ${
                    m.role === 'user'
                      ? 'rounded-tr-md bg-primary text-white'
                      : 'rounded-tl-md bg-white text-navy'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'assistant' && m.chips?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.chips.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleChip(chip)}
                        className="rounded-full border border-primary/25 bg-white px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary-soft"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && <TypingIndicator />}
      </div>

      {/* Composer */}
      <form
        className="rounded-b-2xl border-t border-navy/5 glass p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={state.offline ? 'Ask about your saved trip…' : 'Ask about your trip, bookings, refunds…'}
            aria-label="Message the assistant"
            className="input max-h-28 min-h-[44px] flex-1 resize-none"
          />
          <button type="submit" className="btn-primary h-[44px] w-[44px] !px-0" aria-label="Send message" disabled={!input.trim() || typing}>
            <Send size={17} />
          </button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-ink-faint">
          I can answer questions about this trip, recovery options, refunds, deadlines, your group and documents.
        </p>
      </form>

      <RefundModal open={modal === 'refund'} onClose={() => setModal(null)} deadlineTs={state.deadlineTs} />
    </div>
  );
}