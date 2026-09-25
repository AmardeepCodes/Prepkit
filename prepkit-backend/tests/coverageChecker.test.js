import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCoverage, getMustHaveGaps } from "../src/services/coverage/coverageChecker.js";

const requirements = [
  { id: "r1", text: "Rails", kind: "technical", priority: "must" },
  { id: "r2", text: "PostgreSQL", kind: "technical", priority: "must" },
  { id: "r3", text: "Mentoring", kind: "behavioural", priority: "nice" },
];

test("finds no gaps when every requirement has a linked question", () => {
  const questions = [
    { id: "q1", requirement_ids: ["r1"] },
    { id: "q2", requirement_ids: ["r2"] },
    { id: "q3", requirement_ids: ["r3"] },
  ];
  const result = checkCoverage(requirements, questions);
  assert.deepEqual(result.uncovered_requirement_ids, []);
});

test("detects an uncovered requirement", () => {
  const questions = [{ id: "q1", requirement_ids: ["r1"] }];
  const result = checkCoverage(requirements, questions);
  assert.deepEqual(result.uncovered_requirement_ids.sort(), ["r2", "r3"]);
});

test("a question can cover multiple requirements at once", () => {
  const questions = [{ id: "q1", requirement_ids: ["r1", "r2", "r3"] }];
  const result = checkCoverage(requirements, questions);
  assert.deepEqual(result.uncovered_requirement_ids, []);
});

test("getMustHaveGaps ignores an uncovered nice-to-have", () => {
  const questions = [
    { id: "q1", requirement_ids: ["r1"] },
    { id: "q2", requirement_ids: ["r2"] },
  ];
  const gaps = getMustHaveGaps(requirements, questions);
  assert.deepEqual(gaps, []);
});

test("getMustHaveGaps reports an uncovered must-have", () => {
  const questions = [{ id: "q1", requirement_ids: ["r1"] }];
  const gaps = getMustHaveGaps(requirements, questions);
  assert.deepEqual(gaps, ["r2"]);
});

test("empty question bank means every requirement is uncovered", () => {
  const result = checkCoverage(requirements, []);
  assert.equal(result.uncovered_requirement_ids.length, 3);
});