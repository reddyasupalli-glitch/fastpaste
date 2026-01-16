import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateGroupCode } from '@/lib/groupUtils';
import { addToGroupHistory, getCreatorUsername } from '@/lib/groupHistory';

interface Group {
  id: string;
  code: string;
  created_at: string;
  room_type: 'public';
  creatorUsername?: string;
}

export function useGroup() {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);

  const createGroup = async (options: { isPrivate?: boolean } = {}, username?: string): Promise<Group | null> => {
    setLoading(true);
    setError(null);
    
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const code = generateGroupCode();
      
      const { data, error: insertError } = await supabase
        .from('groups')
        .insert({
          code,
          room_type: 'public',
        })
        .select('id, code, created_at, room_type')
        .single();
      
      if (data) {
        const groupData = { 
          ...data, 
          room_type: 'public' as const,
          creatorUsername: username,
        };
        setGroup(groupData);
        setCreatorUsername(username || null);
        addToGroupHistory(data.code, 'created', username);
        setLoading(false);
        return groupData;
      }
      
      // If error is not a unique violation, break
      if (insertError && !insertError.message.includes('duplicate')) {
        setError(insertError.message);
        setLoading(false);
        return null;
      }
      
      attempts++;
    }
    
    setError('Failed to generate unique room code');
    setLoading(false);
    return null;
  };

  const joinGroup = async (code: string): Promise<Group | null> => {
    setLoading(true);
    setError(null);
    
    // Use secure RPC function to look up room by exact code
    const { data: roomData, error: fetchError } = await supabase
      .rpc('join_group_by_code', { p_code: code.toUpperCase() });
    
    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return null;
    }
    
    const roomInfo = roomData?.[0];
    
    if (!roomInfo) {
      setError('Room not found');
      setLoading(false);
      return null;
    }
    
    // Check if we're the creator (from local history)
    const storedCreator = getCreatorUsername(roomInfo.code);
    
    const groupData = { 
      id: roomInfo.id, 
      code: roomInfo.code, 
      created_at: roomInfo.created_at, 
      room_type: 'public' as const,
      creatorUsername: storedCreator,
    };
    
    setGroup(groupData);
    setCreatorUsername(storedCreator || null);
    addToGroupHistory(roomInfo.code, 'joined', storedCreator);
    setLoading(false);
    return groupData;
  };

  const leaveGroup = () => {
    setGroup(null);
    setError(null);
    setCreatorUsername(null);
  };

  return {
    group,
    loading,
    error,
    creatorUsername,
    createGroup,
    joinGroup,
    leaveGroup,
  };
}