import { useState, useCallback, useRef } from 'react';

interface SwipeState {
  messageId: string;
  username: string;
  content: string;
}

export function useSwipeToReply() {
  const [quotedMessage, setQuotedMessage] = useState<SwipeState | null>(null);

  const handleSwipeReply = useCallback((messageId: string, username: string, content: string) => {
    setQuotedMessage({ messageId, username, content });
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const dismissQuote = useCallback(() => {
    setQuotedMessage(null);
  }, []);

  return {
    quotedMessage,
    handleSwipeReply,
    dismissQuote,
  };
}
