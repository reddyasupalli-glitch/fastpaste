import { Copy, Check, CheckCheck, Download, FileText, Image as ImageIcon, Bot, Terminal } from 'lucide-react';
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
    if (!isOwn) return null;
    
    // Show single check if sent, double check with blue if seen
    if (seenBy.length === 0) {
      return (
        <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] sm:text-xs text-muted-foreground font-mono">
          <Check className="h-3 w-3" />
          <span>SENT</span>
        </div>
      );
    }
    
    const seenText = seenBy.length === 1 
      ? `${seenBy[0]}`
      : seenBy.length === 2
        ? `${seenBy[0]}, ${seenBy[1]}`
        : `${seenBy[0]} +${seenBy.length - 1}`;
    
    return (
      <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] sm:text-xs text-muted-foreground font-mono">
        <CheckCheck className="h-3 w-3 text-neon-cyan" />
        <span>SEEN: {seenText}</span>
      </div>
    );
  };

  const renderAvatar = () => {
    if (isOwn) return null;
    
    if (isAI) {
      return (
        <div className={cn(
          "flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-neon-cyan to-neon-purple",
          "shadow-[0_0_15px_hsl(var(--neon-cyan)/0.5)] ring-2 ring-neon-cyan/30"
        )}>
          <Bot className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-primary-foreground" />
        </div>
      );
    }
    
    return (
      <div className={cn(
        "flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full flex items-center justify-center",
        "bg-neon-purple/20 border border-neon-purple/30",
        "text-[10px] sm:text-sm lg:text-base font-mono font-medium text-neon-purple"
      )}>
        {message.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderUsername = () => {
    if (isOwn) return <span className="text-neon-cyan font-mono">YOU</span>;
    if (isAI) {
      return (
        <span className="flex items-center gap-1">
          <span className="text-neon-cyan font-cyber font-semibold">{AI_NAME}</span>
          <span className="text-[8px] sm:text-[10px] bg-neon-cyan/20 text-neon-cyan px-1.5 py-0.5 rounded-full font-mono border border-neon-cyan/30">AI</span>
        </span>
      );
    }
    return <span className="font-mono">{message.username}</span>;
  };

  // File message
  if (message.message_type === 'file' && message.file_url) {
    return (
      <div className={cn("group my-1 sm:my-1.5 lg:my-3 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] flex gap-1.5 sm:gap-2 lg:gap-3", isOwn && "ml-auto flex-row-reverse")}>
        {renderAvatar()}
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 sm:mb-1">
            <span className={cn("text-[9px] sm:text-[10px] lg:text-xs font-medium", isOwn ? 'text-neon-cyan' : 'text-muted-foreground')}>
              {renderUsername()}
            </span>
          </div>
          <div className={cn(
            "rounded-lg overflow-hidden border",
            isOwn ? "bg-neon-cyan/10 border-neon-cyan/30" : isAI ? "bg-neon-cyan/5 border-neon-cyan/20" : "bg-muted/50 border-border"
          )}>
            {isImage ? (
              <div className="relative">
                {!imageLoaded && (
                  <div className="flex h-24 sm:h-32 lg:h-48 items-center justify-center bg-muted/50">
                    <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 animate-pulse text-neon-cyan/50" />
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
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-neon-purple/20 border border-neon-purple/30">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-neon-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono font-medium text-[10px] sm:text-xs lg:text-sm">{message.file_name}</p>
                  <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-mono">{message.file_type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(message.file_url!, '_blank')}
                  title="Download file"
                  className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9 hover:bg-neon-cyan/10 hover:text-neon-cyan"
                >
                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-center justify-between">
            <time className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-mono">
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
            <span className={cn("text-[9px] sm:text-[10px] lg:text-xs font-medium", isOwn ? 'text-neon-cyan' : 'text-muted-foreground')}>
              {renderUsername()}
            </span>
          </div>
          <div className={cn(
            "overflow-hidden rounded-lg border",
            isAI ? "border-neon-cyan/30" : isOwn ? "border-neon-purple/30" : "border-border"
          )}>
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5">
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-mono font-medium text-neon-purple flex items-center gap-1">
                <Terminal className="h-3 w-3" />
                CODE
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCode}
                className="h-5 sm:h-6 lg:h-7 gap-0.5 sm:gap-1 lg:gap-1.5 text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 lg:px-2 hover:bg-neon-cyan/10 hover:text-neon-cyan font-mono"
              >
                {copied ? (
                  <>
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-neon-green" />
                    <span className="hidden sm:inline">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">COPY</span>
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
                  style={{ ...style, margin: 0, borderRadius: 0, background: 'hsl(240 20% 5%)' }}
                >
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span className="mr-1.5 sm:mr-3 lg:mr-6 inline-block w-3 sm:w-5 lg:w-8 select-none text-right text-neon-cyan/30 text-[9px] sm:text-xs lg:text-base font-mono">
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
            <time className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-mono">
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
          <span className={cn("text-[9px] sm:text-[10px] lg:text-xs font-medium", isOwn ? 'text-neon-cyan' : 'text-muted-foreground')}>
            {renderUsername()}
          </span>
        </div>
        
        <div className="space-y-2">
          {contentParts.map((part, index) => (
            part.type === 'code' ? (
              <div key={index} className="space-y-1">
                <div className={cn(
                  "overflow-hidden rounded-lg border",
                  isAI ? "border-neon-cyan/30" : "border-border"
                )}>
                  <div className="flex items-center justify-between border-b border-border bg-muted/80 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2">
                    <span className="text-[10px] sm:text-xs lg:text-sm font-mono font-semibold text-neon-purple uppercase tracking-wide flex items-center gap-1">
                      <Terminal className="h-3 w-3" />
                      {part.language || 'CODE'}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCodeBlock(part.content, index)}
                        className="h-6 sm:h-7 lg:h-8 gap-1 sm:gap-1.5 text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 font-mono"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-neon-green" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>COPY</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Highlight
                    theme={themes.nightOwl}
                    code={part.content}
                    language={part.language || 'javascript'}
                  >
                    {({ style, tokens, getLineProps, getTokenProps }) => (
                      <pre 
                        className="overflow-x-auto p-1.5 sm:p-3 lg:p-5 text-[10px] sm:text-xs lg:text-sm"
                        style={{ ...style, margin: 0, borderRadius: 0, background: 'hsl(240 20% 5%)' }}
                      >
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line })}>
                            <span className="mr-1.5 sm:mr-3 lg:mr-6 inline-block w-3 sm:w-5 lg:w-8 select-none text-right text-neon-cyan/30 text-[9px] sm:text-xs lg:text-sm font-mono">
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
              </div>
            ) : (
              <div key={index} className={cn(
                "rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 lg:px-5 lg:py-3 border",
                isOwn 
                  ? "bg-neon-cyan/20 border-neon-cyan/30 text-foreground" 
                  : isAI 
                    ? "bg-gradient-to-br from-neon-cyan/10 to-neon-purple/5 border-neon-cyan/20" 
                    : "bg-muted/50 border-border"
              )}>
                <p className="whitespace-pre-wrap break-words text-xs sm:text-sm lg:text-[17px] lg:leading-relaxed">{part.content}</p>
              </div>
            )
          ))}
        </div>
        
        <div className="mt-0.5 sm:mt-1">
          <time className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-mono">
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
