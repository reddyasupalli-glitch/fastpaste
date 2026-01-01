import { X, Reply } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuotedMessageProps {
  username: string;
  content: string;
  onDismiss: () => void;
}

export function QuotedMessage({ username, content, onDismiss }: QuotedMessageProps) {
  // Truncate content if too long
  const truncatedContent = content.length > 100 ? content.slice(0, 100) + '...' : content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: 10, height: 0 }}
      transition={{ duration: 0.15 }}
      className="mx-2 mb-2"
    >
      <div className={cn(
        "flex items-start gap-2 p-2 rounded-lg",
        "bg-secondary/80 border-l-4 border-primary"
      )}>
        <Reply className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary truncate">
            Replying to {username}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {truncatedContent}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-full hover:bg-background/50 active:bg-background/70 transition-colors flex-shrink-0"
          aria-label="Dismiss reply"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
}
