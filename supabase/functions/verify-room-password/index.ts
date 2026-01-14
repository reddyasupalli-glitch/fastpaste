import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // 5 attempts
const RATE_LIMIT_WINDOW = 60 * 1000; // per minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { roomCode, password } = await req.json();
    
    // Input validation
    if (!roomCode || typeof roomCode !== 'string' || roomCode.length > 10) {
      return new Response(JSON.stringify({ error: "Invalid room code" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!password || typeof password !== 'string' || password.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Rate limiting by room code to prevent brute force
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${roomCode}:${clientIP}`;
    
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(JSON.stringify({ 
        error: "Too many password attempts. Please try again later.",
        retryAfter: 60
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch room info (password_hash is no longer in groups table)
    const { data: room, error: fetchError } = await supabase
      .from('groups')
      .select('id, code, created_at, room_type')
      .eq('code', roomCode.toUpperCase())
      .maybeSingle();

    if (fetchError) {
      console.error("Database error:", fetchError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!room) {
      return new Response(JSON.stringify({ error: "Room not found" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (room.room_type !== 'private') {
      // Public room, no password needed
      return new Response(JSON.stringify({ 
        valid: true,
        room: {
          id: room.id,
          code: room.code,
          created_at: room.created_at,
          room_type: room.room_type
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get password hash from secure table (using service role)
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: passwordData, error: passwordError } = await supabaseService
      .from('group_passwords')
      .select('password_hash')
      .eq('group_id', room.id)
      .maybeSingle();

    if (passwordError) {
      console.error("Password fetch error:", passwordError);
      return new Response(JSON.stringify({ error: "Verification failed" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!passwordData) {
      return new Response(JSON.stringify({ error: "Room has no password set" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const storedHash = passwordData.password_hash;
    let isValid = false;

    // Check if this is a bcrypt hash (starts with $2) or legacy SHA-256 (64 hex chars)
    if (storedHash.startsWith('$2')) {
      // New bcrypt hash - use bcrypt.compare
      isValid = await bcrypt.compare(password, storedHash);
    } else {
      // Legacy SHA-256 hash - compute and compare
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      isValid = storedHash === computedHash;
    }

    if (!isValid) {
      // Add small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      return new Response(JSON.stringify({ error: "Incorrect password" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Password is correct - return room info
    return new Response(JSON.stringify({ 
      valid: true,
      room: {
        id: room.id,
        code: room.code,
        created_at: room.created_at,
        room_type: room.room_type
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error verifying password:", error);
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
