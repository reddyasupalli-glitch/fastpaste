import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactionGroup } from '@/hooks/useReactions';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

interface MessageReactionsProps {
  reactions: ReactionGroup[];
  onToggleReaction: (emoji: string) => void;
  isOwn: boolean;
}

export function MessageReactions({ reactions, onToggleReaction, isOwn }: MessageReactionsProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onToggleReaction(emoji);
    setOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-1 flex-wrap mt-1", isOwn && "justify-end")}>
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onToggleReaction(reaction.emoji)}
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors",
            reaction.hasReacted
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-secondary/80 text-muted-foreground border border-transparent hover:border-border"
          )}
          title={reaction.users.join(', ')}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </button>
      ))}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top" align={isOwn ? "end" : "start"}>
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="p-1.5 hover:bg-secondary rounded transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
