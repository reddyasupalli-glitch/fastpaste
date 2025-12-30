import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUsers: string[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

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
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground animate-fade-in">
      <div className="flex gap-1">
        <span className={cn(
          "h-2 w-2 rounded-full bg-primary/60 animate-bounce",
          "[animation-delay:0ms]"
        )} />
        <span className={cn(
          "h-2 w-2 rounded-full bg-primary/60 animate-bounce",
          "[animation-delay:150ms]"
        )} />
        <span className={cn(
          "h-2 w-2 rounded-full bg-primary/60 animate-bounce",
          "[animation-delay:300ms]"
        )} />
      </div>
      <span className="italic">{getTypingText()}</span>
    </div>
  );
}
