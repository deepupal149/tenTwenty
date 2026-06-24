# TenTwenty — Timesheet Management App

A small SaaS-style timesheet manager built for the TenTwenty front-end technical
assessment. Log in, browse weekly timesheets in a responsive, filterable and
paginated table, drill into a week to log individual task entries, and
create / edit / delete entries through validated modal forms.

## Tech stack

| Concern          | Choice                              | Why |
| ---------------- | ----------------------------------- | --- |
| Framework        | **Next.js 15** (App Router) + TS    | App Router + route handlers for the internal API |
| Auth             | **next-auth v5** (Credentials)      | Dummy login, JWT stored in an httpOnly session cookie |
| Styling          | **Tailwind CSS v4**                 | Utility-first, fast to keep responsive |
| Server state     | **TanStack Query v5**               | Fetch/cache + server prefetch + clean loading/error states |
| Forms            | **react-hook-form + zod**           | Schema validation shared between the form and the API |
| Icons            | **lucide-react**                    | Lightweight icon set |
| Testing          | **Vitest + Testing Library**        | Fast unit + component tests |

## Getting started

```bash
# 1. Install
npm install

# 2. Environment — copy the example and set a secret
cp .env.example .env.local
#   set AUTH_SECRET (any 32-byte base64 string):
#   openssl rand -base64 32

# 3. Run
npm run dev          # http://localhost:3000
```

### Demo credentials

```
Email:    demo@tentwenty.com
Password: password123
```

The login form is pre-filled with these for convenience.

## Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start the dev server      |
| `npm run build`      | Production build          |
| `npm start`          | Run the production build  |
| `npm run lint`       | ESLint                    |
| `npm test`           | Run the Vitest suite once |
| `npm run test:watch` | Watch mode                |

## Project structure

```
src/
  app/
    (app)/                            authenticated route group
      layout.tsx                      shared Header + Footer chrome
      dashboard/page.tsx              timesheet list (server-guarded + prefetched)
      timesheet/page.tsx              bare /timesheet → redirects to /dashboard
      timesheet/[id]/page.tsx         weekly task view for one week
    api/
      auth/[...nextauth]/route.ts     next-auth handler
      timesheets/route.ts             GET list · POST create
      timesheets/[id]/route.ts        PUT update · DELETE
      timesheets/[id]/tasks/route.ts  GET/POST tasks for a week
      tasks/[id]/route.ts             PUT update · DELETE a task
    login/page.tsx                    login screen
    layout.tsx  page.tsx  globals.css root shell + redirect entry
  components/
    ui/                               Button, Input, Textarea, Label, Badge,
                                      Table, Dialog, Calendar, Select, Pagination
    login/LoginForm.tsx
    layout/                           Header, Footer
    timesheets/                       TimesheetDashboard, TimesheetTable,
                                      TimesheetForm, WeeklyTimesheet, TaskRow,
                                      TaskEntryForm, DateRangePicker
    Providers.tsx                     SessionProvider + React Query client
  hooks/
    useTimesheets.ts                  timesheet list query + mutations
    useTasks.ts                       per-week task query + mutations
  lib/
    auth.ts                           next-auth config
    api.ts                            client → internal /api wrappers
    validation.ts                     zod schemas (login + timesheet + task)
    mock-data.ts                      in-memory data store + status derivation
    query-keys.ts                     shared React Query key builders
    get-query-client.ts               per-request server QueryClient (prefetch)
    types.ts  utils.ts  constants.ts
  middleware.ts                       route guard (redirects)
  types/css.d.ts                      CSS module type shim
```

## How it works

- **Auth** — the Credentials provider validates against one hardcoded demo user.
  On success next-auth issues a signed JWT held in an httpOnly cookie (not
  localStorage). `middleware.ts` redirects unauthenticated users to `/login` and
  authenticated users away from it. Each page also re-checks the session
  server-side (belt-and-braces).
- **Internal API routes** — the client never touches the data source directly.
  It calls `/api/timesheets*` and `/api/tasks*`, which check the session before
  reading/writing. This satisfies the "all client calls go through internal API
  routes" guideline and is where a real upstream API + token forwarding would live.
- **Server prefetch + hydration** — protected pages prefetch their first query on
  the server (`get-query-client.ts`) and dehydrate it into the client cache, so
  the first paint has data and avoids a client refetch. `query-keys.ts` keeps the
  server and client keys identical so hydration lands on the same cache entry.
- **Data flow** — `useTimesheets` reads the paginated/filterable list;
  `useTasks` reads one week's tasks. Mutations (create/update/delete) invalidate
  the relevant cache so views refresh automatically. Forms validate with zod via
  react-hook-form; the same schemas re-validate on the server.
- **Status derivation** — a week's status is computed from its logged task hours:
  `MISSING` (0h) · `INCOMPLETE` (<40h) · `COMPLETED` (≥40h), so it recalculates
  whenever a task is added, edited, or deleted.

## Assumptions & notes

- **No backend was supplied**, so timesheet and task data are mocked in an
  in-memory store (`src/lib/mock-data.ts`), attached to `globalThis` to survive
  dev hot-reloads. It resets on server restart. Swapping in a real API means
  changing only the internal route handlers — the client layer is unchanged.
- Authentication is intentionally dummy (single demo user) per the brief; real
  credentials would never live in source.
- `AUTH_SECRET` lives in `.env.local` (git-ignored); `.env.example` documents it.
- The list view supports status + date-range filtering, sorting (week / date /
  status), and pagination — all resolved server-side in the mock data layer.
- A weekly view (`/timesheet/[id]`) is reached from a dashboard row; bare
  `/timesheet` has no week selected and redirects to `/dashboard`.

## Testing

21 tests across 6 files, run with `npm test`:

- **zod schemas** — login + timesheet + task validation rules.
- **TimesheetForm** — validation errors, valid submit, edit prefill, cancel.
- **StatusBadge** — status → label/variant mapping.
- **Pages** — dashboard and weekly/`[id]` server components: auth-guard
  redirects, server prefetch with the correct query keys, and the child view
  rendering when authed.

## Deployment

Deploy to **Vercel**: import the repo, set `AUTH_SECRET` in project env vars,
and ship. Fully static/serverless, no external services.
