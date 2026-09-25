"use client";

import { useState } from "react";

export default function FlashcardsSection({ flashcards, onChange }) {
  function updateCard(id, patch) {
    onChange(flashcards.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function deleteCard(id) {
    onChange(flashcards.filter((c) => c.id !== id));
  }

  function addCard() {
    onChange([
      ...flashcards,
      {
        id: `f_${Date.now()}`,
        front: "New flashcard front",
        back: "New flashcard back",
        requirement_ids: [],
      },
    ]);
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {flashcards.map((card) => (
          <FlashcardEditor
            key={card.id}
            card={card}
            onUpdate={(patch) => updateCard(card.id, patch)}
            onDelete={() => deleteCard(card.id)}
          />
        ))}
      </div>
      <button
        className="mt-space-md py-2 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-all w-full"
        type="button"
        onClick={addCard}
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span>Add Flashcard</span>
      </button>
    </div>
  );
}

function FlashcardEditor({ card, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);

  function save() {
    onUpdate({ front, back });
    setEditing(false);
  }

  return (
    <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm">
      {editing ? (
        <>
          <textarea
            className="font-body-sm text-body-sm rounded-lg bg-surface-container-lowest p-space-sm focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5]"
            rows={2}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Front"
          />
          <textarea
            className="font-body-sm text-body-sm rounded-lg bg-surface-container-lowest p-space-sm focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5]"
            rows={2}
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Back"
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
        </>
      ) : (
        <>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
            Front
          </p>
          <p className="font-body-sm text-body-sm text-on-surface">{card.front}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mt-1">
            Back
          </p>
          <p className="font-body-sm text-body-sm text-on-surface">{card.back}</p>
          <div className="flex gap-space-xs mt-1">
            <button
              className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container transition-colors"
              type="button"
              onClick={onDelete}
              aria-label="Delete"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
