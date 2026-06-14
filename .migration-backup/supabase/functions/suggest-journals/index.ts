import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { APPROVED_JOURNALS, sanitizeText, logUserAction } from "../_shared/journals.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map keyword in condition → preferred category & top journals (fallback layer).
const CATEGORY_MAP: Array<{ kw: RegExp; journals: string[] }> = [
  { kw: /heart|cardio|chest pain|hyperten|сердц|кардио|давлен|心|心脏/i, journals: ["Circulation", "JACC", "European Heart Journal", "JAMA Cardiology"] },
  { kw: /skin|derm|rash|acne|eczema|кож|сып|дерма|皮|皮肤/i, journals: ["JAMA Dermatology", "JAAD", "British Journal of Dermatology"] },
  { kw: /cancer|tumor|oncol|опухол|рак|онкол|肿瘤|癌/i, journals: ["Lancet Oncology", "Journal of Clinical Oncology", "JAMA Oncology"] },
  { kw: /diabet|sugar|glucose|диабет|сахар|糖尿/i, journals: ["Diabetes Care", "Lancet Diabetes Endocrinology", "JCEM"] },
  { kw: /lung|cough|asthma|pneumon|респир|кашель|астм|肺|咳/i, journals: ["AJRCCM", "Chest", "Lancet Respiratory Medicine"] },
  { kw: /stomach|gastro|gut|liver|желуд|кишеч|печен|胃|肝/i, journals: ["Gastroenterology", "Gut (BMJ)", "American Journal of Gastroenterology"] },
  { kw: /brain|neuro|stroke|headache|migraine|невро|мозг|инсульт|脑|神经/i, journals: ["Neurology (AAN)", "Lancet Neurology", "Stroke"] },
  { kw: /infect|virus|covid|flu|инфекц|вирус|грипп|感染/i, journals: ["Lancet Infectious Diseases", "Clinical Infectious Diseases", "Emerging Infectious Diseases (CDC)"] },
  { kw: /child|baby|pediat|ребен|дет|儿/i, journals: ["Pediatrics (AAP)", "JAMA Pediatrics", "Lancet Child Adolescent Health"] },
  { kw: /mental|depress|anxiety|psych|депресс|тревог|психи|抑郁|焦虑/i, journals: ["JAMA Psychiatry", "Lancet Psychiatry", "American Journal of Psychiatry"] },
  { kw: /joint|arthrit|bone|сустав|кост|артрит|关节/i, journals: ["Annals of the Rheumatic Diseases", "JBJS"] },
  { kw: /kidney|renal|почк|肾/i, journals: ["Kidney International", "JASN"] },
  { kw: /eye|vision|глаз|зрен|眼/i, journals: ["Ophthalmology", "JAMA Ophthalmology"] },
];

const GENERAL_FALLBACK = ["The New England Journal of Medicine (NEJM)", "The Lancet", "JAMA", "BMJ"];

// PubMed deep link constrained to the specific journal — guaranteed to land on real article list.
function pubmedJournalSearch(journalName: string, query: string): string {
  // Strip parenthetical/short codes for a cleaner [journal] filter
  const clean = journalName.replace(/\s*\(.*?\)\s*/g, "").replace(/\s*—.*$/, "").trim();
  const q = encodeURIComponent(`${query} AND "${clean}"[journal]`);
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${q}`;
}

// Generic PubMed search (no journal filter) — used as last resort
function pubmedSearch(query: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`;
}

// Build search URL inside a journal site so the user lands on real results.
function searchUrl(journalEntry: string, query: string): string {
  // entry format: "Journal Name — https://url"
  const parts = journalEntry.split(" — ");
  const url = parts[1] || "";
  const q = encodeURIComponent(query);
  if (!url) return "";
  // Most journals support a /search?q= or /action/doSearch?AllField= pattern;
  // we use a generic ?q= which most modern publisher sites resolve, otherwise the user lands on the journal homepage.
  if (url.includes("nejm.org")) return `https://www.nejm.org/action/doSearch?AllField=${q}`;
  if (url.includes("thelancet.com")) return `https://www.thelancet.com/action/doSearch?AllField=${q}`;
  if (url.includes("jamanetwork.com")) return `https://jamanetwork.com/searchresults?q=${q}`;
  if (url.includes("bmj.com")) return `https://www.bmj.com/search/${q}`;
  if (url.includes("ahajournals.org")) return `https://www.ahajournals.org/action/doSearch?AllField=${q}`;
  if (url.includes("jacc.org")) return `https://www.jacc.org/action/doSearch?AllField=${q}`;
  if (url.includes("acpjournals.org")) return `https://www.acpjournals.org/action/doSearch?AllField=${q}`;
  if (url.includes("ncbi.nlm.nih.gov/pmc")) return `https://www.ncbi.nlm.nih.gov/pmc/?term=${q}`;
  if (url.includes("cochranelibrary.com")) return `https://www.cochranelibrary.com/search?searchBy=1&searchText=${q}`;
  // Generic fallback
  return `${url.replace(/\/$/, "")}/?q=${q}`;
}

function findEntry(name: string): string | null {
  const lower = name.toLowerCase();
  return APPROVED_JOURNALS.find((j) => j.toLowerCase().startsWith(lower.toLowerCase())) || null;
}

function fallbackJournals(condition: string): Array<{ name: string; url: string; searchUrl: string }> {
  const matched = CATEGORY_MAP.find((c) => c.kw.test(condition));
  const list = matched ? matched.journals : GENERAL_FALLBACK;
  const out: Array<{ name: string; url: string; searchUrl: string }> = [];
  for (const n of list.slice(0, 3)) {
    const entry = findEntry(n);
    if (!entry) continue;
    const url = entry.split(" — ")[1] || "";
    out.push({ name: entry.split(" — ")[0], url, searchUrl: searchUrl(entry, condition) });
  }
  return out;
}

async function checkRateLimit(supabase: any, visitorId: string): Promise<boolean> {
  const { data } = await supabase.rpc("check_rate_limit", {
    p_visitor_id: visitorId,
    p_function_name: "suggest-journals",
    p_max_requests: 30,
    p_window_minutes: 60,
  });
  if (data === true) {
    await supabase.from("ai_usage").insert({ visitor_id: visitorId, function_name: "suggest-journals" });
  }
  return data === true;
}

function getVisitorId(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const condition = typeof body?.condition === "string" ? body.condition.slice(0, 500).replace(/<[^>]*>/g, "").trim() : "";
    const language = ["en", "ru", "kk", "zh"].includes(body?.language) ? body.language : "en";
    if (!condition) throw new Error("Condition is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const visitorId = getVisitorId(req);
    const allowed = await checkRateLimit(supabase, visitorId);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await logUserAction(supabase, req, "suggest-journals", { language, condition: condition.slice(0, 200) });

    // Hybrid: ask AI to pick the best 3 journals from whitelist and (optionally) cite a relevant article URL.
    // Always layer fallback search URLs from CATEGORY_MAP so the user gets working links.
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You help patients verify a medical verdict by pointing to the EXACT peer-reviewed article that discusses their specific condition.
You must select up to 3 journals strictly from this approved whitelist:
${APPROVED_JOURNALS.map((j, i) => `${i + 1}. ${j}`).join("\n")}

For EACH journal you pick you MUST provide:
- name: exact journal name from the whitelist
- articleTitle: real, specific title of an article in that journal that discusses the condition (not generic "review of X"). Best guess from training data is acceptable.
- articleYear: 4-digit year of that article (best guess)
- reason: one sentence in the requested language explaining what the article confirms about the condition.
- articleUrl (optional): direct URL on that journal's domain ONLY if highly confident it exists. Never fabricate URLs.

Plain text only. No markdown, no emoji, no em-dash.`,
          },
          {
            role: "user",
            content: `Condition / verdict to verify: ${condition}\nLanguage of the short reason: ${language}\nReturn 3 journals, each with a specific article title that supports the verdict.`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_journals",
            description: "Return up to 3 relevant journals each with a specific cited article",
            parameters: {
              type: "object",
              properties: {
                journals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Exact journal name as in whitelist" },
                      articleTitle: { type: "string", description: "Specific real article title in this journal about the condition" },
                      articleYear: { type: "string", description: "4-digit year" },
                      reason: { type: "string", description: "One sentence why this article confirms the verdict" },
                      articleUrl: { type: "string", description: "Optional direct article URL on the journal domain" },
                    },
                    required: ["name", "articleTitle", "reason"],
                  },
                },
              },
              required: ["journals"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_journals" } },
      }),
    });

    let aiJournals: Array<{ name: string; articleTitle?: string; articleYear?: string; reason: string; articleUrl?: string }> = [];
    if (aiResp.ok) {
      const j = await aiResp.json();
      const args = j.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (args) {
        try {
          const parsed = JSON.parse(args);
          aiJournals = Array.isArray(parsed.journals) ? parsed.journals.slice(0, 3) : [];
        } catch { /* ignore */ }
      }
    }

    // Resolve AI suggestions against whitelist + add a guaranteed deep PubMed link constrained to that journal.
    const resolved = aiJournals
      .map((j) => {
        const entry = findEntry(j.name);
        if (!entry) return null;
        const [name, url] = entry.split(" — ");
        const articleTitle = sanitizeText(j.articleTitle || "");
        // articleUrl priority: AI's confident URL > PubMed deep search constrained to journal + title > journal-site search.
        const pubmedQuery = articleTitle || condition;
        const articleUrl = (j.articleUrl && j.articleUrl.startsWith("http"))
          ? j.articleUrl
          : pubmedJournalSearch(name, pubmedQuery);
        return {
          name,
          url,
          reason: sanitizeText(j.reason || ""),
          articleTitle: articleTitle || undefined,
          articleYear: (j.articleYear || "").toString().slice(0, 4) || undefined,
          articleUrl,
          searchUrl: searchUrl(entry, condition),
        };
      })
      .filter(Boolean) as Array<{ name: string; url: string; reason: string; articleTitle?: string; articleYear?: string; articleUrl: string; searchUrl: string }>;

    // Fallback if AI returned nothing useful — still give a specific PubMed page constrained to the journal.
    const finalJournals = resolved.length > 0
      ? resolved
      : fallbackJournals(condition).map((f) => ({
          ...f,
          reason: "",
          articleUrl: pubmedJournalSearch(f.name, condition),
        }));

    return new Response(JSON.stringify({ condition, journals: finalJournals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
