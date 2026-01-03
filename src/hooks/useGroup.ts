import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateGroupCode, hashPassword, verifyPassword } from '@/lib/groupUtils';
import { addToGroupHistory } from '@/lib/groupHistory';

interface Group {
  id: string;
  code: string;
  created_at: string;
  room_type: 'public' | 'private';
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

  const createGroup = async (options: CreateGroupOptions = { isPrivate: false }): Promise<Group | null> => {
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
        const groupData = { ...data, room_type: data.room_type as 'public' | 'private' };
        setGroup(groupData);
        addToGroupHistory(data.code, 'created');
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
    
    const { data, error: fetchError } = await supabase
      .from('groups')
      .select('id, code, created_at, room_type, password_hash')
      .eq('code', code.toUpperCase())
      .maybeSingle();
    
    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return null;
    }
    
    if (!data) {
      setError('Room not found');
      setLoading(false);
      return null;
    }
    
    // Check if room is private and requires password
    if (data.room_type === 'private') {
      if (!password) {
        // Store pending group and signal that password is required
        setPendingJoinGroup({ id: data.id, code: data.code, created_at: data.created_at });
        setLoading(false);
        return null;
      }
      
      // Verify password
      if (!data.password_hash || !(await verifyPassword(password, data.password_hash))) {
        setError('Incorrect password');
        setLoading(false);
        return null;
      }
    }
    
    const groupData = { 
      id: data.id, 
      code: data.code, 
      created_at: data.created_at, 
      room_type: data.room_type as 'public' | 'private' 
    };
    
    setGroup(groupData);
    setPendingJoinGroup(null);
    addToGroupHistory(data.code, 'joined');
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
  };

  return {
    group,
    loading,
    error,
    pendingJoinGroup,
    createGroup,
    joinGroup,
    checkRoomType,
    leaveGroup,
    cancelPendingJoin,
  };
}