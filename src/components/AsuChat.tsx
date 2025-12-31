import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AsuChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: input.trim(),
          conversationContext: messages.slice(-10).map(m => ({
            username: m.role === 'user' ? 'User' : 'Asu',
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data?.response || 'Sorry, something went wrong. Please try again!',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error getting AI response:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Oops! Connection problem undi. Please try again! 🙏',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Chat with Asu</h3>
            <p className="text-[10px] text-muted-foreground">Ask me anything!</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="h-[250px] p-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <Bot className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Hey! Nenu Asu 👋</p>
            <p className="text-xs mt-1">Ask me anything!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 h-9 text-sm"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-9 w-9">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
