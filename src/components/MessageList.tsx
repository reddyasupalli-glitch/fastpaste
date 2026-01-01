import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { SwipeableMessage } from './SwipeableMessage';
import { MessageContextMenu } from './MessageContextMenu';
import type { Message } from '@/hooks/useMessages';
import type { ReactionGroup } from '@/hooks/useReactions';
import { toast } from '@/hooks/use-toast';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUsername: string;
  onMessageSeen?: (messageId: string) => void;
  getSeenBy?: (messageId: string) => string[];
  getReactionsForMessage?: (messageId: string) => ReactionGroup[];
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onSwipeReply?: (messageId: string, username: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

interface ContextMenuState {
  isVisible: boolean;
  position: { x: number; y: number };
  message: Message | null;
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
  onDeleteMessage,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    message: null,
  });

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

  const handleLongPress = useCallback((message: Message, position: { x: number; y: number }) => {
    setContextMenu({
      isVisible: true,
      position,
      message,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  }, []);

  const handleCopy = useCallback(() => {
    if (contextMenu.message) {
      navigator.clipboard.writeText(contextMenu.message.content);
      toast({
        title: 'Copied',
        description: 'Message copied to clipboard',
      });
    }
  }, [contextMenu.message]);

  const handleReply = useCallback(() => {
    if (contextMenu.message && onSwipeReply) {
      onSwipeReply(
        contextMenu.message.id,
        contextMenu.message.username,
        contextMenu.message.content
      );
    }
  }, [contextMenu.message, onSwipeReply]);

  const handleReact = useCallback(() => {
    if (contextMenu.message && onToggleReaction) {
      // Quick react with thumbs up
      onToggleReaction(contextMenu.message.id, '👍');
    }
  }, [contextMenu.message, onToggleReaction]);

  const handleDelete = useCallback(() => {
    if (contextMenu.message && onDeleteMessage) {
      onDeleteMessage(contextMenu.message.id);
    }
  }, [contextMenu.message, onDeleteMessage]);

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
    <>
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

            const handleMessageLongPress = (position: { x: number; y: number }) => {
              handleLongPress(message, position);
            };
            
            return (
              <SwipeableMessage
                key={message.id}
                onSwipeReply={handleSwipe}
                onLongPress={handleMessageLongPress}
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

      {/* Context Menu */}
      <MessageContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onCopy={handleCopy}
        onReply={handleReply}
        onReact={handleReact}
        onDelete={contextMenu.message?.username === currentUsername ? handleDelete : undefined}
        isOwn={contextMenu.message?.username === currentUsername}
      />
    </>
  );
}
