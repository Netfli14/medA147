import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const langNames: Record<string, string> = {
  en: "English",
  ru: "Russian",
  kk: "Kazakh",
  zh: "Simplified Chinese",
};

function sanitize(s: string): string {
  if (!s) return "";
  return s
    .replace(/[\u2014\u2013]/g, ", ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F900}-\u{1F9FF}]/gu, "")
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { text, targetLang, contextHint } = body as {
      text?: string | string[] | Record<string, unknown>;
      targetLang?: string;
      contextHint?: string;
    };

    if (!text || !targetLang || !langNames[targetLang]) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    // Normalize input into a JSON object so AI can translate string fields while keeping structure
    const isString = typeof text === "string";
    const payload = isString ? { value: text } : text;
    const payloadStr = JSON.stringify(payload);
    if (payloadStr.length > 20000) {
      return new Response(JSON.stringify({ error: "Text too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Translate ALL string values in the following JSON into ${langNames[targetLang]}.
Strict rules:
- Preserve the exact JSON structure and keys.
- Translate every string value, including those inside arrays and nested objects.
- Keep numbers, URLs, citations, and proper journal names intact.
- Do NOT use em-dash (—) or en-dash (–). Use commas, periods, or simple hyphens.
- Do NOT use any emoji.
- Use natural, accurate medical terminology in ${langNames[targetLang]}.
${contextHint ? `Context: ${contextHint}` : ""}

INPUT:
${payloadStr}

Return only valid JSON matching the input structure.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise medical translator. Output strictly valid JSON, no prose." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI gateway error:", res.status, errText);
      return new Response(JSON.stringify({ error: `AI error ${res.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Bad JSON:", content);
      parsed = isString ? { value: text } : text;
    }

    // Recursively sanitize all string values
    const walk = (v: any): any => {
      if (typeof v === "string") return sanitize(v);
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === "object") {
        const out: Record<string, any> = {};
        for (const k of Object.keys(v)) out[k] = walk(v[k]);
        return out;
      }
      return v;
    };

    const cleaned = walk(parsed);
    const result = isString ? { translated: cleaned.value || "" } : { translated: cleaned };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("translate-text error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
