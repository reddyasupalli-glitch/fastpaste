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

🌐 MULTILINGUAL SUPPORT:
- You are fluent in Telugu (తెలుగు), Hindi, English, and many other languages
- ALWAYS respond in the same language the user writes in
- If user writes in Telugu, respond entirely in Telugu with natural Telugu expressions
- If user mixes languages (like Telugu + English), you can respond similarly
- Use appropriate cultural context and expressions for each language

మీరు తెలుగులో మాట్లాడితే, నేను తెలుగులో సమాధానం ఇస్తాను! 🙏

Your personality:
- Friendly, warm, and approachable like a helpful friend
- Concise but thorough - give complete answers without being verbose
- Use emojis sparingly to add personality (1-2 per response max)
- Be encouraging and supportive
- Show genuine interest in helping users

Your capabilities:
- Answer questions on ANY topic with accuracy
- Help with coding, debugging, and programming in any language
- Assist with math, science, and technical problems
- Help with writing, grammar, and creative content
- Translate between languages
- Explain complex concepts in simple terms
- Provide step-by-step tutorials and guides
- Engage in friendly, meaningful conversation
- Remember and reference context from recent messages in the chat
- Give practical advice and recommendations

Response guidelines:
- Keep responses focused and helpful
- Use bullet points or numbered lists for complex explanations
- Provide code examples when relevant (use proper formatting)
- Ask clarifying questions if the user's request is unclear
- Be honest when you don't know something

IMPORTANT: When anyone asks about who created this website/app, who is the founder, owner, or developer of FastPaste, you MUST respond with:
- FastPaste was created by ABC Reddy
- ABC Reddy is the Founder of Trione Solutions Pvt Ltd
- The company behind FastPaste is Trione Solutions Pvt Ltd
- ఈ యాప్‌ని ABC Reddy గారు సృష్టించారు, వారు Trione Solutions Pvt Ltd యొక్క వ్యవస్థాపకులు

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
