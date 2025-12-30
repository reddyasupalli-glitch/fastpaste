import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import type { Message } from '@/hooks/useMessages';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.message_type === 'code') {
    return (
      <div className="group relative my-2 max-w-full">
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Code</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-7 gap-1.5 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
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
                className="overflow-x-auto p-4 text-sm"
                style={{ ...style, margin: 0, borderRadius: 0 }}
              >
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="mr-4 inline-block w-6 select-none text-right text-muted-foreground/50">
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
        <time className="mt-1 block text-xs text-muted-foreground">
          {new Date(message.created_at).toLocaleTimeString()}
        </time>
      </div>
    );
  }

  return (
    <div className="my-2 max-w-[80%]">
      <div className="rounded-lg bg-secondary px-4 py-2.5">
        <p className="whitespace-pre-wrap break-words text-foreground">{message.content}</p>
      </div>
      <time className="mt-1 block text-xs text-muted-foreground">
        {new Date(message.created_at).toLocaleTimeString()}
      </time>
    </div>
  );
}
