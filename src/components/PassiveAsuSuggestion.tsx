import { Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PassiveAsuSuggestionProps {
  isVisible: boolean;
  onSelect: () => void;
}

export function PassiveAsuSuggestion({ isVisible, onSelect }: PassiveAsuSuggestionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full left-0 right-0 mb-2 z-40"
        >
          <button
            type="button"
            onClick={onSelect}
            className="mx-2 flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/15 active:bg-primary/20 transition-colors"
          >
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary/80">Ask ASU anything…</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
