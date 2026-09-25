

import { callLLM } from "./llmClient.js";

const SYSTEM_PROMPT = `You turn interview questions into short study flashcards.
Rules:
- "front" is a short, specific recall question (not the full interview question — a
  quick-fire version testing one fact or concept from it).
- "back" is a concise answer (1-3 sentences) — enough to jog memory, not a full essay.
- Generate exactly one flashcard per question given.

Return ONLY a JSON array matching this shape, nothing else:
[{ "front": "...", "back": "..." }]`;

// Turns the already-generated question bank into flashcards — deliberately
// a separate LLM call from question generation, since "write an interview
// question" and "write a quick recall flashcard" are different tasks with
// different constraints (length, framing).
export async function generateFlashcards(questions) {
  if (questions.length === 0) return [];

  const userPrompt = questions
    .map((q, i) => `${i + 1}. [${q.category}] ${q.prompt}\nAnswer outline: ${q.answer_outline}`)
    .join("\n\n");

  const raw = await callLLM(SYSTEM_PROMPT, userPrompt);

  if (!Array.isArray(raw)) return [];

  return raw
    .filter((c) => c && typeof c.front === "string" && c.front.trim())
    .map((c, i) => ({
      id: `f${i + 1}`,
      front: c.front.trim(),
      back: typeof c.back === "string" ? c.back.trim() : "",
      // Carry over the requirement links from the matching question, so
      // flashcards stay traceable back to what they're testing.
      requirement_ids: questions[i]?.requirement_ids || [],
    }));
}