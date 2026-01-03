import { useGroup } from '@/hooks/useGroup';
import { JoinCreateForm } from '@/components/JoinCreateForm';
import { ChatRoom } from '@/components/ChatRoom';
import { WelcomeDialog } from '@/components/WelcomeDialog';
import { Footer } from '@/components/Footer';

const Index = () => {
  const { 
    group, 
    loading, 
    error, 
    pendingJoinGroup,
    createGroup, 
    joinGroup, 
    leaveGroup,
    cancelPendingJoin 
  } = useGroup();

  if (group) {
    return (
      <>
        <WelcomeDialog />
        <ChatRoom
          groupId={group.id}
          groupCode={group.code}
          roomType={group.room_type}
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
        pendingJoinGroup={pendingJoinGroup}
        onCancelPendingJoin={cancelPendingJoin}
      />
      <Footer />
    </>
  );
};

export default Index;