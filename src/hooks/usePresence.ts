import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  odlk: string;
  username: string;
  online_at: string;
  isTyping: boolean;
  lastSeenMessageId: string | null;
  isCreator?: boolean;
}

interface UserReadStatus {
  username: string;
  lastSeenMessageId: string | null;
}

interface OnlineUser {
  username: string;
  isCreator?: boolean;
}

export function usePresence(groupId: string | null, username?: string, isCreator?: boolean) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [readStatuses, setReadStatuses] = useState<UserReadStatus[]>([]);
  const [kickedUsers, setKickedUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const odlkRef = useRef<string>(`user-${Math.random().toString(36).substring(7)}`);
  const isMountedRef = useRef(true);
  const currentStateRef = useRef({
    isTyping: false,
    lastSeenMessageId: null as string | null,
  });

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!groupId) return;

    const channel = supabase.channel(`presence-${groupId}`, {
      config: {
        presence: {
          key: odlkRef.current,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!isMountedRef.current) return;
        
        const state = channel.presenceState<PresenceState>();
        const users: OnlineUser[] = [];
        const typing: string[] = [];
        const statuses: UserReadStatus[] = [];
        
        Object.values(state).forEach((presences) => {
          presences.forEach((presence: PresenceState) => {
            if (presence.username) {
              users.push({
                username: presence.username,
                isCreator: presence.isCreator,
              });
              if (presence.isTyping && presence.username !== username) {
                typing.push(presence.username);
              }
              statuses.push({
                username: presence.username,
                lastSeenMessageId: presence.lastSeenMessageId,
              });
            }
          });
        });
        
        setOnlineCount(Object.keys(state).length);
        setOnlineUsers(users);
        setTypingUsers(typing);
        setReadStatuses(statuses);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'kick' }, (payload) => {
        console.log('Kick event received:', payload);
        if (payload.payload?.username === username) {
          setKickedUsers(prev => [...prev, username]);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && isMountedRef.current) {
          channel.track({
            odlk: odlkRef.current,
            username: username || 'Anonymous',
            online_at: new Date().toISOString(),
            isTyping: false,
            lastSeenMessageId: null,
            isCreator: isCreator || false,
          });
          console.log('Presence tracked for group:', groupId);
        }
      });

    return () => {
      isMountedRef.current = false;
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [groupId, username, isCreator]);

  const updatePresence = useCallback((updates: Partial<{ isTyping: boolean; lastSeenMessageId: string | null }>) => {
    currentStateRef.current = { ...currentStateRef.current, ...updates };
    
    if (channelRef.current && isMountedRef.current) {
      channelRef.current.track({
        odlk: odlkRef.current,
        username: username || 'Anonymous',
        online_at: new Date().toISOString(),
        isTyping: currentStateRef.current.isTyping,
        lastSeenMessageId: currentStateRef.current.lastSeenMessageId,
        isCreator: isCreator || false,
      });
    }
  }, [username, isCreator]);

  const setTyping = useCallback((isTyping: boolean) => {
    updatePresence({ isTyping });
  }, [updatePresence]);

  const markMessageSeen = useCallback((messageId: string) => {
    updatePresence({ lastSeenMessageId: messageId });
  }, [updatePresence]);

  const kickUser = useCallback((targetUsername: string) => {
    if (channelRef.current && isMountedRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'kick',
        payload: { username: targetUsername },
      });
    }
  }, []);

  // Get users who have seen a specific message
  const getSeenBy = useCallback((messageId: string, allMessageIds: string[], excludeUsername?: string) => {
    return readStatuses
      .filter(status => {
        if (status.username === excludeUsername) return false;
        if (!status.lastSeenMessageId) return false;
        
        // Check if the user has seen this message or a later one
        const messageIndex = allMessageIds.indexOf(messageId);
        const seenIndex = allMessageIds.indexOf(status.lastSeenMessageId);
        return seenIndex >= messageIndex;
      })
      .map(status => status.username);
  }, [readStatuses]);

  return {
    onlineCount,
    onlineUsers,
    typingUsers,
    readStatuses,
    kickedUsers,
    setTyping,
    markMessageSeen,
    getSeenBy,
    kickUser,
  };
}
