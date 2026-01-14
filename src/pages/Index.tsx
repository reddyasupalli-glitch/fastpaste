import { useGroup } from '@/hooks/useGroup';
import { JoinCreateForm } from '@/components/JoinCreateForm';
import { ChatRoom } from '@/components/ChatRoom';
import { WelcomeDialog } from '@/components/WelcomeDialog';

const Index = () => {
  const { 
    group, 
    loading, 
    error, 
    creatorUsername,
    createGroup, 
    joinGroup, 
    leaveGroup
  } = useGroup();

  if (group) {
    return (
      <>
        <WelcomeDialog />
        <ChatRoom
          groupId={group.id}
          groupCode={group.code}
          roomType={group.room_type}
          creatorUsername={creatorUsername || group.creatorUsername}
          onLeave={leaveGroup}
        />
      </>
    );
  }

  return (
    <>
      <WelcomeDialog />
      <JoinCreateForm
        onJoin={joinGroup}
        onCreate={createGroup}
        loading={loading}
        error={error}
      />
    </>
  );
};

export default Index;
