"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../../components/AppShell";

import { kitsApi } from "../../../../lib/api/kits";
import { useRequireAuth } from "../../../../lib/hooks/useRequireAuth";
// import { kitsApi } from "../../../../lib/api/kits";

const CONFIDENCE = [
  { key: "low", label: "Low", emoji: "😕" },
  { key: "okay", label: "Okay", emoji: "🙂" },
  { key: "confident", label: "Confident", emoji: "😄" },
];


export default function PracticePage() {
  const { id } = useParams();
  const router = useRouter();

  const authed = useRequireAuth();
  const [kit, setKit] = useState(null);

      useEffect(() => {
        if (!authed) return;
        kitsApi.get(id).then((data) => setKit(data.kit));
      }, [authed, id]);

  // Ordered least-confident-first: cards with no rating yet come first,
  // then low, then okay, then confident. A simple, defensible heuristic —
  // see README for the spaced-repetition alternative considered.


    const [ratings, setRatings] = useState({});
    const order = useMemo(() => {
      if (!kit) return [];
      const rank = { undefined: 0, low: 1, okay: 2, confident: 3 };
      return [...kit.flashcards].sort(
        (a, b) => rank[ratings[a.id]] - rank[ratings[b.id]]
      );
    }, [kit, ratings]);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = order[index];

 function rate(key) {
  setRatings((r) => ({ ...r, [card.id]: key }));
  // Persist to the backend so the Weak Spots Report can use this later,
  // not just this session's in-memory state.
  const updatedFlashcards = kit.flashcards.map((f) =>
    f.id === card.id ? { ...f, confidence: key } : f
  );
  kitsApi.update(id, { flashcards: updatedFlashcards }).catch(() => {
    // Non-critical - the session still works locally even if this fails.
  });
  goNext();
}

  function goNext() {
    setRevealed(false);
    if (index + 1 >= order.length) {
      router.push(`/kits/${id}/practice/summary`);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function goPrev() {
    setRevealed(false);
    setIndex((i) => Math.max(0, i - 1));
  }

   if (!authed || !kit) return null; 

  if (!card) {
    return (
      <AppShell active="Practice Mode">
        <p className="font-body-md text-body-md text-on-surface-variant">
          This kit has no flashcards yet.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell active="Practice Mode">
      <div className="max-w-xl mx-auto w-full py-space-xl flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-space-lg">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Card {index + 1} of {order.length}
          </span>
          <span className="px-space-sm py-1 rounded-full bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant shadow-sm">
            {Object.keys(ratings).length} of {kit.flashcards.length} covered
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden mb-space-xl">
          <div
            className="h-full bg-primary-container rounded-full transition-all"
            style={{ width: `${((index + 1) / order.length) * 100}%` }}
          />
        </div>

        <div className="w-full min-h-[280px] bg-surface-container-lowest rounded-2xl shadow-lg p-space-xl flex flex-col items-center justify-center text-center gap-space-md">
          <p className="font-headline-sm text-headline-sm text-on-surface">
            {card.front}
          </p>
          {revealed && (
            <p className="font-body-md text-body-md text-on-surface-variant border-t border-outline-variant/30 pt-space-md w-full">
              {card.back}
            </p>
          )}
        </div>

        {!revealed ? (
          <button
            className="mt-space-lg px-space-xl py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-md transition-all active:scale-[0.98]"
            type="button"
            onClick={() => setRevealed(true)}
          >
            Reveal Answer
          </button>
        ) : (
          <div className="mt-space-lg flex items-center gap-space-sm">
            {CONFIDENCE.map((c) => (
              <button
                key={c.key}
                className="flex flex-col items-center gap-1 px-space-lg py-space-sm rounded-xl bg-surface-container-lowest hover:bg-surface-container-high shadow-sm transition-all"
                type="button"
                onClick={() => rate(c.key)}
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-space-lg flex items-center gap-space-lg">
          <button
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface disabled:opacity-40"
            type="button"
            onClick={goPrev}
            disabled={index === 0}
          >
            ← Previous
          </button>
          <button
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface"
            type="button"
            onClick={goNext}
          >
            Skip →
          </button>
        </div>
      </div>
    </AppShell>
  );
}
