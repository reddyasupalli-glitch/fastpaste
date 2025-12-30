import { GroupHeader } from './GroupHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useMessages } from '@/hooks/useMessages';

interface ChatRoomProps {
  groupId: string;
  groupCode: string;
  onLeave: () => void;
}

export function ChatRoom({ groupId, groupCode, onLeave }: ChatRoomProps) {
  const { messages, loading, sendMessage } = useMessages(groupId);

  return (
    <div className="flex h-screen flex-col bg-background">
      <GroupHeader code={groupCode} onLeave={onLeave} />
      <MessageList messages={messages} loading={loading} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
