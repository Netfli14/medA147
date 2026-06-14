import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLang } = await req.json();
    if (!text || typeof text !== "string" || text.length > 3000) {
      return new Response(JSON.stringify({ error: "Invalid text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const targets = ["en", "ru", "kk", "zh"].filter((l) => l !== sourceLang);
    const langNames: Record<string, string> = {
      en: "English", ru: "Russian", kk: "Kazakh", zh: "Chinese (Simplified)",
    };

    const prompt = `Translate the following user feedback into ${targets.map((l) => langNames[l]).join(", ")}.
Return strictly JSON: {"${targets.join('":"...","')}":"..."}.
Rules:
- Plain natural language only.
- Do NOT use em-dash or en-dash characters. Use commas, periods, or simple hyphens instead.
- Do NOT use emoji.
- Preserve meaning, do not add or remove information.
- No markdown, no quotes around keys differ from JSON.

Text (source language: ${langNames[sourceLang] || "unknown"}):
"""${text}"""`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You translate text. Output only valid JSON, no prose." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI gateway error:", res.status, errText);
      throw new Error(`AI error ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Bad JSON from AI:", content);
      parsed = {};
    }

    // Clean up: strip emoji and em/en-dashes
    const clean = (s: string) =>
      (s || "")
        .replace(/[\u2014\u2013]/g, ",") // em/en dash → comma
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/gu, "")
        .trim();

    const result: Record<string, string> = { [sourceLang]: text };
    for (const lang of targets) {
      if (parsed[lang]) result[lang] = clean(parsed[lang]);
    }

    return new Response(JSON.stringify({ translations: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("translate-suggestion error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
