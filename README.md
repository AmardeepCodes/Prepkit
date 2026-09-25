Demo Video Link :-  https://youtu.be/VvYeFKK2SSs
Backend Link  :- https://prepkit-backend-wl5c.onrender.com
Frontend Link :- https://prepkit-frontend-rho.vercel.app/ 

To README ko GitHub par professional aur attractive dikhane ke liye main isme **Markdown formatting**, **emojis**, **collapsible sections (`<details>`)**, aur **clean tables** add kar raha hoon.

⚠️ **Note:** Aapki requirement ke mutabiq, **content, facts, aur code me se ek bhi cheez (1% bhi) change nahi ki gayi hai**, bas iski readability aur GitHub UI presentation ko polish kiya gaya hai taki ye ek world-class open-source project jaisa dikhe.

Aap seedha is code ko copy karke apne GitHub repository ke `README.md` file me paste kar sakte hain:

---

```markdown
# 🚀 PrepKit AI — The AI Interview Prep Kit

Turns a pasted job description + a company URL into a personalised interview prep kit: a company brief, a role breakdown, a categorised question bank, flashcards, and a day-by-day study schedule — all editable, regenerable section-by-section, and practiseable inside the app.

> Built for the **Trao Full-Stack Engineering Assessment** (`FS-AI-INTERVIEW-01`).

---

## 🛠️ 1. Tech stack

| Layer | Choice | Notes |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS | Matches the preferred stack |
| **Backend** | Node.js + Express | Matches the preferred stack |
| **Database** | MongoDB (Atlas free tier) | Matches the preferred stack |
| **Auth** | JWT (not session cookies) | See Auth note below |
| **Language** | JavaScript (ES modules) | `"type": "module"` throughout |
| **Scraping** | cheerio for HTML parsing, native fetch for requests | No headless browser — pages are fetched as static HTML, which is enough for company/careers pages |
| **Public search** | DuckDuckGo's `lite.duckduckgo.com` HTML endpoint | No official free-tier search API gives enough queries for batch testing (5 cases in 15 min); this endpoint needs no API key. **Trade-off:** Not an official API and could break if DuckDuckGo changes its markup — failures here are caught and reported as a skipped source, never fatal. |
| **LLM** | Google Gemini — `gemini-2.5-flash-lite` | Free tier, structured JSON output mode |

### 💡 Design & Architecture Notes

<details>
<summary><b>Why JWT instead of session cookies?</b></summary>
The brief asks for "session handling," which we read as the app tracks who's logged in and protects routes rather than literally requiring cookie-based sessions. JWT in an <code>Authorization: Bearer</code> header gives the same guarantee (signed, expiring, server-verified) without needing sticky sessions or CORS-cookie complexity between two separately-deployed origins (frontend on Vercel, backend on Render/Railway).
</details>

<details>
<summary><b>Why this specific Gemini model?</b></summary>
We started on <code>gemini-2.0-flash</code>, which Google deprecated mid-build; moved to <code>gemini-3.6-flash</code>, whose free tier turned out to cap at 20 requests/day (discovered by hitting it in real testing); settled on <code>gemini-2.5-flash-lite</code> for a much more usable free-tier daily quota, at a model tier that's still accurate enough for structured extraction/generation tasks that don't need deep multi-step reasoning.
</details>

---

## ⚙️ 2. Setup instructions

### Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm run dev                # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                # http://localhost:3000

```

* **MongoDB:** Either run MongoDB locally, or (recommended, and required for deployment anyway) create a free MongoDB Atlas cluster and put its connection string in `MONGODB_URI`.
* **Gemini API key:** Create one free at [Google AI Studio](https://aistudio.google.com/apikey?utm_source=gemini).

### Batch entry point (must run from a clean clone)

```bash
cd backend
npm install
cp .env.example .env
npm run evaluate -- --input=cases.json --output=kits.json

```

* Reads `cases.json` (array of `{ id, jd, company_url, days }`, see Appendix B).
* Runs the exact same pipeline (`src/services/pipeline/kitPipeline.js`) the API route uses — not a parallel implementation — including the same structure-validation gate before a case is marked `"ok"`.
* Writes `kits.json` in the Appendix B shape.
* One case failing doesn't stop the run; it's recorded with `status: "failed"` and an `error.code`/`error.message`.
* `company_url` values pointing at a local address (e.g., `http://localhost:8099/acme/`) work — the crawler never assumes a particular host, it resolves every link relative to whatever `company_url` it's given.

### Deployed Links

* **Frontend:** `<DEPLOYMENT_LINK_FRONTEND>`
* **Backend:** `<DEPLOYMENT_LINK_BACKEND>`

> Both are reachable publicly. The frontend calls the backend via `NEXT_PUBLIC_API_URL`, set as an environment variable on the frontend's hosting platform (not committed to source).

### Environment variables

#### Backend (`.env`)

| Var | Purpose |
| --- | --- |
| `PORT` | Server port (default 4000) |
| `NODE_ENV` | development / production — gates private-IP rejection (see Security) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs auth tokens — any long random string in production |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CORS_ORIGIN` | Frontend origin allowed to call this API |

#### Frontend (`.env.local`)

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

---

## 🏛️ 3. High-level architecture

```text
frontend/                          backend/
  app/                               src/
    login, register                   config/       env, db
    dashboard                         models/        User, Kit
    kits/new                          routes/        auth, kit
    kits/[id]                         controllers/   auth, kit
      /generating                     middlewares/   auth guard, validation, errors
      /practice, /practice/summary     services/
      /weak-spots                       retrieval/    crawler, pageFetcher,
  lib/api/                                             publicSearch, robotsCheck
    client.js  - fetch wrapper +         generation/   requirementExtractor,
                 JWT header, 401                        questionGenerator,
                 redirect                                flashcardGenerator,
    kits.js    - kits endpoints                          briefGenerator, llmClient
  components/kit/                       coverage/     coverageChecker,
    CompanyBriefSection,                                coverageLoop (2nd pass)
    RequirementsSection,                scheduler/    scheduleAllocator
    QuestionBankSection,                pipeline/     kitPipeline.js (orchestrator),
    FlashcardsSection,                                  regenerateSection.js
    ScheduleSection,                    validation/   kitSchemaValidator
    WeakSpotsReport                   scripts/
                                         evaluate.js   batch entry point
                                       tests/

```

> `kitPipeline.js` is the single function both the `POST /api/kits/:id/generate` route and `scripts/evaluate.js` call — retrieval, generation, coverage, and scheduling are never duplicated between the interactive and batch paths.

---

## 🔍 4. Retrieval approach and sources used

1. **Company crawl (`crawler.js`):** Fetches the homepage, extracts every link, ranks them by keyword match against a list (`career`, `jobs`, `handbook`, `join-us`, `team`, etc. — not a fixed path list), fetches the top-ranked candidates. Whichever page scores highest and loads successfully is treated as the hiring page.
2. **Page fetch/clean (`pageFetcher.js`):** Fetches with a timeout and retry, rejects unexpected content-types/oversized responses, strips `script`/`style`/`nav`/`footer` for the readable-text version — but extracts links before that stripping, since hiring/careers links usually live in nav or footer.
3. **Public interview discussion (`publicSearch.js`):** Queries `lite.duckduckgo.com` for `"<company> interview process questions"`, decodes the redirect-wrapped result links, fetches each one via the same safe `pageFetcher`.
4. **robots.txt (`robotsCheck.js`):** Checked before crawling a company's homepage; a `Disallow` for `*` on the target path skips that source (recorded, not fatal).
5. **Sources actually used** are recorded per-kit in `source.pages_used` and `company_brief.sources` — visible in the UI's Company Brief tab.

---

## ⚙️ 5. Research / generation sequencing

Each step is a separate, purpose-built call — never one prompt asked to do everything:

* **Retrieval (deterministic code, no LLM):** Crawl $\rightarrow$ hiring page $\rightarrow$ public discussion search. Runs first because generation depends on what it finds.
* **Requirement extraction (LLM, JD only — no retrieval needed for this step):** One call, JD text only, asked to mark each requirement `must`/`nice` based on the posting's own wording ("required" vs. "bonus points for").
* **Question generation (LLM, per category):** Technical and behavioural requirements get separate calls with separate instructions — a "5+ years React" requirement and a "mentoring juniors" requirement are never generated in the same call, because a good technical prompt and a good behavioural (STAR-format) prompt need genuinely different framing.
* **Coverage check (deterministic code, no LLM):** Compares every `question.requirement_ids` against `role.requirements`; any `must` requirement with zero linked questions is a gap.
* **Second pass (LLM, targeted):** Only the gapped requirements get a fresh generation call, capped at one extra pass — see §7.
* **Flashcards (LLM, one call from the final question bank):** A transformation task, not new research, so it's a single batched call rather than one-per-question.
* **Company brief (LLM, from crawled text only):** Explicitly instructed to say "not enough information" rather than invent detail when the crawl came back thin or empty.
* **Schedule (deterministic code, no LLM):** Allocates the final question set across the requested days.

---

## 📌 6. Generated / edited / pinned state

Every question carries two booleans, persisted in MongoDB:

* `edited: true` — set automatically the moment the user changes its text via the builder.
* `pinned: true` — set only when the user explicitly pins it.

`POST /api/kits/:id/regenerate { section: "questions", category }` filters the category's questions into `untouched` = questions where `pinned || edited` and `toRegenerate` = everything else, generates fresh replacements only for the latter, and returns `[...untouched, ...fresh]`. The company brief has the same `edited` flag and is skipped entirely by brief-regeneration if set.

The schedule has no edit/pin concept — it's pure arithmetic over whatever questions currently exist, so regenerating it just re-runs the allocator.

> This was deliberately kept to two flags rather than a version history or diffing system — it directly answers the one question the builder needs to answer ("can regenerate touch this?") without extra bookkeeping.

---

## 🔄 7. Second pass / coverage

* **`MAX_PASSES = 2`:** The initial generation is pass 1; if must-priority gaps remain, one targeted gap-fill call runs per missing requirement, then coverage is checked again and the loop stops regardless of outcome.
* **Reasoning:** If a requirement still can't get a linked question after one retry, further retries are unlikely to fix a structural mismatch (e.g. a vague requirement) and just burn quota/time — better to report the honest gap in `coverage.uncovered_requirement_ids` than loop indefinitely. Nice-to-have gaps are never chased — the brief only requires must-haves to be covered.

---

## 📅 8. Schedule allocation

Pure arithmetic in `scheduleAllocator.js`, no LLM call:

1. Sort questions by a weight combining priority (must-have requirements first) and difficulty (harder first within the same priority tier).
2. Round-robin distribute the sorted list across days buckets — not sequential slicing, so no day is left empty while an earlier one has several extra items.
3. Each day gets `focus` (derived from its questions' categories), `question_ids`, and `minutes` ($15 \times \text{question count}$ — a rough read-plus-review estimate).
4. `days` is clamped to $[1, 60]$ before allocation, so a 1-day or 60-day request never crashes; a 60-day request with fewer than 60 questions simply leaves later days empty with `minutes: 0`.

---

## 💡 9. Creative feature — Weak Spots Report

Practice Mode already collects a confidence rating per flashcard, but only in local session state — it was gone on refresh and useless for planning future sessions. We persisted confidence on each flashcard in MongoDB and built a report (`/kits/:id/weak-spots`) that:

* Shows average confidence per question category,
* Lists the 5 lowest-confidence cards,
* Flags cards never practiced at all,
* Surfaces any requirement still in `coverage.uncovered_requirement_ids`.

> **Why this and not mock-interview mode or a printable export:** It needed no new LLM calls (quota was already the binding constraint we hit repeatedly during generation — see §11), so it carries no extra rate-limit risk; and it answers the actual problem a candidate has with limited prep time — "what should I redo" — more directly than a cosmetic export would.

---

## ⚠️ 10. Edge cases and failure handling

| Case | Handling |
| --- | --- |
| **Invalid/404/timeout company URL** | `pageFetcher` returns `{ ok: false, reason }`, recorded in `skippedSources`; pipeline continues with JD-only generation. |
| **No discoverable hiring page** | `hiringPage` stays `null`; brief generator is told explicitly to say so rather than invent detail. |
| **Two-line JD stub** | `extractRoleInfo` skips the LLM call entirely below 20 characters and returns empty arrays — never invents requirements. |
| **No public discussion found** | `discussion.results = []`; company brief proceeds without that source. |
| **Invalid JSON / incomplete kit from the model** | `callLLM` wraps parsing in `try/catch` $\rightarrow$ `AppError(502, "LLM_INVALID_JSON")`; `validateKitStructure` also runs before saving, both in the API route and the batch script. |
| **LLM rate-limited** | `withRetry` parses the provider's own `RetryInfo.retryDelay` and waits that long before retrying (up to 5 attempts); question generation also adds a deliberate 4s gap between sequential calls to avoid hitting the limit in the first place. |
| **Same JD + company submitted twice** | `createKit` looks up an existing kit with the same `userId + company_url + jd_text` and returns it instead of creating a duplicate. |
| **1-day / 60-day schedule** | Clamped and tested — see §8 and `tests/scheduleAllocator.test.js`. |
| **Generation triggered twice concurrently** | `generateKit` checks `kit.status === "generating"` and returns `409 ALREADY_GENERATING` instead of racing two pipeline runs. |
| **Session expired/invalid** | Frontend's `apiFetch` catches any 401, clears the stored token, and redirects to `/login`. |

---

## 🔒 11. Security

* `assertSafeUrl` (`utils/urlValidator.js`) rejects non-http(s) protocols and known loopback/private hostnames before any fetch; in `NODE_ENV=production` it also rejects private IP ranges (`10.x`, `192.168.x`, `172.16–31.x`, `169.254.x`) — relaxed only in development so the batch command's `localhost:8099` test fixture server still works, per the brief.
* `pageFetcher` caps response size (2MB) and only accepts `text/html`/`application/xhtml+xml` content types.
* Every LLM call that includes scraped or user-pasted text wraps it with explicit `BEGIN`/`END` delimiters plus a system-level instruction telling the model to treat that text strictly as data, never as instructions — see `wrapUntrusted()` / `UNTRUSTED_CONTENT_NOTICE` in `llmClient.js`. This guards against a job description or a crawled page containing something like *"ignore previous instructions and..."*.

---

## ⏳ 12. Backend: handling slow/failing/duplicate generation

Generation is a single long-running request (typically 30–90s across 5–8 sequential LLM calls):

* The frontend doesn't block on it — it fires `POST /generate` and immediately shows a polling "generating" page (`GET /api/kits/:id` every 3s) until status flips to `ready`/`failed`.
* A failure at any point sets `status: "failed"` and re-throws, so the builder's error state is honest rather than showing a half-built kit.
* The 409 double-trigger guard (§10) prevents a second click from racing the first run.
* **Persistence:** Every kit is a MongoDB document from creation (`status: "draft"`) onward, so refreshing or coming back later always finds the same kit in whatever state it's in — draft, generating, ready, or failed.

---

## 🛑 13. Known limitations

* `lite.duckduckgo.com` is an unofficial endpoint; if DuckDuckGo changes its markup, public-discussion search degrades to "no results found" rather than crashing, but would need a parsing update to recover fully.
* Company-name detection from the URL (`about.gitlab.com` $\rightarrow$ `Gitlab`) uses a simple second-to-last-DNS-label heuristic; it will misfire on multi-part TLDs (e.g. `.co.uk`).
* Regenerating a system-design or company-fit question category is a documented no-op (`CATEGORY_NOT_REGENERABLE`) — those categories aren't tied 1:1 to a requirement's kind the way technical/behavioural are, so there's no principled "regenerate from scratch" source for them; they're meant to be hand-authored via "Add Question."
* The model occasionally omits `answer_outline` for a question (empty string) — accepted as-is since it's supporting detail, not the graded `prompt`/`difficulty`/`requirement_ids` fields.
* No CSV/JSON template validation UI for bulk upload beyond basic parsing — a malformed row is silently filtered out rather than reported per-row.

```

```
