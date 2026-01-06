import { useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FeedbackDialogProps {
  roomCode?: string;
  triggerClassName?: string;
  showLabel?: boolean;
}

const WHATSAPP_FEEDBACK_NUMBER = '+916300552884';

export function FeedbackDialog({ roomCode, triggerClassName, showLabel = false }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleShare = () => {
    const stars = '⭐'.repeat(rating);
    const message = `FastPaste Feedback\n\n${stars} (${rating}/5)\n\n${feedback}${roomCode ? `\n\nRoom: ${roomCode}` : ''}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_FEEDBACK_NUMBER}?text=${encoded}`, '_blank');
    setOpen(false);
    setRating(0);
    setFeedback('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 sm:h-8 sm:w-auto px-1 sm:px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950",
            triggerClassName
          )}
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:mr-1.5" />
          {showLabel && <span className="hidden md:inline text-xs">Feedback</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Rate FastPaste</DialogTitle>
          <DialogDescription className="text-center text-xs">
            Tap stars to rate, then share via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star Rating */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    (hoveredRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>

          {/* Feedback Text */}
          <Textarea
            placeholder="Share your thoughts... (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="h-20 resize-none text-sm"
            maxLength={500}
          />

          {/* Share Button */}
          <Button
            onClick={handleShare}
            disabled={rating === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Share via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}