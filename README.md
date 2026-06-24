# TenTwenty — Timesheet Management App

A small SaaS-style timesheet manager built for the TenTwenty front-end technical
assessment. Log in, view weekly timesheet entries in a responsive table, and
create / edit / delete entries through a validated modal form.

## Tech stack

| Concern          | Choice                              | Why |
| ---------------- | ----------------------------------- | --- |
| Framework        | **Next.js 15** (App Router) + TS    | Required; App Router + route handlers for internal APIs |
| Auth             | **next-auth v5** (Credentials)      | Required; dummy login, JWT stored in an httpOnly session cookie |
| Styling          | **Tailwind CSS v4**                 | Required; utility-first, fast to keep responsive |
| Server state     | **TanStack Query v5**               | Fetch/cache + clean loading & error states |
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
    api/
      auth/[...nextauth]/route.ts   next-auth handler
      timesheets/route.ts           GET list · POST create   (internal API)
      timesheets/[id]/route.ts      PUT update · DELETE
    login/page.tsx                  login screen
    dashboard/page.tsx              protected dashboard (server-guarded)
    page.tsx                        redirects to /login or /dashboard
  components/
    ui/                             Button, Input/Select, Modal, Badge
    login/LoginForm.tsx
    layout/Header.tsx
    timesheets/                     Dashboard, Table, Form
    Providers.tsx                   SessionProvider + React Query
  hooks/useTimesheets.ts            query + mutation hooks
  lib/
    auth.ts                         next-auth config
    api.ts                          client → internal /api wrappers
    validation.ts                   zod schemas (login + timesheet)
    mock-data.ts                    in-memory data store
    types.ts  utils.ts  constants.ts
  middleware.ts                     route guard (redirects)
```

## How it works

- **Auth** — the Credentials provider validates against one hardcoded demo user.
  On success next-auth issues a signed JWT held in an httpOnly cookie (not
  localStorage). `middleware.ts` redirects unauthenticated users to `/login` and
  authenticated users away from it.
- **Internal API routes** — the client never calls the data source directly. It
  calls `/api/timesheets*`, which check the session before reading/writing. This
  satisfies the "all client calls go through internal API routes" guideline and
  is where a real upstream API + token forwarding would live.
- **Data flow** — `useTimesheets` (TanStack Query) reads the list; mutations
  (create/update/delete) invalidate the cache so the table refreshes
  automatically. Forms validate with zod via react-hook-form; the same schema
  re-validates on the server.

## Assumptions & notes

- **No backend was supplied**, so timesheet data is mocked in an in-memory store
  (`src/lib/mock-data.ts`). It resets on server restart. Swapping in a real API
  means changing only the internal route handlers — the client layer is unchanged.
- Authentication is intentionally dummy (single demo user) per the brief.
- `AUTH_SECRET` lives in `.env.local` (git-ignored); `.env.example` documents it.
- Columns shown: **Week #, Date, Project, Hours, Status, Actions** — Project and
  Hours were added beyond the minimum spec to make entries meaningful.

## Testing

14 tests covering the zod schemas (login + timesheet rules), the `TimesheetForm`
(validation errors, valid submit, edit prefill, cancel), and the `StatusBadge`.
Run with `npm test`.

## Deployment

Deploy to **Vercel**: import the repo, set `AUTH_SECRET` in project env vars,
and ship. Fully static/serverless, no external services.

## Time spent

~4–5 hours (setup, auth, CRUD + modal, responsive table, tests, docs).

> **Design note:** UI structure/markup is final; Tailwind styling (colors,
> spacing, type) is being aligned to the provided Figma once Dev Mode access or
> exported frames are available.
