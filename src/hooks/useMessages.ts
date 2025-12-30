import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

const AI_NAME = 'Asu';
const AI_TRIGGER_PATTERNS = [/@Asu\s+/i, /\/Asu\s+/i];

export interface Message {
  id: string;
  group_id: string;
  content: string;
  message_type: 'text' | 'code' | 'file';
  username: string;
  created_at: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
}

export function useMessages(groupId: string | null, username: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

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

  const checkForAITrigger = (content: string): { isAIMessage: boolean; question: string } => {
    for (const pattern of AI_TRIGGER_PATTERNS) {
      if (pattern.test(content)) {
        const question = content.replace(pattern, '').trim();
        return { isAIMessage: true, question };
      }
    }
    return { isAIMessage: false, question: '' };
  };

  const getAIResponse = async (question: string, conversationContext: Message[]): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: question,
          conversationContext: conversationContext.slice(-10).map(m => ({
            username: m.username,
            content: m.content
          }))
        }
      });

      if (error) {
        console.error('AI function error:', error);
        return null;
      }

      return data?.response || null;
    } catch (err) {
      console.error('Error getting AI response:', err);
      return null;
    }
  };

  const sendAIMessage = async (content: string): Promise<boolean> => {
    if (!groupId) return false;

    const optimisticId = `temp-ai-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      group_id: groupId,
      content: content,
      message_type: 'text',
      username: AI_NAME,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          content: content,
          message_type: 'text',
          username: AI_NAME,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending AI message:', error);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return false;
      }

      if (data) {
        setMessages((prev) =>
          prev.map((m) => m.id === optimisticId ? (data as Message) : m)
        );
      }
      return true;
    } catch (err) {
      console.error('Error sending AI message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  };

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

      // Check if message triggers AI response
      const { isAIMessage, question } = checkForAITrigger(content.trim());
      if (isAIMessage && question) {
        setIsAIThinking(true);
        try {
          // Get current messages for context
          const currentMessages = await new Promise<Message[]>((resolve) => {
            setMessages((prev) => {
              resolve(prev);
              return prev;
            });
          });

          const aiResponse = await getAIResponse(question, currentMessages);
          if (aiResponse) {
            await sendAIMessage(aiResponse);
          }
        } finally {
          setIsAIThinking(false);
        }
      }

      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  };

  const sendFileMessage = async (file: File): Promise<boolean> => {
    if (!groupId || !username) return false;

    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxSize) {
      console.error('File too large');
      return false;
    }

    // Create optimistic message
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      group_id: groupId,
      content: `Uploading ${file.name}...`,
      message_type: 'file',
      username: username,
      created_at: new Date().toISOString(),
      file_name: file.name,
      file_type: file.type,
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${groupId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return false;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Insert message with file info
      const { data, error } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          content: file.name,
          message_type: 'file',
          username: username,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending file message:', error);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return false;
      }

      if (data) {
        setMessages((prev) => 
          prev.map((m) => m.id === optimisticId ? (data as Message) : m)
        );
      }
      return true;
    } catch (err) {
      console.error('Error sending file:', err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  };

  // Fetch messages on mount and when groupId changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates - using a stable subscription
  useEffect(() => {
    if (!groupId) return;

    // Cleanup previous subscription if exists
    if (channelRef.current) {
      console.log('Cleaning up previous subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    console.log('Setting up realtime subscription for group:', groupId);

    const channel = supabase
      .channel(`messages-realtime-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('Realtime INSERT received:', payload);
          const newMessage = payload.new as Message;
          
          setMessages((prev) => {
            // Check if message already exists by ID
            const existsById = prev.some((m) => m.id === newMessage.id);
            if (existsById) {
              console.log('Message already exists by ID, skipping');
              return prev;
            }
            
            // Check for optimistic message with matching content and username
            const tempMatch = prev.find(
              (m) => m.id.startsWith('temp-') && 
                     m.content === newMessage.content &&
                     m.username === newMessage.username
            );
            
            if (tempMatch) {
              console.log('Replacing optimistic message with real one');
              return prev.map((m) => m.id === tempMatch.id ? newMessage : m);
            }
            
            console.log('Adding new message from realtime');
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('Realtime UPDATE received:', payload);
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => m.id === updatedMessage.id ? updatedMessage : m)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('Realtime DELETE received:', payload);
          const deletedMessage = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== deletedMessage.id));
        }
      );

    channelRef.current = channel;

    channel.subscribe((status) => {
      console.log('Realtime subscription status:', status);
      if (status === 'SUBSCRIBED') {
        isSubscribedRef.current = true;
        console.log('Successfully subscribed to realtime for group:', groupId);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        isSubscribedRef.current = false;
        console.error('Realtime subscription error or closed:', status);
      }
    });

    return () => {
      console.log('Cleanup: Unsubscribing from realtime for group:', groupId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [groupId]);

  return {
    messages,
    loading,
    isAIThinking,
    sendMessage,
    sendFileMessage,
    refetch: fetchMessages,
  };
}
