import Kit from "../models/Kit.js";
import AppError from "../utils/AppError.js";
import { runKitPipeline } from "../services/pipeline/kitPipeline.js";
import { validateKitStructure } from "../services/validation/kitSchemaValidator.js";

import {
  regenerateBrief,
  regenerateQuestionCategory,
  regenerateSchedule,
} from "../services/pipeline/regenerateSection.js";

// POST /api/kits — creates an empty draft kit. No AI call here yet;
// that's a separate step (the generation pipeline) added later.

// export async function createKit(req, res) {
//   const { jd, companyUrl, days } = req.body;

//   const kit = await Kit.create({
//     userId: req.userId,
//     source: {
//       company_url: companyUrl,
//       jd_chars: jd.length,
//       jd_text: jd,
//     },
//     schedule: { days_available: days },
//     status: "draft",
//   });

//   res.status(201).json({ kit });
// }


export async function createKit(req, res) {
  const { jd, companyUrl, days } = req.body;

  // Duplicate submission (brief Section 10): same user, same JD text and
  // company URL already has a kit - return that instead of creating a
  // near-identical duplicate. Only short-circuits on an exact text match;
  // a reworded JD is treated as genuinely new.
  const existing = await Kit.findOne({
    userId: req.userId,
    "source.company_url": companyUrl,
    "source.jd_text": jd,
  });

  if (existing) {
    return res.status(200).json({ kit: existing, duplicate: true });
  }

  const kit = await Kit.create({
    userId: req.userId,
    source: {
      company_url: companyUrl,
      jd_chars: jd.length,
      jd_text: jd,
    },
    schedule: { days_available: days },
    status: "draft",
  });

  res.status(201).json({ kit });
}

// GET /api/kits — only this user's kits, newest first.
export async function listKits(req, res) {
  const kits = await Kit.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ kits });
}

// GET /api/kits/:id
export async function getKit(req, res) {
  const kit = await Kit.findOne({ _id: req.params.id, userId: req.userId });
  if (!kit) {
    throw new AppError(404, "KIT_NOT_FOUND", "Kit not found.");
  }
  res.json({ kit });
}

// PATCH /api/kits/:id — partial update (used by the builder: edits,
// reordering, pinning, etc.). Only fields present in the body are touched.
export async function updateKit(req, res) {
  const kit = await Kit.findOne({ _id: req.params.id, userId: req.userId });
  if (!kit) {
    throw new AppError(404, "KIT_NOT_FOUND", "Kit not found.");
  }

  const allowedFields = [
    "company_brief",
    "role",
    "questions",
    "flashcards",
    "schedule",
    "coverage",
    "status",
  ];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      kit[field] = req.body[field];
    }
  }

  await kit.save();
  res.json({ kit });
}

// DELETE /api/kits/:id
export async function deleteKit(req, res) {
  const kit = await Kit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!kit) {
    throw new AppError(404, "KIT_NOT_FOUND", "Kit not found.");
  }
  res.status(204).send();
}


// POST /api/kits/:id/generate — runs the full pipeline for an existing
// draft kit and saves the result. This is a long-running request (multiple
// sequential LLM calls) — fine for now; a job queue would be the next
// improvement for production.


export async function generateKit(req, res) {
  const kit = await Kit.findOne({ _id: req.params.id, userId: req.userId });
  if (!kit) {
    throw new AppError(404, "KIT_NOT_FOUND", "Kit not found.");
  }

  // Guard against the same kit being generated twice concurrently (e.g. a
  // double-click, or the frontend firing generate() twice) - the second
  // call just no-ops instead of racing the first one's pipeline run.
  if (kit.status === "generating") {
    return res.status(409).json({
      error: { code: "ALREADY_GENERATING", message: "This kit is already being generated." },
    });
  }

  kit.status = "generating";
  await kit.save();

  try {
    const result = await runKitPipeline({
      jd: kit.source.jd_text,
      companyUrl: kit.source.company_url,
      days: kit.schedule.days_available,
    });

    // Validate against Appendix A's structure before saving - an invalid
    // or incomplete kit (e.g. the model returned something malformed
    // somewhere in the pipeline) should fail loudly here, not silently
    // save broken data the frontend then can't render.
    const { valid, errors } = validateKitStructure(result);
    if (!valid) {
      kit.status = "failed";
      await kit.save();
      throw new AppError(
        502,
        "INVALID_KIT_STRUCTURE",
        `Generated kit failed structure validation: ${errors.join("; ")}`
      );
    }

    kit.source = result.source;
    kit.company_brief = result.company_brief;
    kit.role = result.role;
    kit.questions = result.questions;
    kit.flashcards = result.flashcards;
    kit.schedule = result.schedule;
    kit.coverage = result.coverage;
    kit.status = "ready";
    await kit.save();

    res.json({ kit });
  } catch (err) {
    kit.status = "failed";
    await kit.save();
    throw err;
  }
}

// POST /api/kits/:id/regenerate  { section: "brief" | "questions" | "schedule", category? }
export async function regenerateKitSection(req, res) {
  const kit = await Kit.findOne({ _id: req.params.id, userId: req.userId });
  if (!kit) {
    throw new AppError(404, "KIT_NOT_FOUND", "Kit not found.");
  }

  const { section, category } = req.body;

  if (section === "brief") {
    kit.company_brief = await regenerateBrief(kit);
  } else if (section === "questions") {
    if (!category) {
      throw new AppError(400, "VALIDATION_ERROR", "category is required when section is \"questions\".");
    }
    kit.questions = await regenerateQuestionCategory(kit, category);
  } else if (section === "schedule") {
    kit.schedule = regenerateSchedule(kit);
  } else {
    throw new AppError(400, "VALIDATION_ERROR", 'section must be "brief", "questions" or "schedule".');
  }

  await kit.save();
  res.json({ kit });
}



// POST /api/kits/bulk  { entries: [{ jd, companyUrl, days }] }
// Creates one draft kit per entry, then fires generation for each
// (not awaited here — same fire-and-forget pattern as the single-kit
// flow) so the request returns quickly with the created kit ids.
export async function createBulkKits(req, res) {
  const { entries } = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "entries must be a non-empty array.");
  }

  const created = [];
  for (const entry of entries) {
    const { jd, companyUrl, days } = entry;
    if (!jd || !companyUrl || !days) {
      created.push({ ok: false, error: "Missing jd, companyUrl, or days", entry });
      continue;
    }

    const kit = await Kit.create({
      userId: req.userId,
      source: { company_url: companyUrl, jd_chars: jd.length, jd_text: jd },
      schedule: { days_available: Number(days) },
      status: "draft",
    });

    created.push({ ok: true, kitId: kit._id });

    // Fire-and-forget generation, same as the single-kit create flow.
    generateInBackground(kit._id, req.userId);
  }

  res.status(201).json({ created });
}

async function generateInBackground(kitId, userId) {
  const kit = await Kit.findOne({ _id: kitId, userId });
  if (!kit) return;

  kit.status = "generating";
  await kit.save();

  try {
    const result = await runKitPipeline({
      jd: kit.source.jd_text,
      companyUrl: kit.source.company_url,
      days: kit.schedule.days_available,
    });

    const { valid } = validateKitStructure(result);
    if (!valid) {
      kit.status = "failed";
      await kit.save();
      return;
    }

    kit.source = result.source;
    kit.company_brief = result.company_brief;
    kit.role = result.role;
    kit.questions = result.questions;
    kit.flashcards = result.flashcards;
    kit.schedule = result.schedule;
    kit.coverage = result.coverage;
    kit.status = "ready";
    await kit.save();
  } catch (err) {
    kit.status = "failed";
    await kit.save();
  }
}