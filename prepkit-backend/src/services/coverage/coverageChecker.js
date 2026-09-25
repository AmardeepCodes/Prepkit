// Pure, deterministic comparison — no LLM involved. Given the extracted
// requirements and the generated question bank, finds which requirements
// have zero questions referencing their id in `requirement_ids`.
//
// This is intentionally dumb: it's a set-membership check, not a judgment
// call. The brief is explicit that this decision belongs to code, not the model.
export function checkCoverage(requirements, questions) {
  const coveredIds = new Set(questions.flatMap((q) => q.requirement_ids || []));

  const uncovered = requirements.filter((r) => !coveredIds.has(r.id)).map((r) => r.id);

  return { uncovered_requirement_ids: uncovered };
}

// Same check, but only for must-have requirements — this is what the
// second-pass gap-filling loop cares about. A nice-to-have with no question
// is an acceptable, honestly-reported gap, not something worth spending
// another LLM call to fix.
export function getMustHaveGaps(requirements, questions) {
  const { uncovered_requirement_ids } = checkCoverage(requirements, questions);
  const mustHaveIds = new Set(
    requirements.filter((r) => r.priority === "must").map((r) => r.id)
  );
  return uncovered_requirement_ids.filter((id) => mustHaveIds.has(id));
}