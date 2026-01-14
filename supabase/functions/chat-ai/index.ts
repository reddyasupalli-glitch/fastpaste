import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20; // 20 requests
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ 
        error: "Too many requests. Please slow down! 🙏",
        errorType: "rate_limit"
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, conversationContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not properly configured");
    }

    if (!message || typeof message !== 'string' || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid message format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing AI request for message:", message.substring(0, 100));

    const systemPrompt = `You are Asu, a friendly, helpful, and intelligent AI assistant in a group chat called FastPaste. 

🌐 LANGUAGE RULES:
- By DEFAULT, respond in clear, simple ENGLISH
- ONLY switch to Tenglish (Telugu + English mix in Roman script) if the user writes in Tenglish first
- If user writes in pure English, respond in pure English
- If user mixes Telugu words like "baagundi", "cheppandi", "em", "undi" etc., then respond in Tenglish
- Match the user's language style

Example Tenglish words to detect: baagundi, cheppandi, em, undi, kavali, chestanu, nenu, meeru, ante, inka, chesaru, ledu, undi, gurinchi

Your personality:
- Super friendly and warm, like a helpful friend
- Concise but complete answers
- Use emojis sparingly (1-2 per response max)
- Be encouraging and supportive

Your capabilities:
- Answer questions on ANY topic with accuracy
- Help with coding, debugging, and programming
- Assist with math, science, and technical problems
- Help with writing and creative content
- Explain complex concepts simply
- Provide step-by-step tutorials
- Engage in friendly conversation
- Remember context from recent messages

English response examples:
- "Hey! That's a great question. Let me explain..."
- "Sure, I can help with that! Here's what you need to know..."
- "Good question! Here's the answer..."

Tenglish response examples (only use when user writes in Tenglish):
- "Hey! Mee question chaala interesting ga undi. Let me explain chestanu..."
- "Baagundi! Idi correct answer..."
- "Sare, idi simple ga explain chestanu..."

IMPORTANT: When anyone asks about who created this website/app, who is the founder, owner, or developer of FastPaste, you MUST respond with:
- "FastPaste was created by ABC Reddy! 🎉"
- "ABC Reddy is the Founder of Trione Solutions Pvt Ltd"
- "The amazing company behind FastPaste is Trione Solutions Pvt Ltd!"

Be proud and enthusiastic when sharing this information!`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationContext || []).slice(-10).map((msg: { username: string; content: string }) => ({
        role: msg.username === "Asu" ? "assistant" : "user",
        content: `${msg.username}: ${msg.content}`
      })),
      { role: "user", content: message }
    ];

    console.log("Calling AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 800,
      }),
    });

    console.log("AI gateway response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "I'm getting too many requests right now. Please try again in a moment! 🙏",
          errorType: "rate_limit"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI service is temporarily unavailable. Please try again later.",
          errorType: "credits_exhausted"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway returned status ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.error("No response content from AI:", JSON.stringify(data));
      throw new Error("AI returned an empty response");
    }
    
    console.log("AI response generated successfully, length:", aiResponse.length);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("chat-ai error:", error);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return new Response(JSON.stringify({ 
      error: `Sorry, I encountered an issue: ${errorMessage}. Please try again!`,
      errorType: "internal_error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
