import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Secure password hashing with salt using Web Crypto API
async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password + salt);
  
  // Use PBKDF2 for secure password hashing
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Legacy SHA-256 hash for backward compatibility
async function legacyHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch room (using service role to access password_hash)
    const { data: room, error: fetchError } = await supabase
      .from('groups')
      .select('id, code, created_at, room_type, password_hash')
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

    if (!room.password_hash) {
      return new Response(JSON.stringify({ error: "Room has no password set" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify password (legacy SHA-256 format)
    const inputHash = await legacyHash(password);
    const isValid = inputHash === room.password_hash;

    if (!isValid) {
      // Add small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      return new Response(JSON.stringify({ error: "Incorrect password" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Password is correct - return room info without password_hash
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
