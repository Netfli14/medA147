import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { JOURNALS_INSTRUCTION, sanitizeText, logUserAction } from "../_shared/journals.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function validateInput(body: unknown): { symptoms: string; profileContext: string; language: string } {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");
  const { symptoms, profileContext, language } = body as Record<string, unknown>;
  if (typeof symptoms !== "string" || symptoms.trim().length === 0) throw new Error("Symptoms are required");
  if (symptoms.length > 5000) throw new Error("Input too long");
  const sanitizedSymptoms = symptoms.replace(/<[^>]*>/g, "").trim();
  const sanitizedContext = typeof profileContext === "string" ? profileContext.slice(0, 3000).replace(/<[^>]*>/g, "") : "";
  const validLangs = ["en", "ru", "kk", "zh"];
  const lang = validLangs.includes(language as string) ? (language as string) : "en";
  return { symptoms: sanitizedSymptoms, profileContext: sanitizedContext, language: lang };
}

async function checkRateLimit(supabase: any, visitorId: string, functionName: string): Promise<boolean> {
  const { data } = await supabase.rpc("check_rate_limit", {
    p_visitor_id: visitorId,
    p_function_name: functionName,
    p_max_requests: 20,
    p_window_minutes: 60,
  });
  if (data === true) {
    await supabase.from("ai_usage").insert({ visitor_id: visitorId, function_name: functionName });
  }
  return data === true;
}

function getVisitorId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

// Recursively sanitize all string fields in result (remove em-dash, emoji)
function deepSanitize(v: any): any {
  if (typeof v === "string") return sanitizeText(v);
  if (Array.isArray(v)) return v.map(deepSanitize);
  if (v && typeof v === "object") {
    const out: Record<string, any> = {};
    for (const k of Object.keys(v)) out[k] = deepSanitize(v[k]);
    return out;
  }
  return v;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { symptoms, profileContext, language } = validateInput(body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const visitorId = getVisitorId(req);
    const allowed = await checkRateLimit(supabase, visitorId, "analyze-symptoms");
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    const langInstructions: Record<string, string> = {
      ru: 'ВАЖНО: Все ответы строго на русском. Названия болезней, описания, причины, вердикт и меры — на русском. Не используй длинные тире (—) и эмоджи.',
      kk: 'МАҢЫЗДЫ: Барлық жауаптар тек қазақ тілінде. Ұзын сызық (—) және эмоджи қолданба.',
      zh: '重要：所有回答必须完全使用简体中文，包括疾病名称、描述、原因、结论和建议。请使用准确的中文医学术语。不要使用长破折号（—）和表情符号。',
      en: 'Respond in English. Do not use em-dashes or emoji.',
    };
    const langInstruction = langInstructions[language] || langInstructions.en;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `${langInstruction}

You are an elite medical information assistant focused on evidence-based clinical analysis.

GUIDELINES:
1. Analyze ALL symptoms together to find the best matching conditions.
2. Prioritize by combined fit, not partial overlap.
3. Include both common and important rare conditions.
4. Consider patient demographics, lifestyle, diet, exercise, sleep.
5. Never give a definitive diagnosis. This is educational only.
6. healthScore: 0-100 (100=healthy). riskScore: 0-100% risk.

${JOURNALS_INSTRUCTION}

For EACH condition include 2-3 citations from the whitelist above with working URLs.

${profileContext ? `PATIENT CONTEXT:\n${profileContext}` : ""}

Return exactly 3 conditions ranked by likelihood, plus dashboard data.`,
          },
          {
            role: "user",
            content: `Analyze these symptoms thoroughly: ${symptoms}. Provide health score, risk assessment, short-term and long-term measures, and 2-3 citations per condition strictly from the whitelist.`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_analysis",
            description: "Return comprehensive symptom analysis",
            parameters: {
              type: "object",
              properties: {
                conditions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      possibleCause: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high"] },
                      sources: { type: "array", items: { type: "string" }, description: "2-3 citations from whitelist with URLs" },
                    },
                    required: ["name", "description", "possibleCause", "severity", "sources"],
                  },
                },
                healthScore: { type: "number" },
                riskScore: { type: "number" },
                verdict: { type: "string" },
                shortTermMeasures: { type: "array", items: { type: "string" } },
                longTermMeasures: { type: "array", items: { type: "string" } },
              },
              required: ["conditions", "healthScore", "riskScore", "verdict", "shortTermMeasures", "longTermMeasures"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limits exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const raw = args ? JSON.parse(args) : { conditions: [], healthScore: 50, riskScore: 50, verdict: "", shortTermMeasures: [], longTermMeasures: [] };
    const result = deepSanitize(raw);

    // Log user action (best-effort)
    await logUserAction(supabase, req, "analyze-symptoms", {
      language,
      symptoms_preview: symptoms.slice(0, 200),
      conditions: result.conditions?.map((c: any) => c.name) || [],
    });

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
