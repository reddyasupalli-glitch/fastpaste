import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

const AI_NAME = 'Asu';
const AI_TRIGGER_PATTERNS = [/@Asu\s*/i, /\/Asu\s*/i];
const HELP_TRIGGERS = ['help', '?', 'commands'];
const AI_RESPONSE_TIMEOUT = 10000; // 10 seconds

const HELP_MESSAGE = `Hey! Nenu Asu, mee AI assistant in this chat. Meeru nannu ela use cheyyalo cheptanu:

**Nannu ela ask cheyyalo:**
• Type \`@Asu\` followed by your question
• Or use \`/Asu\` followed by your question

**Examples:**
• \`@Asu What's the weather like today?\`
• \`/Asu Explain quantum computing\`
• \`@Asu Tell me a joke\`

**Commands:**
• \`@Asu help\` - Show this help message

Nenu questions answer cheyadam, information provide cheyadam, conversations lo help cheyadam - ivi anni chestanu. Just ask! 🤖`;

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

// Global set to track messages that have been processed for AI response
// This prevents duplicate triggers across re-renders and reconnects
const processedAIMessages = new Set<string>();
// Global lock to prevent concurrent AI responses
let aiResponseLock = false;

export function useMessages(groupId: string | null, username: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);
  const isMountedRef = useRef(true);
  const messagesRef = useRef<Message[]>([]);
  const pendingAIResponseRef = useRef<string | null>(null);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cleanup processed messages when leaving room
  useEffect(() => {
    return () => {
      // Clear processed messages for this group when unmounting
      processedAIMessages.clear();
      aiResponseLock = false;
    };
  }, [groupId]);

  const safeSetMessages = useCallback((updater: React.SetStateAction<Message[]>) => {
    if (isMountedRef.current) {
      setMessages(updater);
    }
  }, []);

  const safeSetLoading = useCallback((value: boolean) => {
    if (isMountedRef.current) {
      setLoading(value);
    }
  }, []);

  const safeSetIsAIThinking = useCallback((value: boolean) => {
    if (isMountedRef.current) {
      setIsAIThinking(value);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    
    safeSetLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
    }
    
    if (data) {
      safeSetMessages(data as Message[]);
      // Mark all existing messages as processed to prevent AI from responding to old messages
      data.forEach(msg => {
        if (msg.username !== AI_NAME) {
          processedAIMessages.add(msg.id);
        }
      });
    }
    safeSetLoading(false);
  }, [groupId, safeSetLoading, safeSetMessages]);

  const checkForAITrigger = (content: string): { isAIMessage: boolean; question: string; isHelp: boolean } => {
    for (const pattern of AI_TRIGGER_PATTERNS) {
      if (pattern.test(content)) {
        const question = content.replace(pattern, '').trim();
        const isHelp = HELP_TRIGGERS.some(trigger => 
          question.toLowerCase() === trigger || question === ''
        );
        return { isAIMessage: true, question, isHelp };
      }
    }
    return { isAIMessage: false, question: '', isHelp: false };
  };

  const getAIResponse = async (question: string, conversationContext: Message[]): Promise<string | null> => {
    console.log('[AI] Getting response for question:', question.substring(0, 50));
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_RESPONSE_TIMEOUT);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: question,
          conversationContext: conversationContext.slice(-10).map(m => ({
            username: m.username,
            content: m.content
          }))
        }
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('[AI] Function error:', error);
        return "Sorry, I'm having trouble connecting right now. Please try again! 🔄";
      }

      if (data?.error) {
        console.error('[AI] Error response:', data.error);
        return data.error;
      }

      console.log('[AI] Response received successfully');
      return data?.response || "I couldn't generate a response. Please try again!";
    } catch (err) {
      console.error('[AI] Error getting response:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        return "Sorry, the response is taking too long. Please try again! ⏳";
      }
      return "Oops! Something went wrong. Please try again in a moment! 🙏";
    }
  };

  const sendAIMessage = useCallback(async (content: string, triggerMessageId: string): Promise<boolean> => {
    if (!groupId || !isMountedRef.current) return false;

    console.log('[AI] Sending AI message for trigger:', triggerMessageId);

    const optimisticId = `temp-ai-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      group_id: groupId,
      content: content,
      message_type: 'text',
      username: AI_NAME,
      created_at: new Date().toISOString(),
    };

    safeSetMessages((prev) => [...prev, optimisticMessage]);

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
        console.error('[AI] Error sending message:', error);
        safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return false;
      }

      if (data) {
        safeSetMessages((prev) =>
          prev.map((m) => m.id === optimisticId ? (data as Message) : m)
        );
      }
      console.log('[AI] Message sent successfully');
      return true;
    } catch (err) {
      console.error('[AI] Error sending message:', err);
      safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  }, [groupId, safeSetMessages]);

  const processAIResponse = useCallback(async (
    messageId: string, 
    content: string
  ): Promise<void> => {
    // CRITICAL: Check if this message has already been processed
    if (processedAIMessages.has(messageId)) {
      console.log('[AI] Message already processed, skipping:', messageId);
      return;
    }

    // CRITICAL: Check if AI is already processing another message
    if (aiResponseLock) {
      console.log('[AI] Response lock active, queueing message:', messageId);
      return;
    }

    // Mark as processed immediately to prevent race conditions
    processedAIMessages.add(messageId);
    pendingAIResponseRef.current = messageId;
    
    const { isAIMessage, question, isHelp } = checkForAITrigger(content);
    
    if (!isAIMessage) {
      console.log('[AI] Not an AI message:', messageId);
      pendingAIResponseRef.current = null;
      return;
    }

    console.log('[AI] Processing AI trigger for message:', messageId);
    
    // Acquire lock
    aiResponseLock = true;
    safeSetIsAIThinking(true);

    try {
      if (isHelp) {
        await sendAIMessage(HELP_MESSAGE, messageId);
      } else if (question) {
        const currentMessages = messagesRef.current;
        const aiResponse = await getAIResponse(question, currentMessages);
        if (aiResponse && isMountedRef.current) {
          await sendAIMessage(aiResponse, messageId);
        }
      }
    } catch (err) {
      console.error('[AI] Error processing response:', err);
    } finally {
      // Release lock
      aiResponseLock = false;
      pendingAIResponseRef.current = null;
      safeSetIsAIThinking(false);
      console.log('[AI] Processing complete for message:', messageId);
    }
  }, [safeSetIsAIThinking, sendAIMessage]);

  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'code'): Promise<boolean> => {
    if (!groupId || !content.trim() || !username || !isMountedRef.current) return false;
    
    // Create optimistic message with a unique ID
    const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      group_id: groupId,
      content: content.trim(),
      message_type: messageType,
      username: username,
      created_at: new Date().toISOString(),
    };
    
    // Add optimistically
    safeSetMessages((prev) => [...prev, optimisticMessage]);
    
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
        safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return false;
      }
      
      // Replace optimistic message with real one
      if (data) {
        const realMessageId = data.id;
        console.log('[Message] Sent with ID:', realMessageId);
        
        safeSetMessages((prev) => 
          prev.map((m) => m.id === optimisticId ? (data as Message) : m)
        );

        // Process AI response for this specific message
        // Only process if this is NOT from the AI and has a trigger
        if (username !== AI_NAME && isMountedRef.current) {
          // Small delay to ensure state is updated
          setTimeout(() => {
            processAIResponse(realMessageId, content.trim());
          }, 50);
        }
      }

      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  }, [groupId, username, safeSetMessages, processAIResponse]);

  const sendFileMessage = useCallback(async (file: File): Promise<boolean> => {
    if (!groupId || !username || !isMountedRef.current) return false;

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
    
    safeSetMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${groupId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
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
        safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return false;
      }

      if (data) {
        safeSetMessages((prev) => 
          prev.map((m) => m.id === optimisticId ? (data as Message) : m)
        );
      }
      return true;
    } catch (err) {
      console.error('Error sending file:', err);
      safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  }, [groupId, username, safeSetMessages]);

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
          console.log('Realtime INSERT received:', payload.new?.id);
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

          // DO NOT trigger AI response from realtime events
          // AI responses are only triggered from sendMessage
          // This prevents duplicate responses on reconnect/re-render
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

  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!groupId || !isMountedRef.current) return false;

    // Optimistically remove
    safeSetMessages((prev) => prev.filter((m) => m.id !== messageId));

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        // Refetch to restore
        fetchMessages();
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      fetchMessages();
      return false;
    }
  }, [groupId, safeSetMessages, fetchMessages]);

  return {
    messages,
    loading,
    isAIThinking,
    sendMessage,
    sendFileMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
}
