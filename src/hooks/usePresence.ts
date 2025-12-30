import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PresenceState {
  odlk: string;
  online_at: string;
}

export function usePresence(groupId: string | null) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!groupId) return;

    const odlk = `user-${Math.random().toString(36).substring(7)}`;

    const channel = supabase.channel(`presence-${groupId}`, {
      config: {
        presence: {
          key: odlk,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        const users = Object.keys(state);
        setOnlineCount(users.length);
        setOnlineUsers(users);
        console.log('Presence sync:', users.length, 'users online');
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
            odlk,
            online_at: new Date().toISOString(),
          });
          console.log('Presence tracked for group:', groupId);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return {
    onlineCount,
    onlineUsers,
  };
}
