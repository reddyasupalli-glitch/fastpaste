import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Code, Type, RotateCcw, X, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';
import { AsuMentionSuggestion } from './AsuMentionSuggestion';
import { PassiveAsuSuggestion } from './PassiveAsuSuggestion';
import { QuotedMessage } from './QuotedMessage';

interface FailedMessage {
  content: string;
  type: 'text' | 'code';
}

interface QuotedMessageData {
  messageId: string;
  username: string;
  content: string;
}

interface MessageInputProps {
  onSend: (content: string, type: 'text' | 'code') => Promise<boolean>;
  onSendFile?: (file: File) => Promise<boolean>;
  onTypingChange?: (isTyping: boolean) => void;
  quotedMessage?: QuotedMessageData | null;
  onDismissQuote?: () => void;
}

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
  'application/javascript',
  'text/javascript',
  'text/css',
  'text/html',
  'application/zip',
  'application/x-zip-compressed',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PASSIVE_SUGGEST_DELAY = 1500; // 1.5 seconds

export function MessageInput({ onSend, onSendFile, onTypingChange, quotedMessage, onDismissQuote }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [failedMessage, setFailedMessage] = useState<FailedMessage | null>(null);
  const [showMentionSuggestion, setShowMentionSuggestion] = useState(false);
  const [showPassiveSuggestion, setShowPassiveSuggestion] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const passiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-insert @asu when quote is set
  useEffect(() => {
    if (quotedMessage && !content.includes('@asu')) {
      setContent('@asu ');
      textareaRef.current?.focus();
    }
  }, [quotedMessage]);

  // Handle passive suggestion
  useEffect(() => {
    if (isFocused && content.trim() === '') {
      passiveTimeoutRef.current = setTimeout(() => {
        setShowPassiveSuggestion(true);
      }, PASSIVE_SUGGEST_DELAY);
    } else {
      setShowPassiveSuggestion(false);
    }

    return () => {
      if (passiveTimeoutRef.current) {
        clearTimeout(passiveTimeoutRef.current);
      }
    };
  }, [isFocused, content]);

  const setTyping = useCallback((typing: boolean) => {
    if (isTypingRef.current !== typing) {
      isTypingRef.current = typing;
      onTypingChange?.(typing);
    }
  }, [onTypingChange]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setShowPassiveSuggestion(false);
    
    // Check for @ mention at cursor position or end
    const cursorPos = textareaRef.current?.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Show suggestion if @ is at end or followed by partial "asu" match
      if (textAfterAt === '' || 'asu'.startsWith(textAfterAt.toLowerCase())) {
        setShowMentionSuggestion(true);
      } else {
        setShowMentionSuggestion(false);
      }
    } else {
      setShowMentionSuggestion(false);
    }
    
    if (value.trim()) {
      setTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
    }
  };

  const insertAsuMention = useCallback(() => {
    const cursorPos = textareaRef.current?.selectionStart ?? content.length;
    const textBeforeCursor = content.slice(0, cursorPos);
    const textAfterCursor = content.slice(cursorPos);
    
    // Find the @ position to replace
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    let newContent: string;
    let newCursorPos: number;
    
    if (lastAtIndex !== -1) {
      // Replace from @ to cursor with @asu
      newContent = textBeforeCursor.slice(0, lastAtIndex) + '@asu ' + textAfterCursor;
      newCursorPos = lastAtIndex + 5; // Position after "@asu "
    } else {
      // Just prepend @asu
      newContent = '@asu ' + content;
      newCursorPos = 5;
    }
    
    setContent(newContent);
    setShowMentionSuggestion(false);
    setShowPassiveSuggestion(false);
    
    // Focus and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [content]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (passiveTimeoutRef.current) {
        clearTimeout(passiveTimeoutRef.current);
      }
      setTyping(false);
    };
  }, [setTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setTyping(false);
    setShowMentionSuggestion(false);
    setShowPassiveSuggestion(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setSending(true);
    
    // Build message with quote context if present
    let messageContent = content;
    if (quotedMessage) {
      messageContent = `[Replying to ${quotedMessage.username}: "${quotedMessage.content.slice(0, 100)}${quotedMessage.content.length > 100 ? '...' : ''}"]\n\n${content}`;
    }
    
    const messageType = isCodeMode ? 'code' : 'text';
    
    const success = await onSend(messageContent, messageType);
    if (success) {
      setContent('');
      setFailedMessage(null);
      onDismissQuote?.();
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSendFile) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image, PDF, or text file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingFile(true);
    const success = await onSendFile(file);
    
    if (success) {
      toast({
        title: 'File sent',
        description: `${file.name} has been shared`,
      });
    } else {
      toast({
        title: 'Failed to send file',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
    setUploadingFile(false);
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
    // Dismiss suggestions on Escape
    if (e.key === 'Escape') {
      setShowMentionSuggestion(false);
      setShowPassiveSuggestion(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding to allow click on suggestion
    setTimeout(() => {
      setShowMentionSuggestion(false);
      setShowPassiveSuggestion(false);
    }, 200);
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card/90 backdrop-blur-sm p-2 sm:p-3 md:p-4 relative">
      <div className="mx-auto w-full max-w-4xl relative">
        {/* @asu Mention Suggestion */}
        <AsuMentionSuggestion 
          isVisible={showMentionSuggestion} 
          onSelect={insertAsuMention} 
        />
        
        {/* Passive ASU Suggestion */}
        <PassiveAsuSuggestion 
          isVisible={showPassiveSuggestion && !showMentionSuggestion} 
          onSelect={insertAsuMention} 
        />

        {/* Quoted Message */}
        <AnimatePresence>
          {quotedMessage && onDismissQuote && (
            <QuotedMessage
              username={quotedMessage.username}
              content={quotedMessage.content}
              onDismiss={onDismissQuote}
            />
          )}
        </AnimatePresence>

        {failedMessage && (
          <div className="mb-2 sm:mb-3 flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            <span className="flex-1 text-xs sm:text-sm">Message failed to send</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={sending}
              className="h-7 gap-1 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Retry</span>
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
        <div className="flex items-end gap-1.5 sm:gap-2">
          <div className="flex flex-row sm:flex-col gap-1 sm:gap-2">
            <Toggle
              pressed={isCodeMode}
              onPressedChange={setIsCodeMode}
              aria-label="Toggle code mode"
              className="h-9 w-9 sm:h-10 sm:w-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {isCodeMode ? <Code className="h-4 w-4" /> : <Type className="h-4 w-4" />}
            </Toggle>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_FILE_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              title="Attach file"
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              {uploadingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isCodeMode ? 'Paste your code here...' : 'Type @ to mention ASU...'}
            className={`min-h-[40px] sm:min-h-[44px] flex-1 resize-none text-sm sm:text-base ${isCodeMode ? 'font-mono' : ''}`}
            rows={isCodeMode ? 4 : 1}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!content.trim() || sending}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left">
          {isCodeMode 
            ? 'Code mode: Your message will be formatted as a code block' 
            : 'Type @ for AI · Swipe message to reply'}
        </p>
      </div>
    </form>
  );
}
