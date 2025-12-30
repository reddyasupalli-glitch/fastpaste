import { GroupHeader } from './GroupHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UsernamePrompt } from './UsernamePrompt';
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
  const { messages, loading, sendMessage } = useMessages(groupId, username);
  const { onlineCount } = usePresence(groupId);
  const { 
    backgroundId, 
    setBackground, 
    currentBackground, 
    backgroundOptions,
    addCustomBackground,
    removeCustomBackground,
  } = useChatBackground();

  if (!hasUsername) {
    return <UsernamePrompt onSubmit={setUsername} />;
  }

  const backgroundStyle = currentBackground.isCustom && currentBackground.imageUrl
    ? { backgroundImage: `url(${currentBackground.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <div 
      className={cn("flex h-screen flex-col", !currentBackground.isCustom && currentBackground.style)}
      style={backgroundStyle}
    >
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
      <MessageList messages={messages} loading={loading} currentUsername={username} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
