# InternTrain

An intern safety training platform with a mobile app for trainees and a web admin panel for supervisors. Trainees watch video courses, take MCQ quizzes, and earn certificates across three modules (AAWS, Brake System, Control System). Admins monitor student progress, view completions, and track certificates.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080, path `/api`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Mobile: Expo (React Native) — path `/mobile`
- Admin: React + Vite + shadcn/ui — path `/admin/`

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (students, admins, progress, quiz_results, certificates)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/mobile/` — Expo mobile app
- `artifacts/admin/` — React-Vite admin panel
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod validation schemas

## Architecture decisions

- JWT auth using SESSION_SECRET env var; 30-day expiry. Mobile stores token in AsyncStorage, admin stores in localStorage.
- All student progress is server-side (PostgreSQL), not just AsyncStorage. Mobile contexts do optimistic updates then sync from API.
- Default admin credentials seeded on first boot: admin@interntrain.com / admin123
- Pass threshold for quiz certificates: 60% (3/5 correct)
- Section IDs are canonical strings: "aaws", "brake", "control"

## Product

- **Mobile (Expo):** Login/signup with server auth → home screen with 3 training sections → video player (YouTube via WebBrowser) → MCQ quiz → certificate screen → profile tab
- **Admin (React-Vite):** Login → dashboard stats → students list with progress → student detail → certificates list

## Default credentials

- Admin: admin@interntrain.com / admin123

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` before checking artifact packages if you change `lib/*`
- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` (this also runs typecheck:libs)
- `req.params.id` in Express 5 is typed as `string | string[]` — cast with `req.params["id"] as string`
- Never use console.log in server code — use `req.log` in route handlers and `logger` singleton elsewhere

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
