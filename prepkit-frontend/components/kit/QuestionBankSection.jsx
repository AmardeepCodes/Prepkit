"use client";

import { useState } from "react";

const CATEGORIES = [
  { key: "technical", label: "Technical" },
  { key: "behavioural", label: "Behavioural" },
  { key: "system-design", label: "System Design" },
  { key: "company-fit", label: "Company Fit" },
];

const DIFFICULTY_DOTS = [1, 2, 3];

export default function QuestionBankSection({
  questions,
  requirements,
  onChange,
  onRegenerateCategory,
}) {
  const [regeneratingCategory, setRegeneratingCategory] = useState(null);

  function updateQuestion(id, patch) {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...patch, edited: true } : q)));
  }

  function deleteQuestion(id) {
    onChange(questions.filter((q) => q.id !== id));
  }

  function addQuestion(category) {
    const newQuestion = {
      id: `q_${Date.now()}`,
      requirement_ids: [],
      category,
      prompt: "New question — click to edit",
      answer_outline: "",
      difficulty: 1,
      edited: true,
      pinned: true,
    };
    onChange([...questions, newQuestion]);
  }

  function moveCategory(id, category) {
    onChange(questions.map((q) => (q.id === id ? { ...q, category, edited: true } : q)));
  }

  function move(id, category, direction) {
    const inCat = questions.filter((q) => q.category === category);
    const rest = questions.filter((q) => q.category !== category);
    const idx = inCat.findIndex((q) => q.id === id);
    const target = idx + direction;
    if (target < 0 || target >= inCat.length) return;
    const reordered = [...inCat];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    onChange([...rest, ...reordered]);
  }

  async function regenerateCategory(category) {
    setRegeneratingCategory(category);
    try {
      // Pinned/edited questions in this category are kept as-is; only the
      // caller (which owns the pipeline call) knows how to fill the rest in.
      await onRegenerateCategory(category);
    } finally {
      setRegeneratingCategory(null);
    }
  }

  return (
    <div className="flex flex-col gap-space-lg">
      {CATEGORIES.map((cat) => {
        const items = questions.filter((q) => q.category === cat.key);
        return (
          <div key={cat.key} className="bg-surface-container-lowest rounded-2xl shadow-sm">
            <div className="flex items-center justify-between p-space-lg border-b border-outline-variant/30">
              <div className="flex items-center gap-space-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {cat.label}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {items.length} Question{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <button
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors disabled:opacity-60"
                type="button"
                disabled={regeneratingCategory === cat.key}
                onClick={() => regenerateCategory(cat.key)}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    regeneratingCategory === cat.key ? "animate-spin" : ""
                  }`}
                >
                  auto_fix_normal
                </span>
                <span className="hidden sm:inline">Regenerate section</span>
              </button>
            </div>

            <div className="p-space-md flex flex-col gap-space-sm">
              {items.map((q, idx) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  requirements={requirements}
                  isFirst={idx === 0}
                  isLast={idx === items.length - 1}
                  onUpdate={(patch) => updateQuestion(q.id, patch)}
                  onDelete={() => deleteQuestion(q.id)}
                  onMoveUp={() => move(q.id, cat.key, -1)}
                  onMoveDown={() => move(q.id, cat.key, 1)}
                  onMoveCategory={(category) => moveCategory(q.id, category)}
                />
              ))}
              <button
                className="py-2 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-all"
                type="button"
                onClick={() => addQuestion(cat.key)}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Question</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuestionRow({
  question,
  requirements,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveCategory,
}) {
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [outline, setOutline] = useState(question.answer_outline);

  function save() {
    onUpdate({ prompt, answer_outline: outline });
    setEditing(false);
  }

  const linkedReqs = requirements.filter((r) =>
    question.requirement_ids.includes(r.id)
  );

  return (
    <div className="bg-surface-container-lowest hover:bg-surface-container-low/50 rounded-xl p-space-md shadow-sm transition-all duration-150 flex flex-col gap-space-xs group border border-outline-variant/20">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-start gap-space-xs flex-1">
          <div className="flex flex-col gap-0.5 mt-1">
            <button
              className="text-outline-variant hover:text-on-surface disabled:opacity-30 p-0.5"
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              aria-label="Move up"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_upward
              </span>
            </button>
            <button
              className="text-outline-variant hover:text-on-surface disabled:opacity-30 p-0.5"
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              aria-label="Move down"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_downward
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-space-xs flex-wrap">
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`w-1.5 h-1.5 rounded-full ${
                    level <= question.difficulty ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
              ))}
              {question.pinned && (
                <span className="inline-flex items-center gap-0.5 text-label-sm font-label-sm text-secondary">
                  <span className="material-symbols-outlined text-[14px]">
                    push_pin
                  </span>
                  Pinned
                </span>
              )}

              {question.edited && !question.pinned && (
                <span className="inline-flex items-center gap-0.5 text-label-sm font-label-sm text-primary">
                  <span className="material-symbols-outlined text-[14px]">
                    edit
                  </span>
                  Edited
                </span>
              )}
              
              {linkedReqs.map((r) => (
                <span
                  key={r.id}
                  className="px-2 py-0.5 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface-variant"
                >
                  {r.id}
                </span>
              ))}
            </div>

            {editing ? (
              <div className="flex flex-col gap-space-sm">
                <textarea
                  className="font-body-md text-body-md text-on-surface rounded-lg bg-surface-container-low p-space-sm focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5]"
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <textarea
                  className="font-body-sm text-body-sm text-on-surface-variant rounded-lg bg-surface-container-low p-space-sm focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5]"
                  rows={2}
                  placeholder="Answer outline"
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                />
                <div className="flex gap-space-sm">
                  <button
                    className="px-space-md py-1 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm"
                    type="button"
                    onClick={save}
                  >
                    Save
                  </button>
                  <button
                    className="px-space-md py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm"
                    type="button"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="text-left"
                type="button"
                onClick={() => setEditing(true)}
              >
                <p className="font-body-lg text-body-lg text-on-surface font-semibold leading-relaxed">
                  {question.prompt}
                </p>
                {question.answer_outline && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {question.answer_outline}
                  </p>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <select
            className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low rounded-lg px-1.5 py-1 border-none focus:outline-none"
            value={question.category}
            onChange={(e) => onMoveCategory(e.target.value)}
            aria-label="Move to category"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            type="button"
            onClick={() => onUpdate({ pinned: !question.pinned })}
            aria-label="Pin question"
          >
            <span className="material-symbols-outlined text-[18px]">
              {question.pinned ? "push_pin" : "push_pin"}
            </span>
          </button>
          <button
            className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container transition-colors"
            type="button"
            onClick={onDelete}
            aria-label="Delete question"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
