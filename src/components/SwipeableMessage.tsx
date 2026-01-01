import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Reply } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableMessageProps {
  children: React.ReactNode;
  onSwipeReply: () => void;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 60;

export function SwipeableMessage({ children, onSwipeReply, disabled = false }: SwipeableMessageProps) {
  const x = useMotionValue(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // Transform x to icon opacity and scale
  const iconOpacity = useTransform(x, [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const iconScale = useTransform(x, [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD], [0.5, 0.8, 1]);
  const iconX = useTransform(x, [0, SWIPE_THRESHOLD], [-30, 0]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsSwiping(false);
    if (info.offset.x >= SWIPE_THRESHOLD) {
      onSwipeReply();
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  }, [onSwipeReply]);

  const handleDragStart = useCallback(() => {
    setIsSwiping(true);
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden touch-pan-y">
      {/* Reply indicator */}
      <motion.div
        style={{ opacity: iconOpacity, scale: iconScale, x: iconX }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
      >
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Reply className="h-4 w-4 text-primary-foreground" />
        </div>
      </motion.div>
      
      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        dragDirectionLock
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "relative",
          isSwiping && "cursor-grabbing"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
