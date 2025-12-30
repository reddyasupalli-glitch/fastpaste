import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Reaction {
  id: string;
  message_id: string;
  username: string;
  emoji: string;
  created_at: string;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

export function useReactions(groupId: string | null, currentUsername: string | null) {
  const [reactions, setReactions] = useState<Map<string, Reaction[]>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchReactions = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length) return;

    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .in('message_id', messageIds);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    if (data && isMountedRef.current) {
      const reactionMap = new Map<string, Reaction[]>();
      data.forEach((reaction) => {
        const existing = reactionMap.get(reaction.message_id) || [];
        reactionMap.set(reaction.message_id, [...existing, reaction as Reaction]);
      });
      setReactions(reactionMap);
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUsername) return false;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          username: currentUsername,
          emoji,
        });

      if (error) {
        if (error.code === '23505') {
          // Already reacted with this emoji, remove it
          return removeReaction(messageId, emoji);
        }
        console.error('Error adding reaction:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error adding reaction:', err);
      return false;
    }
  }, [currentUsername]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUsername) return false;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('username', currentUsername)
        .eq('emoji', emoji);

      if (error) {
        console.error('Error removing reaction:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error removing reaction:', err);
      return false;
    }
  }, [currentUsername]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    const messageReactions = reactions.get(messageId) || [];
    const existingReaction = messageReactions.find(
      r => r.emoji === emoji && r.username === currentUsername
    );

    if (existingReaction) {
      return removeReaction(messageId, emoji);
    } else {
      return addReaction(messageId, emoji);
    }
  }, [reactions, currentUsername, addReaction, removeReaction]);

  const getReactionsForMessage = useCallback((messageId: string): ReactionGroup[] => {
    const messageReactions = reactions.get(messageId) || [];
    const grouped = new Map<string, { count: number; users: string[] }>();

    messageReactions.forEach(reaction => {
      const existing = grouped.get(reaction.emoji) || { count: 0, users: [] };
      grouped.set(reaction.emoji, {
        count: existing.count + 1,
        users: [...existing.users, reaction.username],
      });
    });

    return Array.from(grouped.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      users: data.users,
      hasReacted: data.users.includes(currentUsername || ''),
    }));
  }, [reactions, currentUsername]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!groupId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`reactions-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          console.log('Reaction change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newReaction = payload.new as Reaction;
            if (isMountedRef.current) {
              setReactions(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(newReaction.message_id) || [];
                if (!existing.some(r => r.id === newReaction.id)) {
                  newMap.set(newReaction.message_id, [...existing, newReaction]);
                }
                return newMap;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldReaction = payload.old as { id: string; message_id: string };
            if (isMountedRef.current) {
              setReactions(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(oldReaction.message_id) || [];
                newMap.set(
                  oldReaction.message_id,
                  existing.filter(r => r.id !== oldReaction.id)
                );
                return newMap;
              });
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [groupId]);

  return {
    reactions,
    fetchReactions,
    toggleReaction,
    getReactionsForMessage,
  };
}
