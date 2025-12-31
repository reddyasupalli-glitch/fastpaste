import { useGroup } from '@/hooks/useGroup';
import { JoinCreateForm } from '@/components/JoinCreateForm';
import { ChatRoom } from '@/components/ChatRoom';
import { WelcomeDialog } from '@/components/WelcomeDialog';
import { Footer } from '@/components/Footer';
import { AsuChat } from '@/components/AsuChat';

const Index = () => {
  const { group, loading, error, createGroup, joinGroup, leaveGroup } = useGroup();

  if (group) {
    return (
      <>
        <WelcomeDialog />
        <ChatRoom
          groupId={group.id}
          groupCode={group.code}
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
      
      {/* Asu Chat Section */}
      <div className="px-4 pb-8">
        <AsuChat />
      </div>
      
      <Footer />
    </>
  );
};

export default Index;
