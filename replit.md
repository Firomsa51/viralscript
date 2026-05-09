# ViralScript

AI-powered social media script generator that creates platform-specific viral scripts for TikTok, YouTube, Instagram, LinkedIn, and Twitter/X.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- After codegen always run `node scripts/fix-codegen.mjs` to fix `lib/api-zod/src/index.ts`
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `GROQ_API_KEY`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: Clerk (`@clerk/express` server, `@clerk/react` + `@clerk/themes` client)
- AI: Groq SDK (llama-3.3-70b-versatile) with platform-specific prompt templates

## Where things live

- `lib/db/src/schema/scripts.ts` — DB schema (scripts table with userId, audience, hookStyle)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-zod/src/` — generated Zod schemas
- `lib/api-client-react/src/` — generated React Query hooks
- `artifacts/api-server/src/lib/groq.ts` — platform-specific AI prompt templates
- `artifacts/api-server/src/routes/scripts.ts` — script CRUD routes (all auth-gated)
- `artifacts/script-generator/src/App.tsx` — ClerkProvider + routing
- `artifacts/script-generator/src/pages/landing.tsx` — public landing page
- `artifacts/script-generator/src/pages/home.tsx` — authenticated generator page

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks + Zod schemas. Never hand-write API types.
- All script routes require Clerk auth (`requireAuth` middleware). Scripts are isolated per `userId`.
- Platform-specific Groq prompts: each platform (TikTok, Instagram, YouTube, YouTube-long, Twitter/X, LinkedIn) has a dedicated template function in `groq.ts`.
- Unauthenticated users see a public landing page. Authenticated users are redirected to `/generate`.
- Clerk proxy path is hardcoded to `/api/__clerk`. Production proxy is set up automatically.

## Product

- Public landing page with hero, feature grid, platform pills, and CTAs
- Clerk sign-in/sign-up pages styled to match the dark cyan theme
- Script generator: topic + audience + platform + tone + hook style + duration → AI script
- Script library: view, filter by platform, copy, delete saved scripts
- Stats dashboard: total scripts, saved count, breakdown by platform/tone

## User preferences

- Keep existing Express + React/Vite + Drizzle stack (no Next.js/Prisma migration)
- Dark theme with cyan primary (#00d4ff)

## Gotchas

- After any `pnpm --filter @workspace/api-spec run codegen`, always run `node scripts/fix-codegen.mjs`
- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` to rebuild composite libs first
- `VITE_CLERK_PUBLISHABLE_KEY` must be set for the frontend; `CLERK_SECRET_KEY` + `CLERK_PUBLISHABLE_KEY` for the backend

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for auth setup and customization details
