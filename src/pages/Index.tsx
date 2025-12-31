import { useGroup } from '@/hooks/useGroup';
import { JoinCreateForm } from '@/components/JoinCreateForm';
import { ChatRoom } from '@/components/ChatRoom';
import { WelcomeDialog } from '@/components/WelcomeDialog';
import { Footer } from '@/components/Footer';
import { AdBanner } from '@/components/AdBanner';
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
      <AdBanner slot="2153371023" format="horizontal" className="w-full max-w-[728px] h-[90px] mx-auto my-4" />
      <JoinCreateForm
        onJoin={joinGroup}
        onCreate={createGroup}
        loading={loading}
        error={error}
      />
      <Footer />
      
      {/* Floating Asu Chat */}
      <AsuChat />
    </>
  );
};

export default Index;
