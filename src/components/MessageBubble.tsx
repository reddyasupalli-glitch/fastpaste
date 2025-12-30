import { Copy, Check, CheckCheck, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import type { Message } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  seenBy?: string[];
}

export function MessageBubble({ message, isOwn, seenBy = [] }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  // File message
  if (message.message_type === 'file' && message.file_url) {
    return (
      <div className={cn("my-1.5 sm:my-2 max-w-[90%] sm:max-w-[80%]", isOwn && "ml-auto")}>
        <div className="mb-1">
          <span className={`text-[10px] sm:text-xs font-medium ${isOwn ? 'text-primary' : 'text-muted-foreground'}`}>
            {isOwn ? 'You' : message.username}
          </span>
        </div>
        <div className={cn(
          "rounded-lg overflow-hidden",
          isOwn ? "bg-primary/10" : "bg-secondary"
        )}>
          {isImage ? (
            <div className="relative">
              {!imageLoaded && (
                <div className="flex h-32 sm:h-48 items-center justify-center bg-muted">
                  <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse text-muted-foreground" />
                </div>
              )}
              <img
                src={message.file_url}
                alt={message.file_name || 'Image'}
                className={cn(
                  "max-h-48 sm:max-h-64 w-auto rounded-lg cursor-pointer transition-opacity",
                  !imageLoaded && "hidden"
                )}
                onLoad={() => setImageLoaded(true)}
                onClick={() => window.open(message.file_url!, '_blank')}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/20">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-xs sm:text-sm">{message.file_name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{message.file_type}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(message.file_url!, '_blank')}
                title="Download file"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="mt-1">
          <time className="text-[10px] sm:text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString()}
          </time>
        </div>
        {renderSeenBy()}
      </div>
    );
  }

  // Code message
  if (message.message_type === 'code') {
    return (
      <div className={cn("group relative my-1.5 sm:my-2 w-full", isOwn && "ml-auto")}>
        <div className="mb-1 flex items-center gap-2">
          <span className={`text-[10px] sm:text-xs font-medium ${isOwn ? 'text-primary' : 'text-muted-foreground'}`}>
            {isOwn ? 'You' : message.username}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-2 sm:px-3 py-1 sm:py-1.5">
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Code</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-6 sm:h-7 gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1.5 sm:px-2"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
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
                className="overflow-x-auto p-2 sm:p-4 text-xs sm:text-sm"
                style={{ ...style, margin: 0, borderRadius: 0 }}
              >
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="mr-2 sm:mr-4 inline-block w-4 sm:w-6 select-none text-right text-muted-foreground/50 text-[10px] sm:text-sm">
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
        <div className="mt-1 flex items-center justify-between">
          <time className="text-[10px] sm:text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString()}
          </time>
        </div>
        {renderSeenBy()}
      </div>
    );
  }

  // Text message
  return (
    <div className={cn("my-1.5 sm:my-2 max-w-[90%] sm:max-w-[80%]", isOwn && "ml-auto")}>
      <div className="mb-1">
        <span className={`text-[10px] sm:text-xs font-medium ${isOwn ? 'text-primary' : 'text-muted-foreground'}`}>
          {isOwn ? 'You' : message.username}
        </span>
      </div>
      <div className={cn(
        "rounded-lg px-3 py-2 sm:px-4 sm:py-2.5",
        isOwn ? "bg-primary text-primary-foreground" : "bg-secondary"
      )}>
        <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.content}</p>
      </div>
      <div className="mt-1">
        <time className="text-[10px] sm:text-xs text-muted-foreground">
          {new Date(message.created_at).toLocaleTimeString()}
        </time>
      </div>
      {renderSeenBy()}
    </div>
  );
}
