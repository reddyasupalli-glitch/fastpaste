import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // 10 room creations
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // per hour

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

function generateRoomCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { isPrivate, password } = await req.json();
    
    // Input validation
    if (typeof isPrivate !== 'boolean') {
      return new Response(JSON.stringify({ error: "Invalid room type" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (isPrivate) {
      if (!password || typeof password !== 'string') {
        return new Response(JSON.stringify({ error: "Password required for private rooms" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (password.length < 1 || password.length > 100) {
        return new Response(JSON.stringify({ error: "Password must be 1-100 characters" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ 
        error: "Too many room creations. Please try again later.",
        retryAfter: 3600
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role for secure operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to create room with unique code
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const code = generateRoomCode();
      
      const { data: room, error: insertError } = await supabase
        .from('groups')
        .insert({
          code,
          room_type: isPrivate ? 'private' : 'public',
        })
        .select('id, code, created_at, room_type')
        .single();
      
      if (room) {
        // If private room, hash password securely with bcrypt and store
        if (isPrivate && password) {
          // Use bcrypt with cost factor 10 (secure and performant)
          const passwordHash = await bcrypt.hash(password);
          
          const { error: passwordError } = await supabase
            .from('group_passwords')
            .insert({
              group_id: room.id,
              password_hash: passwordHash,
            });
          
          if (passwordError) {
            console.error('Failed to save password:', passwordError);
            // Clean up the created group
            await supabase.from('groups').delete().eq('id', room.id);
            return new Response(JSON.stringify({ error: "Failed to create private room" }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        
        return new Response(JSON.stringify({ 
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
      
      // If error is not a unique violation, break
      if (insertError && !insertError.message.includes('duplicate')) {
        console.error('Room creation error:', insertError);
        return new Response(JSON.stringify({ error: "Failed to create room" }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      attempts++;
    }
    
    return new Response(JSON.stringify({ error: "Failed to generate unique room code" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error creating room:", error);
    return new Response(JSON.stringify({ error: "Room creation failed" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
