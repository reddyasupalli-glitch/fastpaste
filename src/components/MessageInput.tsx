import { useState } from 'react';
import { Send, Code, Type, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { toast } from '@/hooks/use-toast';

interface FailedMessage {
  content: string;
  type: 'text' | 'code';
}

interface MessageInputProps {
  onSend: (content: string, type: 'text' | 'code') => Promise<boolean>;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [failedMessage, setFailedMessage] = useState<FailedMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    const messageContent = content;
    const messageType = isCodeMode ? 'code' : 'text';
    
    const success = await onSend(messageContent, messageType);
    if (success) {
      setContent('');
      setFailedMessage(null);
    } else {
      setFailedMessage({ content: messageContent, type: messageType });
      toast({
        title: 'Failed to send message',
        description: 'Click retry to try again',
        variant: 'destructive',
      });
    }
    setSending(false);
  };

  const handleRetry = async () => {
    if (!failedMessage || sending) return;
    
    setSending(true);
    const success = await onSend(failedMessage.content, failedMessage.type);
    if (success) {
      setContent('');
      setFailedMessage(null);
      toast({
        title: 'Message sent',
        description: 'Your message was sent successfully',
      });
    } else {
      toast({
        title: 'Still failing',
        description: 'Please check your connection and try again',
        variant: 'destructive',
      });
    }
    setSending(false);
  };

  const dismissFailed = () => {
    setFailedMessage(null);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isCodeMode) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card p-4">
      {failedMessage && (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          <span className="flex-1">Message failed to send</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={sending}
            className="h-7 gap-1 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={dismissFailed}
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-2">
          <Toggle
            pressed={isCodeMode}
            onPressedChange={setIsCodeMode}
            aria-label="Toggle code mode"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {isCodeMode ? <Code className="h-4 w-4" /> : <Type className="h-4 w-4" />}
          </Toggle>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isCodeMode ? 'Paste your code here...' : 'Type a message...'}
          className={`min-h-[44px] flex-1 resize-none ${isCodeMode ? 'font-mono' : ''}`}
          rows={isCodeMode ? 4 : 1}
        />
        <Button type="submit" size="icon" disabled={!content.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {isCodeMode ? 'Code mode: Your message will be formatted as a code block' : 'Text mode: Press Enter to send, Shift+Enter for new line'}
      </p>
    </form>
  );
}
