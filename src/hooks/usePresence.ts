import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  odlk: string;
  username: string;
  online_at: string;
  isTyping: boolean;
  lastSeenMessageId: string | null;
}

interface UserReadStatus {
  username: string;
  lastSeenMessageId: string | null;
}

export function usePresence(groupId: string | null, username?: string) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [readStatuses, setReadStatuses] = useState<UserReadStatus[]>([]);
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
        const users: string[] = [];
        const typing: string[] = [];
        const statuses: UserReadStatus[] = [];
        
        Object.values(state).forEach((presences) => {
          presences.forEach((presence: PresenceState) => {
            if (presence.username) {
              users.push(presence.username);
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && isMountedRef.current) {
          channel.track({
            odlk: odlkRef.current,
            username: username || 'Anonymous',
            online_at: new Date().toISOString(),
            isTyping: false,
            lastSeenMessageId: null,
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
  }, [groupId, username]);

  const updatePresence = useCallback((updates: Partial<{ isTyping: boolean; lastSeenMessageId: string | null }>) => {
    currentStateRef.current = { ...currentStateRef.current, ...updates };
    
    if (channelRef.current && isMountedRef.current) {
      channelRef.current.track({
        odlk: odlkRef.current,
        username: username || 'Anonymous',
        online_at: new Date().toISOString(),
        isTyping: currentStateRef.current.isTyping,
        lastSeenMessageId: currentStateRef.current.lastSeenMessageId,
      });
    }
  }, [username]);

  const setTyping = useCallback((isTyping: boolean) => {
    updatePresence({ isTyping });
  }, [updatePresence]);

  const markMessageSeen = useCallback((messageId: string) => {
    updatePresence({ lastSeenMessageId: messageId });
  }, [updatePresence]);

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
    setTyping,
    markMessageSeen,
    getSeenBy,
  };
}
