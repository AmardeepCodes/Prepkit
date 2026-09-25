import AppError from "./AppError.js";

const PRIVATE_IP_PATTERNS = [
  /^127\./, /^10\./, /^192\.168\./, /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
];
const BLOCKED_HOSTS = ["localhost", "0.0.0.0", "::1"];

// Throws if the URL isn't a plain public http(s) address. Called before
// every fetch to a user-supplied or crawled URL - prevents the server being
// used to probe internal/private network addresses.
export function assertSafeUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new AppError(400, "INVALID_URL", `Not a valid URL: ${rawUrl}`);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new AppError(400, "INVALID_URL", "Only http/https URLs are allowed.");
  }

  const host = url.hostname.toLowerCase();

  if (BLOCKED_HOSTS.includes(host)) {
    throw new AppError(400, "BLOCKED_URL", "Local/loopback addresses aren't allowed.");
  }

  // Only enforce private-IP blocking in production. Local dev/testing
  // against a localhost fixture server (as the batch command's brief
  // describes) needs this off.
  if (process.env.NODE_ENV === "production") {
    if (PRIVATE_IP_PATTERNS.some((p) => p.test(host))) {
      throw new AppError(400, "BLOCKED_URL", "Private network addresses aren't allowed.");
    }
  }

  return url;
}