import { useRef, useState, useCallback, useEffect } from 'react';

interface LongPressOptions {
  delay?: number;
  onLongPress: (position: { x: number; y: number }) => void;
}

export function useLongPress({ delay = 500, onLongPress }: LongPressOptions) {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Get position
    if ('touches' in e) {
      positionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      positionRef.current = { x: e.clientX, y: e.clientY };
    }

    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
      onLongPress(positionRef.current);
      setIsPressed(false);
    }, delay);
  }, [delay, onLongPress]);

  const cancel = useCallback(() => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    isPressed,
  };
}
