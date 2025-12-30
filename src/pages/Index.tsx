import { useGroup } from '@/hooks/useGroup';
import { JoinCreateForm } from '@/components/JoinCreateForm';
import { ChatRoom } from '@/components/ChatRoom';

const Index = () => {
  const { group, loading, error, createGroup, joinGroup, leaveGroup } = useGroup();

  if (group) {
    return (
      <ChatRoom
        groupId={group.id}
        groupCode={group.code}
        onLeave={leaveGroup}
      />
    );
  }

  return (
    <JoinCreateForm
      onJoin={joinGroup}
      onCreate={createGroup}
      loading={loading}
      error={error}
    />
  );
};

export default Index;
