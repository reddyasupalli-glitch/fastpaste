import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_TOKEN_KEY = 'room-session-token';

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function getOrCreateSessionToken(): string {
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = generateSessionToken();
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}

export function getSessionToken(): string {
  return getOrCreateSessionToken();
}

export function useRoomSession(groupId: string | null, username: string | null) {
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const joinRoom = useCallback(async () => {
    if (!groupId || !username) return false;
    
    setLoading(true);
    
    try {
      // Use secure RPC function to create/update session
      // This ensures the session token is hashed server-side
      // and prevents username changes after initial join
      const { error } = await supabase
        .rpc('create_room_session', {
          p_group_id: groupId,
          p_username: username,
        });
      
      if (error) {
        console.error('Failed to create room session:', error);
        setLoading(false);
        return false;
      }
      
      setSessionActive(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error joining room:', err);
      setLoading(false);
      return false;
    }
  }, [groupId, username]);

  const leaveRoom = useCallback(async () => {
    if (!groupId) return;
    
    const sessionToken = getOrCreateSessionToken();
    
    try {
      await supabase
        .from('room_sessions')
        .delete()
        .eq('group_id', groupId)
        .eq('session_token', sessionToken);
      
      setSessionActive(false);
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  }, [groupId]);

  const updateLastSeen = useCallback(async () => {
    if (!groupId || !sessionActive) return;
    
    const sessionToken = getOrCreateSessionToken();
    
    try {
      await supabase
        .from('room_sessions')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('group_id', groupId)
        .eq('session_token', sessionToken);
    } catch (err) {
      // Silently fail - not critical
    }
  }, [groupId, sessionActive]);

  // Auto-join when groupId and username are available
  useEffect(() => {
    if (groupId && username && !sessionActive) {
      joinRoom();
    }
  }, [groupId, username, sessionActive, joinRoom]);

  // Periodically update last_seen
  useEffect(() => {
    if (!sessionActive) return;
    
    const interval = setInterval(updateLastSeen, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [sessionActive, updateLastSeen]);

  return {
    sessionActive,
    loading,
    joinRoom,
    leaveRoom,
    sessionToken: getOrCreateSessionToken(),
  };
}
