import { useState } from 'react';
import { useGroup } from '@/hooks/useGroup';
import { ChatRoom } from '@/components/ChatRoom';
import { JoinCreateForm } from '@/components/JoinCreateForm';
import { Navbar } from '@/components/layout/Navbar';

const Chat = () => {
  const { group, loading, error, creatorUsername, createGroup, joinGroup, leaveGroup } = useGroup();
  const [username, setUsername] = useState<string | undefined>();

  const handleCreate = async (options: { isPrivate: boolean; password?: string }, inputUsername?: string) => {
    setUsername(inputUsername);
    await createGroup(options, inputUsername);
  };

  const handleJoin = async (code: string) => {
    await joinGroup(code);
  };

  if (group) {
    return (
      <ChatRoom
        groupId={group.id}
        groupCode={group.code}
        roomType={group.room_type}
        creatorUsername={creatorUsername || username}
        onLeave={leaveGroup}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-animate" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />

      <Navbar />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-16">
        <JoinCreateForm
          onJoin={handleJoin}
          onCreate={handleCreate}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Chat;
