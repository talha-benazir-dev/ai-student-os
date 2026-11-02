# Nucleus — AI Student OS

A Next.js app for notes, tasks, flashcards, documents, study sessions, analytics,
and an AI study assistant. Authentication and app data use Supabase; AI requests
use Anthropic, and uploads use Cloudinary.

## Local setup

Use a current supported Node.js release (Node.js 24 or newer recommended).

```bash
npm ci
cp .env.example .env.local
```

Fill in `.env.local` with your existing project's credentials:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for sign-in and data.
- `NEXT_PUBLIC_SITE_URL` for OAuth redirects; locally use `http://localhost:3000`.
- `ANTHROPIC_API_KEY` for AI features.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for uploads.

Only the `NEXT_PUBLIC_` values are exposed to the browser. Keep server credentials
in `.env.local` or your hosting provider's environment settings.

Use the existing Supabase project. The migrations in `supabase/migrations/` are
incremental changes, not a complete bootstrap of the original database. Configure
the corresponding `/auth/callback` URL in Supabase when using Google sign-in.

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Checks and production

```bash
npm test
npm run typecheck
npm run lint
npx playwright install chromium
npm run test:e2e
npm run build
npm start
```

The browser checks use an isolated local backend and do not modify your Supabase
project. See [the workspace refresh notes](docs/workspace-refresh-2026-10-27.md)
for the student journey, design decisions, performance work, and verification scope.

The build downloads Geist fonts from Google and needs network access. Production
features also need the environment values above. Keep `package-lock.json` in sync
with `package.json` and use `npm ci` for reproducible installs.
