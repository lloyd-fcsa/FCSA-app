# fcsa-app

Public-facing app for FCSA (forum, events, public info). A self-contained SPA, separate from other projects. A members-only section is planned for a later stage.

## Stack

- React 19 + Vite
- React Router 7
- Supabase (auth + data) — credentials in `.env` (see `.env.example`)
- ESLint
- Deployed on Vercel; `vercel.json` has a catch-all rewrite to `index.html` for client-side routing

## Commands

```
npm install     # install deps
npm run dev     # local dev
npm run build   # production build (run before commit)
npm run lint    # ESLint
```

No test framework. No TypeScript/typecheck.

## Structure

- Entry: `src/main.jsx` → `src/App.jsx`
- Pages: `src/pages/` (Home, Event, About)
- Shared layout + nav/footer: `src/components/Layout.jsx`
- Supabase client: `src/lib/supabase.js` (returns `null` + `supabaseReady=false` when env not set, so the app runs in demo mode before Supabase is connected)
- Static assets: `public/`
- Design tokens (`--bg`, `--accent`, `--radius-md`, etc.) live in `src/index.css`. Use them; don't hardcode hex.

## Current state

- v1 is a public-facing slice: Home (overview + links), Event (hardcoded two-day agenda with day toggle), About (what FCSA is).
- All event content is hardcoded in `src/pages/Event.jsx` for now. When the Supabase project is ready, move agenda/sessions/speakers into tables and load them here.

## Conventions

- Component/page files use `PascalCase.jsx`.
- Keep the nav simple — current tabs are Home / Event / About. A members area is a future addition (likely a sixth footer/sign-in area or a gated route), not a fourth primary nav unless decided otherwise here.
- Keep copy professional and plain — this is a membership body's public app, not a marketing product.

## Doing tasks here

- Run `npm run build` and `npm run lint` before considering work done.
- Never commit secrets (`.env` is gitignored).
- Only commit when explicitly asked.