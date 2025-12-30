import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  group_id: string;
  content: string;
  message_type: 'text' | 'code';
  username: string;
  created_at: string;
}

export function useMessages(groupId: string | null, username: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
    }
    
    if (data) {
      setMessages(data as Message[]);
    }
    setLoading(false);
  }, [groupId]);

  const sendMessage = async (content: string, messageType: 'text' | 'code'): Promise<boolean> => {
    if (!groupId || !content.trim() || !username) return false;
    
    // Create optimistic message
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      group_id: groupId,
      content: content.trim(),
      message_type: messageType,
      username: username,
      created_at: new Date().toISOString(),
    };
    
    // Add optimistically
    setMessages((prev) => [...prev, optimisticMessage]);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          content: content.trim(),
          message_type: messageType,
          username: username,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return false;
      }
      
      // Replace optimistic message with real one
      if (data) {
        setMessages((prev) => 
          prev.map((m) => m.id === optimisticId ? (data as Message) : m)
        );
      }
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  };

  // Fetch messages on mount and when groupId changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!groupId) return;

    console.log('Subscribing to realtime for group:', groupId);

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
          console.log('Realtime message received:', payload);
          const newMessage = payload.new as Message;
          // Avoid duplicates - check if message already exists
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMessage.id);
            if (exists) return prev;
            // Also check for temp messages with same content to avoid dupes
            const tempMatch = prev.find(
              (m) => m.id.startsWith('temp-') && m.content === newMessage.content
            );
            if (tempMatch) {
              return prev.map((m) => m.id === tempMatch.id ? newMessage : m);
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from realtime for group:', groupId);
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
}
