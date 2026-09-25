


// import { callLLM } from "./llmClient.js";
import { callLLM, wrapUntrusted, UNTRUSTED_CONTENT_NOTICE } from "./llmClient.js";

const SYSTEM_PROMPT = `${UNTRUSTED_CONTENT_NOTICE}

You extract structured role information from a job description.
Rules:
- Only use what the text actually says. Never invent a requirement, responsibility, or detail that isn't there.
- title: the job title as stated (or your best short label if not explicitly stated).
- seniority: one of "junior", "mid", "senior", "staff", "lead", or "" if unclear.
- responsibilities: short bullet-style strings of what the role actually does, only if the text describes them.
- requirements: mark priority "must" only for "required"/"must have"/"X+ years required" language, "nice" for "bonus"/"preferred"/"a plus". kind is "technical", "behavioural", or "domain". Give each a short id: r1, r2, r3...
- If the job description is too thin to extract meaningful detail, return fewer/empty fields rather than inventing content. An empty requirements array is a valid, honest answer.

Return ONLY a JSON object matching this shape, nothing else:
{ "title": "...", "seniority": "...", "responsibilities": ["..."], "requirements": [{ "id": "r1", "text": "...", "kind": "technical", "priority": "must" }] }`;

export async function extractRoleInfo(jobDescriptionText) {
  const trimmed = jobDescriptionText.trim();

  if (trimmed.length < 20) {
    // Edge case: two-line stub JD. Be honest, don't call the LLM on nothing.
    return { title: "", seniority: "", responsibilities: [], requirements: [] };
  }

  // const result = await callLLM(SYSTEM_PROMPT, `Job description:\n\n${trimmed}`);
  const result = await callLLM(SYSTEM_PROMPT, wrapUntrusted("JOB DESCRIPTION", trimmed));

  const requirements = Array.isArray(result?.requirements)
    ? result.requirements
        .filter((r) => r && typeof r.text === "string" && r.text.trim())
        .map((r, i) => ({
          id: r.id || `r${i + 1}`,
          text: r.text.trim(),
          kind: ["technical", "behavioural", "domain"].includes(r.kind) ? r.kind : "technical",
          priority: r.priority === "nice" ? "nice" : "must",
        }))
    : [];

  return {
    title: typeof result?.title === "string" ? result.title.trim() : "",
    seniority: typeof result?.seniority === "string" ? result.seniority.trim() : "",
    responsibilities: Array.isArray(result?.responsibilities)
      ? result.responsibilities.filter((r) => typeof r === "string" && r.trim()).map((r) => r.trim())
      : [],
    requirements,
  };
}

// Kept so anything that only needs the requirements array still works
// (e.g. the earlier standalone test script).
export async function extractRequirements(jobDescriptionText) {
  const { requirements } = await extractRoleInfo(jobDescriptionText);
  return requirements;
}


























// import { callLLM } from "./llmClient.js";

// const SYSTEM_PROMPT = `You extract hiring requirements from a job description.
// Rules:
// - Only extract what the text actually says. Never invent a requirement that isn't there.
// - Mark priority "must" only if the text uses language like "required", "must have", "X+ years required". Mark "nice" for "bonus", "preferred", "a plus", "nice to have".
// - kind is "technical" (tools/languages/frameworks/systems), "behavioural" (soft skills, mentoring, communication), or "domain" (industry/business knowledge).
// - Give each requirement a short id: r1, r2, r3...
// - If the job description is too thin to extract meaningful requirements, return fewer items rather than inventing ones. An empty or near-empty list is a valid, honest answer.

// Return ONLY a JSON array matching this shape, nothing else:
// [{ "id": "r1", "text": "...", "kind": "technical", "priority": "must" }]`;

// // Deliberately its own LLM call, separate from question generation — the
// // brief requires requirement extraction and question generation to be
// // different steps with different instructions, not one prompt doing both.
// export async function extractRequirements(jobDescriptionText) {
//   const trimmed = jobDescriptionText.trim();

//   if (trimmed.length < 20) {
//     // Edge case from the brief: a two-line stub JD. Don't call the LLM on
//     // almost nothing — be honest that there's not enough to extract.
//     return [];
//   }

//   const requirements = await callLLM(
//     SYSTEM_PROMPT,
//     `Job description:\n\n${trimmed}`
//   );

//   if (!Array.isArray(requirements)) {
//     return [];
//   }

//   return requirements
//     .filter((r) => r && typeof r.text === "string" && r.text.trim())
//     .map((r, i) => ({
//       id: r.id || `r${i + 1}`,
//       text: r.text.trim(),
//       kind: ["technical", "behavioural", "domain"].includes(r.kind) ? r.kind : "technical",
//       priority: r.priority === "nice" ? "nice" : "must",
//     }));
// }