

// import { callLLM } from "./llmClient.js";
import { callLLM, wrapUntrusted, UNTRUSTED_CONTENT_NOTICE } from "./llmClient.js";

const SYSTEM_PROMPT = `${UNTRUSTED_CONTENT_NOTICE}

You write a short, honest company brief for someone
preparing for an interview, based on real text scraped from the company's
own website.
Rules:
- Only state what the provided text actually supports. Never invent facts,
  products, or culture details that aren't in the source text.
- If the provided text is thin or empty, say so honestly in the summary
  instead of filling in generic-sounding claims.
- "summary" is 2-3 sentences: what the company does + anything notable
  about how they hire, if the hiring page text mentions it.
- "what_they_do" is 1-2 sentences, more product/business-focused.

Return ONLY a JSON object matching this shape, nothing else:
{ "summary": "...", "what_they_do": "..." }`;

// Summarizes whatever the crawler actually found. If nothing useful was
// found, this still runs but the prompt explicitly tells the model to be
// honest about that rather than invent a generic-sounding brief.

export async function generateCompanyBrief({ homepageText, hiringPageText, discussionText, companyName }) {


 const sourcesText = [
  homepageText ? wrapUntrusted("HOMEPAGE TEXT", homepageText.slice(0, 4000)) : "Homepage: not reachable.",
  hiringPageText ? wrapUntrusted("HIRING PAGE TEXT", hiringPageText.slice(0, 4000)) : "Hiring page: not found.",
  discussionText ? wrapUntrusted("PUBLIC DISCUSSION EXCERPT", discussionText.slice(0, 2000)) : "",
].filter(Boolean).join("\n\n");


  const userPrompt = `Company: ${companyName || "Unknown"}\n\n${sourcesText}`;

  const result = await callLLM(SYSTEM_PROMPT, userPrompt);

  return {
    summary: typeof result?.summary === "string" ? result.summary.trim() : "",
    what_they_do: typeof result?.what_they_do === "string" ? result.what_they_do.trim() : "",
  };
}