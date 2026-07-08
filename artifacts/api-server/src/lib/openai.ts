import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export const AI_MODEL = "gpt-4o";
export const VISION_MODEL = "gpt-4o";
export const FAST_MODEL = "gpt-4o-mini";
