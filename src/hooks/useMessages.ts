import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  group_id: string;
  content: string;
  message_type: 'text' | 'code';
  created_at: string;
}

export function useMessages(groupId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select()
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data as Message[]);
    }
    setLoading(false);
  }, [groupId]);

  const sendMessage = async (content: string, messageType: 'text' | 'code') => {
    if (!groupId || !content.trim()) return;
    
    const { error } = await supabase
      .from('messages')
      .insert({
        group_id: groupId,
        content: content.trim(),
        message_type: messageType,
      });
    
    return !error;
  };

  // Fetch messages on mount and when groupId changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return {
    messages,
    loading,
    sendMessage,
  };
}
