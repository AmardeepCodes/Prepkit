import { crawlCompanySite } from "../retrieval/crawler.js";
import { searchInterviewDiscussion } from "../retrieval/publicSearch.js";
import { extractRoleInfo } from "../generation/requirementExtractor.js";
import { generateQuestionBank } from "../generation/questionGenerator.js";
import { generateFlashcards } from "../generation/flashcardGenerator.js";
import { generateCompanyBrief } from "../generation/briefGenerator.js";
import { runCoverageLoop } from "../coverage/coverageLoop.js";
import { buildSchedule } from "../scheduler/scheduleAllocator.js";


function deriveCompanyName(companyUrl, homepageTitle) {
  try {
    const host = new URL(companyUrl).hostname.replace(/^www\./, "");
    const parts = host.split(".");
    // "about.gitlab.com" -> ["about","gitlab","com"] -> take "gitlab"
    // (second-to-last label), not the subdomain. "stripe.com" -> "stripe".
    const label = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return homepageTitle || "Unknown company";
  }
}

// The single place that runs the full research -> generation -> coverage ->
// schedule sequence. Both the API route (below) and the batch script
// (`npm run evaluate`, built later) call this exact function — the brief
// requires no parallel implementation for the batch path.
//
// Each retrieval sub-step is wrapped so one unreachable source doesn't
// fail the whole run — it gets recorded in skippedSources instead, and
// generation continues with whatever was actually found.
export async function runKitPipeline({ jd, companyUrl, days }) {
  const skippedSources = [];

  // --- Retrieval ---
  let crawl = { homepage: null, hiringPage: null, pagesUsed: [], skipped: [] };
  try {
    crawl = await crawlCompanySite(companyUrl);
    skippedSources.push(...crawl.skipped);
  } catch (err) {
    skippedSources.push({ url: companyUrl, reason: err.message });
  }

 const companyName = deriveCompanyName(companyUrl, crawl.homepage?.title);

    let discussion = { ok: false, results: [] };
    // Only search for public discussion if we actually confirmed the company
    // exists (homepage fetch succeeded). Searching with a name derived from an
    // unreachable/garbage URL just pulls in irrelevant results and pollutes
    // the brief's sources — worse than honestly having nothing.
    if (crawl.homepage) {
      try {
        discussion = await searchInterviewDiscussion(companyName);
      } catch (err) {
        skippedSources.push({ url: "public interview discussion search", reason: err.message });
      }
    } else {
      skippedSources.push({
        url: "public interview discussion search",
        reason: "Skipped — company homepage was unreachable, so there's no confirmed company name to search for.",
      });
    }

  const pagesUsed = [...crawl.pagesUsed, ...discussion.results.map((r) => r.url)];

  // --- Generation: role + requirements from the JD (no retrieval needed) ---
  const roleInfo = await extractRoleInfo(jd);

  // --- Generation: questions, category-separated calls ---
  const initialQuestions = await generateQuestionBank(roleInfo.requirements);

  // --- Coverage check + second pass (deterministic gap detection) ---
  const { questions, coverage } = await runCoverageLoop(roleInfo.requirements, initialQuestions);

  // --- Generation: flashcards (transform of the final question bank) ---
  const flashcards = await generateFlashcards(questions);

  // --- Generation: company brief, from whatever retrieval actually found ---
  const companyBrief = await generateCompanyBrief({
    homepageText: crawl.homepage?.text,
    hiringPageText: crawl.hiringPage?.text,
    discussionText: discussion.results[0]?.excerpt,
    companyName,
  });

  // --- Scheduler: deterministic allocation, not the model's decision ---
  const schedule = buildSchedule(roleInfo.requirements, questions, days);

  return {
    source: {
      company: companyName,
      company_url: companyUrl,
      role: roleInfo.title,
      location: "",
      jd_chars: jd.length,
      jd_text: jd,
      researched_at: new Date(),
      pages_used: pagesUsed,
    },
    company_brief: {
      summary: companyBrief.summary,
      what_they_do: companyBrief.what_they_do,
      sources: pagesUsed,
    },
    role: {
      title: roleInfo.title,
      seniority: roleInfo.seniority,
      responsibilities: roleInfo.responsibilities,
      requirements: roleInfo.requirements,
    },
    questions,
    flashcards,
    schedule,
    coverage,
    status: "ready",
    skippedSources, // not part of Appendix A — useful for logs, controller can drop it
  };
}




















