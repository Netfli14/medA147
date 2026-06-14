import { Router } from "express";
import { db } from "../lib/db";
import { userActions } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { sendInternalError } from "../lib/errors";

const router = Router();

// GET /api/actions
router.get("/", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const rows = await db
      .select()
      .from(userActions)
      .where(eq(userActions.userId, userId))
      .orderBy(desc(userActions.createdAt))
      .limit(50);

    const data = rows.map((r) => ({
      id: r.id,
      function_name: r.functionName,
      action_data: r.actionData,
      created_at: r.createdAt?.toISOString() ?? new Date().toISOString(),
    }));

    return res.json({ data });
  } catch (error) {
    return sendInternalError(res, "get-actions", error);
  }
});

export default router;
