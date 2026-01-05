import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface RoomExpiryNotificationProps {
  groupId: string;
  groupCode: string;
}

export function RoomExpiryNotification({ groupId, groupCode }: RoomExpiryNotificationProps) {
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefreshActivity = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', groupId);

      if (error) throw error;

      await fetchLastActivity();
      toast({
        title: "Activity refreshed!",
        description: "Room timer has been reset to 24 hours.",
      });
    } catch (err) {
      toast({
        title: "Failed to refresh",
        description: "Could not reset the room timer.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

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
            <>Room <strong>{groupCode}</strong> will expire soon!</>
          ) : (
            <>Room expires in <strong>{timeRemaining}</strong></>
          )}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleRefreshActivity}
          disabled={refreshing}
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors",
            "bg-background/50 hover:bg-background/80",
            refreshing && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Refresh activity"
        >
          <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-background/50 rounded transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
