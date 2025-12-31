import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

const AI_NAME = 'Asu';
const AI_TRIGGER_PATTERNS = [/@Asu\s*/i, /\/Asu\s*/i];
const HELP_TRIGGERS = ['help', '?', 'commands'];

const WELCOME_MESSAGE = `Hey! Nenu Asu, mee AI friend in FastPaste! 🎉

Welcome to the chat! Meeku em help kavali ante just ask cheyandi.

**Nannu ela use cheyyalo:**
• Type \`@Asu\` followed by your question
• Or use \`/Asu\` followed by your question

**Examples:**
• \`@Asu What is JavaScript?\`
• \`/Asu Tell me a joke\`
• \`@Asu Help me with coding\`

Inka em doubt unte cheppandi, nenu help chestanu! Happy chatting! 🤖✨`;

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

export function useMessages(groupId: string | null, username: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);
  const isMountedRef = useRef(true);
  const messagesRef = useRef<Message[]>([]);
  const welcomeSentRef = useRef(false);

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
        return "Sorry, I'm having trouble connecting right now. Please try again! 🔄";
      }

      if (data?.error) {
        console.error('AI error response:', data.error);
        return data.error;
      }

      return data?.response || "I couldn't generate a response. Please try again!";
    } catch (err) {
      console.error('Error getting AI response:', err);
      return "Oops! Something went wrong. Please try again in a moment! 🙏";
    }
  };

  const sendAIMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!groupId || !isMountedRef.current) return false;

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
        console.error('Error sending AI message:', error);
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
      console.error('Error sending AI message:', err);
      safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  }, [groupId, safeSetMessages]);

  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'code'): Promise<boolean> => {
    if (!groupId || !content.trim() || !username || !isMountedRef.current) return false;
    
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
        safeSetMessages((prev) => 
          prev.map((m) => m.id === optimisticId ? (data as Message) : m)
        );
      }

      // Check if message triggers AI response
      const { isAIMessage, question, isHelp } = checkForAITrigger(content.trim());
      if (isAIMessage && isMountedRef.current) {
        safeSetIsAIThinking(true);
        try {
          if (isHelp) {
            // Show help message without API call
            await sendAIMessage(HELP_MESSAGE);
          } else if (question) {
            // Use messagesRef for context instead of setState trick
            const currentMessages = messagesRef.current;
            const aiResponse = await getAIResponse(question, currentMessages);
            if (aiResponse && isMountedRef.current) {
              await sendAIMessage(aiResponse);
            }
          }
        } finally {
          safeSetIsAIThinking(false);
        }
      }

      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      safeSetMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      return false;
    }
  }, [groupId, username, safeSetMessages, safeSetIsAIThinking, sendAIMessage]);

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

  // Send welcome message from Asu when user first joins
  useEffect(() => {
    if (!groupId || !username || welcomeSentRef.current || loading) return;
    
    // Check if there are no messages or if Asu hasn't welcomed yet in this session
    const hasWelcomeFromAsu = messages.some(
      m => m.username === AI_NAME && m.content.includes("Welcome to the chat")
    );
    
    // Only send welcome if this is a new/empty chat or first time user
    if (messages.length === 0 && !hasWelcomeFromAsu) {
      welcomeSentRef.current = true;
      // Small delay to ensure the UI is ready
      setTimeout(() => {
        sendAIMessage(WELCOME_MESSAGE);
      }, 1000);
    }
  }, [groupId, username, messages.length, loading, sendAIMessage]);

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
