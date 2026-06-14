import { Router } from "express";
import { db } from "../lib/db";
import { medicalProfiles } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { sendInternalError } from "../lib/errors";

const router = Router();

// GET /api/profiles/me
router.get("/me", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [profile] = await db.select().from(medicalProfiles).where(eq(medicalProfiles.userId, userId));
    return res.json({ profile: profile || null });
  } catch (error) {
    return sendInternalError(res, "get-profile", error);
  }
});

// PUT /api/profiles/me
router.put("/me", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { age, gender, weightKg, heightCm, bloodType, chronicConditions, allergies, currentMedications } = req.body;

    const parsedAge = age != null ? Number(age) : null;
    if (parsedAge !== null && (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130)) {
      return res.status(400).json({ error: "Invalid age" });
    }

    const data = {
      userId,
      age: parsedAge,
      gender: typeof gender === "string" ? gender.slice(0, 20) : null,
      weightKg: weightKg ? String(weightKg).slice(0, 10) : null,
      heightCm: heightCm ? String(heightCm).slice(0, 10) : null,
      bloodType: typeof bloodType === "string" ? bloodType.slice(0, 10) : null,
      chronicConditions,
      allergies,
      currentMedications,
      updatedAt: new Date(),
    };

    const existing = await db.select().from(medicalProfiles).where(eq(medicalProfiles.userId, userId));

    if (existing.length > 0) {
      await db.update(medicalProfiles).set(data).where(eq(medicalProfiles.userId, userId));
    } else {
      await db.insert(medicalProfiles).values(data);
    }

    const [updated] = await db.select().from(medicalProfiles).where(eq(medicalProfiles.userId, userId));
    return res.json({ profile: updated });
  } catch (error) {
    return sendInternalError(res, "update-profile", error);
  }
});

export default router;
