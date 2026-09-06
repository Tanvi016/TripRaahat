import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3" aria-label="Assistant is typing" role="status">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">TS</div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-card">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-primary/50"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  );
}