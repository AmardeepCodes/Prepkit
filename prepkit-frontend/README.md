# PrepKit AI — Frontend

Next.js (App Router) + Tailwind CSS frontend for the AI Interview Prep Kit
assessment. UI converted from a Stitch design export ("Modern AI Precision"
design system — see `tailwind.config.js` for the exact tokens).

## Status

This is the **UI layer only**, wired with local/mock state
(`lib/mockKit.js`) so every screen and interaction can be built and reviewed
before the backend exists. Every place that needs a real API call is marked
with a `// TODO:` comment pointing at the endpoint it will call.

## Screens

| Route | Screen |
|---|---|
| `/login`, `/register` | Auth |
| `/dashboard` | Kit list, filters, empty state |
| `/kits/new` | Create kit — single role or bulk upload |
| `/kits/[id]/generating` | Live generation progress + partial-failure warning |
| `/kits/[id]` | Kit builder — Brief / Requirements / Question Bank / Flashcards / Schedule tabs |
| `/kits/[id]/practice` | Flashcard practice mode with confidence rating |
| `/kits/[id]/practice/summary` | Coverage report after a session |

## The builder's state model

Each question and the company brief carry `edited` / `pinned` flags. The UI
never lets "regenerate section" touch an item the user has pinned or hand-
edited — the backend contract (once wired) is expected to honor the same
rule: a regenerate call only replaces items that are neither `edited` nor
`pinned`.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Not yet wired

Auth, kit CRUD, generation pipeline, and coverage checking all currently run
against `lib/mockKit.js`. Replacing the `TODO`s with real `fetch` calls to
the backend is the next step.
