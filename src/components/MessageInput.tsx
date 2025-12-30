import { useState } from 'react';
import { Send, Code, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';

interface MessageInputProps {
  onSend: (content: string, type: 'text' | 'code') => Promise<boolean>;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    const success = await onSend(content, isCodeMode ? 'code' : 'text');
    if (success) {
      setContent('');
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isCodeMode) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card p-4">
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
