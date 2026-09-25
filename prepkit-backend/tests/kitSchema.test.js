import { test } from "node:test";
import assert from "node:assert/strict";
import { validateKitStructure } from "../src/services/validation/kitSchemaValidator.js";

function validKit() {
  return {
    source: { company_url: "https://example.com" },
    company_brief: { summary: "A company." },
    role: {
      requirements: [{ id: "r1", text: "Rails", kind: "technical", priority: "must" }],
    },
    questions: [
      { id: "q1", requirement_ids: ["r1"], category: "technical", difficulty: 2, prompt: "x" },
    ],
    schedule: {
      days: [{ day: 1, minutes: 15, question_ids: ["q1"] }],
    },
  };
}

test("a well-formed kit passes validation", () => {
  const result = validateKitStructure(validKit());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("rejects a requirement with an invalid priority", () => {
  const kit = validKit();
  kit.role.requirements[0].priority = "sometimes";
  const result = validateKitStructure(kit);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("priority")));
});

test("rejects a question referencing a requirement id that doesn't exist", () => {
  const kit = validKit();
  kit.questions[0].requirement_ids = ["r99"];
  const result = validateKitStructure(kit);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("unknown requirement id")));
});

test("rejects a schedule day referencing a question id that doesn't exist", () => {
  const kit = validKit();
  kit.schedule.days[0].question_ids = ["q99"];
  const result = validateKitStructure(kit);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("unknown question id")));
});

test("rejects a difficulty outside 1-3", () => {
  const kit = validKit();
  kit.questions[0].difficulty = 5;
  const result = validateKitStructure(kit);
  assert.equal(result.valid, false);
});

test("rejects a non-integer minutes value", () => {
  const kit = validKit();
  kit.schedule.days[0].minutes = "fifteen";
  const result = validateKitStructure(kit);
  assert.equal(result.valid, false);
});

test("rejects null/undefined kit without crashing", () => {
  const result = validateKitStructure(null);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});