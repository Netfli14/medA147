import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeText, logUserAction } from "../_shared/journals.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const medicineImages: Record<string, string> = {
  "paracetamol": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop",
  "парацетамол": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop",
  "ibuprofen": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop",
  "ибупрофен": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop",
  "aspirin": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop",
  "аспирин": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop",
  "amoxicillin": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop",
  "амоксициллин": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop",
  "azithromycin": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&h=200&fit=crop",
  "азитромицин": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&h=200&fit=crop",
  "tablet": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop",
  "capsule": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&h=200&fit=crop",
  "syrup": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop",
  "cream": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
  "drops": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop",
};

function getMedicineImage(name: string, dosage: string): string {
  const nameLower = name.toLowerCase();
  const dosageLower = dosage.toLowerCase();
  
  for (const [key, url] of Object.entries(medicineImages)) {
    if (nameLower.includes(key)) return url;
  }
  
  if (dosageLower.includes("syrup") || dosageLower.includes("сироп")) return medicineImages["syrup"];
  if (dosageLower.includes("capsule") || dosageLower.includes("капсул")) return medicineImages["capsule"];
  if (dosageLower.includes("cream") || dosageLower.includes("мазь") || dosageLower.includes("крем")) return medicineImages["cream"];
  if (dosageLower.includes("drop") || dosageLower.includes("капл")) return medicineImages["drops"];
  
  return medicineImages["tablet"];
}

function validateInput(body: unknown): { condition: string; age?: number; weight?: number; allergies?: string[]; currentMedications?: string[]; profileContext: string; language: string } {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");
  const b = body as Record<string, unknown>;
  
  if (typeof b.condition !== "string" || b.condition.trim().length === 0) throw new Error("Condition is required");
  if (b.condition.length > 500) throw new Error("Input too long");
  
  const condition = b.condition.replace(/<[^>]*>/g, "").trim();
  const age = typeof b.age === "number" && b.age > 0 && b.age < 200 ? b.age : undefined;
  const weight = typeof b.weight === "number" && b.weight > 0 && b.weight < 500 ? b.weight : undefined;
  const allergies = Array.isArray(b.allergies) ? b.allergies.filter((a): a is string => typeof a === "string").slice(0, 20) : undefined;
  const currentMedications = Array.isArray(b.currentMedications) ? b.currentMedications.filter((m): m is string => typeof m === "string").slice(0, 20) : undefined;
  const validLangs = ["en", "ru", "kk", "zh"];
  const language = validLangs.includes(b.language as string) ? (b.language as string) : "en";
  const profileContext = typeof b.profileContext === "string" ? b.profileContext.slice(0, 3000).replace(/<[^>]*>/g, "") : "";
  
  return { condition, age, weight, allergies, currentMedications, profileContext, language };
}

async function checkRateLimit(visitorId: string, functionName: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { condition, age, weight, allergies, currentMedications, profileContext, language } = validateInput(body);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const visitorId = getVisitorId(req);
    const allowed = await checkRateLimit(visitorId, "find-medicines");
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    const allergyWarning = allergies?.length ? `\nKNOWN ALLERGIES (AVOID THESE): ${allergies.join(", ")}` : "";
    const medicationWarning = currentMedications?.length ? `\nCURRENT MEDICATIONS (CHECK INTERACTIONS): ${currentMedications.join(", ")}` : "";
    
    const langInstructions: Record<string, string> = {
      ru: 'ВАЖНО: Отвечай только на русском. Не используй длинные тире (—) и эмоджи.',
      kk: 'МАҢЫЗДЫ: Тек қазақ тілінде. Ұзын сызық (—) және эмоджи қолданба.',
      zh: '重要：只用简体中文回答。使用准确的中文医学术语。不要使用长破折号（—）和表情符号。',
      en: 'Respond in English. Do not use em-dashes or emoji.',
    };
    const langInstruction = langInstructions[language] || langInstructions.en;

    const prompt = `${langInstruction}

Find medicine recommendations for: ${condition}. ${age ? `Patient age: ${age} years.` : ""} ${weight ? `Weight: ${weight} kg.` : ""} 
${allergyWarning}${medicationWarning}
${profileContext ? `\nAdditional patient context: ${profileContext}` : ""}

Provide realistic medicine recommendations available in Kazakhstan pharmacies with realistic KZT prices.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { 
            role: "system", 
            content: `You are a pharmacy information assistant for Kazakhstan. Provide accurate medicine information with prices in KZT.

GUIDELINES:
1. Only recommend over-the-counter medicines available in Kazakhstan
2. Provide realistic price estimates in KZT
3. Adjust dosages based on age and weight
4. Include usage instructions
5. List warnings and contraindications
6. CHECK FOR DRUG INTERACTIONS
7. AVOID medicines containing any listed allergies
8. Always recommend consulting a pharmacist or doctor` 
          },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_medicines",
            description: "Return medicine recommendations",
            parameters: {
              type: "object",
              properties: {
                condition: { type: "string" },
                medicines: { 
                  type: "array", 
                  items: { 
                    type: "object", 
                    properties: { 
                      name: { type: "string" }, 
                      purpose: { type: "string" }, 
                      dosage: { type: "string" }, 
                      instructions: { type: "string" },
                      duration: { type: "string" },
                      estimatedPrice: { type: "string" },
                      warnings: { type: "array", items: { type: "string" } },
                      evidenceSource: { type: "string" }
                    }, 
                    required: ["name", "purpose", "dosage", "instructions", "estimatedPrice", "warnings"] 
                  } 
                },
                generalAdvice: { type: "string" }
              },
              required: ["condition", "medicines", "generalAdvice"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_medicines" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error");
    }
    
    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const result = args ? JSON.parse(args) : { condition, medicines: [], generalAdvice: "" };

    const deepSanitize = (v: any): any => {
      if (typeof v === "string") return sanitizeText(v);
      if (Array.isArray(v)) return v.map(deepSanitize);
      if (v && typeof v === "object") {
        const out: Record<string, any> = {};
        for (const k of Object.keys(v)) out[k] = deepSanitize(v[k]);
        return out;
      }
      return v;
    };
    const sanitized = deepSanitize(result);

    if (sanitized.medicines) {
      sanitized.medicines = sanitized.medicines.map((m: { name: string; dosage: string }) => ({
        ...m,
        imageUrl: getMedicineImage(m.name, m.dosage),
      }));
    }

    const supabaseLog = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await logUserAction(supabaseLog, req, "find-medicines", {
      language,
      condition,
      medicines: sanitized.medicines?.map((m: any) => m.name) || [],
    });

    return new Response(JSON.stringify(sanitized), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
