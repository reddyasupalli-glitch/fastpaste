import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateGroupCode } from '@/lib/groupUtils';
import { addToGroupHistory } from '@/lib/groupHistory';

interface Group {
  id: string;
  code: string;
  created_at: string;
}

export function useGroup() {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = async (): Promise<Group | null> => {
    setLoading(true);
    setError(null);
    
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const code = generateGroupCode();
      
      const { data, error: insertError } = await supabase
        .from('groups')
        .insert({ code })
        .select()
        .single();
      
      if (data) {
        setGroup(data);
        addToGroupHistory(data.code);
        setLoading(false);
        return data;
      }
      
      // If error is not a unique violation, break
      if (insertError && !insertError.message.includes('duplicate')) {
        setError(insertError.message);
        setLoading(false);
        return null;
      }
      
      attempts++;
    }
    
    setError('Failed to generate unique group code');
    setLoading(false);
    return null;
  };

  const joinGroup = async (code: string): Promise<Group | null> => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('groups')
      .select()
      .eq('code', code.toUpperCase())
      .maybeSingle();
    
    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return null;
    }
    
    if (!data) {
      setError('Group not found');
      setLoading(false);
      return null;
    }
    
    setGroup(data);
    addToGroupHistory(data.code);
    setLoading(false);
    return data;
  };

  const leaveGroup = () => {
    setGroup(null);
    setError(null);
  };

  return {
    group,
    loading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
  };
}
