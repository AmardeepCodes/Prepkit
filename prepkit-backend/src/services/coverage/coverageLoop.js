


import { generateQuestionsForRequirement } from "../generation/questionGenerator.js";
import { checkCoverage, getMustHaveGaps } from "./coverageChecker.js";

const MAX_PASSES = 2; // brief: "decide for yourself how many passes are sensible"
const DELAY_BETWEEN_CALLS_MS = 4000;

// Runs the generate -> check -> fill-gaps -> check-again loop. Stops when
// either no must-have gaps remain, or MAX_PASSES is reached (whichever
// comes first) — capped so a stubbornly-unanswerable requirement (e.g. the
// model keeps failing to link its own question back to the right id)
// can't loop forever and burn the whole time/quota budget.
export async function runCoverageLoop(requirements, initialQuestions) {
  let questions = [...initialQuestions];
  let idCounter = questions.length + 1;
  let passes = 1; // the initial generation already counts as pass 1

  while (passes < MAX_PASSES) {
    const gaps = getMustHaveGaps(requirements, questions);
    if (gaps.length === 0) break;

    for (const reqId of gaps) {
      const requirement = requirements.find((r) => r.id === reqId);
      if (!requirement) continue;

      const category = requirement.kind === "behavioural" ? "behavioural" : "technical";
      const generated = await generateQuestionsForRequirement(requirement, category);

      for (const q of generated) {
        questions.push({ id: `q${idCounter++}`, ...q });
      }

      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
    }

    passes += 1;
  }

  const finalCoverage = checkCoverage(requirements, questions);

  return {
    questions,
    coverage: { uncovered_requirement_ids: finalCoverage.uncovered_requirement_ids, passes },
  };
}