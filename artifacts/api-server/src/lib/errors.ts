import type { Response } from "express";

export function sendInternalError(res: Response, context: string, error: unknown): Response {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, msg);
  return res.status(500).json({ error: "An internal error occurred. Please try again." });
}
