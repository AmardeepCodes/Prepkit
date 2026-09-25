import { crawlCompanySite } from "../retrieval/crawler.js";
import { searchInterviewDiscussion } from "../retrieval/publicSearch.js";
import { generateCompanyBrief } from "../generation/briefGenerator.js";
import { generateQuestionsForRequirement } from "../generation/questionGenerator.js";
import { buildSchedule } from "../scheduler/scheduleAllocator.js";
import AppError from "../../utils/AppError.js";

// --- Company brief -------------------------------------------------------
// Re-crawls (research is cheap to redo and we don't persist raw scraped
// text) and regenerates the brief — unless the user has hand-edited it,
// in which case regenerating anything else must never touch it.
export async function regenerateBrief(kit) {
  if (kit.company_brief.edited) {
    return kit.company_brief; // pinned by edit — leave untouched
  }

  const crawl = await crawlCompanySite(kit.source.company_url);
  const discussion = crawl.homepage
    ? await searchInterviewDiscussion(kit.source.company).catch(() => ({ results: [] }))
    : { results: [] };

  const brief = await generateCompanyBrief({
    homepageText: crawl.homepage?.text,
    hiringPageText: crawl.hiringPage?.text,
    discussionText: discussion.results?.[0]?.excerpt,
    companyName: kit.source.company,
  });

  return { ...brief, sources: [...crawl.pagesUsed], edited: false };
}

// --- Questions, one category at a time -----------------------------------
// Only "technical" and "behavioural" are tied to a requirement's kind and
// can be regenerated from scratch here. "system-design" and "company-fit"
// questions are hand-authored via "Add Question" — there's no single
// requirement to regenerate them from, so regenerating those categories is
// a no-op (documented limitation, see README).
const CATEGORY_TO_KIND = { technical: "technical", behavioural: "behavioural" };

export async function regenerateQuestionCategory(kit, category) {
  const kind = CATEGORY_TO_KIND[category];
  if (!kind) {
    throw new AppError(
      400,
      "CATEGORY_NOT_REGENERABLE",
      `"${category}" questions are hand-authored and can't be regenerated automatically.`
    );
  }

  const untouched = kit.questions.filter(
    (q) => q.category !== category || q.pinned || q.edited
  );
  const relevantRequirements = kit.role.requirements.filter((r) =>
    kind === "behavioural" ? r.kind === "behavioural" : r.kind !== "behavioural"
  );

  let idCounter =
    Math.max(0, ...kit.questions.map((q) => Number(String(q.id).replace(/\D/g, "")) || 0)) + 1;

  const freshQuestions = [];
  for (const req of relevantRequirements) {
    const generated = await generateQuestionsForRequirement(req, category);
    for (const q of generated) {
      freshQuestions.push({ id: `q${idCounter++}`, ...q, edited: false, pinned: false });
    }
    await new Promise((r) => setTimeout(r, 4000)); // stay under free-tier RPM
  }

  return [...untouched, ...freshQuestions];
}

// --- Schedule --------------------------------------------------------------
// Purely deterministic — no LLM, no "edited" concept to preserve (the
// brief doesn't ask the schedule to survive edits the way questions do).
export function regenerateSchedule(kit) {
  return buildSchedule(kit.role.requirements, kit.questions, kit.schedule.days_available);
}