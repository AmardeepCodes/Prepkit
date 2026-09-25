"use client";

import { useState } from "react";

export default function ScheduleSection({ schedule, questions, onRegenerate }) {
  const [activeDay, setActiveDay] = useState(schedule.days[0]?.day ?? 1);
  const [regenerating, setRegenerating] = useState(false);

  const current = schedule.days.find((d) => d.day === activeDay);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm">
      <div className="flex items-center justify-between p-space-lg border-b border-outline-variant/30">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            {schedule.days_available}-Day Study Schedule
          </h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Allocated deterministically from your requirements and time
            available — not left to the model.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors disabled:opacity-60"
          type="button"
          disabled={regenerating}
          onClick={handleRegenerate}
        >
          <span
            className={`material-symbols-outlined text-[16px] ${
              regenerating ? "animate-spin" : ""
            }`}
          >
            auto_fix_normal
          </span>
          <span className="hidden sm:inline">Regenerate schedule</span>
        </button>
      </div>

      <div className="flex items-center gap-space-xs overflow-x-auto p-space-md border-b border-outline-variant/20">
        {schedule.days.map((d) => (
          <button
            key={d.day}
            className={`px-space-md py-1.5 rounded-xl font-label-md text-label-md whitespace-nowrap transition-all ${
              activeDay === d.day
                ? "bg-primary-container text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
            type="button"
            onClick={() => setActiveDay(d.day)}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {current && (
        <div className="p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">
              {current.focus}
            </h4>
            <span className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              {current.minutes} min
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {current.question_ids.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No questions assigned to this day yet.
              </p>
            ) : (
              current.question_ids.map((qid) => {
                const q = questions.find((x) => x.id === qid);
                return (
                  <label
                    key={qid}
                    className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low"
                  >
                    <input type="checkbox" className="w-4 h-4 accent-primary-container" />
                    <span className="font-body-sm text-body-sm text-on-surface">
                      {q ? q.prompt : `Question ${qid} (missing)`}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
