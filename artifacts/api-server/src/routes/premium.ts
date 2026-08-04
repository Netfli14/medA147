import { Router } from "express";
import Stripe from "stripe";
import { db } from "../lib/db";
import { userPremium } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { sendInternalError } from "../lib/errors";

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-06-30.basil" as any });
}

function getPriceId(plan: string): string | null {
  const ids: Record<string, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY ?? "price_1TExP0ReXN8AIfPxbbcDcebE",
    semiannual: process.env.STRIPE_PRICE_SEMIANNUAL ?? "price_1TLm67ReXN8AIfPxIS7y3dXw",
    annual: process.env.STRIPE_PRICE_ANNUAL ?? "price_1TLm6HReXN8AIfPxNZebqvDW",
  };
  return ids[plan] ?? null;
}

const VALID_PLANS = new Set(["monthly", "semiannual", "annual"]);

// GET /api/premium/status
router.get("/status", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.json({ isPremium: false, active: false });

    const [row] = await db.select().from(userPremium).where(eq(userPremium.userId, userId));

    if (!row || !row.active) return res.json({ isPremium: false, active: false });

    if (row.expiresAt && row.expiresAt < new Date()) {
      await db.update(userPremium).set({ active: false }).where(eq(userPremium.userId, userId));
      return res.json({ isPremium: false, active: false });
    }

    return res.json({ isPremium: true, active: true, expiresAt: row.expiresAt });
  } catch (error) {
    return sendInternalError(res, "check-subscription", error);
  }
});

// POST /api/premium/checkout
router.post("/checkout", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { plan = "monthly", userEmail } = req.body;

    if (!VALID_PLANS.has(plan)) return res.status(400).json({ error: "Invalid plan" });

    const priceId = getPriceId(plan);
    if (!priceId) return res.status(400).json({ error: "Plan not configured" });

    const stripe = getStripe();
    const origin = req.headers.origin || "https://replit.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: typeof userEmail === "string" ? userEmail.slice(0, 254) : undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/premium?success=true`,
      cancel_url: `${origin}/premium?canceled=true`,
      metadata: { userId },
    });

    return res.json({ url: session.url });
  } catch (error) {
    return sendInternalError(res, "create-checkout", error);
  }
});

// POST /api/premium/portal
router.post("/portal", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { userEmail } = req.body;
    if (!userEmail || typeof userEmail !== "string") return res.status(400).json({ error: "userEmail required" });

    const stripe = getStripe();
    const origin = req.headers.origin || "https://replit.app";

    const customers = await stripe.customers.list({ email: userEmail.slice(0, 254), limit: 1 });
    if (customers.data.length === 0) return res.status(404).json({ error: "No Stripe customer found" });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${origin}/premium`,
    });

    return res.json({ url: portalSession.url });
  } catch (error) {
    return sendInternalError(res, "customer-portal", error);
  }
});

// POST /api/premium/webhook
router.post("/webhook", async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(400).json({ error: "Webhook not configured" });
    }
    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        await db.insert(userPremium).values({
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          active: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        }).onConflictDoUpdate({
          target: userPremium.userId,
          set: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            active: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      await db.update(userPremium).set({ active: false }).where(eq(userPremium.stripeSubscriptionId, sub.id));
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(400).json({ error: "Webhook verification failed" });
  }
});

// GET /api/premium/symptom-history
router.get("/symptom-history", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { symptomHistory } = await import("@workspace/db/schema");
    const { desc } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(symptomHistory)
      .where(eq(symptomHistory.userId, userId))
      .orderBy(desc(symptomHistory.createdAt))
      .limit(20);
    return res.json({ data: rows });
  } catch (error) {
    return sendInternalError(res, "symptom-history", error);
  }
});

export default router;
