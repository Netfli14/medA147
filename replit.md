# MedAI+ Workspace

## Overview

pnpm workspace monorepo using TypeScript. Multi-language (EN/RU/KK/ZH) health AI platform for Kazakhstan with symptom analysis, AI doctor chat, image analysis, medicine finder, Stripe payments, and a feedback system.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifact: `artifacts/medai`, previewPath `/`)
- **API Server**: Express 5 (artifact: `artifacts/api-server`, port 8080)
- **Database**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Auth**: Clerk (`@clerk/express` on server, `@clerk/react` on client)
- **AI**: OpenAI via Replit AI Integration (`lib/openai.ts`)
- **Payments**: Stripe (`artifacts/api-server/src/routes/premium.ts`)
- **Build**: esbuild (ESM bundle for server)

## Artifacts

| Artifact | Kind | Preview Path | Port |
|---|---|---|---|
| `artifacts/medai` | web | `/` | `$PORT` (Vite) |
| `artifacts/api-server` | api | — | 8080 |

## Key Commands

- `pnpm --filter @workspace/db run push` — push DB schema changes to PostgreSQL (dev only)
- `pnpm --filter @workspace/api-server run dev` — build + start API server
- `pnpm --filter @workspace/medai run dev` — start Vite dev server

## API Routes

All routes served from `http://localhost:8080`:

| Route | Description |
|---|---|
| `GET /api/feedback/suggestions` | List all suggestions with likes & replies |
| `POST /api/feedback/suggestions` | Submit a suggestion (auto-translates via AI) |
| `POST /api/feedback/suggestions/:id/like` | Toggle like (by visitorId) |
| `POST /api/feedback/suggestions/:id/reply` | Add reply to a suggestion |
| `GET /api/profiles/me` | Get authenticated user's medical profile |
| `PUT /api/profiles/me` | Update medical profile |
| `GET /api/premium/status` | Check user premium status |
| `POST /api/premium/checkout` | Create Stripe checkout session |
| `POST /api/premium/portal` | Create Stripe billing portal session |
| `GET /api/premium/symptom-history` | Get symptom history (premium only) |
| `POST /api/ai/analyze-symptoms` | Symptom analysis |
| `POST /api/ai/ai-doctor` | AI doctor chat (SSE streaming) |
| `POST /api/ai/analyze-image` | Image analysis |
| `POST /api/ai/analyze-prescription` | Prescription reader |
| `POST /api/ai/find-medicines` | Medicine finder |
| `POST /api/ai/suggest-journals` | Health journal suggestions |
| `POST /api/ai/translate-text` | Text translation |
| `GET /api/ai/chat-history` | AI chat history |

## DB Schema (`lib/db/src/schema/medai.ts`)

Tables: `medical_profiles`, `symptom_history`, `chat_history`, `user_actions`, `suggestions`, `suggestion_likes`, `suggestion_replies`, `user_premium`, `ai_usage`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit)
- `CLERK_SECRET_KEY` — Clerk secret key (set in Secrets)
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (set in Secrets)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy base URL (auto by Replit AI Integration)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI proxy key (auto by Replit AI Integration)
- `STRIPE_SECRET_KEY` — Stripe secret key (needs to be set in Secrets)

## Stripe Price IDs

- Monthly: `price_1TExP0ReXN8AIfPxbbcDcebE`
- Semiannual: `price_1TLm67ReXN8AIfPxIS7y3dXw`
- Annual: `price_1TLm6HReXN8AIfPxNZebqvDW`

## Creator Email

`yerzhanuly.y@nisa.edu.kz` — gets special creator badge on feedback page

## Notes

- The `artifacts/medai/src/integrations/supabase/client.ts` is neutralized (no-op stub) — do not restore Supabase
- The `artifacts/medai/src/integrations/lovable/index.ts` is neutralized (no-op stub) — do not restore Lovable auth
- Stripe requires `STRIPE_SECRET_KEY` env var for payments to work
