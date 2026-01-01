import { Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AsuMentionSuggestionProps {
  isVisible: boolean;
  onSelect: () => void;
}

export function AsuMentionSuggestion({ isVisible, onSelect }: AsuMentionSuggestionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="absolute bottom-full left-0 right-0 mb-2 z-50"
        >
          <div className="mx-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={onSelect}
              className={cn(
                "w-full flex items-center gap-3 p-3 hover:bg-primary/10 active:bg-primary/20 transition-colors",
                "focus:outline-none focus:bg-primary/10"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">@asu</span>
                  <span className="text-xs text-muted-foreground">· AI Assistant</span>
                </div>
                <p className="text-sm text-muted-foreground">Ask anything</p>
              </div>
              <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                Tap to select
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
