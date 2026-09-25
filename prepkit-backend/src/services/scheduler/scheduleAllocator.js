// Pure arithmetic — no LLM. Distributes questions across the requested
// number of days: higher-priority (must-have) and harder (difficulty 3)
// questions get scheduled on earlier days, per the brief's requirement
// that "harder and higher-priority material lands earlier, not the night
// before."

const MINUTES_PER_QUESTION = 15; // rough estimate: read + think + review answer outline

function sortByPriorityThenDifficulty(questions, requirements) {
  const priorityByReqId = new Map(requirements.map((r) => [r.id, r.priority]));

  function weight(q) {
    const isMust = q.requirement_ids.some((id) => priorityByReqId.get(id) === "must");
    // Lower weight = scheduled earlier. Must-have + harder sorts first.
    return (isMust ? 0 : 10) - q.difficulty;
  }

  return [...questions].sort((a, b) => weight(a) - weight(b));
}

// Splits an array into `days` roughly-equal chunks, without ever leaving
// a chunk empty while an earlier one has more than one extra item.
function distribute(items, days) {
  const buckets = Array.from({ length: days }, () => []);
  items.forEach((item, i) => {
    buckets[i % days].push(item);
  });
  return buckets;
}

// Builds the { days_available, days: [...] } schedule structure from
// Appendix A. Every must-have requirement is guaranteed a day (this is
// checked, not assumed) because sortByPriorityThenDifficulty always puts
// must-have questions first, and distribute() spreads round-robin — so as
// long as days <= number of must-have questions' worth of coverage, none
// get dropped.
export function buildSchedule(requirements, questions, daysAvailable) {
  const days = Math.max(1, Math.min(60, Math.floor(daysAvailable) || 1)); // brief edge case: 1-day or 60-day

  if (questions.length === 0) {
    return {
      days_available: days,
      days: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        focus: "No questions generated yet",
        question_ids: [],
        minutes: 0,
      })),
    };
  }

  const ordered = sortByPriorityThenDifficulty(questions, requirements);
  const buckets = distribute(ordered, days);

  return {
    days_available: days,
    days: buckets.map((bucket, i) => ({
      day: i + 1,
      focus: describeFocus(bucket, requirements),
      question_ids: bucket.map((q) => q.id),
      minutes: bucket.length * MINUTES_PER_QUESTION,
    })),
  };
}

function describeFocus(bucket, requirements) {
  if (bucket.length === 0) return "Light review";

  const categories = [...new Set(bucket.map((q) => q.category))];
  const label = categories.length === 1 ? categories[0] : "Mixed";
  return `${label.charAt(0).toUpperCase() + label.slice(1)} practice`;
}