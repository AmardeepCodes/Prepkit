import * as cheerio from "cheerio";
import { assertSafeUrl } from "../../utils/urlValidator.js";
import { withRetry } from "../../utils/retry.js";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB cap
const TIMEOUT_MS = 8000;
const ALLOWED_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

// Fetches one page, strips it down to readable text + the links on it.
// Returns { ok:true, text, links, title } or { ok:false, reason } - never
// throws for an unreachable page, since one bad source shouldn't kill the
// whole research run (per the brief's edge-case handling).
export async function fetchPage(rawUrl, { headers = {} } = {}) {
  try {
    const url = assertSafeUrl(rawUrl);

    const res = await withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const response = await fetch(url.toString(), {
          signal: controller.signal,
          redirect: "follow",
          headers: {
            "User-Agent": "PrepKitAI-Bot/1.0 (interview prep research)",
                      ...headers,
          },
        });
        if (response.status === 429 || response.status >= 500) {
          throw new Error(`Retryable status ${response.status}`);
        }
        return response;
      } finally {
        clearTimeout(timeout);
      }
    }, { retries: 2, baseDelayMs: 600 });

    if (!res.ok) {
      return { ok: false, reason: `HTTP ${res.status}` };
    }

    const contentType = res.headers.get("content-type") || "";
    if (!ALLOWED_CONTENT_TYPES.some((t) => contentType.includes(t))) {
      return { ok: false, reason: `Unexpected content-type: ${contentType}` };
    }

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength > MAX_BYTES) {
      return { ok: false, reason: "Page too large" };
    }

    const html = await res.text();
    if (html.length > MAX_BYTES) {
      return { ok: false, reason: "Page too large" };
    }

    const $ = cheerio.load(html);

    
    const links = [];
    $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        const label = $(el).text().trim();
        if (href) links.push({ href, label });
    });
    
    const title = $("title").first().text().trim();


    
    $("script, style, noscript, svg, nav, footer").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 20000);
    
    return { ok: true, url: url.toString(), title, text, links };

  } catch (err) {
    return { ok: false, reason: err.message || "Fetch failed" };
  }
}