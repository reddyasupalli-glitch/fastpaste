import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateGroupCode, hashPassword } from '@/lib/groupUtils';
import { addToGroupHistory, getCreatorUsername } from '@/lib/groupHistory';

interface Group {
  id: string;
  code: string;
  created_at: string;
  room_type: 'public' | 'private';
  creatorUsername?: string;
}

interface CreateGroupOptions {
  isPrivate: boolean;
  password?: string;
}

export function useGroup() {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingJoinGroup, setPendingJoinGroup] = useState<{ id: string; code: string; created_at: string } | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);

  const createGroup = async (options: CreateGroupOptions = { isPrivate: false }, username?: string): Promise<Group | null> => {
    setLoading(true);
    setError(null);
    
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const code = generateGroupCode();
      
      let insertData: { code: string; room_type: string; password_hash?: string } = {
        code,
        room_type: options.isPrivate ? 'private' : 'public',
      };
      
      if (options.isPrivate && options.password) {
        insertData.password_hash = await hashPassword(options.password);
      }
      
      const { data, error: insertError } = await supabase
        .from('groups')
        .insert(insertData)
        .select('id, code, created_at, room_type')
        .single();
      
      if (data) {
        const groupData = { 
          ...data, 
          room_type: data.room_type as 'public' | 'private',
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

  const checkRoomType = async (code: string): Promise<{ id: string; code: string; created_at: string; room_type: 'public' | 'private' } | null> => {
    const { data, error: fetchError } = await supabase
      .from('groups')
      .select('id, code, created_at, room_type')
      .eq('code', code.toUpperCase())
      .maybeSingle();
    
    if (fetchError || !data) {
      return null;
    }
    
    return { ...data, room_type: data.room_type as 'public' | 'private' };
  };

  const joinGroup = async (code: string, password?: string): Promise<Group | null> => {
    setLoading(true);
    setError(null);
    
    // First, check if room exists and its type (public info)
    const { data: roomInfo, error: fetchError } = await supabase
      .from('groups')
      .select('id, code, created_at, room_type')
      .eq('code', code.toUpperCase())
      .maybeSingle();
    
    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return null;
    }
    
    if (!roomInfo) {
      setError('Room not found');
      setLoading(false);
      return null;
    }
    
    // Check if room is private and requires password
    if (roomInfo.room_type === 'private') {
      if (!password) {
        // Store pending group and signal that password is required
        setPendingJoinGroup({ id: roomInfo.id, code: roomInfo.code, created_at: roomInfo.created_at });
        setLoading(false);
        return null;
      }
      
      // Verify password via secure edge function
      try {
        const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-room-password', {
          body: { roomCode: code, password }
        });
        
        if (verifyError) {
          setError('Password verification failed');
          setLoading(false);
          return null;
        }
        
        if (!verifyResult?.valid) {
          setError(verifyResult?.error || 'Incorrect password');
          setLoading(false);
          return null;
        }
      } catch (err) {
        setError('Failed to verify password');
        setLoading(false);
        return null;
      }
    }
    
    // Check if we're the creator (from local history)
    const storedCreator = getCreatorUsername(roomInfo.code);
    
    const groupData = { 
      id: roomInfo.id, 
      code: roomInfo.code, 
      created_at: roomInfo.created_at, 
      room_type: roomInfo.room_type as 'public' | 'private',
      creatorUsername: storedCreator,
    };
    
    setGroup(groupData);
    setPendingJoinGroup(null);
    setCreatorUsername(storedCreator || null);
    addToGroupHistory(roomInfo.code, 'joined', storedCreator);
    setLoading(false);
    return groupData;
  };

  const cancelPendingJoin = () => {
    setPendingJoinGroup(null);
    setError(null);
  };

  const leaveGroup = () => {
    setGroup(null);
    setError(null);
    setPendingJoinGroup(null);
    setCreatorUsername(null);
  };

  return {
    group,
    loading,
    error,
    pendingJoinGroup,
    creatorUsername,
    createGroup,
    joinGroup,
    checkRoomType,
    leaveGroup,
    cancelPendingJoin,
  };
}