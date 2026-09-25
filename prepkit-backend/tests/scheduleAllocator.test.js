import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSchedule } from "../src/services/scheduler/scheduleAllocator.js";

const requirements = [
  { id: "r1", text: "Rails", kind: "technical", priority: "must" },
  { id: "r2", text: "Mentoring", kind: "behavioural", priority: "nice" },
];

const questions = [
  { id: "q1", requirement_ids: ["r1"], category: "technical", difficulty: 3 },
  { id: "q2", requirement_ids: ["r2"], category: "behavioural", difficulty: 1 },
  { id: "q3", requirement_ids: ["r1"], category: "technical", difficulty: 2 },
];

test("schedule spans exactly the number of days requested", () => {
  const schedule = buildSchedule(requirements, questions, 5);
  assert.equal(schedule.days.length, 5);
  assert.equal(schedule.days_available, 5);
});

test("every question is scheduled exactly once", () => {
  const schedule = buildSchedule(requirements, questions, 3);
  const allIds = schedule.days.flatMap((d) => d.question_ids);
  assert.equal(allIds.length, questions.length);
  assert.deepEqual([...allIds].sort(), ["q1", "q2", "q3"].sort());
});

test("must-have requirement's question is scheduled before a nice-to-have's", () => {
  // q1 (must, difficulty 3) should sort earlier than q2 (nice, difficulty 1)
  const schedule = buildSchedule(requirements, questions, 3);
  const dayOf = (qid) => schedule.days.find((d) => d.question_ids.includes(qid)).day;
  assert.ok(dayOf("q1") <= dayOf("q2"));
});

test("1-day edge case puts everything on day 1 without crashing", () => {
  const schedule = buildSchedule(requirements, questions, 1);
  assert.equal(schedule.days.length, 1);
  assert.equal(schedule.days[0].question_ids.length, 3);
});

test("60-day edge case doesn't crash, unused days are empty with 0 minutes", () => {
  const schedule = buildSchedule(requirements, questions, 60);
  assert.equal(schedule.days.length, 60);
  const emptyDays = schedule.days.filter((d) => d.question_ids.length === 0);
  assert.ok(emptyDays.length > 0);
  emptyDays.forEach((d) => assert.equal(d.minutes, 0));
});

test("zero questions still produces a valid schedule shape", () => {
  const schedule = buildSchedule(requirements, [], 5);
  assert.equal(schedule.days.length, 5);
  schedule.days.forEach((d) => assert.deepEqual(d.question_ids, []));
});

test("days_available is clamped between 1 and 60", () => {
  assert.equal(buildSchedule(requirements, questions, 0).days_available, 1);
  assert.equal(buildSchedule(requirements, questions, 999).days_available, 60);
});