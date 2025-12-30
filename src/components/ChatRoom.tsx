import { GroupHeader } from './GroupHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UsernamePrompt } from './UsernamePrompt';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useUsername } from '@/hooks/useUsername';

interface ChatRoomProps {
  groupId: string;
  groupCode: string;
  onLeave: () => void;
}

export function ChatRoom({ groupId, groupCode, onLeave }: ChatRoomProps) {
  const { username, setUsername, hasUsername } = useUsername();
  const { messages, loading, sendMessage } = useMessages(groupId, username);
  const { onlineCount } = usePresence(groupId);

  if (!hasUsername) {
    return <UsernamePrompt onSubmit={setUsername} />;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <GroupHeader code={groupCode} onLeave={onLeave} onlineCount={onlineCount} username={username} />
      <MessageList messages={messages} loading={loading} currentUsername={username} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
