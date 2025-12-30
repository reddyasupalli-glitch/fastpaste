import { useCallback, useMemo } from 'react';
import { GroupHeader } from './GroupHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UsernamePrompt } from './UsernamePrompt';
import { TypingIndicator } from './TypingIndicator';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useUsername } from '@/hooks/useUsername';
import { useChatBackground } from '@/hooks/useChatBackground';
import { cn } from '@/lib/utils';

interface ChatRoomProps {
  groupId: string;
  groupCode: string;
  onLeave: () => void;
}

export function ChatRoom({ groupId, groupCode, onLeave }: ChatRoomProps) {
  const { username, setUsername, hasUsername } = useUsername();
  const { messages, loading, sendMessage, sendFileMessage } = useMessages(groupId, username);
  const { onlineCount, typingUsers, setTyping, markMessageSeen, getSeenBy } = usePresence(groupId, username);
  const { 
    backgroundId, 
    setBackground, 
    currentBackground, 
    backgroundOptions,
    addCustomBackground,
    removeCustomBackground,
  } = useChatBackground();

  const messageIds = useMemo(() => messages.map(m => m.id), [messages]);

  const handleGetSeenBy = useCallback((messageId: string) => {
    return getSeenBy(messageId, messageIds, username);
  }, [getSeenBy, messageIds, username]);

  if (!hasUsername) {
    return <UsernamePrompt onSubmit={setUsername} />;
  }

  const backgroundStyle = currentBackground.isCustom && currentBackground.imageUrl
    ? { backgroundImage: `url(${currentBackground.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <div 
      className={cn(
        "flex h-screen flex-col w-full",
        !currentBackground.isCustom && currentBackground.style
      )}
      style={backgroundStyle}
    >
      {/* Centered container for desktop */}
      <div className="flex flex-col h-full w-full max-w-[1100px] mx-auto">
        <GroupHeader 
          code={groupCode} 
          onLeave={onLeave} 
          onlineCount={onlineCount} 
          username={username}
          backgroundId={backgroundId}
          backgroundOptions={backgroundOptions}
          onBackgroundChange={setBackground}
          onAddCustomBackground={addCustomBackground}
          onRemoveCustomBackground={removeCustomBackground}
        />
        <MessageList 
          messages={messages} 
          loading={loading} 
          currentUsername={username}
          onMessageSeen={markMessageSeen}
          getSeenBy={handleGetSeenBy}
        />
        <TypingIndicator typingUsers={typingUsers} />
        <MessageInput 
          onSend={sendMessage} 
          onSendFile={sendFileMessage}
          onTypingChange={setTyping} 
        />
      </div>
    </div>
  );
}
