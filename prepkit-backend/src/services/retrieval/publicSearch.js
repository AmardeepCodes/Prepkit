import { fetchPage } from "./pageFetcher.js";
import { assertSafeUrl } from "../../utils/urlValidator.js";

const SEARCH_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Uses DuckDuckGo's "lite" HTML endpoint (no API key needed - fits the
// "genuine free tier" requirement) to find public discussion of a
// company's interview process, then fetches the top results' text.
export async function searchInterviewDiscussion(companyName, { maxResults = 3 } = {}) {
  const query = encodeURIComponent(`${companyName} interview process questions`);
  const searchUrl = `https://lite.duckduckgo.com/lite/?q=${query}`;

  const searchPage = await fetchPage(searchUrl, {
    headers: { "User-Agent": SEARCH_USER_AGENT },
  });
  if (!searchPage.ok) {
    return { ok: false, reason: searchPage.reason, results: [] };
  }

  // Result links look like: //duckduckgo.com/l/?uddg=<encoded target>&rut=...
  // Protocol-relative, so prefix https: before parsing.
  const resultLinks = [];
  for (const link of searchPage.links) {
    const match = link.href.match(/uddg=([^&]+)/);
    if (!match) continue;
    try {
      const target = decodeURIComponent(match[1]);
      assertSafeUrl(target);
      resultLinks.push(target);
    } catch {
      continue; // skip anything that doesn't resolve to a safe public URL
    }
    if (resultLinks.length >= maxResults) break;
  }

  const results = [];
  for (const url of resultLinks) {
    const page = await fetchPage(url);
    if (page.ok) {
      results.push({ url: page.url, title: page.title, excerpt: page.text.slice(0, 2000) });
    }
    // If a source can't be reached, just skip it - don't fail the whole run.
  }

  return { ok: true, results };
}