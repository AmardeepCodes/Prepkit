import { fetchPage } from "./pageFetcher.js";
import { isAllowedByRobots } from "./robotsCheck.js";

// Keywords that suggest a link is worth following when hunting for the
// hiring/careers page. No hard-coded path list - the brief explicitly
// rules that out - this ranks whatever links the homepage actually has.
const HIRING_KEYWORDS = [
  "career", "careers", "jobs", "job", "hiring", "hire", "join-us", "join us",
  "work-with-us", "life-at", "team", "handbook", "culture", "open-positions",
];

function score(link) {
  const haystack = `${link.href} ${link.label}`.toLowerCase();
  return HIRING_KEYWORDS.reduce((s, kw) => (haystack.includes(kw) ? s + 1 : s), 0);
}

function resolveLink(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

// Crawls a company site starting from its homepage: fetches the homepage,
// ranks its links by how "hiring-related" they look, fetches the top few.
// Returns { homepage, hiringPage, pagesUsed, skipped }.
export async function crawlCompanySite(companyUrl, { maxLinksToFollow = 3 } = {}) {
  const skipped = [];
  const pagesUsed = [];

  const allowed = await isAllowedByRobots(companyUrl);
    if (!allowed) {
      skipped.push({ url: companyUrl, reason: "Blocked by robots.txt" });
      return { homepage: null, hiringPage: null, pagesUsed: [], skipped };
    }

  const homepage = await fetchPage(companyUrl);

  if (!homepage.ok) {
    skipped.push({ url: companyUrl, reason: homepage.reason });
    return { homepage: null, hiringPage: null, pagesUsed, skipped };
  }
  pagesUsed.push(homepage.url);

  const sameOrigin = new URL(homepage.url).origin;
  const candidates = homepage.links
    .map((l) => ({ ...l, resolved: resolveLink(l.href, homepage.url) }))
    .filter((l) => l.resolved && l.resolved.startsWith(sameOrigin))
    .map((l) => ({ ...l, score: score(l) }))
    .filter((l) => l.score > 0)
    .sort((a, b) => b.score - a.score);

  // De-dupe by URL, keep the highest-ranked few.
  const seen = new Set();
  const toFetch = [];
  for (const c of candidates) {
    if (seen.has(c.resolved)) continue;
    seen.add(c.resolved);
    toFetch.push(c.resolved);
    if (toFetch.length >= maxLinksToFollow) break;
  }

  let hiringPage = null;
  for (const url of toFetch) {
    const page = await fetchPage(url);
    if (!page.ok) {
      skipped.push({ url, reason: page.reason });
      continue;
    }
    pagesUsed.push(page.url);
    // First one that actually loaded and scored well is our best guess.
    if (!hiringPage) hiringPage = page;
  }

  return { homepage, hiringPage, pagesUsed, skipped };
}