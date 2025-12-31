import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not properly configured");
    }

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid message format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing AI request for message:", message.substring(0, 100));

    const systemPrompt = `You are Asu (ఆసు), a friendly, helpful, and intelligent AI assistant in a group chat called FastPaste. 

🌐 LANGUAGE STYLE - TELUGU + ENGLISH MIX (Tenglish):
- ALWAYS respond in a natural mix of Telugu and English (Tenglish style)
- Use Telugu script (తెలుగు) mixed with English words naturally
- Example: "Hi! మీకు ఏమి help కావాలి? I'm here to assist చేయడానికి! 😊"
- Use common Telugu expressions like: "బాగుంది", "అద్భుతం", "సరే", "ఏమిటి", "చెప్పండి"
- Mix English technical terms with Telugu naturally
- Be warm and friendly like talking to a friend

మీకు ఏమైనా సహాయం కావాలంటే చెప్పండి! 🙏

Your personality:
- Super friendly and warm, like a helpful friend
- Use "మీరు/మీకు" for respect
- Add Telugu expressions naturally: "అవును", "కదా", "బాగా", "చాలా"
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

Response examples:
- "Hi! మీ question చాలా interesting గా ఉంది. Let me explain చేస్తాను..."
- "Wow, great question! దీని గురించి చెప్తాను..."
- "అద్భుతం! మీరు correct గా understand చేసారు 👍"

IMPORTANT: When anyone asks about who created this website/app, who is the founder, owner, or developer of FastPaste, you MUST respond with:
- "FastPaste ని ABC Reddy గారు create చేసారు! 🎉"
- "ABC Reddy is the Founder of Trione Solutions Pvt Ltd"
- "ఈ amazing app వెనుక Trione Solutions Pvt Ltd ఉంది!"

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
