import { Router } from "express";
import { db } from "../lib/db";
import { suggestions, suggestionLikes, suggestionReplies } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { openai, AI_MODEL } from "../lib/openai";
import { sendInternalError } from "../lib/errors";

const router = Router();

// GET /api/feedback/suggestions
router.get("/suggestions", async (req, res) => {
  try {
    const rows = await db.select().from(suggestions).orderBy(desc(suggestions.createdAt)).limit(1000);

    const likesData = await db.select().from(suggestionLikes);
    const repliesData = await db.select().from(suggestionReplies).orderBy(desc(suggestionReplies.createdAt));

    const result = rows.map((s) => ({
      ...s,
      likes: likesData.filter((l) => l.suggestionId === s.id).length,
      replies: repliesData.filter((r) => r.suggestionId === s.id),
    }));

    return res.json({ data: result });
  } catch (error) {
    return sendInternalError(res, "get-suggestions", error);
  }
});

// POST /api/feedback/suggestions
router.post("/suggestions", async (req, res) => {
  try {
    const { name, email, category, suggestion, originalLang = "en" } = req.body;

    if (!suggestion || typeof suggestion !== "string" || suggestion.trim().length < 5) {
      return res.status(400).json({ error: "Suggestion text is required (min 5 chars)" });
    }
    if (suggestion.trim().length > 2000) {
      return res.status(400).json({ error: "Suggestion too long (max 2000 chars)" });
    }

    const VALID_CATEGORIES = ["general", "ui", "features", "ai", "other"];
    const safeCategory = VALID_CATEGORIES.includes(category) ? category : "general";
    const safeName = typeof name === "string" ? name.slice(0, 100).replace(/<[^>]*>/g, "") : "Anonymous";
    const safeEmail = typeof email === "string" && email.length < 255 ? email : undefined;
    const safeLang = ["en", "ru", "kk", "zh"].includes(originalLang) ? originalLang : "en";
    const cleanSuggestion = suggestion.trim().replace(/<[^>]*>/g, "");

    let translations: Record<string, string> = {};
    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `Translate this feedback into English, Russian, Kazakh, and Chinese (Simplified).
Return JSON: {"en":"...","ru":"...","kk":"...","zh":"..."}.
Rules: Plain natural language. No em-dash. No emoji.

Text (source: ${safeLang}):
"""${cleanSuggestion}"""`,
          },
        ],
        max_tokens: 1000,
      });
      translations = JSON.parse(completion.choices[0]?.message?.content || "{}");
    } catch (err) {
      console.error("Translation failed (non-fatal):", err instanceof Error ? err.message : err);
    }

    const [inserted] = await db.insert(suggestions).values({
      name: safeName || "Anonymous",
      email: safeEmail,
      category: safeCategory,
      suggestion: cleanSuggestion,
      suggestionEn: translations.en,
      suggestionRu: translations.ru,
      suggestionKk: translations.kk,
      suggestionZh: translations.zh,
      originalLang: safeLang,
    }).returning();

    return res.json({ data: inserted });
  } catch (error) {
    return sendInternalError(res, "create-suggestion", error);
  }
});

// POST /api/feedback/suggestions/:id/like
router.post("/suggestions/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { visitorId } = req.body;
    if (!visitorId || typeof visitorId !== "string" || visitorId.length > 128) {
      return res.status(400).json({ error: "visitorId required" });
    }

    const existing = await db.select().from(suggestionLikes).where(
      and(eq(suggestionLikes.suggestionId, id), eq(suggestionLikes.visitorId, visitorId))
    );

    if (existing.length > 0) {
      await db.delete(suggestionLikes).where(
        and(eq(suggestionLikes.suggestionId, id), eq(suggestionLikes.visitorId, visitorId))
      );
      return res.json({ liked: false });
    } else {
      await db.insert(suggestionLikes).values({ suggestionId: id, visitorId });
      return res.json({ liked: true });
    }
  } catch (error) {
    return sendInternalError(res, "like-suggestion", error);
  }
});

// POST /api/feedback/suggestions/:id/reply
router.post("/suggestions/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText, authorName, isCreator } = req.body;

    if (!replyText || typeof replyText !== "string" || replyText.trim().length < 2) {
      return res.status(400).json({ error: "Reply text required" });
    }
    if (replyText.trim().length > 1000) {
      return res.status(400).json({ error: "Reply too long (max 1000 chars)" });
    }

    const safeText = replyText.trim().replace(/<[^>]*>/g, "");
    const safeAuthor = typeof authorName === "string" ? authorName.slice(0, 100).replace(/<[^>]*>/g, "") : "Anonymous";

    const [reply] = await db.insert(suggestionReplies).values({
      suggestionId: id,
      replyText: safeText,
      authorName: safeAuthor || "Anonymous",
      isCreator: isCreator === true,
    }).returning();

    return res.json({ data: reply });
  } catch (error) {
    return sendInternalError(res, "reply-suggestion", error);
  }
});

export default router;
