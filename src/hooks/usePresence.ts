import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PresenceState {
  odlk: string;
  username: string;
  online_at: string;
  isTyping: boolean;
}

export function usePresence(groupId: string | null, username?: string) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const odlkRef = useRef<string>(`user-${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
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
        const state = channel.presenceState<PresenceState>();
        const users: string[] = [];
        const typing: string[] = [];
        
        Object.values(state).forEach((presences) => {
          presences.forEach((presence: PresenceState) => {
            if (presence.username) {
              users.push(presence.username);
              if (presence.isTyping && presence.username !== username) {
                typing.push(presence.username);
              }
            }
          });
        });
        
        setOnlineCount(Object.keys(state).length);
        setOnlineUsers(users);
        setTypingUsers(typing);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            odlk: odlkRef.current,
            username: username || 'Anonymous',
            online_at: new Date().toISOString(),
            isTyping: false,
          });
          console.log('Presence tracked for group:', groupId);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [groupId, username]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (channelRef.current) {
      await channelRef.current.track({
        odlk: odlkRef.current,
        username: username || 'Anonymous',
        online_at: new Date().toISOString(),
        isTyping,
      });
    }
  }, [username]);

  return {
    onlineCount,
    onlineUsers,
    typingUsers,
    setTyping,
  };
}
