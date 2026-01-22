import { useCallback, useMemo, useEffect, useState } from 'react';
import { GroupHeader } from './GroupHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UsernamePrompt } from './UsernamePrompt';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeDialog } from './WelcomeDialog';
import { KickedDialog } from './KickedDialog';
import { RoomExpiryNotification } from './RoomExpiryNotification';

import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useUsername } from '@/hooks/useUsername';
import { useChatBackground } from '@/hooks/useChatBackground';
import { useReactions } from '@/hooks/useReactions';
import { useSwipeToReply } from '@/hooks/useSwipeToReply';
import { useRoomSession } from '@/hooks/useRoomSession';
import { cn } from '@/lib/utils';

interface ChatRoomProps {
  groupId: string;
  groupCode: string;
  roomType: 'public' | 'private';
  creatorUsername?: string;
  onLeave: () => void;
}

export function ChatRoom({ groupId, groupCode, roomType, creatorUsername, onLeave }: ChatRoomProps) {
  const { username, setUsername, hasUsername } = useUsername();
  const isCreator = username === creatorUsername;
  
  // Create room session for secure message access
  const { sessionActive, leaveRoom } = useRoomSession(groupId, username);
  
  // Only fetch messages and setup presence once session is active
  const { messages, loading, isAIThinking, sendMessage, sendFileMessage, deleteMessage } = useMessages(sessionActive ? groupId : null, username);
  const { onlineCount, onlineUsers, typingUsers, kickedUsers, setTyping, markMessageSeen, getSeenBy, kickUser } = usePresence(sessionActive ? groupId : null, username, isCreator);
  const { fetchReactions, toggleReaction, getReactionsForMessage } = useReactions(sessionActive ? groupId : null, username);
  const { quotedMessage, handleSwipeReply, dismissQuote } = useSwipeToReply();
  const { 
    backgroundId, 
    setBackground, 
    currentBackground, 
    backgroundOptions,
    addCustomBackground,
    removeCustomBackground,
  } = useChatBackground();

  const [showKickedDialog, setShowKickedDialog] = useState(false);

  const messageIds = useMemo(() => messages.map(m => m.id), [messages]);

  // Check if current user was kicked
  useEffect(() => {
    if (username && kickedUsers.includes(username)) {
      setShowKickedDialog(true);
    }
  }, [kickedUsers, username]);

  const handleKickedClose = () => {
    setShowKickedDialog(false);
    leaveRoom();
    onLeave();
  };

  // Handle leaving room - clean up session
  const handleLeave = useCallback(() => {
    leaveRoom();
    onLeave();
  }, [leaveRoom, onLeave]);

  // Fetch reactions when messages change
  useEffect(() => {
    if (messageIds.length > 0) {
      fetchReactions(messageIds);
    }
  }, [messageIds, fetchReactions]);

  const handleGetSeenBy = useCallback((messageId: string) => {
    return getSeenBy(messageId, messageIds, username);
  }, [getSeenBy, messageIds, username]);

  const handleToggleReaction = useCallback((messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  }, [toggleReaction]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    deleteMessage(messageId);
  }, [deleteMessage]);

  const handleKickUser = useCallback((targetUsername: string) => {
    kickUser(targetUsername);
  }, [kickUser]);

  if (!hasUsername) {
    return <UsernamePrompt onSubmit={setUsername} />;
  }

  // Show loading while session is being created
  if (!sessionActive) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Joining room...</p>
        </div>
      </div>
    );
  }

  const backgroundStyle = currentBackground.isCustom && currentBackground.imageUrl
    ? { backgroundImage: `url(${currentBackground.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <>
      <WelcomeDialog inChatRoom roomCode={groupCode} />
      <KickedDialog open={showKickedDialog} onClose={handleKickedClose} />
      <div 
        className={cn(
          "flex h-screen flex-col w-full",
          !currentBackground.isCustom && currentBackground.style
        )}
        style={backgroundStyle}
      >
      {/* Centered container for desktop */}
      <div className="flex flex-col h-full w-full max-w-full md:max-w-[90%] lg:max-w-[1400px] mx-auto px-0 md:px-6 lg:px-8">
        <GroupHeader 
          code={groupCode} 
          roomType={roomType}
          onLeave={handleLeave} 
          onlineCount={onlineCount}
          onlineUsers={onlineUsers}
          username={username}
          onUsernameChange={setUsername}
          backgroundId={backgroundId}
          backgroundOptions={backgroundOptions}
          onBackgroundChange={setBackground}
          onAddCustomBackground={addCustomBackground}
          onRemoveCustomBackground={removeCustomBackground}
          creatorUsername={creatorUsername}
          onKickUser={isCreator ? handleKickUser : undefined}
        />
        <RoomExpiryNotification groupId={groupId} groupCode={groupCode} />
        <MessageList 
          messages={messages} 
          loading={loading} 
          currentUsername={username}
          onMessageSeen={markMessageSeen}
          getSeenBy={handleGetSeenBy}
          getReactionsForMessage={getReactionsForMessage}
          onToggleReaction={handleToggleReaction}
          onSwipeReply={handleSwipeReply}
          onDeleteMessage={handleDeleteMessage}
        />
        <TypingIndicator typingUsers={typingUsers} isAIThinking={isAIThinking} />
        <MessageInput 
          onSend={sendMessage} 
          onSendFile={sendFileMessage}
          onTypingChange={setTyping}
          quotedMessage={quotedMessage}
          onDismissQuote={dismissQuote}
        />
      </div>
    </div>
    </>
  );
}
