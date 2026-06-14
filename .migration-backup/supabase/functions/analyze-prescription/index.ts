import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image, language } = await req.json();
    if (!image || typeof image !== "string") throw new Error("Image is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = language === 'ru'
      ? 'Отвечай ТОЛЬКО на русском языке.'
      : language === 'kk'
      ? 'Тек қазақ тілінде жауап бер.'
      : 'Respond in English.';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `${langInstruction}
You are an expert prescription analyzer with OCR capabilities. You MUST carefully read every character, word, and number on the prescription image. Pay special attention to:
- Handwritten text (doctor's handwriting can be messy)
- Latin and Cyrillic characters
- Drug dosages (mg, ml, g)
- Frequency instructions (1x, 2x, 3 times daily, etc.)

For each medicine found, provide DETAILED information:
1. Medicine name (brand name as written + international generic name INN)
2. Dosage prescribed (exactly as written)
3. Full instructions from prescription
4. Estimated price in KZT (Kazakhstani Tenge) - use realistic pharmacy prices for Kazakhstan market:
   - Common generics: 300-800 KZT
   - Brand drugs: 800-3000 KZT
   - Specialized: 3000-15000 KZT
5. Where to buy in Astana: АльфаМед, БиоСфера, Bios, Аптека низких цен, Фармаком, Euro Apteka, Pharmacom
6. 2-3 cheaper alternatives/generics with their prices and manufacturer

Return JSON in this exact format:
{
  "medicines": [
    {
      "name": "Medicine Brand Name",
      "genericName": "INN Generic Name",
      "dosage": "500mg",
      "instructions": "1 tablet 3 times daily after meals for 7 days",
      "estimatedPrice": "1500 KZT",
      "whereToBuy": ["АльфаМед", "БиоСфера", "Bios"],
      "alternatives": [
        { "name": "Generic Alternative 1", "price": "600 KZT", "manufacturer": "SANTO" },
        { "name": "Generic Alternative 2", "price": "450 KZT", "manufacturer": "Нобел" }
      ],
      "pharmacologicalGroup": "e.g., NSAID, Antibiotic, etc.",
      "activeIngredient": "e.g., Ibuprofen"
    }
  ],
  "doctorNotes": "Any additional notes from the prescription",
  "warnings": ["Drug interaction warnings", "Contraindications"],
  "totalEstimatedCost": "5000 KZT",
  "totalWithGenerics": "2500 KZT"
}

If you cannot read parts of the prescription clearly, indicate which parts are unclear but still try your best to identify the medicines.
DO NOT use markdown formatting. Return only valid JSON.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Carefully read and analyze this prescription image. Extract ALL medicines with exact dosages, instructions, prices in Kazakhstan, and cheaper alternatives. Read every word carefully, even if handwriting is messy." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { medicines: [], doctorNotes: content, warnings: [] };
    } catch {
      parsed = { medicines: [], doctorNotes: content, warnings: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
