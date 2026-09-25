"use client";

const CONFIDENCE_SCORE = { low: 1, okay: 2, confident: 3 };

// Groups flashcards by the category of the question they were derived
// from (via shared requirement_ids), and surfaces the lowest-confidence
// items first - the whole point of this report is "what should I redo".
export default function WeakSpotsReport({ kit }) {
  const { flashcards, questions, role, coverage } = kit;

  const categoryByRequirement = new Map();
  questions.forEach((q) => {
    q.requirement_ids.forEach((rid) => categoryByRequirement.set(rid, q.category));
  });

  function categoryFor(card) {
    const rid = card.requirement_ids[0];
    return categoryByRequirement.get(rid) || "uncategorized";
  }

  const byCategory = {};
  flashcards.forEach((card) => {
    const cat = categoryFor(card);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(card);
  });

  const categoryStats = Object.entries(byCategory).map(([category, cards]) => {
    const practiced = cards.filter((c) => c.confidence);
    const avg =
      practiced.length === 0
        ? null
        : practiced.reduce((sum, c) => sum + CONFIDENCE_SCORE[c.confidence], 0) / practiced.length;
    return { category, total: cards.length, practicedCount: practiced.length, avg };
  });

  const weakestCards = [...flashcards]
    .filter((c) => c.confidence)
    .sort((a, b) => CONFIDENCE_SCORE[a.confidence] - CONFIDENCE_SCORE[b.confidence])
    .slice(0, 5);

  const neverPracticed = flashcards.filter((c) => !c.confidence);
  const uncoveredRequirements = role.requirements.filter((r) =>
    coverage.uncovered_requirement_ids.includes(r.id)
  );

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">
          Confidence by category
        </h3>
        <div className="flex flex-col gap-space-sm">
          {categoryStats.map(({ category, total, practicedCount, avg }) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-md text-label-md text-on-surface capitalize">
                  {category.replace("-", " ")}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {practicedCount}/{total} practiced
                  {avg && ` · avg ${avg.toFixed(1)}/3`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    avg === null
                      ? "bg-surface-container-high"
                      : avg < 1.7
                      ? "bg-error"
                      : avg < 2.4
                      ? "bg-secondary"
                      : "bg-tertiary"
                  }`}
                  style={{ width: avg ? `${(avg / 3) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {weakestCards.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">
            Your weakest cards
          </h3>
          <div className="flex flex-col gap-space-sm">
            {weakestCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between gap-space-sm p-space-md rounded-xl bg-surface-container-low"
              >
                <span className="font-body-sm text-body-sm text-on-surface">{card.front}</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm shrink-0 ${
                    card.confidence === "low"
                      ? "bg-error-container text-on-error-container"
                      : "bg-secondary-fixed text-on-secondary-fixed-variant"
                  }`}
                >
                  {card.confidence}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {neverPracticed.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
            Not practiced yet
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {neverPracticed.length} card{neverPracticed.length === 1 ? "" : "s"} you haven&apos;t
            reviewed at all.
          </p>
        </div>
      )}

      {uncoveredRequirements.length > 0 && (
        <div className="bg-error-container/40 rounded-2xl p-space-lg">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
            Still uncovered requirements
          </h3>
          <div className="flex flex-col gap-space-xs">
            {uncoveredRequirements.map((r) => (
              <p key={r.id} className="font-body-sm text-body-sm text-on-surface">
                {r.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}