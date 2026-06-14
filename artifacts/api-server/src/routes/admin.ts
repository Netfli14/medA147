import { Router } from "express";
import { db } from "../lib/db";
import { aiUsage, userActions, chatHistory, symptomHistory } from "@workspace/db/schema";
import { sql, desc, count } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { sendInternalError } from "../lib/errors";

const router = Router();

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

function isAdmin(userId: string | null): boolean {
  if (!userId) return false;
  if (ADMIN_USER_IDS.length === 0) return false;
  return ADMIN_USER_IDS.includes(userId);
}

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!isAdmin(userId)) return res.status(403).json({ error: "Forbidden" });

    const [
      totalUsageRows,
      usageByFunction,
      actionsRows,
      recentActions,
      dailyUsage,
    ] = await Promise.all([
      db.select({ total: count() }).from(aiUsage),
      db
        .select({ functionName: aiUsage.functionName, total: count() })
        .from(aiUsage)
        .groupBy(aiUsage.functionName)
        .orderBy(desc(count())),
      db.select({ total: count() }).from(userActions),
      db
        .select({
          functionName: userActions.functionName,
          total: count(),
        })
        .from(userActions)
        .groupBy(userActions.functionName)
        .orderBy(desc(count())),
      db
        .select({
          day: sql<string>`DATE(${aiUsage.createdAt})`,
          total: count(),
        })
        .from(aiUsage)
        .groupBy(sql`DATE(${aiUsage.createdAt})`)
        .orderBy(sql`DATE(${aiUsage.createdAt}) DESC`)
        .limit(30),
    ]);

    const [chatCount, symptomCount] = await Promise.all([
      db.select({ total: count() }).from(chatHistory),
      db.select({ total: count() }).from(symptomHistory),
    ]);

    return res.json({
      totals: {
        aiCalls: totalUsageRows[0]?.total ?? 0,
        userActions: actionsRows[0]?.total ?? 0,
        chatMessages: chatCount[0]?.total ?? 0,
        symptomAnalyses: symptomCount[0]?.total ?? 0,
      },
      usageByFunction,
      actionsByFunction: recentActions,
      dailyUsage: dailyUsage.reverse(),
    });
  } catch (error) {
    return sendInternalError(res, "admin/stats", error);
  }
});

export default router;
