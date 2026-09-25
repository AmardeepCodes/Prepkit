

// import { callLLM } from "./llmClient.js";

import { callLLM, wrapUntrusted, UNTRUSTED_CONTENT_NOTICE } from "./llmClient.js";

// Separate instructions per category — a technical requirement and a
// behavioural one shouldn't be asked about with the same prompt. This is
// what the brief means by "deliberate steps that respond to what's found",
// not one call generating everything.
const CATEGORY_PROMPTS = {
  technical: `You write technical interview questions that test hands-on
knowledge of the given requirement (a language, framework, system, or tool).
Questions should require the candidate to reason or design, not just recall
a fact. Include a brief answer_outline (2-3 sentences, what a strong answer
would cover — not the full answer).`,

  behavioural: `You write behavioural interview questions (STAR-format style)
that probe how the candidate has handled real situations related to the
given requirement (e.g. mentoring, communication, conflict). Include a brief
answer_outline describing what a strong STAR answer would cover.`,

  "system-design": `You write a system-design interview question that
exercises the given requirement at scale. Include a brief answer_outline of
the key design points a strong answer would touch (trade-offs, not a full
design doc).`,

  "company-fit": `You write a company-fit / motivation interview question
based on the given company brief and role. Include a brief answer_outline of
what a genuine, well-researched answer would reference.`,
};

const JSON_SHAPE_INSTRUCTION = `
Return ONLY a JSON array, nothing else, matching this shape:
[{ "prompt": "...", "answer_outline": "...", "difficulty": 1 }]
difficulty is an integer 1-3 (1 = easier, 3 = harder). Generate 1-2 questions.`;

// Generates questions for ONE requirement in ONE category — called
// separately per requirement/category pair by the pipeline, not in bulk.

export async function generateQuestionsForRequirement(requirement, category) {
  const systemPrompt =
    UNTRUSTED_CONTENT_NOTICE +
    "\n\n" +
    (CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.technical) +
    JSON_SHAPE_INSTRUCTION;

  const userPrompt = wrapUntrusted(
    "REQUIREMENT",
    `${requirement.text} (priority: ${requirement.priority})`
  );

  const raw = await callLLM(systemPrompt, userPrompt);

  if (!Array.isArray(raw)) return [];

  return raw
    .filter((q) => q && typeof q.prompt === "string" && q.prompt.trim())
    .map((q) => ({
      requirement_ids: [requirement.id],
      category,
      prompt: q.prompt.trim(),
      answer_outline: typeof q.answer_outline === "string" ? q.answer_outline.trim() : "",
      difficulty: [1, 2, 3].includes(q.difficulty) ? q.difficulty : 2,
    }));
}

// Generates the full question bank: for each requirement, pick the category
// that fits its `kind`, and (for must-have technical requirements) also
// add a system-design question if it's a scale-related requirement.

const DELAY_BETWEEN_CALLS_MS = 4000; // stay under free-tier RPM limits

export async function generateQuestionBank(requirements) {
  const allQuestions = [];
  let idCounter = 1;

        for (let i = 0; i < requirements.length; i++) {
            const req = requirements[i];
            const category = req.kind === "behavioural" ? "behavioural" : "technical";
            const generated = await generateQuestionsForRequirement(req, category);
            for (const q of generated) {
            allQuestions.push({ id: `q${idCounter++}`, ...q });
            }

            // Space out sequential LLM calls so we don't hit the free-tier
            // requests-per-minute limit in the first place — cheaper than relying
            // on retry/backoff every time.
            if (i < requirements.length - 1) {
            await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
            }
        }

        return allQuestions;
}