




// // Retries an async function with exponential backoff. Used anywhere we
// // call something that can rate-limit or transiently fail (page fetches,
// // later: the LLM provider).
// export async function withRetry(fn, { retries = 3, baseDelayMs = 500 } = {}) {
//   let lastErr;
//   for (let attempt = 0; attempt <= retries; attempt++) {
//     try {
//       return await fn(attempt);
//     } catch (err) {
//       lastErr = err;
//       if (attempt === retries) break;
//       const delay = baseDelayMs * 2 ** attempt;
//       await new Promise((r) => setTimeout(r, delay));
//     }
//   }
//   throw lastErr;
// }

// Replaces the above with a more robust version that respects provider-suggested retry delays (Gemini sends these on 429s).

//this is below src/utils/retry.js — poori file replace karo wala new code


//src/utils/retry.js — poori file replace karo


// Retries an async function with exponential backoff. If the error carries
// the provider's own suggested wait time (Gemini sends this on 429s), we
// honor that instead of guessing — retrying too soon just wastes the
// attempt and burns through our retry budget for nothing.
export async function withRetry(fn, { retries = 5, baseDelayMs = 1000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;

      const suggestedDelay = extractRetryDelayMs(err);
      const delay = suggestedDelay ?? baseDelayMs * 2 ** attempt;

      console.warn(
        `[retry] attempt ${attempt + 1}/${retries} failed (${err.message?.slice(0, 80)}...) - waiting ${Math.round(delay / 1000)}s`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// Gemini's 429 errors include errorDetails with a RetryInfo.retryDelay
// field like "53s". Parse it out if present.
function extractRetryDelayMs(err) {
  const details = err?.errorDetails;
  if (!Array.isArray(details)) return null;

  const retryInfo = details.find((d) => d["@type"]?.includes("RetryInfo"));
  const raw = retryInfo?.retryDelay; // e.g. "53s"
  if (!raw) return null;

  const seconds = parseFloat(raw);
  if (Number.isNaN(seconds)) return null;

  return Math.ceil(seconds * 1000) + 500; // small buffer on top
}