# Port "your-sync-mate" into this project

Copy the full email-reminder app from the GitHub repo into this project: all pages, components, server logic, and the database/storage schema.

## What the app does

An email reminder scheduler: you configure SMTP profiles, create reminders (recipients, subject, body, attachments, timezone), schedule them (single or recurring by weekday/time), and review a send log. It also ships guide pages for environment setup, hosting, and static export.

## Pages to bring over

- `/` — reminders dashboard
- `/auth` — sign in / sign up
- `/reminders/new` and `/reminders/:id` — reminder editor form
- `/smtp` — SMTP profile management and test send
- `/logs` — send history
- `/env-guide`, `/hosting-guide`, `/export` — documentation/utility pages

## Backend

Enable Lovable Cloud, then apply the repo's schema as one migration:

- Tables: `smtp_profiles`, `reminders`, `reminder_schedules`, `reminder_attachments`, `send_logs`
- `set_updated_at()` trigger function plus update triggers
- Grants for `authenticated` and `service_role`, RLS enabled, policies allowing signed-in users to manage their data and read logs
- `attachments` storage bucket with authenticated read/write policies
- Email auth (sign-up/sign-in) for gating the app

## Technical notes

- Repo stack matches this project (TanStack Start v1, React 19, Tailwind v4, shadcn, Supabase), so files port over largely as-is.
- Server-side pieces to copy: `src/lib/app.functions.ts`, `mailer.server.ts`, `smtp.server.ts`, `mail-api.server.ts`, plus the Supabase integration files (client, admin client, auth middleware, auth attacher in `src/start.ts`).
- Shared helpers: `src/lib/auth.ts`, `backend.ts`, `format.ts`, `schedule.ts`, `src/components/AppShell.tsx`, `ReminderForm.tsx`, and the shadcn UI components the pages use.
- `src/routes/index.tsx` placeholder is replaced by the reminders dashboard; `__root.tsx` gains the app providers and toaster.
- Repo secrets are not included; SMTP credentials are stored per profile in the database, so no extra secret is required up front. Any missing key can be added later.
- Per-route head metadata will be set for each page.
- The `.static-export` / `spa` export scripts from the repo are skipped unless you want them.

## Verification

Build the app, load each route, sign up a test account, create an SMTP profile and a reminder, and confirm the data persists.
