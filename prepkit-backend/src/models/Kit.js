import mongoose from "mongoose";

// Mirrors Appendix A of the brief. Everything here is created empty/blank
// at first — the AI generation step (later) will fill it in.
const requirementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    kind: { type: String, enum: ["technical", "behavioural", "domain"], required: true },
    priority: { type: String, enum: ["must", "nice"], required: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    requirement_ids: [{ type: String }],
    category: {
      type: String,
      enum: ["technical", "behavioural", "system-design", "company-fit"],
      required: true,
    },
    prompt: { type: String, default: "" },
    answer_outline: { type: String, default: "" },
    difficulty: { type: Number, min: 1, max: 3, default: 1 },
    // Tracks the builder's generated/edited/pinned state (Section 6 of the
    // brief). A regenerate call must never touch a question where either
    // of these is true.
    edited: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
  },
  { _id: false }
);

const flashcardSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    front: { type: String, default: "" },
    back: { type: String, default: "" },
    requirement_ids: [{ type: String }],
    // Set by Practice Mode after each card - persisted so the Weak Spots
    // Report (creative feature) can analyze it later, not just within one
    // session. null = never practiced yet.
    confidence: { type: String, enum: ["low", "okay", "confident", null], default: null },
  },
  { _id: false }
);

const scheduleDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    focus: { type: String, default: "" },
    question_ids: [{ type: String }],
    minutes: { type: Number, default: 0 },
  },
  { _id: false }
);

const kitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    source: {
      company: { type: String, default: "" },
      company_url: { type: String, default: "" },
      role: { type: String, default: "" },
      location: { type: String, default: "" },
      jd_chars: { type: Number, default: 0 },
      jd_text: { type: String, default: "" }, // pasted JD, kept for regeneration later
      researched_at: { type: Date, default: null },
      pages_used: [{ type: String }],
    },

   company_brief: {
      summary: { type: String, default: "" },
      what_they_do: { type: String, default: "" },
      sources: [{ type: String }],
      edited: { type: Boolean, default: false },
    },

    role: {
      title: { type: String, default: "" },
      seniority: { type: String, default: "" },
      responsibilities: [{ type: String }],
      requirements: [requirementSchema],
    },

    questions: [questionSchema],
    flashcards: [flashcardSchema],

    schedule: {
      days_available: { type: Number, default: 0 },
      days: [scheduleDaySchema],
    },

    coverage: {
      uncovered_requirement_ids: [{ type: String }],
      passes: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["draft", "generating", "ready", "failed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Kit", kitSchema);