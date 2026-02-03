import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, X, Sparkles, Lightbulb, Bug, 
  MessageSquare, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AICodeHelperProps {
  code: string;
  language: string;
  onClose: () => void;
  onSuggestion?: (code: string) => void;
}

export const AICodeHelper = ({ 
  code, 
  language, 
  onClose, 
  onSuggestion 
}: AICodeHelperProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string, includeCode: boolean = true) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = `You are a helpful coding assistant in a collaborative coding room. 
The user is working with ${language} code.
${includeCode && code ? `\nCurrent code:\n\`\`\`${language}\n${code}\n\`\`\`` : ''}

Provide concise, helpful responses. When suggesting code changes, show only the relevant parts.
Use markdown formatting for code blocks.`;

      const response = await supabase.functions.invoke('ai-code-helper', {
        body: { 
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content },
          ],
        },
      });

      if (response.error) throw response.error;

      const aiResponse = response.data?.content || 'Sorry, I could not process your request.';

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI helper error:', error);
      toast.error(error.message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: Bug, label: 'Explain errors', prompt: 'Explain any errors or issues in this code and how to fix them.' },
    { icon: Sparkles, label: 'Improve', prompt: 'Suggest improvements for this code to make it cleaner and more efficient.' },
    { icon: Lightbulb, label: 'Explain', prompt: 'Explain what this code does step by step.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-80 flex flex-col bg-card/90 border-l border-border/50"
    >
      {/* Header */}
      <div className="h-12 border-b border-border/50 flex items-center justify-between px-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-neon-purple" />
          <span className="font-cyber text-sm">AI_HELPER</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="p-3 border-b border-border/50 space-y-2">
          <p className="text-xs text-muted-foreground font-mono mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-7"
                onClick={() => sendMessage(action.prompt)}
                disabled={isLoading}
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-mono">
                Ask me anything about your code
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm ${
                  msg.role === 'user'
                    ? 'ml-4'
                    : 'mr-4'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {msg.role === 'assistant' && (
                    <Bot className="h-4 w-4 text-neon-purple mt-0.5" />
                  )}
                  <span className={`text-xs font-mono ${
                    msg.role === 'user' ? 'text-primary ml-auto' : 'text-neon-purple'
                  }`}>
                    {msg.role === 'user' ? 'You' : 'AI'}
                  </span>
                  {msg.role === 'user' && (
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                  )}
                </div>
                <div className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/50 border border-border/50'
                }`}>
                  <div className="prose prose-sm prose-invert max-w-none">
                    {msg.content.split('```').map((part, i) => {
                      if (i % 2 === 1) {
                        // Code block
                        const [lang, ...codeLines] = part.split('\n');
                        const codeContent = codeLines.join('\n');
                        return (
                          <pre key={i} className="bg-background/50 p-2 rounded text-xs overflow-x-auto">
                            <code>{codeContent}</code>
                          </pre>
                        );
                      }
                      return <p key={i} className="whitespace-pre-wrap">{part}</p>;
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-mono">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code..."
            className="flex-1 text-sm h-9"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default AICodeHelper;
