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
      <div className="min-h-screen flex flex-col">
        <AdBanner slot="2153371023" format="horizontal" className="w-full max-w-[728px] h-[90px] mx-auto my-4" />
        <JoinCreateForm
          onJoin={joinGroup}
          onCreate={createGroup}
          loading={loading}
          error={error}
        />
        
        {/* Asu AI Chat Section */}
        <div className="px-4 py-8 flex-1">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Chat with Asu AI</h2>
            <p className="text-muted-foreground text-sm">Ask anything - Nenu help chestanu! 🤖</p>
          </div>
          <AsuChat />
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
