

export function validateKitStructure(kit) {
  const errors = [];

  function require(cond, message) {
    if (!cond) errors.push(message);
  }

  require(kit && typeof kit === "object", "kit must be an object");
  if (!kit) return { valid: false, errors };

  require(kit.source && typeof kit.source.company_url === "string", "source.company_url missing");
  require(kit.company_brief && typeof kit.company_brief.summary === "string", "company_brief.summary missing");

  require(kit.role && Array.isArray(kit.role.requirements), "role.requirements must be an array");
  const requirementIds = new Set();
  (kit.role?.requirements || []).forEach((r, i) => {
    require(typeof r.id === "string" && r.id, `requirement[${i}] missing id`);
    require(["must", "nice"].includes(r.priority), `requirement[${i}] priority must be "must" or "nice"`);
    require(["technical", "behavioural", "domain"].includes(r.kind), `requirement[${i}] invalid kind`);
    requirementIds.add(r.id);
  });

  require(Array.isArray(kit.questions), "questions must be an array");
  const questionIds = new Set();
  (kit.questions || []).forEach((q, i) => {
    require(typeof q.id === "string" && q.id, `question[${i}] missing id`);
    require(Array.isArray(q.requirement_ids), `question[${i}].requirement_ids must be an array`);
    (q.requirement_ids || []).forEach((rid) => {
      require(requirementIds.has(rid), `question[${i}] references unknown requirement id "${rid}"`);
    });
    require(
      ["technical", "behavioural", "system-design", "company-fit"].includes(q.category),
      `question[${i}] invalid category`
    );
    require(Number.isInteger(q.difficulty) && q.difficulty >= 1 && q.difficulty <= 3, `question[${i}] difficulty must be an integer 1-3`);
    questionIds.add(q.id);
  });

  require(kit.schedule && Array.isArray(kit.schedule.days), "schedule.days must be an array");
  (kit.schedule?.days || []).forEach((d, i) => {
    require(Number.isInteger(d.minutes), `schedule.days[${i}].minutes must be an integer`);
    (d.question_ids || []).forEach((qid) => {
      require(questionIds.has(qid), `schedule.days[${i}] references unknown question id "${qid}"`);
    });
  });

  return { valid: errors.length === 0, errors };
}