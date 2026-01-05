import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface RoomExpiryNotificationProps {
  groupId: string;
  groupCode: string;
}

export function RoomExpiryNotification({ groupId, groupCode }: RoomExpiryNotificationProps) {
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchLastActivity = useCallback(async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('last_activity_at')
      .eq('id', groupId)
      .single();

    if (!error && data) {
      setLastActivity(new Date(data.last_activity_at));
    }
  }, [groupId]);

  useEffect(() => {
    fetchLastActivity();
    
    // Refresh activity time every minute
    const interval = setInterval(fetchLastActivity, 60000);
    return () => clearInterval(interval);
  }, [fetchLastActivity]);

  useEffect(() => {
    if (!lastActivity) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiryTime = new Date(lastActivity.getTime() + 24 * 60 * 60 * 1000); // 24 hours from last activity
      const diff = expiryTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setUrgencyLevel('high');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours < 1) {
        setTimeRemaining(`${minutes}m remaining`);
        setUrgencyLevel('high');
      } else if (hours < 6) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
        setUrgencyLevel('medium');
      } else if (hours < 12) {
        setTimeRemaining(`${hours}h remaining`);
        setUrgencyLevel('low');
      } else {
        setUrgencyLevel(null); // Don't show notification if more than 12 hours remaining
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastActivity]);

  // Don't show if dismissed, no urgency, or no activity data
  if (dismissed || !urgencyLevel || !lastActivity) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-2 text-sm border-b',
        urgencyLevel === 'high' && 'bg-destructive/10 text-destructive border-destructive/20',
        urgencyLevel === 'medium' && 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        urgencyLevel === 'low' && 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
      )}
    >
      <div className="flex items-center gap-2">
        {urgencyLevel === 'high' ? (
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        ) : (
          <Clock className="h-4 w-4 flex-shrink-0" />
        )}
        <span className="text-xs sm:text-sm">
          {urgencyLevel === 'high' ? (
            <>Room <strong>{groupCode}</strong> will expire soon! Send a message to keep it active.</>
          ) : (
            <>Room expires in <strong>{timeRemaining}</strong>. Activity resets the timer.</>
          )}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-background/50 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
