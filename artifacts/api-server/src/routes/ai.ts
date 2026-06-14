import { Router, json } from "express";
import { openai, AI_MODEL, VISION_MODEL, FAST_MODEL } from "../lib/openai";
import { db } from "../lib/db";
import {
  symptomHistory,
  chatHistory,
  userActions,
  aiUsage,
  medicalProfiles,
} from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { sendInternalError } from "../lib/errors";

const router = Router();

// Image endpoints need a larger body limit for base64 payloads
const imageLimiter = json({ limit: "15mb" });

function getLangInstruction(language: string): string {
  if (language === "ru") return "Отвечай ТОЛЬКО на русском языке.";
  if (language === "kk") return "Тек қазақ тілінде жауап бер.";
  if (language === "zh") return "请只用简体中文回答。";
  return "Respond in English.";
}

const VALID_LANGUAGES = new Set(["en", "ru", "kk", "zh"]);

const JOURNALS_INSTRUCTION = `CITATION RULES — STRICT (VIOLATIONS WILL MAKE RESPONSE INVALID):
- You MUST ONLY cite sources from the authoritative databases and journals listed below.
- NEVER cite Wikipedia, WebMD, Healthline, Mayo Clinic patient pages, or any non-peer-reviewed source.
- NEVER invent a journal name, article title, or DOI. If uncertain about a specific article, use a PubMed search URL.
- Format every citation as a markdown link: [Source Name](URL)

AUTHORITATIVE CLINICAL DATABASES (always acceptable):
  PubMed/NCBI: https://pubmed.ncbi.nlm.nih.gov/?term=CONDITION (URL-encode spaces as +)
  PubMed Central (free full-text): https://www.ncbi.nlm.nih.gov/pmc/search/?query=CONDITION
  Cochrane Library (systematic reviews): https://www.cochranelibrary.com/search?q=CONDITION
  WHO Guidelines & Publications: https://www.who.int/publications
  NICE Clinical Guidelines (UK): https://www.nice.org.uk/guidance
  CDC Clinical Guidelines (US): https://www.cdc.gov/guidelines/
  UpToDate (evidence-based clinical decisions): https://www.uptodate.com/contents/search?search=CONDITION
  ClinicalKey (Elsevier): https://www.clinicalkey.com/#!/search/CONDITION
  DynaMed (evidence summaries): https://www.dynamed.com/search?q=CONDITION
  StatPearls/NCBI Bookshelf: https://www.ncbi.nlm.nih.gov/books/NBK430685/
  EMBASE (Elsevier): https://www.embase.com/search/results?query=CONDITION
  Trip Medical Database (evidence synthesis): https://www.tripdatabase.com/search?criteria=CONDITION
  ClinicalTrials.gov: https://clinicaltrials.gov/search?cond=CONDITION
  FDA Drug Database (Drugs@FDA): https://www.accessdata.fda.gov/scripts/cder/daf/
  EMA Medicines (European): https://www.ema.europa.eu/en/medicines
  WHO Essential Medicines List 2023: https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.02
  Kazakhstan MedElement Clinical Guidelines: https://diseases.medelement.com/
  RLS Pharmaceutical Database (RU/KZ): https://www.rlsnet.ru/
  BNF (British National Formulary): https://bnf.nice.org.uk/
  Micromedex Drug Interactions: https://www.micromedexsolutions.com/
  GRADE Working Group (evidence grading): https://www.gradeworkinggroup.org/
  AHA/ACC Clinical Guidelines: https://www.acc.org/guidelines
  ESC Clinical Guidelines: https://www.escardio.org/Guidelines
  ADA Standards of Care: https://diabetesjournals.org/care/issue/47/Supplement_1

PEER-REVIEWED JOURNALS BY SPECIALTY (use homepage or DOI links):
  General: NEJM (nejm.org), The Lancet (thelancet.com), JAMA (jamanetwork.com/journals/jama), BMJ (bmj.com), Annals of Internal Medicine, Nature Medicine, eClinicalMedicine
  Cardiology: Circulation, European Heart Journal, JACC, JAMA Cardiology, Hypertension, Stroke, Heart Rhythm, JACC Cardiovascular Interventions
  Oncology: Lancet Oncology, Journal of Clinical Oncology, CA Cancer J Clin [IF 286], Nature Cancer, JAMA Oncology, Annals of Oncology, Cancer Cell, Cancer Discovery
  Neurology: Lancet Neurology, JAMA Neurology, Brain, Neurology (AAN), Alzheimer's & Dementia, Nature Reviews Neurology, Acta Neuropathologica
  Psychiatry: Lancet Psychiatry, World Psychiatry, JAMA Psychiatry, American Journal of Psychiatry, Molecular Psychiatry, Neuropsychopharmacology
  Pulmonology: AJRCCM (atsjournals.org), European Respiratory Journal, Lancet Respiratory Medicine, Thorax, Chest, ERJ Open Research
  Gastroenterology: Gastroenterology, Gut, Journal of Hepatology, Nature Reviews Gastroenterology, American Journal of Gastroenterology, Clinical Gastroenterology & Hepatology
  Endocrinology: Lancet Diabetes & Endocrinology, Diabetes Care, Cell Metabolism, JCEM, Diabetologia, Thyroid, Hormone Research in Paediatrics
  Infectious Disease: Lancet Infectious Diseases, Clinical Infectious Diseases, Emerging Infectious Diseases, Nature Microbiology, Cell Host & Microbe, Journal of Infectious Diseases
  Immunology/Rheumatology: Nature Immunology, Annals of Rheumatic Diseases, Arthritis & Rheumatology, Journal of Allergy & Clinical Immunology, Autoimmunity Reviews
  Nephrology: JASN, Kidney International, AJKD, Nature Reviews Nephrology, Nephrology Dialysis Transplantation, CJASN
  Dermatology: JAMA Dermatology, JAAD, British Journal of Dermatology, Journal of Investigative Dermatology, Dermatology and Therapy
  Pediatrics: JAMA Pediatrics, Lancet Child & Adolescent Health, Pediatrics (AAP), Archives of Disease in Childhood, Journal of Pediatrics
  Surgery/Critical Care: Annals of Surgery, JAMA Surgery, Critical Care Medicine, Intensive Care Medicine, Critical Care, Resuscitation
  Hematology: Blood (ASH), Haematologica, American Journal of Hematology, Leukemia, Journal of Thrombosis and Haemostasis
  Pharmacology: British Journal of Pharmacology, Clinical Pharmacology & Therapeutics, Drug Safety, Drugs, Pharmacological Research, Drug Discovery Today
  Evidence-Based: Cochrane Database of Systematic Reviews, BMJ Evidence-Based Medicine, GRADE guidelines, Journal of Clinical Epidemiology
  Radiology: Radiology, European Radiology, Medical Image Analysis, Journal of Nuclear Medicine
  Geriatrics: Age and Ageing, Journal of the American Geriatrics Society, Aging Cell, GeroScience
  Nutrition: American Journal of Clinical Nutrition, Clinical Nutrition, Nutrients, International Journal of Obesity
  Ophthalmology: Ophthalmology, JAMA Ophthalmology, British Journal of Ophthalmology, Survey of Ophthalmology
  Urology: European Urology, Journal of Urology, BJUI, Prostate Cancer and Prostatic Diseases`;

const CLINICAL_KNOWLEDGE_BASE = `CLINICAL REASONING FRAMEWORK (apply to every analysis):

DIFFERENTIAL DIAGNOSIS HIERARCHY:
1. Life-threatening conditions first (ALWAYS consider and rule out): MI, PE, stroke, sepsis, aortic dissection, meningitis, ectopic pregnancy, tension pneumothorax
2. Common conditions fitting the symptom cluster
3. Rare conditions with high morbidity if missed

RED FLAG SYMPTOMS (always highlight if present):
- Cardiovascular: chest pain radiating to arm/jaw, syncope, sudden dyspnea, unequal pulses
- Neurological: sudden severe headache ("thunderclap"), focal neurological deficit, altered consciousness, meningismus
- Respiratory: SpO2 <92%, respiratory rate >30, cyanosis, stridor
- GI: coffee-ground vomit, melena, rigid abdomen, jaundice + fever
- Systemic: unexplained weight loss >10% in 6 months, night sweats, persistent fever >38.5°C >3 weeks
- Pediatric: high fever <3 months, bulging fontanelle, petechial rash, inconsolable crying

EVIDENCE GRADING (cite the level):
  1A: Systematic review/meta-analysis of RCTs (strongest)
  1B: Individual high-quality RCT
  2A: Systematic review of cohort studies
  2B: Individual well-designed cohort study
  3: Case-control or observational study
  4: Case series or expert opinion (weakest)

KAZAKHSTAN HEALTH CONTEXT:
- Emergency: dial 103 (emergency) or 112 (unified emergency)
- Leading causes of death: cardiovascular disease (~50%), cancer (~15%), external causes
- High prevalence: hypertension, type 2 diabetes, tuberculosis (high TB burden country), hepatitis B/C, brucellosis (rural areas), echinococcosis
- Healthcare system: mandatory social health insurance (МСЗУ/OSMС), polyclinic system, republican specialist hospitals
- Climate/geography considerations: extreme temperature variations (-40°C to +45°C), high altitude areas (Almaty: 700-900m), arid steppe (increased dust, allergic conditions)
- Common local medications: local generics widely available, RLS Kazakhstan reference database
- Vaccination calendar: BCG at birth (TB-endemic), hepatitis B, DTP, MMR, varicella — per Kazakhstan National Immunization Program
- Common nutritional issues: iodine deficiency (endemic goiter), vitamin D deficiency (long winters), iron deficiency anemia

CLINICAL REASONING RULES:
- Always consider patient demographics: age, sex, BMI, occupation, geographic region affect pre-test probability
- Pattern recognition: cluster symptoms into syndromes before hypothesizing diseases
- Bayesian thinking: start with base rates (epidemiology), update with clinical findings
- Acknowledge uncertainty: distinguish "most likely" from "confirmed" — use language like "consistent with", "suggestive of", "cannot exclude"
- Treatment thresholds: consider NNT (Number Needed to Treat) and NNH (Number Needed to Harm) when relevant
- Medications: prefer WHO Essential Medicines List drugs; note availability in Kazakhstan
- Always add: "Consult a licensed healthcare provider before starting any treatment"`;

// POST /api/ai/analyze-symptoms
router.post("/analyze-symptoms", async (req, res) => {
  try {
    const { symptoms, profileContext, language = "en", visitorId } = req.body;
    const { userId } = getAuth(req);
    if (!symptoms || typeof symptoms !== "string") return res.status(400).json({ error: "symptoms required" });

    const safeLang = VALID_LANGUAGES.has(language) ? language : "en";
    const langInstruction = getLangInstruction(safeLang);

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `${langInstruction}

You are an elite medical information assistant — a senior clinician with 20+ years of experience in internal medicine and differential diagnosis. You deliver rigorous, evidence-based clinical analysis at the level of a major academic hospital.

${CLINICAL_KNOWLEDGE_BASE}

SYMPTOM ANALYSIS GUIDELINES:
1. Analyze ALL symptoms TOGETHER as a syndrome — never in isolation.
2. Apply Bayesian reasoning: start with epidemiological base rates, update with each finding.
3. Rank conditions by posterior probability (combined symptom fit × base rate × demographics).
4. ALWAYS consider and explicitly rule out life-threatening conditions first.
5. Flag red-flag symptoms if present (see CLINICAL_KNOWLEDGE_BASE above).
6. Include both common high-probability and rare high-risk conditions.
7. Consider patient demographics, lifestyle, diet, exercise, sleep, occupational exposures.
8. Never give a definitive diagnosis. This is clinical decision support, not a diagnosis.
9. healthScore: 0-100 (100 = perfect health). riskScore: 0-100 (% urgency/risk).
10. For each condition, assign evidence quality level: 1A/1B/2A/2B/3/4.
11. Short-term measures: actionable within 24-72 hours. Long-term: sustained lifestyle/treatment changes.
12. Consider Kazakhstan-specific epidemiology: TB, hepatitis B/C, brucellosis, cardiovascular disease, type 2 diabetes.

${JOURNALS_INSTRUCTION}

VERDICT FORMAT (MANDATORY — do not omit):
The verdict field MUST include 2-3 inline journal citations using EXACTLY this format:
"Per [Journal Name](https://url.com) (YEAR): [specific clinical finding from that journal that directly connects the patient's exact reported symptom(s) to the concluded condition with the mechanism or statistical evidence]."
Example: "Per [NEJM](https://www.nejm.org) (2021): fever combined with severe headache and photophobia demonstrates 87% sensitivity for bacterial meningitis in adults (evidence level 1B) — directly matching this patient's reported headache + fever + light sensitivity."

The verdictEvidence array MUST mirror those inline citations with structured data.

${profileContext ? `PATIENT CONTEXT (use to personalize analysis):\n${String(profileContext).slice(0, 2000)}` : ""}

Return exactly 3 conditions ranked by decreasing likelihood.`,
        },
        {
          role: "user",
          content: `Analyze these symptoms thoroughly using the clinical reasoning framework: ${String(symptoms).slice(0, 2000)}. Apply differential diagnosis, consider red flags, provide health score, risk assessment, short-term and long-term evidence-based measures, a verdict with 2-3 inline journal citations (each explaining how a specific finding from that journal directly connects the patient's symptoms to the conclusion), and the verdictEvidence array.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_analysis",
            description: "Return comprehensive symptom analysis with evidence-based verdict",
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
                      sources: { type: "array", items: { type: "string" } },
                    },
                    required: ["name", "description", "possibleCause", "severity", "sources"],
                  },
                },
                healthScore: { type: "number" },
                riskScore: { type: "number" },
                verdict: {
                  type: "string",
                  description: "Summary verdict that MUST include 2-3 inline journal citations in format: Per [Journal](url) (YEAR): finding that connects patient symptoms to conclusion."
                },
                verdictEvidence: {
                  type: "array",
                  description: "Structured citations that mirror the inline citations in the verdict field",
                  items: {
                    type: "object",
                    properties: {
                      journal: { type: "string", description: "Full journal name" },
                      url: { type: "string", description: "Journal homepage or DOI URL" },
                      year: { type: "string", description: "Publication year e.g. 2022" },
                      finding: { type: "string", description: "The specific clinical finding from this journal that supports the verdict, explaining how it connects the patient's symptoms to the conclusion" },
                    },
                    required: ["journal", "url", "year", "finding"],
                  },
                },
                shortTermMeasures: { type: "array", items: { type: "string" } },
                longTermMeasures: { type: "array", items: { type: "string" } },
              },
              required: ["conditions", "healthScore", "riskScore", "verdict", "verdictEvidence", "shortTermMeasures", "longTermMeasures"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_analysis" } },
    });

    const args = completion.choices[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const result = args ? JSON.parse(args) : { conditions: [], healthScore: 50, riskScore: 50, verdict: "", shortTermMeasures: [], longTermMeasures: [] };

    try {
      if (userId) {
        await db.insert(symptomHistory).values({ userId, symptoms: { text: symptoms }, result });
        await db.insert(userActions).values({ userId, functionName: "symptoms", actionData: { symptoms, result: result.verdict } });
      }
      if (visitorId) {
        await db.insert(aiUsage).values({ visitorId, functionName: "analyze-symptoms" });
      }
    } catch (dbErr) {
      console.error("DB write error (non-fatal):", dbErr instanceof Error ? dbErr.message : dbErr);
    }

    return res.json(result);
  } catch (error) {
    return sendInternalError(res, "analyze-symptoms", error);
  }
});

// POST /api/ai/ai-doctor (streaming SSE)
router.post("/ai-doctor", async (req, res) => {
  try {
    const { messages, profileContext, language = "en", visitorId } = req.body;
    const { userId } = getAuth(req);
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages required" });

    const safeLang = VALID_LANGUAGES.has(language) ? language : "en";
    const langInstruction = getLangInstruction(safeLang);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const safeMessages = messages.slice(-20).map((m: any) => ({
      role: m.role === "user" || m.role === "assistant" ? m.role : "user",
      content: typeof m.content === "string" ? m.content.slice(0, 4000) : "",
    }));

    const stream = await openai.chat.completions.create({
      model: AI_MODEL,
      stream: true,
      messages: [
        {
          role: "system",
          content: `${langInstruction}

You are an expert AI medical assistant for Kazakhstan — a senior clinician and trusted health advisor with deep knowledge of internal medicine, pharmacology, and public health. You combine clinical rigor with empathy.

${CLINICAL_KNOWLEDGE_BASE}

CONVERSATION RULES:
- Never give a definitive diagnosis; use "consistent with", "suggestive of", "cannot exclude"
- Always recommend consulting a real doctor for serious, worsening, or unclear symptoms
- In emergencies: immediately recommend calling 103 (Kazakhstan emergency) or 112 (unified emergency)
- Be empathetic, clear, and professional — avoid medical jargon unless the user uses it first
- Structure answers: Brief summary → Key points → Recommendations → When to seek care
- Consider Kazakhstan-specific health context: TB prevalence, brucellosis in rural areas, cardiovascular disease burden, extreme climate effects
- For medications: always mention the need for a prescription when appropriate; note availability in Kazakhstan pharmacies

CITATION BEHAVIOR (apply when giving medical facts):
- When stating a clinical fact, guideline, or drug effect, cite inline: [Source](URL)
- Use PubMed search links for conditions: https://pubmed.ncbi.nlm.nih.gov/?term=CONDITION
- Use authoritative sources: WHO, NICE, CDC, AHA/ACC, ADA, Kazakhstan MedElement
- Example: "Hypertension is defined as sustained BP >130/80 mmHg per [ACC/AHA 2017 Guidelines](https://www.acc.org/guidelines)"
- NEVER invent citations. If uncertain, link to a PubMed search page.

${JOURNALS_INSTRUCTION}

${profileContext ? `PATIENT CONTEXT (personalize advice to this patient):\n${String(profileContext).slice(0, 2000)}` : ""}`,
        },
        ...safeMessages,
      ],
      max_tokens: 1500,
    });

    let fullContent = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        fullContent += delta;
        res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
      }
      if (chunk.choices[0]?.finish_reason === "stop") {
        res.write("data: [DONE]\n\n");
        break;
      }
    }
    res.end();

    try {
      if (userId && messages.length > 0) {
        const lastUserMsg = messages[messages.length - 1];
        if (lastUserMsg?.role === "user") {
          await db.insert(chatHistory).values({ userId, role: "user", content: lastUserMsg.content, language: safeLang });
          await db.insert(chatHistory).values({ userId, role: "assistant", content: fullContent, language: safeLang });
        }
      }
      if (userId && fullContent) {
        await db.insert(userActions).values({ userId, functionName: "aiDoctor", actionData: { query: messages[messages.length - 1]?.content?.slice(0, 200) } });
      }
      if (visitorId) {
        await db.insert(aiUsage).values({ visitorId, functionName: "ai-doctor" });
      }
    } catch (dbErr) {
      console.error("DB write error (non-fatal):", dbErr instanceof Error ? dbErr.message : dbErr);
    }
  } catch (error) {
    console.error("[ai-doctor]", error instanceof Error ? error.message : error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "An internal error occurred. Please try again." });
    }
    res.write(`data: ${JSON.stringify({ error: "An error occurred. Please try again." })}\n\n`);
    res.end();
  }
});

// POST /api/ai/analyze-image
router.post("/analyze-image", imageLimiter, async (req, res) => {
  try {
    const { image, analysisType = "skin", language = "en", visitorId } = req.body;
    if (!image || typeof image !== "string") return res.status(400).json({ error: "image required" });
    if (!image.startsWith("data:image/")) return res.status(400).json({ error: "Invalid image format" });

    const safeLang = VALID_LANGUAGES.has(language) ? language : "en";
    const langInstruction = getLangInstruction(safeLang);

    const VALID_TYPES = new Set(["skin", "xray", "wound", "eye"]);
    const safeType = VALID_TYPES.has(analysisType) ? analysisType : "skin";

    const typeInstructions: Record<string, string> = {
      skin: `DERMATOLOGY IMAGE ANALYSIS:
- Describe morphology: primary lesion type (macule/papule/plaque/vesicle/pustule/nodule/ulcer), color, border, distribution
- Note: size estimation, symmetry, surface texture, associated changes (scaling, crusting, lichenification)
- Differential diagnosis: list 3-5 conditions fitting the visual pattern (e.g. eczema vs psoriasis vs tinea vs contact dermatitis)
- ABCDE criteria for pigmented lesions: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution
- Red flags: rapid change, bleeding, ulceration, satellite lesions — recommend urgent dermatology referral
- Relevant citation: link to JAAD (https://www.jaad.org) or Dermnet guidelines`,
      xray: `RADIOLOGY IMAGE ANALYSIS:
- Systematically describe: bones/soft tissue/air spaces/vasculature/foreign bodies
- For chest X-ray: cardiac silhouette (CTR), lung fields, costophrenic angles, mediastinal width, tracheal deviation
- For musculoskeletal: cortical continuity, bone density, joint space, soft tissue swelling
- Describe any abnormalities: opacity/lucency/mass/effusion/fracture/dislocation
- Note the view if identifiable (PA/AP/lateral/oblique)
- Always recommend formal radiologist interpretation — this is a preliminary assessment only
- Relevant citation: link to Radiology journal (https://pubs.rsna.org/journal/radiology)`,
      wound: `WOUND ASSESSMENT:
- Wound classification: acute vs chronic, traumatic/surgical/pressure/venous/arterial/diabetic
- Describe: size estimation, depth appearance (superficial/partial/full thickness), edges, base color
- Signs of infection: erythema, warmth, exudate color/odor, streaking, swelling, purulence
- Tissue viability: granulation tissue (healthy pink/red), slough (yellow), necrosis (black/brown)
- Staging for pressure injuries: Stage 1-4 / Unstageable / Deep Tissue Injury (NPUAP/EPUAP classification)
- First aid guidance and dressing recommendations
- Red flags requiring urgent care: signs of sepsis, gas gangrene, rapidly spreading infection
- Relevant citation: WHO Wound Care guidelines (https://www.who.int/publications)`,
      eye: `OPHTHALMOLOGY IMAGE ANALYSIS:
- Describe external structures: eyelids, conjunctiva (hyperemia/chemosis/discharge), cornea (clarity/ulcer), iris, pupil shape/symmetry
- Fundus findings (if fundus image): optic disc (C/D ratio, margins, pallor), retinal vessels (A/V ratio, nicking), macula, hemorrhages, exudates, cotton wool spots
- Red eye differential: conjunctivitis vs uveitis vs acute glaucoma vs corneal ulcer vs episcleritis — key distinguishing features
- Vision-threatening signs: corneal perforation, hyphema, retinal detachment, papilledema
- Urgent referral criteria: acute angle-closure, central retinal artery occlusion, endophthalmitis
- Relevant citation: link to Ophthalmology journal (https://www.aaojournal.org) or British Journal of Ophthalmology`,
    };

    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "system",
          content: `${langInstruction}

You are an expert medical image analyzer with the skills of a board-certified specialist in the relevant field. You provide systematic, evidence-based visual assessment.

ANALYSIS FRAMEWORK:
${typeInstructions[safeType]}

GENERAL RULES:
- Never give a definitive diagnosis — provide a differential diagnosis with probabilities
- Recommend consulting the appropriate specialist
- Flag any urgent/emergency findings immediately with clear language
- Cite relevant clinical guidelines or journals where appropriate
- Structure output: Findings → Differential Diagnosis → Recommended Action → Citations`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this medical image thoroughly. Identify findings, list differential diagnoses with likelihood, provide observations, and give a clear recommendation. Fill all fields in the structured output." },
            { type: "image_url", image_url: { url: image, detail: "high" } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_image_analysis",
            description: "Return structured medical image analysis",
            parameters: {
              type: "object",
              properties: {
                conditions: {
                  type: "array",
                  description: "Differential diagnosis — 2-4 possible conditions ranked by likelihood",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Condition name" },
                      description: { type: "string", description: "Detailed description: visual findings, pathophysiology, and why this matches the image" },
                      likelihood: { type: "string", enum: ["low", "medium", "high"], description: "How likely this condition is based on the image" },
                    },
                    required: ["name", "description", "likelihood"],
                  },
                },
                observations: {
                  type: "array",
                  items: { type: "string" },
                  description: "4-6 specific visual observations from the image (morphology, color, size, pattern, distribution, severity markers)",
                },
                recommendation: {
                  type: "string",
                  description: "Clear clinical recommendation: urgency level, what specialist to see, any first-aid steps, and a cited guideline or journal link. Must mention consulting a doctor.",
                },
                medications: {
                  type: "array",
                  description: "Optional: suggested OTC or first-line medications if appropriate (e.g. topical for skin). Leave empty for X-rays or unclear findings.",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string", description: "Drug class e.g. Antihistamine, Topical corticosteroid" },
                      dosage: { type: "string" },
                      instructions: { type: "string" },
                      estimatedPrice: { type: "string", description: "Estimated price in KZT e.g. '300-600 KZT'" },
                    },
                    required: ["name", "type", "dosage", "instructions"],
                  },
                },
                healingStages: {
                  type: "array",
                  description: "Optional: expected healing timeline for wounds or skin conditions. Leave empty if not applicable.",
                  items: {
                    type: "object",
                    properties: {
                      week: { type: "string", description: "Time label e.g. 'Days 1-3', 'Week 1-2'" },
                      description: { type: "string", description: "What happens during this phase" },
                      appearance: { type: "string", description: "How it will look visually" },
                    },
                    required: ["week", "description", "appearance"],
                  },
                },
              },
              required: ["conditions", "observations", "recommendation"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_image_analysis" } },
      max_tokens: 2000,
    });

    const args = completion.choices[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const result = args ? JSON.parse(args) : {
      conditions: [],
      observations: ["Unable to analyze image. Please try a clearer photo."],
      recommendation: "Unable to complete analysis. Please upload a clearer image or consult a healthcare provider.",
    };

    if (visitorId) {
      await db.insert(aiUsage).values({ visitorId, functionName: "analyze-image" }).catch(() => {});
    }

    return res.json(result);
  } catch (error) {
    return sendInternalError(res, "analyze-image", error);
  }
});

// POST /api/ai/analyze-prescription
router.post("/analyze-prescription", imageLimiter, async (req, res) => {
  try {
    const { image, language = "en", visitorId } = req.body;
    if (!image || typeof image !== "string") return res.status(400).json({ error: "image required" });
    if (!image.startsWith("data:image/")) return res.status(400).json({ error: "Invalid image format" });

    const safeLang = VALID_LANGUAGES.has(language) ? language : "en";
    const langInstruction = getLangInstruction(safeLang);

    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "system",
          content: `${langInstruction}
You are an expert clinical pharmacist and prescription analyst with advanced OCR capabilities. You operate at the level of a hospital pharmacy specialist who reviews prescriptions for safety and accuracy.

OCR READING RULES:
- Read EVERY character meticulously — doctor handwriting is often difficult
- Recognize both Latin (international drug names) and Cyrillic (Russian/Kazakh brand names)
- Drug dosages: distinguish mg/mcg/g/ml/IU/units carefully — dosage errors are life-threatening
- Frequency abbreviations: q.d./o.d. (once daily), b.i.d./b.d. (twice), t.i.d./t.d.s. (three times), q.i.d. (four times), q.h.s. (at bedtime), p.r.n. (as needed), a.c. (before meals), p.c. (after meals), s.l. (sublingual)
- Kazakhstan prescription formats: Rp. (Recipe), D.t.d. (Da tales doses), S. (Signa — instructions)
- Route abbreviations: p.o. (oral), i.v. (intravenous), i.m. (intramuscular), s.c. (subcutaneous), top. (topical)

SAFETY ANALYSIS (mandatory for every prescription):
- Check for potentially dangerous doses (above standard therapeutic ranges)
- Identify high-alert medications: anticoagulants, insulin, opioids, chemotherapy, narrow therapeutic index drugs (digoxin, warfarin, lithium, phenytoin, theophylline)
- Note drug-drug interactions if multiple medications are prescribed together
- Flag illegible or ambiguous entries that require pharmacist clarification
- Check for allergy-related concerns if drug class is mentioned
- Reference: BNF (https://bnf.nice.org.uk/), Micromedex interactions, RLS Kazakhstan (https://www.rlsnet.ru/)

Return a JSON object with:
- medications: array of { name, genericName, dosage, route, frequency, duration, notes, isHighAlert (boolean) }
- doctorName: string or null
- patientName: string or null
- date: string or null
- warnings: string[] — important safety warnings, illegible fields, high-alert drug flags
- interactions: string[] — potential drug-drug interactions if multiple Rx drugs
- summary: overall prescription summary with clinical context
- confidenceScore: 0-100 (how confident OCR reading was — note any unclear areas)`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this prescription image and extract all medication details." },
            { type: "image_url", image_url: { url: image, detail: "high" } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    if (visitorId) {
      await db.insert(aiUsage).values({ visitorId, functionName: "analyze-prescription" }).catch(() => {});
    }
    return res.json(result);
  } catch (error) {
    return sendInternalError(res, "analyze-prescription", error);
  }
});

// POST /api/ai/find-medicines
router.post("/find-medicines", async (req, res) => {
  try {
    const { condition, age, weight, allergies, currentMedications, chronicDiseases, profileContext, language = "en", visitorId } = req.body;
    if (!condition || typeof condition !== "string") return res.status(400).json({ error: "condition required" });

    const safeLang = VALID_LANGUAGES.has(language) ? language : "en";
    const langInstruction = getLangInstruction(safeLang);

    const hasSafetyProfile = (Array.isArray(chronicDiseases) && chronicDiseases.length > 0) || (Array.isArray(currentMedications) && currentMedications.length > 0) || (Array.isArray(allergies) && allergies.length > 0);

    const safetyContext = hasSafetyProfile ? `
PATIENT SAFETY PROFILE (MANDATORY — check every medicine against this):
${Array.isArray(chronicDiseases) && chronicDiseases.length > 0 ? `Chronic diseases: ${chronicDiseases.slice(0, 20).join(", ")}` : ""}
${Array.isArray(currentMedications) && currentMedications.length > 0 ? `Current medications already taking: ${currentMedications.slice(0, 20).join(", ")}` : ""}
${Array.isArray(allergies) && allergies.length > 0 ? `Known allergies: ${allergies.slice(0, 10).join(", ")}` : ""}

For EVERY medicine you recommend, you MUST populate the interactionWarnings array:
- Check for drug-disease contraindications (does this medicine worsen any listed chronic disease?)
- Check for drug-drug interactions (does this medicine interact with any listed current medication?)
- Check for drug-allergy reactions (does this medicine contain anything the patient is allergic to?)
- severity "high" = dangerous, avoid; "medium" = use with caution; "low" = minor, monitor
- If NO interactions found, set interactionWarnings to an empty array []` : "";

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `${langInstruction}
You are a senior clinical pharmacist AI with expertise in pharmacology, drug interactions, and evidence-based therapeutics. Your primary duty is patient safety. You operate at the level of a hospital clinical pharmacy specialist.

PHARMACOLOGY GUIDELINES:
1. Recommend first-line agents per current clinical guidelines (WHO EML, NICE, AHA/ACC, ADA, ESC) — always note the guideline source.
2. Include both brand names and INN (International Nonproprietary Names / generic names).
3. Provide realistic prices in Kazakhstan Tenge (KZT) — local pharmacy market rates.
4. Distinguish prescription-only (Rx) from over-the-counter (OTC) medications.
5. Mechanisms of action: always explain HOW the drug works in plain language.
6. Pharmacokinetics note: mention key interactions (CYP450 inhibitors/inducers, renal/hepatic dose adjustment needs).
7. Kazakhstan pharmacy availability: note if commonly stocked in local apteka chains (Europharma, Rigla, Apteka.kz network).
8. WHO Essential Medicines preference: prefer EML-listed drugs when equally effective.
9. Evidence quality for each recommendation: cite GRADE level (1A/1B/2A/2B).
10. For each medicine, provide a structured evidenceCitation (journal + year + specific finding supporting this drug for this condition).

DRUG INTERACTION PRINCIPLES:
- Pharmacodynamic interactions: additive, synergistic, or antagonistic effects
- Pharmacokinetic interactions: absorption, distribution, metabolism (CYP enzymes), excretion
- High-risk combinations: anticoagulants + NSAIDs, SSRIs + MAOIs, metformin + contrast agents, QT-prolonging drugs
- Renal/hepatic considerations: always flag dose adjustment needs
- Age-specific cautions: Beers Criteria for elderly (>65), weight-based dosing for children

${JOURNALS_INSTRUCTION}

EVIDENCE CITATION FORMAT FOR MEDICINES (MANDATORY for each medicine):
Each medicine must include an evidenceCitation with: journal name, URL, year, and specific finding from that source supporting this drug for this condition.
Example: { journal: "NEJM", url: "https://www.nejm.org", year: "2020", finding: "Metformin as first-line therapy for T2DM reduces HbA1c by 1.5% with proven cardiovascular safety (UKPDS follow-up)" }

${profileContext ? `PATIENT CONTEXT:\n${String(profileContext).slice(0, 800)}` : ""}
${safetyContext}
Always recommend consulting a licensed pharmacist or physician before starting any medicine.`,
        },
        {
          role: "user",
          content: `Find the best evidence-based medicines for: ${String(condition).slice(0, 500)}. ${age ? `Age: ${Number(age)}.` : ""} ${weight ? `Weight: ${Number(weight)}kg.` : ""} For each medicine: explain the mechanism of action, provide an evidenceCitation from a peer-reviewed journal or clinical guideline, and carefully check interactions with the patient's safety profile filling interactionWarnings accordingly.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_medicines",
            description: "Return medicine recommendations with full interaction/safety analysis",
            parameters: {
              type: "object",
              properties: {
                medicines: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Brand or common medicine name" },
                      purpose: { type: "string", description: "What this medicine treats / its main use" },
                      dosage: { type: "string", description: "Recommended dosage e.g. 500mg" },
                      instructions: { type: "string", description: "How and when to take it e.g. 'Take 1 tablet twice daily with food'" },
                      warnings: { type: "array", items: { type: "string" }, description: "General side effects and safety warnings" },
                      estimatedPrice: { type: "string", description: "Estimated price in KZT e.g. '450-800 KZT'" },
                      duration: { type: "string", description: "Typical treatment duration e.g. '5-7 days'" },
                      brand: { type: "string", description: "Generic/chemical name" },
                      isGeneric: { type: "boolean", description: "True if this is a generic drug" },
                      analogues: { type: "array", items: { type: "string" }, description: "Alternative brand names or generics" },
                      inStock: { type: "boolean", description: "Typically available in pharmacies" },
                      mechanism: { type: "string", description: "How this drug works — mechanism of action in plain language" },
                      prescriptionRequired: { type: "boolean", description: "True if prescription (Rx) is required in Kazakhstan" },
                      incompatibleWith: { type: "array", items: { type: "string" }, description: "Drugs or foods to avoid in general" },
                      evidenceSource: { type: "string", description: "Brief inline citation e.g. 'Per [NEJM](https://nejm.org) (2021): ...' supporting this recommendation" },
                      evidenceCitation: {
                        type: "object",
                        description: "Structured citation from a peer-reviewed journal or clinical guideline supporting this drug for this condition",
                        properties: {
                          journal: { type: "string", description: "Full journal or guideline name e.g. 'NEJM' or 'WHO Essential Medicines List 2023'" },
                          url: { type: "string", description: "Journal homepage or relevant guideline URL" },
                          year: { type: "string", description: "Publication year e.g. '2022'" },
                          finding: { type: "string", description: "Specific clinical finding from this source — what was proven about this drug for this condition (efficacy, safety, dosing)" },
                          evidenceLevel: { type: "string", description: "GRADE level: 1A, 1B, 2A, 2B, 3, or 4" },
                        },
                        required: ["journal", "url", "year", "finding"],
                      },
                      interactionWarnings: {
                        type: "array",
                        description: "Specific interaction/contraindication alerts based on the patient's chronic diseases, current medications, and allergies. Empty array if none.",
                        items: {
                          type: "object",
                          properties: {
                            severity: { type: "string", enum: ["high", "medium", "low"], description: "high=dangerous avoid; medium=use with caution; low=minor monitor" },
                            type: { type: "string", enum: ["drug-drug", "drug-disease", "drug-allergy"], description: "Type of interaction" },
                            message: { type: "string", description: "Clear explanation of the interaction and what the patient should do" },
                          },
                          required: ["severity", "type", "message"],
                        },
                      },
                    },
                    required: ["name", "purpose", "dosage", "instructions", "warnings", "estimatedPrice", "duration", "interactionWarnings"],
                  },
                },
                generalAdvice: { type: "string", description: "Overall pharmacist advice for this condition" },
                disclaimer: { type: "string" },
                safetyAlerts: {
                  type: "array",
                  description: "Top-level critical safety alerts if any high-severity interactions exist across all recommended medicines",
                  items: { type: "string" },
                },
              },
              required: ["medicines", "generalAdvice", "disclaimer", "safetyAlerts"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_medicines" } },
    });

    const args = completion.choices[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const rawResult = args ? JSON.parse(args) : { medicines: [], generalAdvice: "", disclaimer: "" };

    const result = {
      condition,
      medicines: rawResult.medicines ?? [],
      generalAdvice: rawResult.generalAdvice ?? "",
      disclaimer: rawResult.disclaimer ?? "",
      safetyAlerts: rawResult.safetyAlerts ?? [],
    };

    if (visitorId) {
      await db.insert(aiUsage).values({ visitorId, functionName: "find-medicines" }).catch(() => {});
    }

    return res.json(result);
  } catch (error) {
    return sendInternalError(res, "find-medicines", error);
  }
});

// POST /api/ai/suggest-journals
router.post("/suggest-journals", async (req, res) => {
  try {
    const { condition, language = "en", visitorId } = req.body;
    if (!condition || typeof condition !== "string") return res.status(400).json({ error: "condition required" });

    const safeLang = VALID_LANGUAGES.has(language) ? language : "en";
    const langInstruction = getLangInstruction(safeLang);

    // 200+ top journals across 37 specialties — used for AI-powered suggest-journals
    const APPROVED_JOURNALS = [
      // ── General Medicine ──────────────────────────────────────────────────
      "The New England Journal of Medicine (NEJM) [IF 96.2] — https://www.nejm.org",
      "The Lancet [IF 79.3] — https://www.thelancet.com",
      "JAMA (Journal of the American Medical Association) [IF 63.1] — https://jamanetwork.com/journals/jama",
      "BMJ (British Medical Journal) [IF 39.9] — https://www.bmj.com",
      "Nature Medicine [IF 58.7] — https://www.nature.com/nm",
      "Cell [IF 64.5] — https://www.cell.com",
      "PNAS [IF 11.1] — https://www.pnas.org",
      "Annals of Internal Medicine [IF 25.4] — https://www.acpjournals.org/journal/aim",
      "JAMA Internal Medicine [IF 21.5] — https://jamanetwork.com/journals/jamainternalmedicine",
      "JAMA Network Open [IF 13.8] — https://jamanetwork.com/journals/jamanetworkopen",
      "PLOS Medicine [IF 10.5] — https://journals.plos.org/plosmedicine",
      "BMC Medicine [IF 9.3] — https://bmcmedicine.biomedcentral.com",
      "Mayo Clinic Proceedings [IF 8.9] — https://www.mayoclinicproceedings.org",
      "Science Translational Medicine [IF 15.8] — https://www.science.org/journal/stm",
      "eLife [IF 7.7] — https://elifesciences.org",
      "eClinicalMedicine [IF 17.0] — https://www.thelancet.com/journals/eclinm",
      "Cell Reports Medicine [IF 14.3] — https://www.cell.com/cell-reports-medicine",
      "Nature Reviews Disease Primers [IF 81.5] — https://www.nature.com/nrdp",
      // ── Cardiology / Vascular ─────────────────────────────────────────────
      "Circulation [IF 35.5] — https://www.ahajournals.org/journal/circ",
      "European Heart Journal [IF 35.8] — https://academic.oup.com/eurheartj",
      "JACC: Journal of the American College of Cardiology [IF 24.0] — https://www.jacc.org",
      "JAMA Cardiology [IF 19.6] — https://jamanetwork.com/journals/jamacardiology",
      "Nature Reviews Cardiology [IF 49.3] — https://www.nature.com/nrcardio",
      "Circulation Research [IF 20.1] — https://www.ahajournals.org/journal/res",
      "European Journal of Heart Failure [IF 16.9] — https://onlinelibrary.wiley.com/journal/18790844",
      "Stroke [IF 10.7] — https://www.ahajournals.org/journal/str",
      "Hypertension [IF 9.6] — https://www.ahajournals.org/journal/hyp",
      "Arteriosclerosis, Thrombosis, and Vascular Biology [IF 10.0] — https://www.ahajournals.org/journal/atvb",
      "Journal of the American Heart Association [IF 5.0] — https://www.ahajournals.org/journal/jaha",
      "Heart Rhythm [IF 5.6] — https://www.heartrhythmjournal.com",
      "JACC: Cardiovascular Interventions [IF 11.2] — https://www.jacc.org/journal/jint",
      "Journal of Thoracic and Cardiovascular Surgery [IF 5.0] — https://www.jtcvs.org",
      "Thrombosis and Haemostasis [IF 5.0] — https://www.thieme.com/thrombosis-and-haemostasis",
      // ── Oncology / Cancer ─────────────────────────────────────────────────
      "CA: A Cancer Journal for Clinicians [IF 286.1] — https://acsjournals.onlinelibrary.wiley.com/journal/15424863",
      "Lancet Oncology [IF 51.1] — https://www.thelancet.com/journals/lanonc",
      "Annals of Oncology [IF 51.8] — https://www.annalsofoncology.org",
      "Journal of Clinical Oncology [IF 44.5] — https://ascopubs.org/journal/jco",
      "Cancer Cell [IF 38.6] — https://www.cell.com/cancer-cell",
      "Cancer Discovery [IF 38.7] — https://cancerdiscovery.aacrjournals.org",
      "Nature Reviews Cancer [IF 78.5] — https://www.nature.com/nrc",
      "JAMA Oncology [IF 28.4] — https://jamanetwork.com/journals/jamaoncology",
      "Nature Cancer [IF 23.5] — https://www.nature.com/natcancer",
      "Signal Transduction and Targeted Therapy [IF 39.3] — https://www.nature.com/sigtrans",
      "Journal of Hematology and Oncology [IF 22.1] — https://jhoonline.biomedcentral.com",
      "Journal of the National Cancer Institute [IF 17.7] — https://academic.oup.com/jnci",
      "Clinical Cancer Research [IF 13.8] — https://clincancerres.aacrjournals.org",
      "Cancer Research [IF 12.7] — https://cancerres.aacrjournals.org",
      "Neuro-Oncology [IF 13.5] — https://academic.oup.com/neuro-oncology",
      "Molecular Cancer [IF 37.3] — https://molecular-cancer.biomedcentral.com",
      "International Journal of Radiation Oncology [IF 7.3] — https://www.redjournal.org",
      "British Journal of Cancer [IF 9.1] — https://www.nature.com/bjc",
      "Cancer Medicine [IF 4.6] — https://onlinelibrary.wiley.com/journal/20457634",
      "Cancers (Basel) [IF 6.6] — https://www.mdpi.com/journal/cancers",
      // ── Neurology / Neuroscience ──────────────────────────────────────────
      "Nature Reviews Neurology [IF 45.1] — https://www.nature.com/nrneurol",
      "Lancet Neurology [IF 44.0] — https://www.thelancet.com/journals/laneur",
      "JAMA Neurology [IF 29.0] — https://jamanetwork.com/journals/jamaneurology",
      "Nature Neuroscience [IF 25.0] — https://www.nature.com/neuro",
      "Brain [IF 14.5] — https://academic.oup.com/brain",
      "Neurology [IF 12.3] — https://n.neurology.org",
      "Alzheimer's and Dementia [IF 14.0] — https://alz-journals.onlinelibrary.wiley.com/journal/15525260",
      "Acta Neuropathologica [IF 14.2] — https://link.springer.com/journal/401",
      "Annals of Neurology [IF 11.2] — https://onlinelibrary.wiley.com/journal/15318249",
      "Movement Disorders [IF 8.6] — https://onlinelibrary.wiley.com/journal/15318257",
      "Journal of Neurology, Neurosurgery and Psychiatry [IF 8.7] — https://jnnp.bmj.com",
      "Multiple Sclerosis Journal [IF 5.8] — https://journals.sagepub.com/home/msj",
      "npj Parkinson's Disease [IF 9.1] — https://www.nature.com/npjparkd",
      "Journal of Neuroinflammation [IF 9.3] — https://jneuroinflammation.biomedcentral.com",
      "Epilepsia [IF 6.0] — https://onlinelibrary.wiley.com/journal/15281167",
      "Neuropsychopharmacology [IF 7.9] — https://www.nature.com/npp",
      "Journal of Cerebral Blood Flow and Metabolism [IF 6.9] — https://journals.sagepub.com/home/jcb",
      "Progress in Neurobiology [IF 10.7] — https://www.sciencedirect.com/journal/progress-in-neurobiology",
      // ── Psychiatry / Mental Health ────────────────────────────────────────
      "World Psychiatry [IF 73.3] — https://www.wpanet.org/world-psychiatry",
      "Lancet Psychiatry [IF 64.3] — https://www.thelancet.com/journals/lanpsy",
      "JAMA Psychiatry [IF 25.8] — https://jamanetwork.com/journals/jamapsychiatry",
      "American Journal of Psychiatry [IF 17.4] — https://ajp.psychiatryonline.org",
      "Molecular Psychiatry [IF 13.4] — https://www.nature.com/mp",
      "Psychological Medicine [IF 9.1] — https://www.cambridge.org/core/journals/psychological-medicine",
      "Biological Psychiatry [IF 12.8] — https://www.biologicalpsychiatryjournal.com",
      "Psychotherapy and Psychosomatics [IF 18.3] — https://www.karger.com/Journal/Home/223977",
      "Journal of Affective Disorders [IF 6.5] — https://www.sciencedirect.com/journal/journal-of-affective-disorders",
      "Acta Psychiatrica Scandinavica [IF 6.7] — https://onlinelibrary.wiley.com/journal/16000447",
      "Translational Psychiatry [IF 7.9] — https://www.nature.com/tp",
      "Bipolar Disorders [IF 5.4] — https://onlinelibrary.wiley.com/journal/13983798",
      "Journal of Child Psychology and Psychiatry [IF 10.0] — https://onlinelibrary.wiley.com/journal/14697610",
      "Addiction [IF 7.0] — https://onlinelibrary.wiley.com/journal/13600443",
      // ── Pulmonology / Respiratory ─────────────────────────────────────────
      "Lancet Respiratory Medicine [IF 38.7] — https://www.thelancet.com/journals/lanres",
      "American Journal of Respiratory and Critical Care Medicine [IF 30.5] — https://www.atsjournals.org/journal/ajrccm",
      "European Respiratory Journal [IF 24.9] — https://erj.ersjournals.com",
      "Thorax [IF 10.2] — https://thorax.bmj.com",
      "Chest [IF 9.6] — https://journal.chestnet.org",
      "Annals of the American Thoracic Society [IF 8.5] — https://www.atsjournals.org/journal/annalsats",
      "Journal of Cystic Fibrosis [IF 8.3] — https://www.sciencedirect.com/journal/journal-of-cystic-fibrosis",
      "Respiratory Research [IF 5.9] — https://respiratory-research.biomedcentral.com",
      "Respirology [IF 6.3] — https://onlinelibrary.wiley.com/journal/14401843",
      "Sleep Medicine Reviews [IF 11.4] — https://www.sciencedirect.com/journal/sleep-medicine-reviews",
      // ── Gastroenterology / Hepatology ─────────────────────────────────────
      "Nature Reviews Gastroenterology and Hepatology [IF 65.1] — https://www.nature.com/nrgastro",
      "Journal of Hepatology [IF 25.7] — https://www.journal-of-hepatology.eu",
      "Gastroenterology [IF 33.9] — https://www.gastrojournal.org",
      "Gut [IF 24.5] — https://gut.bmj.com",
      "Hepatology [IF 17.4] — https://aasldpubs.onlinelibrary.wiley.com/journal/15273350",
      "Liver Cancer [IF 13.8] — https://www.karger.com/Journal/Home/232453",
      "Microbiome [IF 15.5] — https://microbiomejournal.biomedcentral.com",
      "Gut Microbes [IF 10.2] — https://www.tandfonline.com/journals/kgmi20",
      "Alimentary Pharmacology and Therapeutics [IF 9.5] — https://onlinelibrary.wiley.com/journal/13652036",
      "American Journal of Gastroenterology [IF 12.0] — https://journals.lww.com/ajg",
      "Journal of Crohn's and Colitis [IF 10.0] — https://academic.oup.com/ecco-jcc",
      "Liver International [IF 7.8] — https://onlinelibrary.wiley.com/journal/14783231",
      "Endoscopy [IF 11.8] — https://www.thieme.com/endoscopy",
      // ── Endocrinology / Diabetes / Metabolism ─────────────────────────────
      "Nature Reviews Endocrinology [IF 52.1] — https://www.nature.com/nrendo",
      "Lancet Diabetes and Endocrinology [IF 44.5] — https://www.thelancet.com/journals/landia",
      "Endocrine Reviews [IF 22.1] — https://academic.oup.com/edrv",
      "Cell Metabolism [IF 31.4] — https://www.cell.com/cell-metabolism",
      "Diabetes Care [IF 16.2] — https://diabetesjournals.org/care",
      "Journal of Clinical Endocrinology and Metabolism [IF 6.0] — https://academic.oup.com/jcem",
      "Diabetologia [IF 10.1] — https://link.springer.com/journal/125",
      "Metabolism [IF 13.9] — https://www.metabolismjournal.com",
      "Obesity Reviews [IF 10.3] — https://onlinelibrary.wiley.com/journal/1467789x",
      "European Journal of Endocrinology [IF 6.3] — https://eje.bioscientifica.com",
      "Thyroid [IF 6.5] — https://www.liebertpub.com/loi/thy",
      "Osteoporosis International [IF 5.0] — https://link.springer.com/journal/198",
      // ── Infectious Disease / Microbiology / Virology ──────────────────────
      "Lancet Infectious Diseases [IF 36.4] — https://www.thelancet.com/journals/laninf",
      "Nature Microbiology [IF 28.3] — https://www.nature.com/nmicrobiol",
      "Emerging Infectious Diseases [IF 11.8] — https://wwwnc.cdc.gov/eid",
      "Clinical Infectious Diseases [IF 11.8] — https://academic.oup.com/cid",
      "Journal of Clinical Microbiology [IF 9.4] — https://journals.asm.org/journal/jcm",
      "Antimicrobial Agents and Chemotherapy [IF 5.2] — https://journals.asm.org/journal/aac",
      "Journal of Antimicrobial Chemotherapy [IF 7.0] — https://academic.oup.com/jac",
      "Cell Host and Microbe [IF 31.3] — https://www.cell.com/cell-host-microbe",
      "PLOS Pathogens [IF 6.7] — https://journals.plos.org/plospathogens",
      "mBio [IF 6.7] — https://journals.asm.org/journal/mbio",
      "Emerging Microbes and Infections [IF 12.0] — https://www.tandfonline.com/journals/temi20",
      "Journal of Infectious Diseases [IF 6.0] — https://academic.oup.com/jid",
      "Antiviral Research [IF 9.0] — https://www.sciencedirect.com/journal/antiviral-research",
      "Journal of Medical Virology [IF 12.1] — https://onlinelibrary.wiley.com/journal/10969071",
      "Journal of Infection [IF 12.8] — https://www.sciencedirect.com/journal/journal-of-infection",
      "AIDS [IF 5.2] — https://journals.lww.com/aidsonline",
      "Vaccine [IF 4.6] — https://www.sciencedirect.com/journal/vaccine",
      "npj Vaccines [IF 10.0] — https://www.nature.com/npjvaccines",
      // ── Immunology / Allergy / Rheumatology ──────────────────────────────
      "Nature Reviews Immunology [IF 108.0] — https://www.nature.com/nri",
      "Nature Reviews Rheumatology [IF 56.5] — https://www.nature.com/nrrheum",
      "Immunity [IF 32.4] — https://www.cell.com/immunity",
      "Nature Immunology [IF 31.3] — https://www.nature.com/ni",
      "Annals of the Rheumatic Diseases [IF 27.4] — https://ard.bmj.com",
      "Arthritis and Rheumatology [IF 12.1] — https://acrjournals.onlinelibrary.wiley.com/journal/23265205",
      "Journal of Allergy and Clinical Immunology [IF 14.2] — https://www.jacionline.org",
      "Allergy [IF 12.4] — https://onlinelibrary.wiley.com/journal/13989995",
      "Journal of Autoimmunity [IF 12.0] — https://www.sciencedirect.com/journal/journal-of-autoimmunity",
      "Cellular and Molecular Immunology [IF 24.1] — https://www.nature.com/cmi",
      "Mucosal Immunology [IF 11.0] — https://www.nature.com/mi",
      "Rheumatology (Oxford) [IF 8.0] — https://academic.oup.com/rheumatology",
      "Frontiers in Immunology [IF 7.3] — https://www.frontiersin.org/journals/immunology",
      // ── Nephrology / Urology ──────────────────────────────────────────────
      "Nature Reviews Nephrology [IF 42.2] — https://www.nature.com/nrneph",
      "Journal of the American Society of Nephrology [IF 13.6] — https://jasn.asnjournals.org",
      "Kidney International [IF 14.8] — https://www.kidney-international.org",
      "European Urology [IF 22.4] — https://www.europeanurology.com",
      "American Journal of Kidney Diseases [IF 8.9] — https://www.ajkd.org",
      "Clinical Journal of the American Society of Nephrology [IF 7.5] — https://cjasn.asnjournals.org",
      "Nephrology Dialysis Transplantation [IF 7.0] — https://academic.oup.com/ndt",
      "BJU International [IF 5.7] — https://www.bjuinternational.com",
      "Journal of Urology [IF 6.9] — https://www.jurology.com",
      // ── Dermatology ───────────────────────────────────────────────────────
      "JAMA Dermatology [IF 14.8] — https://jamanetwork.com/journals/jamadermatology",
      "Journal of the American Academy of Dermatology [IF 14.3] — https://www.jaad.org",
      "British Journal of Dermatology [IF 11.1] — https://onlinelibrary.wiley.com/journal/13652133",
      "Journal of Investigative Dermatology [IF 7.6] — https://www.jidonline.org",
      "Journal of the European Academy of Dermatology and Venereology [IF 6.4] — https://onlinelibrary.wiley.com/journal/14683083",
      "Contact Dermatitis [IF 5.3] — https://onlinelibrary.wiley.com/journal/16000536",
      // ── Ophthalmology ─────────────────────────────────────────────────────
      "Ophthalmology [IF 13.1] — https://www.aaojournal.org",
      "JAMA Ophthalmology [IF 8.3] — https://jamanetwork.com/journals/jamaophthalmology",
      "British Journal of Ophthalmology [IF 5.2] — https://bjo.bmj.com",
      "Ocular Surface [IF 8.4] — https://www.sciencedirect.com/journal/ocular-surface",
      "Investigative Ophthalmology and Visual Science [IF 4.3] — https://iovs.arvojournals.org",
      // ── Otolaryngology / ENT ──────────────────────────────────────────────
      "Otolaryngology Head and Neck Surgery [IF 3.2] — https://journals.sagepub.com/home/oto",
      "Laryngoscope [IF 3.0] — https://onlinelibrary.wiley.com/journal/15314995",
      "Head and Neck [IF 3.5] — https://onlinelibrary.wiley.com/journal/10970347",
      "Ear and Hearing [IF 3.9] — https://journals.lww.com/ear-hearing",
      // ── Orthopedics / Sports Medicine ────────────────────────────────────
      "British Journal of Sports Medicine [IF 18.4] — https://bjsm.bmj.com",
      "Sports Medicine [IF 10.7] — https://link.springer.com/journal/40279",
      "American Journal of Sports Medicine [IF 6.7] — https://journals.sagepub.com/home/ajs",
      "Journal of Bone and Joint Surgery (American) [IF 5.1] — https://journals.lww.com/jbjsjournal",
      "Knee Surgery, Sports Traumatology, Arthroscopy [IF 4.3] — https://link.springer.com/journal/167",
      "Bone [IF 4.9] — https://www.sciencedirect.com/journal/bone",
      "European Spine Journal [IF 3.3] — https://link.springer.com/journal/586",
      "Spine [IF 3.8] — https://journals.lww.com/spinejournal",
      // ── Pediatrics / Neonatology ──────────────────────────────────────────
      "Lancet Child and Adolescent Health [IF 25.0] — https://www.thelancet.com/journals/lanchi",
      "JAMA Pediatrics [IF 26.9] — https://jamanetwork.com/journals/jamapediatrics",
      "Pediatrics (AAP) [IF 8.0] — https://publications.aap.org/pediatrics",
      "Archives of Disease in Childhood [IF 5.5] — https://adc.bmj.com",
      "Journal of Pediatrics [IF 6.4] — https://www.jpeds.com",
      "Pediatric Research [IF 4.3] — https://www.nature.com/pr",
      "Developmental Medicine and Child Neurology [IF 4.7] — https://onlinelibrary.wiley.com/journal/14698749",
      "Journal of Perinatology [IF 3.0] — https://www.nature.com/jp",
      // ── Obstetrics / Gynecology ───────────────────────────────────────────
      "American Journal of Obstetrics and Gynecology [IF 10.4] — https://www.ajog.org",
      "BJOG [IF 7.3] — https://obgyn.onlinelibrary.wiley.com/journal/14710528",
      "Fertility and Sterility [IF 7.6] — https://www.fertstert.org",
      "Human Reproduction [IF 7.6] — https://academic.oup.com/humrep",
      "Ultrasound in Obstetrics and Gynecology [IF 9.0] — https://onlinelibrary.wiley.com/journal/14690705",
      "Obstetrics and Gynecology [IF 7.5] — https://journals.lww.com/greenjournal",
      // ── Surgery / Anesthesia / Critical Care ──────────────────────────────
      "Intensive Care Medicine [IF 22.0] — https://link.springer.com/journal/134",
      "JAMA Surgery [IF 16.9] — https://jamanetwork.com/journals/jamasurgery",
      "Annals of Surgery [IF 10.1] — https://journals.lww.com/annalsofsurgery",
      "Critical Care Medicine [IF 7.7] — https://journals.lww.com/ccmjournal",
      "British Journal of Surgery [IF 9.0] — https://academic.oup.com/bjs",
      "Anesthesiology [IF 9.0] — https://pubs.asahq.org/anesthesiology",
      "British Journal of Anaesthesia [IF 9.1] — https://www.bjanaesthesia.org",
      "Critical Care [IF 8.8] — https://ccforum.biomedcentral.com",
      "Resuscitation [IF 6.5] — https://www.resuscitationjournal.com",
      "American Journal of Transplantation [IF 8.3] — https://onlinelibrary.wiley.com/journal/16007143",
      // ── Radiology / Medical Imaging ───────────────────────────────────────
      "Radiology [IF 12.1] — https://pubs.rsna.org/journal/radiology",
      "European Radiology [IF 7.0] — https://link.springer.com/journal/330",
      "Journal of Nuclear Medicine [IF 9.1] — https://jnm.snmjournals.org",
      "Medical Image Analysis [IF 13.8] — https://www.sciencedirect.com/journal/medical-image-analysis",
      "Investigative Radiology [IF 7.5] — https://journals.lww.com/investigativeradiology",
      "RadioGraphics [IF 5.6] — https://pubs.rsna.org/journal/radiographics",
      // ── Emergency Medicine ─────────────────────────────────────────────────
      "Annals of Emergency Medicine [IF 5.9] — https://www.annemergmed.com",
      "Emergency Medicine Journal [IF 4.8] — https://emj.bmj.com",
      "Injury [IF 3.0] — https://www.sciencedirect.com/journal/injury",
      "Journal of Trauma and Acute Care Surgery [IF 3.7] — https://journals.lww.com/jtrauma",
      // ── Pharmacology / Toxicology ─────────────────────────────────────────
      "Pharmacology and Therapeutics [IF 13.4] — https://www.sciencedirect.com/journal/pharmacology-and-therapeutics",
      "British Journal of Pharmacology [IF 9.5] — https://bpspubs.onlinelibrary.wiley.com/journal/14765381",
      "Drugs [IF 10.0] — https://link.springer.com/journal/40265",
      "Drug Discovery Today [IF 8.9] — https://www.sciencedirect.com/journal/drug-discovery-today",
      "Clinical Pharmacology and Therapeutics [IF 7.3] — https://ascpt.onlinelibrary.wiley.com/journal/15326535",
      "Pharmacological Research [IF 9.8] — https://www.sciencedirect.com/journal/pharmacological-research",
      "Journal of Controlled Release [IF 11.5] — https://www.sciencedirect.com/journal/journal-of-controlled-release",
      "Drug Safety [IF 5.7] — https://link.springer.com/journal/40264",
      // ── Genetics / Genomics ───────────────────────────────────────────────
      "Nature Genetics [IF 41.3] — https://www.nature.com/ng",
      "Genome Biology [IF 17.4] — https://genomebiology.biomedcentral.com",
      "Genetics in Medicine [IF 11.6] — https://www.nature.com/gim",
      "Genome Medicine [IF 15.2] — https://genomemedicine.biomedcentral.com",
      "American Journal of Human Genetics [IF 11.0] — https://www.cell.com/ajhg",
      "Human Mutation [IF 5.8] — https://onlinelibrary.wiley.com/journal/10981004",
      "npj Genomic Medicine [IF 9.2] — https://www.nature.com/npjgenmed",
      "Nucleic Acids Research [IF 14.9] — https://academic.oup.com/nar",
      // ── Public Health / Epidemiology ──────────────────────────────────────
      "Lancet Public Health [IF 25.4] — https://www.thelancet.com/journals/lanpub",
      "Lancet Global Health [IF 34.3] — https://www.thelancet.com/journals/langlo",
      "Environmental Health Perspectives [IF 11.0] — https://ehp.niehs.nih.gov",
      "International Journal of Epidemiology [IF 9.4] — https://academic.oup.com/ije",
      "European Journal of Epidemiology [IF 13.6] — https://link.springer.com/journal/10654",
      "American Journal of Epidemiology [IF 7.0] — https://academic.oup.com/aje",
      "Bulletin of the World Health Organization [IF 10.4] — https://www.who.int/bulletin",
      "American Journal of Public Health [IF 8.1] — https://ajph.aphapublications.org",
      "Social Science and Medicine [IF 5.9] — https://www.sciencedirect.com/journal/social-science-and-medicine",
      "Tobacco Control [IF 8.0] — https://tobaccocontrol.bmj.com",
      // ── Evidence-Based Medicine ───────────────────────────────────────────
      "Cochrane Database of Systematic Reviews [IF 12.0] — https://www.cochranelibrary.com",
      "Systematic Reviews [IF 3.5] — https://systematicreviewsjournal.biomedcentral.com",
      "Journal of Clinical Epidemiology [IF 7.4] — https://www.sciencedirect.com/journal/journal-of-clinical-epidemiology",
      "Research Synthesis Methods [IF 10.5] — https://onlinelibrary.wiley.com/journal/17592887",
      // ── Hematology ────────────────────────────────────────────────────────
      "Blood (ASH) [IF 22.1] — https://ashpublications.org/blood",
      "Haematologica [IF 10.1] — https://haematologica.org",
      "American Journal of Hematology [IF 10.5] — https://onlinelibrary.wiley.com/journal/10969896",
      "British Journal of Haematology [IF 7.2] — https://onlinelibrary.wiley.com/journal/13652141",
      "Journal of Thrombosis and Haemostasis [IF 5.7] — https://onlinelibrary.wiley.com/journal/15387836",
      "Leukemia [IF 14.4] — https://www.nature.com/leu",
      // ── Geriatrics / Aging ────────────────────────────────────────────────
      "Age and Ageing [IF 12.1] — https://academic.oup.com/ageing",
      "GeroScience [IF 7.5] — https://link.springer.com/journal/11357",
      "Journal of the American Geriatrics Society [IF 7.7] — https://onlinelibrary.wiley.com/journal/15325415",
      "Aging Cell [IF 8.7] — https://onlinelibrary.wiley.com/journal/14749726",
      "Journals of Gerontology: Medical Sciences [IF 5.9] — https://academic.oup.com/biomedgerontology",
      // ── Nutrition ─────────────────────────────────────────────────────────
      "American Journal of Clinical Nutrition [IF 8.1] — https://academic.oup.com/ajcn",
      "Clinical Nutrition [IF 7.0] — https://www.sciencedirect.com/journal/clinical-nutrition",
      "International Journal of Obesity [IF 6.2] — https://www.nature.com/ijo",
      "Nutrients [IF 6.6] — https://www.mdpi.com/journal/nutrients",
      "European Journal of Nutrition [IF 5.1] — https://link.springer.com/journal/394",
      // ── Sleep Medicine ────────────────────────────────────────────────────
      "Sleep [IF 6.0] — https://academic.oup.com/sleep",
      "Journal of Clinical Sleep Medicine [IF 4.7] — https://jcsm.aasm.org",
      // ── Pain Medicine ─────────────────────────────────────────────────────
      "Pain (IASP) [IF 7.4] — https://journals.lww.com/pain",
      "Journal of Pain [IF 5.5] — https://www.sciencedirect.com/journal/journal-of-pain",
      "Palliative Medicine [IF 5.8] — https://journals.sagepub.com/home/pmj",
      // ── Pathology / Lab Medicine ──────────────────────────────────────────
      "Modern Pathology [IF 8.0] — https://www.nature.com/modpathol",
      "American Journal of Pathology [IF 6.5] — https://www.ajpathology.org",
      "Clinical Chemistry [IF 9.0] — https://academic.oup.com/clinchem",
      "Laboratory Investigation [IF 6.8] — https://www.nature.com/labinvest",
      // ── Global Health / Tropical Medicine ────────────────────────────────
      "PLoS Neglected Tropical Diseases [IF 4.5] — https://journals.plos.org/plosntds",
      "American Journal of Tropical Medicine and Hygiene [IF 3.5] — https://www.ajtmh.org",
      "Journal of Travel Medicine [IF 10.6] — https://academic.oup.com/jtm",
      // ── Digital Health / Informatics ──────────────────────────────────────
      "NPJ Digital Medicine [IF 12.4] — https://www.nature.com/npjdigitalmed",
      "Journal of the American Medical Informatics Association [IF 6.8] — https://academic.oup.com/jamia",
      "Artificial Intelligence in Medicine [IF 7.5] — https://www.sciencedirect.com/journal/artificial-intelligence-in-medicine",
    ];

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `${langInstruction}
You are a senior medical librarian with deep knowledge of peer-reviewed literature. Select the most relevant journals from the approved list below for the given condition.

APPROVED JOURNALS:
${APPROVED_JOURNALS.join("\n")}

For each suggestion you MUST provide:
1. The exact journal name and homepage URL from the list above
2. A realistic article title (a real or highly plausible landmark article title for this condition)
3. Publication year (between 2015-2024)
4. A PubMed search URL using: https://pubmed.ncbi.nlm.nih.gov/?term=CONDITION+KEYWORDS (URL-encode spaces as +)
5. A 1-2 sentence explanation of why this journal is the best source for this condition
6. A direct article URL if known (use the journal's doi or search page otherwise)`,
        },
        {
          role: "user",
          content: `Suggest 4-5 of the most relevant journals with specific article citations for: ${String(condition).slice(0, 500)}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_journals",
            description: "Return journal suggestions with specific article citations",
            parameters: {
              type: "object",
              properties: {
                journals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Full journal name" },
                      url: { type: "string", description: "Journal homepage URL" },
                      searchUrl: { type: "string", description: "PubMed search URL for this condition" },
                      articleTitle: { type: "string", description: "Specific landmark article title" },
                      articleYear: { type: "string", description: "Article publication year e.g. 2022" },
                      articleUrl: { type: "string", description: "Direct link to article or DOI page" },
                      reason: { type: "string", description: "Why this journal is most relevant for the condition" },
                    },
                    required: ["name", "url", "searchUrl", "articleTitle", "articleYear", "reason"],
                  },
                },
              },
              required: ["journals"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_journals" } },
    });

    const args = completion.choices[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const result = args ? JSON.parse(args) : { journals: [] };

    if (visitorId) {
      await db.insert(aiUsage).values({ visitorId, functionName: "suggest-journals" }).catch(() => {});
    }

    return res.json(result);
  } catch (error) {
    return sendInternalError(res, "suggest-journals", error);
  }
});

// POST /api/ai/translate-text
router.post("/translate-text", async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || typeof text !== "string" || text.length > 5000) {
      return res.status(400).json({ error: "Invalid text (max 5000 chars)" });
    }

    const langNames: Record<string, string> = { en: "English", ru: "Russian", kk: "Kazakh", zh: "Chinese (Simplified)" };

    if (targetLang && targetLang !== sourceLang && langNames[targetLang]) {
      const completion = await openai.chat.completions.create({
        model: FAST_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a precise medical translator. Translate medical text accurately into ${langNames[targetLang]}. Output ONLY the translated text, nothing else — no labels, no quotes, no explanation.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 2000,
      });

      const translated = completion.choices[0]?.message?.content?.trim() || "";
      if (!translated) return res.status(500).json({ error: "Translation failed. Please try again." });
      return res.json({ translated, [targetLang]: translated });
    }

    // Legacy multi-language mode (fallback)
    const targets = ["en", "ru", "kk", "zh"].filter((l) => l !== sourceLang);

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: `Translate the following medical text into ${targets.map((l) => langNames[l]).join(", ")}.
Return ONLY valid JSON: {"${targets.join('":"<translation>","')}":"<translation>"}.
Rules: Plain natural medical language. No em-dash. No emoji. Preserve all medical terms.

Source (${langNames[sourceLang] || "English"}):
${text}`,
        },
      ],
      max_tokens: 4000,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(raw);
    return res.json(result);
  } catch (error) {
    return sendInternalError(res, "translate-text", error);
  }
});

// GET /api/ai/chat-history
router.get("/chat-history", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const rows = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId))
      .orderBy(desc(chatHistory.createdAt))
      .limit(40);

    return res.json({ data: rows });
  } catch (error) {
    return sendInternalError(res, "chat-history", error);
  }
});

export default router;
