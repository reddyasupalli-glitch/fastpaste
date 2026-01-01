import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { SwipeableMessage } from './SwipeableMessage';
import type { Message } from '@/hooks/useMessages';
import type { ReactionGroup } from '@/hooks/useReactions';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUsername: string;
  onMessageSeen?: (messageId: string) => void;
  getSeenBy?: (messageId: string) => string[];
  getReactionsForMessage?: (messageId: string) => ReactionGroup[];
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onSwipeReply?: (messageId: string, username: string, content: string) => void;
}

export function MessageList({ 
  messages, 
  loading, 
  currentUsername,
  onMessageSeen,
  getSeenBy,
  getReactionsForMessage,
  onToggleReaction,
  onSwipeReply,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark latest message as seen when messages change
  useEffect(() => {
    if (messages.length > 0 && onMessageSeen) {
      const lastMessage = messages[messages.length - 1];
      onMessageSeen(lastMessage.id);
    }
  }, [messages, onMessageSeen]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-y-auto px-2 py-3 sm:px-4 sm:py-4 md:px-6"
    >
      <div className="mx-auto w-full max-w-4xl">
        {messages.map((message, index) => {
          const isLastOwnMessage = 
            message.username === currentUsername && 
            messages.slice(index + 1).every(m => m.username !== currentUsername);
          
          const handleSwipe = () => {
            if (onSwipeReply) {
              onSwipeReply(message.id, message.username, message.content);
            }
          };
          
          return (
            <SwipeableMessage
              key={message.id}
              onSwipeReply={handleSwipe}
              disabled={!onSwipeReply}
            >
              <MessageBubble 
                message={message} 
                isOwn={message.username === currentUsername}
                seenBy={isLastOwnMessage && getSeenBy ? getSeenBy(message.id) : undefined}
                reactions={getReactionsForMessage ? getReactionsForMessage(message.id) : undefined}
                onToggleReaction={onToggleReaction ? (emoji) => onToggleReaction(message.id, emoji) : undefined}
              />
            </SwipeableMessage>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
