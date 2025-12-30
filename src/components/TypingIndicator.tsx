import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  typingUsers: string[];
  isAIThinking?: boolean;
}

export function TypingIndicator({ typingUsers, isAIThinking }: TypingIndicatorProps) {
  if (typingUsers.length === 0 && !isAIThinking) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    } else {
      return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex flex-col gap-1 px-3 py-1.5 sm:px-4 sm:py-2">
      {isAIThinking && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-primary animate-fade-in">
          <Bot className="h-4 w-4 animate-pulse" />
          <div className="flex gap-1">
            <span className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-bounce",
              "[animation-delay:0ms]"
            )} />
            <span className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-bounce",
              "[animation-delay:150ms]"
            )} />
            <span className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-bounce",
              "[animation-delay:300ms]"
            )} />
          </div>
          <span className="italic font-medium">Asu is thinking...</span>
        </div>
      )}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground animate-fade-in">
          <div className="flex gap-1">
            <span className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce",
              "[animation-delay:0ms]"
            )} />
            <span className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce",
              "[animation-delay:150ms]"
            )} />
            <span className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary/60 animate-bounce",
              "[animation-delay:300ms]"
            )} />
          </div>
          <span className="italic">{getTypingText()}</span>
        </div>
      )}
    </div>
  );
}
