// Very small robots.txt parser — just checks if the given path is
// disallowed for "*" (all bots) under a Disallow rule. Good enough for
// our use case: we're not writing a full robots.txt spec parser, just
// respecting the common case.
export async function isAllowedByRobots(targetUrl) {
  try {
    const url = new URL(targetUrl);
    const robotsUrl = `${url.origin}/robots.txt`;

    const res = await fetch(robotsUrl, {
      headers: { "User-Agent": "PrepKitAI-Bot/1.0" },
    });
    if (!res.ok) return true; // no robots.txt = allowed by default

    const text = await res.text();
    const lines = text.split("\n").map((l) => l.trim());

    let appliesToUs = false;
    for (const line of lines) {
      if (/^user-agent:\s*\*/i.test(line)) {
        appliesToUs = true;
        continue;
      }
      if (/^user-agent:/i.test(line)) {
        appliesToUs = false;
        continue;
      }
      if (appliesToUs && /^disallow:/i.test(line)) {
        const disallowedPath = line.split(":")[1]?.trim();
        if (disallowedPath && url.pathname.startsWith(disallowedPath)) {
          return false;
        }
      }
    }
    return true;
  } catch {
    return true; // robots.txt unreachable — fail open, don't block research
  }
}