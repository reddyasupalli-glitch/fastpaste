import { Copy, Check, CheckCheck, Download, FileText, Image as ImageIcon, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import type { Message } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';
import { MessageReactions } from './MessageReactions';
import type { ReactionGroup } from '@/hooks/useReactions';

const AI_NAME = 'Asu';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  seenBy?: string[];
  reactions?: ReactionGroup[];
  onToggleReaction?: (emoji: string) => void;
}

interface ContentPart {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

// Parse message content to separate text and code blocks
function parseMessageContent(content: string): ContentPart[] {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }
    
    // Add code block
    parts.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || 'javascript'
    });
    
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim();
    if (textContent) {
      parts.push({ type: 'text', content: textContent });
    }
  }

  // If no code blocks found, return original content as text
  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return parts;
}

export function MessageBubble({ message, isOwn, seenBy = [], reactions = [], onToggleReaction }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isAI = message.username === AI_NAME;

  const copyCode = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCodeBlock = useCallback((code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const isImage = message.file_type?.startsWith('image/');

  const renderSeenBy = () => {
    if (!isOwn || seenBy.length === 0) return null;
    
    const seenText = seenBy.length === 1 
      ? `Seen by ${seenBy[0]}`
      : seenBy.length === 2
        ? `Seen by ${seenBy[0]} and ${seenBy[1]}`
        : `Seen by ${seenBy[0]} and ${seenBy.length - 1} others`;
    
    return (
      <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] sm:text-xs text-muted-foreground">
        <CheckCheck className="h-3 w-3 text-primary" />
        <span>{seenText}</span>
      </div>
    );
  };

  const renderAvatar = () => {
    if (isOwn) return null;
    
    if (isAI) {
      return (
        <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
          <Bot className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-primary-foreground" />
        </div>
      );
    }
    
    return (
      <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full bg-secondary flex items-center justify-center text-[10px] sm:text-sm lg:text-base font-medium text-muted-foreground">
        {message.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderUsername = () => {
    if (isOwn) return 'You';
    if (isAI) {
      return (
        <span className="flex items-center gap-1">
          <span className="text-primary font-semibold">{AI_NAME}</span>
          <span className="text-[8px] sm:text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">AI</span>
        </span>
      );
    }
    return message.username;
  };

  // File message
  if (message.message_type === 'file' && message.file_url) {
    return (
      <div className={cn("group my-1 sm:my-1.5 lg:my-3 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] flex gap-1.5 sm:gap-2 lg:gap-3", isOwn && "ml-auto flex-row-reverse")}>
        {renderAvatar()}
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 sm:mb-1">
            <span className={cn("text-[9px] sm:text-[10px] lg:text-xs font-medium", isOwn ? 'text-primary' : 'text-muted-foreground')}>
              {renderUsername()}
            </span>
          </div>
          <div className={cn(
            "rounded-lg overflow-hidden",
            isOwn ? "bg-primary/10" : isAI ? "bg-primary/5 border border-primary/20" : "bg-secondary"
          )}>
            {isImage ? (
              <div className="relative">
                {!imageLoaded && (
                  <div className="flex h-24 sm:h-32 lg:h-48 items-center justify-center bg-muted">
                    <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 animate-pulse text-muted-foreground" />
                  </div>
                )}
                <img
                  src={message.file_url}
                  alt={message.file_name || 'Image'}
                  className={cn(
                    "max-h-36 sm:max-h-48 lg:max-h-64 w-auto rounded-lg cursor-pointer transition-opacity",
                    !imageLoaded && "hidden"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onClick={() => window.open(message.file_url!, '_blank')}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 p-1.5 sm:p-2 lg:p-3">
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-primary/20">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-[10px] sm:text-xs lg:text-sm">{message.file_name}</p>
                  <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">{message.file_type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(message.file_url!, '_blank')}
                  title="Download file"
                  className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9"
                >
                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-center justify-between">
            <time className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">
              {new Date(message.created_at).toLocaleTimeString()}
            </time>
          </div>
          {onToggleReaction && (
            <MessageReactions reactions={reactions} onToggleReaction={onToggleReaction} isOwn={isOwn} />
          )}
          {renderSeenBy()}
        </div>
      </div>
    );
  }

  // Code message
  if (message.message_type === 'code') {
    return (
      <div className={cn("group relative my-1 sm:my-1.5 lg:my-3 w-full lg:max-w-[85%] flex gap-1.5 sm:gap-2 lg:gap-3", isOwn && "flex-row-reverse ml-auto")}>
        {renderAvatar()}
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 sm:mb-1 flex items-center gap-2">
            <span className={cn("text-[9px] sm:text-[10px] lg:text-xs font-medium", isOwn ? 'text-primary' : 'text-muted-foreground')}>
              {renderUsername()}
            </span>
          </div>
          <div className={cn(
            "overflow-hidden rounded-lg border",
            isAI ? "border-primary/30" : "border-border"
          )}>
            <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5">
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-muted-foreground">Code</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCode}
                className="h-5 sm:h-6 lg:h-7 gap-0.5 sm:gap-1 lg:gap-1.5 text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 lg:px-2"
              >
                {copied ? (
                  <>
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </Button>
            </div>
            <Highlight
              theme={themes.nightOwl}
              code={message.content}
              language="javascript"
            >
              {({ style, tokens, getLineProps, getTokenProps }) => (
                <pre 
                  className="overflow-x-auto p-1.5 sm:p-3 lg:p-5 text-[10px] sm:text-xs lg:text-base"
                  style={{ ...style, margin: 0, borderRadius: 0 }}
                >
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span className="mr-1.5 sm:mr-3 lg:mr-6 inline-block w-3 sm:w-5 lg:w-8 select-none text-right text-muted-foreground/50 text-[9px] sm:text-xs lg:text-base">
                        {i + 1}
                      </span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-center justify-between">
            <time className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">
              {new Date(message.created_at).toLocaleTimeString()}
            </time>
          </div>
          {onToggleReaction && (
            <MessageReactions reactions={reactions} onToggleReaction={onToggleReaction} isOwn={isOwn} />
          )}
          {renderSeenBy()}
        </div>
      </div>
    );
  }

  // Parse content for code blocks (especially for AI messages)
  const contentParts = isAI ? parseMessageContent(message.content) : [{ type: 'text' as const, content: message.content }];
  const hasCodeBlocks = contentParts.some(part => part.type === 'code');

  // Text message (with possible code blocks for AI)
  return (
    <div className={cn("group my-1 sm:my-1.5 lg:my-3 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] flex gap-1.5 sm:gap-2 lg:gap-3", isOwn && "ml-auto flex-row-reverse", hasCodeBlocks && "max-w-[95%] sm:max-w-[90%] lg:max-w-[85%]")}>
      {renderAvatar()}
      <div className="flex-1 min-w-0">
        <div className="mb-0.5 sm:mb-1">
          <span className={cn("text-[9px] sm:text-[10px] lg:text-xs font-medium", isOwn ? 'text-primary' : 'text-muted-foreground')}>
            {renderUsername()}
          </span>
        </div>
        
        <div className="space-y-2">
          {contentParts.map((part, index) => (
            part.type === 'code' ? (
              <div key={index} className={cn(
                "overflow-hidden rounded-lg border",
                isAI ? "border-primary/30" : "border-border"
              )}>
                <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5">
                  <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-muted-foreground">
                    {part.language || 'Code'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCodeBlock(part.content, index)}
                    className="h-5 sm:h-6 lg:h-7 gap-0.5 sm:gap-1 lg:gap-1.5 text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 lg:px-2"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <Highlight
                  theme={themes.nightOwl}
                  code={part.content}
                  language={part.language || 'javascript'}
                >
                  {({ style, tokens, getLineProps, getTokenProps }) => (
                    <pre 
                      className="overflow-x-auto p-1.5 sm:p-3 lg:p-5 text-[10px] sm:text-xs lg:text-sm"
                      style={{ ...style, margin: 0, borderRadius: 0 }}
                    >
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          <span className="mr-1.5 sm:mr-3 lg:mr-6 inline-block w-3 sm:w-5 lg:w-8 select-none text-right text-muted-foreground/50 text-[9px] sm:text-xs lg:text-sm">
                            {i + 1}
                          </span>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            ) : (
              <div key={index} className={cn(
                "rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 lg:px-5 lg:py-3",
                isOwn 
                  ? "bg-primary text-primary-foreground" 
                  : isAI 
                    ? "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20" 
                    : "bg-secondary"
              )}>
                <p className="whitespace-pre-wrap break-words text-xs sm:text-sm lg:text-[17px] lg:leading-relaxed">{part.content}</p>
              </div>
            )
          ))}
        </div>
        
        <div className="mt-0.5 sm:mt-1">
          <time className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString()}
          </time>
        </div>
        {onToggleReaction && (
          <MessageReactions reactions={reactions} onToggleReaction={onToggleReaction} isOwn={isOwn} />
        )}
        {renderSeenBy()}
      </div>
    </div>
  );
}
